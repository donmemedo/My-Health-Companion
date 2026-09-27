import hashlib, hmac, os, secrets, datetime as dt
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlmodel import Session, select
from .db import get_session
from .models import User

SECRET = os.getenv("SECRET_KEY", "hamrah-salamat-dev-secret-change-me")
ALGO = "HS256"
TOKEN_DAYS = 14
bearer = HTTPBearer(auto_error=False)


def hash_password(password: str) -> str:
    salt = secrets.token_hex(16)
    dk = hashlib.pbkdf2_hmac("sha256", password.encode(), salt.encode(), 120_000)
    return f"pbkdf2${salt}${dk.hex()}"


def verify_password(password: str, stored: str) -> bool:
    try:
        _, salt, digest = stored.split("$")
    except ValueError:
        return False
    dk = hashlib.pbkdf2_hmac("sha256", password.encode(), salt.encode(), 120_000)
    return hmac.compare_digest(dk.hex(), digest)


def create_token(user_id: int) -> str:
    payload = {
        "sub": str(user_id),
        "exp": dt.datetime.now(dt.timezone.utc) + dt.timedelta(days=TOKEN_DAYS),
        "iat": dt.datetime.now(dt.timezone.utc),
    }
    return jwt.encode(payload, SECRET, algorithm=ALGO)


def current_user(
    creds: HTTPAuthorizationCredentials | None = Depends(bearer),
    session: Session = Depends(get_session),
) -> User:
    if creds is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "نیاز به ورود دارید")
    try:
        data = jwt.decode(creds.credentials, SECRET, algorithms=[ALGO])
        user = session.get(User, int(data["sub"]))
    except Exception:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "نشست نامعتبر است")
    if not user:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "کاربر یافت نشد")
    return user


def optional_user(
    creds: HTTPAuthorizationCredentials | None = Depends(bearer),
    session: Session = Depends(get_session),
) -> User | None:
    if creds is None:
        return None
    try:
        data = jwt.decode(creds.credentials, SECRET, algorithms=[ALGO])
        return session.get(User, int(data["sub"]))
    except Exception:
        return None
