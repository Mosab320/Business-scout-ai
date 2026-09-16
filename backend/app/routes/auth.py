import uuid

from fastapi import APIRouter, Depends, HTTPException, status

from app.database import db, utcnow
from app.middleware.auth import get_current_user
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse, UserPublic
from app.utils.security import create_access_token, hash_password, verify_password

router = APIRouter(prefix="/api/auth", tags=["auth"])


def _to_public(user: dict) -> UserPublic:
    return UserPublic(
        id=user["_id"],
        name=user["name"],
        email=user["email"],
        plan=user.get("plan", "free"),
        role=user.get("role", "user"),
        created_at=user["created_at"],
    )


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(payload: RegisterRequest):
    existing = await db.users.find_one({"email": payload.email.lower()})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists.",
        )

    user_id = str(uuid.uuid4())
    user_doc = {
        "_id": user_id,
        "name": payload.name.strip(),
        "email": payload.email.lower(),
        "password_hash": hash_password(payload.password),
        "plan": "free",
        "role": "user",
        "created_at": utcnow().isoformat(),
    }
    await db.users.insert_one(user_doc)

    await db.subscriptions.insert_one(
        {
            "_id": str(uuid.uuid4()),
            "user_id": user_id,
            "plan": "free",
            "status": "active",
            "start_date": utcnow().isoformat(),
            "expiry_date": None,
        }
    )

    token = create_access_token(subject=user_id)
    return TokenResponse(access_token=token, user=_to_public(user_doc))


@router.post("/login", response_model=TokenResponse)
async def login(payload: LoginRequest):
    user = await db.users.find_one({"email": payload.email.lower()})
    if not user or not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
        )

    token = create_access_token(subject=user["_id"])
    return TokenResponse(access_token=token, user=_to_public(user))


@router.get("/me", response_model=UserPublic)
async def me(current_user: dict = Depends(get_current_user)):
    return _to_public(current_user)
