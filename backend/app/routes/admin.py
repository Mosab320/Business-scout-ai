from collections import Counter

from fastapi import APIRouter, Depends

from app.database import db
from app.middleware.auth import get_current_admin

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.get("/overview")
async def admin_overview(_: dict = Depends(get_current_admin)):
    users = await db.users.find({}).to_list(100000)
    sessions = await db.scouting_sessions.find({}).to_list(100000)
    opportunities = await db.opportunities.find({}).to_list(100000)

    free_count = len([u for u in users if u.get("plan", "free") == "free"])
    pro_count = len([u for u in users if u.get("plan") == "pro"])

    category_counter = Counter(o.get("key", "unknown") for o in opportunities)
    popular_categories = [
        {"category": k, "count": v} for k, v in category_counter.most_common(8)
    ]

    recent_users = sorted(users, key=lambda u: u["created_at"], reverse=True)[:10]
    recent_users_out = [
        {"id": u["_id"], "name": u["name"], "email": u["email"], "plan": u.get("plan", "free"),
         "created_at": u["created_at"]}
        for u in recent_users
    ]

    revenue_estimate = pro_count * 999  # PKR, illustrative only

    return {
        "total_users": len(users),
        "active_users": len(users),  # simple proxy; no session/last-seen tracking in MVP
        "total_scouting_sessions": len(sessions),
        "popular_business_categories": popular_categories,
        "free_users": free_count,
        "pro_users": pro_count,
        "revenue_overview": {
            "estimated_monthly_revenue_pkr": revenue_estimate,
            "note": "Illustrative estimate based on active Pro subscriptions.",
        },
        "recent_users": recent_users_out,
    }
