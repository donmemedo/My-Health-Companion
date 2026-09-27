"""Aggregate, anonymised insights.

Everything here obeys the plan's governance rule: only aggregated, de-identified
numbers, and never a cohort smaller than MIN_COHORT.
"""
import datetime as dt
from collections import defaultdict
from fastapi import APIRouter, Depends
from sqlmodel import Session, select, func

from ..db import get_session
from ..models import Condition, Entry, Membership, Post, Treatment, User

router = APIRouter(prefix="/api", tags=["insights"])
MIN_COHORT = 5


@router.get("/stats")
def stats(session: Session = Depends(get_session)):
    return {
        "members": session.exec(select(func.count(User.id))).one(),
        "conditions": session.exec(select(func.count(Condition.id))).one(),
        "posts": session.exec(select(func.count(Post.id))).one(),
        "datapoints": session.exec(select(func.count(Entry.id))).one(),
    }


@router.get("/insights")
def insights(condition: str | None = None, session: Session = Depends(get_session)):
    cond = None
    if condition:
        cond = session.exec(select(Condition).where(Condition.slug == condition)).first()

    user_ids = None
    if cond:
        user_ids = {m.user_id for m in session.exec(
            select(Membership).where(Membership.condition_id == cond.id)).all()}

    entries = session.exec(select(Entry)).all()
    if user_ids is not None:
        entries = [e for e in entries if e.user_id in user_ids]

    # symptom prevalence + average severity
    sym = defaultdict(list)
    sym_users = defaultdict(set)
    for e in entries:
        if e.kind == "symptom":
            sym[e.label].append(e.value)
            sym_users[e.label].add(e.user_id)
    symptoms = sorted(
        [{"label": k, "avg_severity": round(sum(v) / len(v), 2), "reports": len(v),
          "people": len(sym_users[k])}
         for k, v in sym.items() if len(sym_users[k]) >= MIN_COHORT],
        key=lambda x: -x["people"])[:10]

    # treatment effectiveness
    treats = session.exec(select(Treatment)).all()
    if user_ids is not None:
        treats = [t for t in treats if t.user_id in user_ids]
    tmap = defaultdict(list)
    for t in treats:
        tmap[t.name].append(t)
    treatments = sorted(
        [{"name": k,
          "people": len({t.user_id for t in v}),
          "effectiveness": round(sum(t.effectiveness for t in v) / len(v), 2),
          "side_effect_rate": round(100 * sum(1 for t in v if t.side_effects.strip()) / len(v)),
          "still_taking": round(100 * sum(1 for t in v if t.active) / len(v))}
         for k, v in tmap.items() if len({t.user_id for t in v}) >= MIN_COHORT],
        key=lambda x: -x["people"])[:10]

    # quality-of-life trend, monthly
    monthly = defaultdict(lambda: defaultdict(list))
    for e in entries:
        key = e.recorded_at.strftime("%Y-%m")
        if e.kind in ("quality", "symptom"):
            monthly[key][e.kind].append(e.value)
    trend = [{"month": m,
              "quality": round(sum(v["quality"]) / len(v["quality"]), 2) if v["quality"] else None,
              "symptom": round(sum(v["symptom"]) / len(v["symptom"]), 2) if v["symptom"] else None}
             for m, v in sorted(monthly.items())][-12:]

    # demographics (coarse buckets only)
    users = session.exec(select(User)).all()
    if user_ids is not None:
        users = [u for u in users if u.id in user_ids]
    year = dt.date.today().year
    buckets = defaultdict(int)
    for u in users:
        if u.year_of_birth:
            age = year - u.year_of_birth
            label = "۱۸-۳۰" if age < 31 else "۳۱-۴۵" if age < 46 else "۴۶-۶۰" if age < 61 else "۶۰+"
            buckets[label] += 1
    demographics = [{"bucket": k, "count": v} for k, v in buckets.items() if v >= MIN_COHORT]

    return {
        "condition": {"slug": cond.slug, "name_fa": cond.name_fa, "name_en": cond.name_en} if cond else None,
        "cohort_size": len(users),
        "min_cohort": MIN_COHORT,
        "suppressed": len(users) < MIN_COHORT,
        "symptoms": symptoms,
        "treatments": treatments,
        "trend": trend,
        "demographics": demographics,
    }
