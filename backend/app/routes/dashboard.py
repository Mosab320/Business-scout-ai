from datetime import datetime

from fastapi import APIRouter, Depends

from app.config import get_settings
from app.database import db
from app.middleware.auth import get_current_user

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])
settings = get_settings()


@router.get("")
async def get_dashboard(current_user: dict = Depends(get_current_user)):
    user_id = current_user["_id"]
    sessions = await db.scouting_sessions.find({"user_id": user_id}).to_list(1000)
    saved = await db.saved_opportunities.find({"user_id": user_id}).to_list(1000)
    plans = await db.business_plans.find({"user_id": user_id}).to_list(1000)

    month_prefix = datetime.utcnow().strftime("%Y-%m")
    used_this_month = len([s for s in sessions if s["created_at"].startswith(month_prefix)])

    plan_name = current_user.get("plan", "free")
    limit = (
        settings.FREE_PLAN_MONTHLY_SESSIONS
        if plan_name == "free"
        else settings.PRO_PLAN_MONTHLY_SESSIONS
    )

    latest_session = None
    latest_opportunities = []
    if sessions:
        sessions_sorted = sorted(sessions, key=lambda s: s["created_at"], reverse=True)
        latest_session = sessions_sorted[0]
        latest_opportunities = await db.opportunities.find(
            {"session_id": latest_session["_id"]}
        ).to_list(10)
        latest_opportunities = sorted(
            latest_opportunities, key=lambda o: o["score"], reverse=True
        )[:3]

    return {
        "total_scouting_sessions": len(sessions),
        "saved_opportunities_count": len(saved),
        "business_plans_count": len(plans),
        "current_plan": plan_name,
        "usage": {"used": used_this_month, "limit": limit},
        "latest_recommendations": latest_opportunities,
    }
