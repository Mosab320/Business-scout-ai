"""Password hashing and JWT helpers."""
from datetime import timedelta
from typing import Optional

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.config import get_settings
from app.database import utcnow

settings = get_settings()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, password_hash: str) -> bool:
    return pwd_context.verify(plain_password, password_hash)


def create_access_token(subject: str, expires_delta: Optional[timedelta] = None) -> str:
    expire = utcnow() + (
        expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    payload = {"sub": subject, "exp": expire}
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


def decode_access_token(token: str) -> Optional[str]:
    try:
        payload = jwt.decode(
            token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM]
        )
        return payload.get("sub")
    except JWTError:
        return None
