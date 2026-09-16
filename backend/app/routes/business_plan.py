from fastapi import APIRouter, Depends, HTTPException, Response

from app.database import db
from app.middleware.auth import get_current_user
from app.schemas.plan import BusinessPlanOut, BusinessPlanRequest, TaskStatusUpdate
from app.services.pdf_service import pdf_service
from app.services.plan_builder import build_business_plan

router = APIRouter(tags=["business-plan"])


@router.post("/api/business-plan", response_model=BusinessPlanOut)
async def generate_business_plan(
    payload: BusinessPlanRequest, current_user: dict = Depends(get_current_user)
):
    opp = await db.opportunities.find_one({"id": payload.opportunity_id})
    if not opp:
        raise HTTPException(status_code=404, detail="Opportunity not found.")

    session = await db.scouting_sessions.find_one(
        {"_id": opp["session_id"], "user_id": current_user["_id"]}
    )
    if not session:
        raise HTTPException(status_code=403, detail="You don't have access to this opportunity.")

    profile = await db.business_profiles.find_one({"_id": session["profile_id"]}) or {}
    profile["user_id"] = current_user["_id"]

    plan_doc = await build_business_plan(opp, profile)
    await db.business_plans.insert_one(plan_doc)

    plan_doc["id"] = plan_doc["_id"]
    return plan_doc


@router.get("/api/business-plans", response_model=list[BusinessPlanOut])
async def list_business_plans(current_user: dict = Depends(get_current_user)):
    plans = await db.business_plans.find({"user_id": current_user["_id"]}).to_list(1000)
    for p in plans:
        p["id"] = p.get("id") or p["_id"]
    return plans


@router.get("/api/business-plans/{plan_id}", response_model=BusinessPlanOut)
async def get_business_plan(plan_id: str, current_user: dict = Depends(get_current_user)):
    plan = await db.business_plans.find_one({"_id": plan_id, "user_id": current_user["_id"]})
    if not plan:
        raise HTTPException(status_code=404, detail="Business plan not found.")
    plan["id"] = plan.get("id") or plan["_id"]
    return plan


@router.patch("/api/business-plans/{plan_id}/tasks")
async def update_task_status(
    plan_id: str, payload: TaskStatusUpdate, current_user: dict = Depends(get_current_user)
):
    plan = await db.business_plans.find_one({"_id": plan_id, "user_id": current_user["_id"]})
    if not plan:
        raise HTTPException(status_code=404, detail="Business plan not found.")

    launch_plan = plan.get("launch_plan", [])
    for task in launch_plan:
        if task["day"] == payload.day:
            task["status"] = payload.status

    await db.business_plans.update_one(
        {"_id": plan_id}, {"$set": {"launch_plan": launch_plan}}
    )
    return {"status": "updated"}


@router.get("/api/business-plans/{plan_id}/export-pdf")
async def export_business_plan_pdf(plan_id: str, current_user: dict = Depends(get_current_user)):
    plan = await db.business_plans.find_one({"_id": plan_id, "user_id": current_user["_id"]})
    if not plan:
        raise HTTPException(status_code=404, detail="Business plan not found.")

    pdf_bytes = pdf_service.business_plan_to_pdf_bytes(plan)
    filename = f"{plan['business_name'].replace(' ', '_')}_business_plan.pdf"
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )
