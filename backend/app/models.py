import datetime as dt
from typing import Optional
from sqlmodel import SQLModel, Field


def now() -> dt.datetime:
    """Naive UTC — SQLite drops tzinfo on read, so we stay naive everywhere."""
    return dt.datetime.now(dt.timezone.utc).replace(tzinfo=None)


class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(index=True, unique=True)
    password_hash: str
    display_name: str
    avatar_seed: str = "1"
    bio: str = ""
    city: str = ""
    year_of_birth: Optional[int] = None
    gender: str = ""  # f / m / other / ""
    role: str = "patient"  # patient | caregiver | clinician | researcher
    research_consent: bool = False
    created_at: dt.datetime = Field(default_factory=now)


class Condition(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    slug: str = Field(index=True, unique=True)
    name_fa: str
    name_en: str
    blurb_fa: str = ""
    blurb_en: str = ""
    icon: str = "heart"
    accent: str = "#6366f1"
    member_count: int = 0


class Membership(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(index=True, foreign_key="user.id")
    condition_id: int = Field(index=True, foreign_key="condition.id")
    diagnosed_year: Optional[int] = None
    created_at: dt.datetime = Field(default_factory=now)


class Post(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(index=True, foreign_key="user.id")
    condition_id: int = Field(index=True, foreign_key="condition.id")
    title: str
    body: str
    kind: str = "experience"  # experience | question | tip
    likes: int = 0
    created_at: dt.datetime = Field(default_factory=now)


class Comment(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    post_id: int = Field(index=True, foreign_key="post.id")
    user_id: int = Field(index=True, foreign_key="user.id")
    body: str
    created_at: dt.datetime = Field(default_factory=now)


class Like(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    post_id: int = Field(index=True, foreign_key="post.id")
    user_id: int = Field(index=True, foreign_key="user.id")


class Entry(SQLModel, table=True):
    """A longitudinal health record point."""
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(index=True, foreign_key="user.id")
    condition_id: Optional[int] = Field(default=None, foreign_key="condition.id")
    kind: str = Field(index=True)  # symptom | treatment | lab | quality
    label: str = ""
    value: float = 0.0          # severity 0-10, lab value, or adherence 0-100
    unit: str = ""
    note: str = ""
    recorded_at: dt.datetime = Field(default_factory=now, index=True)


class Treatment(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(index=True, foreign_key="user.id")
    condition_id: Optional[int] = Field(default=None, foreign_key="condition.id")
    name: str
    dosage: str = ""
    purpose: str = ""
    effectiveness: int = 3   # 1..5
    side_effects: str = ""
    active: bool = True
    started_at: dt.datetime = Field(default_factory=now)
