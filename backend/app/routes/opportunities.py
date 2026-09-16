import uuid

from fastapi import APIRouter, Depends, HTTPException, status

from app.database import db, utcnow
from app.middleware.auth import get_current_user
from app.schemas.scout import OpportunityOut

router = APIRouter(prefix="/api/opportunities", tags=["opportunities"])


async def _user_session_ids(user_id: str) -> set[str]:
    sessions = await db.scouting_sessions.find({"user_id": user_id}).to_list(1000)
    return {s["_id"] for s in sessions}


@router.get("", response_model=list[OpportunityOut])
async def list_opportunities(current_user: dict = Depends(get_current_user)):
    session_ids = await _user_session_ids(current_user["_id"])
    all_opps = await db.opportunities.find({}).to_list(10000)
    user_opps = [o for o in all_opps if o["session_id"] in session_ids]

    saved_ids = {
        s["opportunity_id"]
        for s in await db.saved_opportunities.find({"user_id": current_user["_id"]}).to_list(1000)
    }
    for o in user_opps:
        o["id"] = o.get("id") or o["_id"]
        o["saved"] = o["id"] in saved_ids
    return user_opps


@router.get("/{opportunity_id}", response_model=OpportunityOut)
async def get_opportunity(opportunity_id: str, current_user: dict = Depends(get_current_user)):
    opp = await db.opportunities.find_one({"id": opportunity_id})
    if not opp:
        raise HTTPException(status_code=404, detail="Opportunity not found.")

    session_ids = await _user_session_ids(current_user["_id"])
    if opp["session_id"] not in session_ids:
        raise HTTPException(status_code=403, detail="You don't have access to this opportunity.")

    saved = await db.saved_opportunities.find_one(
        {"user_id": current_user["_id"], "opportunity_id": opportunity_id}
    )
    opp["saved"] = bool(saved)
    return opp


@router.post("/{opportunity_id}/save", status_code=status.HTTP_201_CREATED)
async def save_opportunity(opportunity_id: str, current_user: dict = Depends(get_current_user)):
    opp = await db.opportunities.find_one({"id": opportunity_id})
    if not opp:
        raise HTTPException(status_code=404, detail="Opportunity not found.")

    existing = await db.saved_opportunities.find_one(
        {"user_id": current_user["_id"], "opportunity_id": opportunity_id}
    )
    if existing:
        return {"status": "already_saved"}

    await db.saved_opportunities.insert_one(
        {
            "_id": str(uuid.uuid4()),
            "user_id": current_user["_id"],
            "opportunity_id": opportunity_id,
            "created_at": utcnow().isoformat(),
        }
    )
    return {"status": "saved"}


@router.delete("/{opportunity_id}/save")
async def unsave_opportunity(opportunity_id: str, current_user: dict = Depends(get_current_user)):
    await db.saved_opportunities.delete_one(
        {"user_id": current_user["_id"], "opportunity_id": opportunity_id}
    )
    return {"status": "removed"}
