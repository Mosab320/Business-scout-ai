import uuid

from fastapi import APIRouter, Depends, HTTPException, status

from app.agents.orchestrator import run_scouting_pipeline
from app.config import get_settings
from app.database import db, utcnow
from app.middleware.auth import get_current_user
from app.schemas.scout import BusinessProfileInput, ScoutResultResponse

router = APIRouter(prefix="/api/scout", tags=["scout"])
settings = get_settings()


async def _sessions_used_this_month(user_id: str) -> int:
    from datetime import datetime

    month_prefix = datetime.utcnow().strftime("%Y-%m")
    sessions = await db.scouting_sessions.find({"user_id": user_id}).to_list(1000)
    return len([s for s in sessions if s["created_at"].startswith(month_prefix)])


@router.post("", response_model=ScoutResultResponse, status_code=status.HTTP_201_CREATED)
async def start_scout(
    payload: BusinessProfileInput, current_user: dict = Depends(get_current_user)
):
    plan = current_user.get("plan", "free")
    limit = (
        settings.FREE_PLAN_MONTHLY_SESSIONS
        if plan == "free"
        else settings.PRO_PLAN_MONTHLY_SESSIONS
    )
    used = await _sessions_used_this_month(current_user["_id"])
    if used >= limit:
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail=(
                f"You've used all {limit} scouting sessions on the {plan} plan this month. "
                "Upgrade to Pro for more sessions."
            ),
        )

    profile_id = str(uuid.uuid4())
    profile_doc = {"_id": profile_id, "user_id": current_user["_id"], **payload.model_dump()}
    await db.business_profiles.insert_one(profile_doc)

    session_id = str(uuid.uuid4())
    session_doc = {
        "_id": session_id,
        "user_id": current_user["_id"],
        "profile_id": profile_id,
        "status": "researching",
        "created_at": utcnow().isoformat(),
        "completed_at": None,
    }
    await db.scouting_sessions.insert_one(session_doc)

    profile_for_agents = {**payload.model_dump(), "user_id": current_user["_id"]}
    result = await run_scouting_pipeline(session_id, profile_for_agents)

    for opp in result["opportunities"]:
        await db.opportunities.insert_one(opp)

    await db.scouting_sessions.update_one(
        {"_id": session_id},
        {"$set": {"status": "completed", "completed_at": utcnow().isoformat()}},
    )

    saved_ids = {
        s["opportunity_id"]
        for s in await db.saved_opportunities.find({"user_id": current_user["_id"]}).to_list(1000)
    }

    opportunities_out = [
        {**opp, "saved": opp["id"] in saved_ids}
        for opp in result["opportunities"]
    ]

    session_out = {
        "id": session_id,
        "status": "completed",
        "created_at": session_doc["created_at"],
        "completed_at": utcnow().isoformat(),
        "profile": payload,
    }

    return ScoutResultResponse(
        session=session_out,
        opportunities=opportunities_out,
        best_opportunity_id=result["best_opportunity_id"],
        advisor_summary=result["advisor_summary"],
    )


@router.get("/{session_id}", response_model=ScoutResultResponse)
async def get_scout_session(session_id: str, current_user: dict = Depends(get_current_user)):
    session = await db.scouting_sessions.find_one(
        {"_id": session_id, "user_id": current_user["_id"]}
    )
    if not session:
        raise HTTPException(status_code=404, detail="Scouting session not found.")

    profile = await db.business_profiles.find_one({"_id": session["profile_id"]})
    opportunities = await db.opportunities.find({"session_id": session_id}).to_list(100)

    saved_ids = {
        s["opportunity_id"]
        for s in await db.saved_opportunities.find({"user_id": current_user["_id"]}).to_list(1000)
    }
    for o in opportunities:
        o["id"] = o.get("id") or o["_id"]
        o["saved"] = o["id"] in saved_ids

    best = max(opportunities, key=lambda o: o["score"]) if opportunities else None

    return ScoutResultResponse(
        session={
            "id": session["_id"],
            "status": session["status"],
            "created_at": session["created_at"],
            "completed_at": session.get("completed_at"),
            "profile": profile,
        },
        opportunities=opportunities,
        best_opportunity_id=best["id"] if best else None,
        advisor_summary=None,
    )
