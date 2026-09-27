from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr, Field
from sqlmodel import Session, select

from ..core import create_token, current_user, hash_password, verify_password
from ..db import get_session
from ..models import Condition, Membership, User

router = APIRouter(prefix="/api/auth", tags=["auth"])


class RegisterIn(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    display_name: str = Field(min_length=2)
    role: str = "patient"
    condition_slug: str | None = None


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class ProfileIn(BaseModel):
    display_name: str | None = None
    bio: str | None = None
    city: str | None = None
    year_of_birth: int | None = None
    gender: str | None = None
    research_consent: bool | None = None
    avatar_seed: str | None = None


def public(user: User) -> dict:
    return {
        "id": user.id,
        "email": user.email,
        "display_name": user.display_name,
        "avatar_seed": user.avatar_seed,
        "bio": user.bio,
        "city": user.city,
        "year_of_birth": user.year_of_birth,
        "gender": user.gender,
        "role": user.role,
        "research_consent": user.research_consent,
    }


@router.post("/register")
def register(data: RegisterIn, session: Session = Depends(get_session)):
    exists = session.exec(select(User).where(User.email == data.email)).first()
    if exists:
        raise HTTPException(400, "این رایانامه قبلاً ثبت شده است")
    user = User(
        email=str(data.email).lower(),
        password_hash=hash_password(data.password),
        display_name=data.display_name,
        role=data.role,
        avatar_seed=str(abs(hash(data.email)) % 60),
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    if data.condition_slug:
        cond = session.exec(select(Condition).where(Condition.slug == data.condition_slug)).first()
        if cond:
            session.add(Membership(user_id=user.id, condition_id=cond.id))
            cond.member_count += 1
            session.add(cond)
            session.commit()
    return {"token": create_token(user.id), "user": public(user)}


@router.post("/login")
def login(data: LoginIn, session: Session = Depends(get_session)):
    user = session.exec(select(User).where(User.email == str(data.email).lower())).first()
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(401, "رایانامه یا رمز عبور نادرست است")
    return {"token": create_token(user.id), "user": public(user)}


@router.get("/me")
def me(user: User = Depends(current_user), session: Session = Depends(get_session)):
    rows = session.exec(select(Membership).where(Membership.user_id == user.id)).all()
    conds = [session.get(Condition, r.condition_id) for r in rows]
    return {
        **public(user),
        "conditions": [
            {"id": c.id, "slug": c.slug, "name_fa": c.name_fa, "name_en": c.name_en, "accent": c.accent}
            for c in conds if c
        ],
    }


@router.patch("/me")
def update_me(data: ProfileIn, user: User = Depends(current_user), session: Session = Depends(get_session)):
    for key, value in data.model_dump(exclude_none=True).items():
        setattr(user, key, value)
    session.add(user)
    session.commit()
    session.refresh(user)
    return public(user)
