import datetime as dt
from collections import defaultdict
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlmodel import Session, select, func

from ..core import current_user
from ..db import get_session
from ..models import Entry, Membership, Post, Treatment, User, now as utcnow

router = APIRouter(prefix="/api", tags=["health"])


class EntryIn(BaseModel):
    kind: str
    label: str
    value: float
    unit: str = ""
    note: str = ""
    condition_id: int | None = None
    recorded_at: dt.datetime | None = None


class TreatmentIn(BaseModel):
    name: str
    dosage: str = ""
    purpose: str = ""
    effectiveness: int = 3
    side_effects: str = ""
    condition_id: int | None = None
    active: bool = True


def edict(e: Entry) -> dict:
    return {"id": e.id, "kind": e.kind, "label": e.label, "value": e.value, "unit": e.unit,
            "note": e.note, "recorded_at": e.recorded_at.isoformat(), "condition_id": e.condition_id}


@router.get("/entries")
def list_entries(kind: str | None = None, days: int = 90, limit: int = 400,
                 user: User = Depends(current_user), session: Session = Depends(get_session)):
    since = utcnow() - dt.timedelta(days=days)
    q = select(Entry).where(Entry.user_id == user.id, Entry.recorded_at >= since)
    if kind:
        q = q.where(Entry.kind == kind)
    rows = session.exec(q.order_by(Entry.recorded_at.desc()).limit(limit)).all()
    return [edict(e) for e in rows]


@router.post("/entries")
def create_entry(data: EntryIn, user: User = Depends(current_user), session: Session = Depends(get_session)):
    payload = data.model_dump()
    rec = payload.get("recorded_at")
    if rec is not None and rec.tzinfo is not None:
        rec = rec.astimezone(dt.timezone.utc).replace(tzinfo=None)
    payload["recorded_at"] = rec or utcnow()
    e = Entry(user_id=user.id, **payload)
    session.add(e)
    session.commit()
    session.refresh(e)
    return edict(e)


@router.delete("/entries/{eid}")
def delete_entry(eid: int, user: User = Depends(current_user), session: Session = Depends(get_session)):
    e = session.get(Entry, eid)
    if not e or e.user_id != user.id:
        raise HTTPException(404, "رکورد یافت نشد")
    session.delete(e)
    session.commit()
    return {"ok": True}


@router.get("/treatments")
def list_treatments(user: User = Depends(current_user), session: Session = Depends(get_session)):
    rows = session.exec(select(Treatment).where(Treatment.user_id == user.id)).all()
    return [{"id": t.id, "name": t.name, "dosage": t.dosage, "purpose": t.purpose,
             "effectiveness": t.effectiveness, "side_effects": t.side_effects,
             "active": t.active, "started_at": t.started_at.isoformat()} for t in rows]


@router.post("/treatments")
def create_treatment(data: TreatmentIn, user: User = Depends(current_user), session: Session = Depends(get_session)):
    t = Treatment(user_id=user.id, **data.model_dump())
    session.add(t)
    session.commit()
    session.refresh(t)
    return {"id": t.id}


@router.delete("/treatments/{tid}")
def delete_treatment(tid: int, user: User = Depends(current_user), session: Session = Depends(get_session)):
    t = session.get(Treatment, tid)
    if not t or t.user_id != user.id:
        raise HTTPException(404, "یافت نشد")
    session.delete(t)
    session.commit()
    return {"ok": True}


@router.get("/dashboard")
def dashboard(days: int = 60, user: User = Depends(current_user), session: Session = Depends(get_session)):
    since = utcnow() - dt.timedelta(days=days)
    rows = session.exec(select(Entry).where(Entry.user_id == user.id, Entry.recorded_at >= since)
                        .order_by(Entry.recorded_at)).all()

    by_day: dict[str, dict[str, list[float]]] = defaultdict(lambda: defaultdict(list))
    for e in rows:
        by_day[e.recorded_at.date().isoformat()][e.kind].append(e.value)

    trend = []
    for day in sorted(by_day):
        k = by_day[day]
        trend.append({
            "date": day,
            "symptom": round(sum(k["symptom"]) / len(k["symptom"]), 2) if k["symptom"] else None,
            "quality": round(sum(k["quality"]) / len(k["quality"]), 2) if k["quality"] else None,
            "adherence": round(sum(k["treatment"]) / len(k["treatment"]), 1) if k["treatment"] else None,
        })

    sym = defaultdict(list)
    for e in rows:
        if e.kind == "symptom":
            sym[e.label].append(e.value)
    top_symptoms = sorted(
        [{"label": k, "avg": round(sum(v) / len(v), 2), "count": len(v)} for k, v in sym.items()],
        key=lambda x: -x["avg"])[:6]

    labs = defaultdict(list)
    for e in rows:
        if e.kind == "lab":
            labs[e.label].append({"date": e.recorded_at.date().isoformat(), "value": e.value, "unit": e.unit})

    def avg(kind, window):
        vals = [e.value for e in rows if e.kind == kind and e.recorded_at >= window]
        return round(sum(vals) / len(vals), 2) if vals else None

    now = utcnow()
    last7, prev7 = now - dt.timedelta(days=7), now - dt.timedelta(days=14)
    prev_vals = [e.value for e in rows if e.kind == "symptom" and prev7 <= e.recorded_at < last7]

    streak = 0
    days_set = {e.recorded_at.date() for e in rows}
    cursor = now.date()
    while cursor in days_set:
        streak += 1
        cursor -= dt.timedelta(days=1)

    return {
        "trend": trend,
        "top_symptoms": top_symptoms,
        "labs": {k: v[-12:] for k, v in labs.items()},
        "kpi": {
            "symptom_7d": avg("symptom", last7),
            "symptom_prev7d": round(sum(prev_vals) / len(prev_vals), 2) if prev_vals else None,
            "quality_7d": avg("quality", last7),
            "adherence_7d": avg("treatment", last7),
            "entries_total": len(rows),
            "streak": streak,
        },
        "treatments": len(session.exec(select(Treatment).where(Treatment.user_id == user.id,
                                                              Treatment.active == True)).all()),  # noqa: E712
        "communities": len(session.exec(select(Membership).where(Membership.user_id == user.id)).all()),
    }
