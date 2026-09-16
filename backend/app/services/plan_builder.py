"""Builds a complete, structured business plan from a scored opportunity."""
import uuid

from app.agents.orchestrator import generate_execution_plan
from app.database import utcnow


async def build_business_plan(opportunity: dict, profile: dict) -> dict:
    execution = await generate_execution_plan(opportunity["title"])
    finance = opportunity.get("finance", {})
    marketing = opportunity.get("marketing", {})
    competitor = opportunity.get("competitor_analysis", {})

    return {
        "_id": str(uuid.uuid4()),
        "user_id": profile.get("user_id"),
        "opportunity_id": opportunity["id"],
        "business_name": opportunity["title"],
        "executive_summary": (
            f"{opportunity['title']} is a research-based opportunity scoring "
            f"{opportunity['score']}/100 for this founder profile. {opportunity['reasoning']}"
        ),
        "business_concept": opportunity["description"],
        "target_customer": marketing.get("target_audience", "General local customers"),
        "product_strategy": (
            f"Launch a focused starter offer, priced using an estimated margin of "
            f"{opportunity['estimated_margin']}, then expand based on demand signals."
        ),
        "pricing_strategy": finance.get(
            "estimated_gross_margin_pct", "Estimate pending"
        ),
        "competitor_strategy": competitor.get(
            "competitor_positioning", "Differentiate on service quality and niche targeting."
        ),
        "marketing_strategy": marketing.get(
            "social_media_strategy", "Consistent organic content plus a launch campaign."
        ),
        "sales_channels": marketing.get("marketing_channels", []),
        "startup_cost_estimate": finance,
        "operations": (
            "Run lean: track orders/bookings, expenses and customer feedback weekly. "
            "Reinvest early profit into the best-converting marketing channel."
        ),
        "risks": opportunity.get("risks", []),
        "launch_plan": execution["thirty_day_plan"],
        "created_at": utcnow().isoformat(),
    }
