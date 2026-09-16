from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.config import get_settings
from app.database import db, utcnow
from app.middleware.auth import get_current_user
from app.services.payment_service import payment_service

router = APIRouter(prefix="/api/subscription", tags=["subscription"])
settings = get_settings()


class CheckoutRequest(BaseModel):
    plan: str  # "pro_monthly" | "one_time_plan"


@router.get("")
async def get_subscription(current_user: dict = Depends(get_current_user)):
    sub = await db.subscriptions.find_one({"user_id": current_user["_id"]})
    sessions = await db.scouting_sessions.find({"user_id": current_user["_id"]}).to_list(1000)
    month_prefix = datetime.utcnow().strftime("%Y-%m")
    used = len([s for s in sessions if s["created_at"].startswith(month_prefix)])

    plan_name = current_user.get("plan", "free")
    limit = (
        settings.FREE_PLAN_MONTHLY_SESSIONS
        if plan_name == "free"
        else settings.PRO_PLAN_MONTHLY_SESSIONS
    )

    return {
        "plan": plan_name,
        "status": sub.get("status", "active") if sub else "active",
        "usage": {"used": used, "limit": limit},
        "pricing": {
            "free": {"price": 0, "sessions_per_month": settings.FREE_PLAN_MONTHLY_SESSIONS},
            "pro_monthly": {
                "price": settings.PRO_PLAN_PRICE_PKR,
                "currency": "PKR",
                "sessions_per_month": settings.PRO_PLAN_MONTHLY_SESSIONS,
            },
            "one_time_plan": {
                "price": settings.ONE_TIME_PLAN_PRICE_PKR,
                "currency": "PKR",
            },
        },
    }


@router.post("/checkout")
async def checkout(payload: CheckoutRequest, current_user: dict = Depends(get_current_user)):
    if payload.plan not in ("pro_monthly", "one_time_plan"):
        raise HTTPException(status_code=400, detail="Unknown plan selected.")

    result = await payment_service.create_checkout_session(current_user["_id"], payload.plan)

    if result["status"] == "success" and payload.plan == "pro_monthly":
        await db.users.update_one({"_id": current_user["_id"]}, {"$set": {"plan": "pro"}})
        await db.subscriptions.update_one(
            {"user_id": current_user["_id"]},
            {
                "$set": {
                    "plan": "pro",
                    "status": "active",
                    "start_date": utcnow().isoformat(),
                }
            },
        )

    return result
