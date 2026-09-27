import datetime as dt
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlmodel import Session, select, func

from ..core import current_user, optional_user
from ..db import get_session
from ..models import Comment, Condition, Like, Membership, Post, User

router = APIRouter(prefix="/api", tags=["community"])


class PostIn(BaseModel):
    condition_id: int
    title: str = Field(min_length=3)
    body: str = Field(min_length=3)
    kind: str = "experience"


class CommentIn(BaseModel):
    body: str = Field(min_length=1)


def cond_dict(c: Condition) -> dict:
    return {
        "id": c.id, "slug": c.slug, "name_fa": c.name_fa, "name_en": c.name_en,
        "blurb_fa": c.blurb_fa, "blurb_en": c.blurb_en, "icon": c.icon,
        "accent": c.accent, "member_count": c.member_count,
    }


@router.get("/conditions")
def list_conditions(session: Session = Depends(get_session)):
    rows = session.exec(select(Condition).order_by(Condition.member_count.desc())).all()
    return [cond_dict(c) for c in rows]


@router.get("/conditions/{slug}")
def get_condition(slug: str, session: Session = Depends(get_session)):
    c = session.exec(select(Condition).where(Condition.slug == slug)).first()
    if not c:
        raise HTTPException(404, "جامعه یافت نشد")
    posts = session.exec(select(func.count(Post.id)).where(Post.condition_id == c.id)).one()
    return {**cond_dict(c), "post_count": posts}


@router.post("/conditions/{cid}/join")
def join(cid: int, user: User = Depends(current_user), session: Session = Depends(get_session)):
    cond = session.get(Condition, cid)
    if not cond:
        raise HTTPException(404, "جامعه یافت نشد")
    existing = session.exec(
        select(Membership).where(Membership.user_id == user.id, Membership.condition_id == cid)
    ).first()
    if existing:
        session.delete(existing)
        cond.member_count = max(0, cond.member_count - 1)
        joined = False
    else:
        session.add(Membership(user_id=user.id, condition_id=cid))
        cond.member_count += 1
        joined = True
    session.add(cond)
    session.commit()
    return {"joined": joined, "member_count": cond.member_count}


@router.get("/posts")
def list_posts(
    condition: str | None = None,
    kind: str | None = None,
    limit: int = 30,
    session: Session = Depends(get_session),
    user: User | None = Depends(optional_user),
):
    q = select(Post).order_by(Post.created_at.desc()).limit(limit)
    if condition:
        c = session.exec(select(Condition).where(Condition.slug == condition)).first()
        if not c:
            return []
        q = select(Post).where(Post.condition_id == c.id).order_by(Post.created_at.desc()).limit(limit)
    if kind:
        q = q.where(Post.kind == kind)
    posts = session.exec(q).all()
    liked = set()
    if user:
        liked = {l.post_id for l in session.exec(select(Like).where(Like.user_id == user.id)).all()}
    out = []
    for p in posts:
        author = session.get(User, p.user_id)
        cond = session.get(Condition, p.condition_id)
        n = session.exec(select(func.count(Comment.id)).where(Comment.post_id == p.id)).one()
        out.append({
            "id": p.id, "title": p.title, "body": p.body, "kind": p.kind, "likes": p.likes,
            "created_at": p.created_at.isoformat(), "comment_count": n,
            "liked": p.id in liked,
            "author": {"name": author.display_name if author else "ناشناس",
                       "seed": author.avatar_seed if author else "0",
                       "role": author.role if author else "patient"},
            "condition": {"slug": cond.slug, "name_fa": cond.name_fa, "name_en": cond.name_en,
                          "accent": cond.accent} if cond else None,
        })
    return out


@router.post("/posts")
def create_post(data: PostIn, user: User = Depends(current_user), session: Session = Depends(get_session)):
    post = Post(user_id=user.id, **data.model_dump())
    session.add(post)
    session.commit()
    session.refresh(post)
    return {"id": post.id}


@router.get("/posts/{pid}")
def get_post(pid: int, session: Session = Depends(get_session), user: User | None = Depends(optional_user)):
    p = session.get(Post, pid)
    if not p:
        raise HTTPException(404, "نوشته یافت نشد")
    author = session.get(User, p.user_id)
    cond = session.get(Condition, p.condition_id)
    comments = session.exec(select(Comment).where(Comment.post_id == pid).order_by(Comment.created_at)).all()
    liked = False
    if user:
        liked = bool(session.exec(select(Like).where(Like.post_id == pid, Like.user_id == user.id)).first())
    return {
        "id": p.id, "title": p.title, "body": p.body, "kind": p.kind, "likes": p.likes,
        "created_at": p.created_at.isoformat(), "liked": liked,
        "author": {"name": author.display_name if author else "ناشناس",
                   "seed": author.avatar_seed if author else "0",
                   "role": author.role if author else "patient"},
        "condition": {"slug": cond.slug, "name_fa": cond.name_fa, "name_en": cond.name_en,
                      "accent": cond.accent} if cond else None,
        "comments": [
            {
                "id": c.id, "body": c.body, "created_at": c.created_at.isoformat(),
                "author": (lambda u: {"name": u.display_name if u else "ناشناس",
                                      "seed": u.avatar_seed if u else "0"})(session.get(User, c.user_id)),
            } for c in comments
        ],
    }


@router.post("/posts/{pid}/like")
def like(pid: int, user: User = Depends(current_user), session: Session = Depends(get_session)):
    p = session.get(Post, pid)
    if not p:
        raise HTTPException(404, "نوشته یافت نشد")
    existing = session.exec(select(Like).where(Like.post_id == pid, Like.user_id == user.id)).first()
    if existing:
        session.delete(existing)
        p.likes = max(0, p.likes - 1)
        liked = False
    else:
        session.add(Like(post_id=pid, user_id=user.id))
        p.likes += 1
        liked = True
    session.add(p)
    session.commit()
    return {"liked": liked, "likes": p.likes}


@router.post("/posts/{pid}/comments")
def add_comment(pid: int, data: CommentIn, user: User = Depends(current_user), session: Session = Depends(get_session)):
    if not session.get(Post, pid):
        raise HTTPException(404, "نوشته یافت نشد")
    c = Comment(post_id=pid, user_id=user.id, body=data.body)
    session.add(c)
    session.commit()
    session.refresh(c)
    return {"id": c.id, "body": c.body, "created_at": c.created_at.isoformat(),
            "author": {"name": user.display_name, "seed": user.avatar_seed}}
