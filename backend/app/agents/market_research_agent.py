"""Market Research Agent: researches potential business opportunities."""
from app.services.knowledge_base import BUSINESS_ARCHETYPES


async def run(profile: dict, category_keys: list[str]) -> list[dict]:
    archetypes = [a for a in BUSINESS_ARCHETYPES if a["key"] in category_keys]

    results = []
    for arche in archetypes:
        interests = {i.lower() for i in profile.get("interests", [])}
        skills = {s.lower() for s in profile.get("skills", [])}
        overlap = interests.union(skills).intersection(arche["tags"])

        local_relevance = (
            "Strong local relevance: fits common demand patterns in "
            f"{profile['city']} for this category."
            if arche["demand"] in ("high", "medium")
            else "Niche local relevance; may need targeted outreach."
        )

        results.append(
            {
                "key": arche["key"],
                "title": arche["title"],
                "description": arche["description"],
                "demand": arche["demand"],
                "competition": arche["competition"],
                "difficulty": arche["difficulty"],
                "margin_range": arche["margin_range"],
                "base_cost_fraction": arche["base_cost"],
                "min_budget_pkr": arche["min_budget_pkr"],
                "channels": arche["channels"],
                "matched_tags": sorted(overlap),
                "local_relevance_note": local_relevance,
                "growth_trend": _trend_for(arche["demand"]),
            }
        )
    return results


def _trend_for(demand: str) -> str:
    return {
        "high": "Rising interest over the last 12 months",
        "medium": "Stable, consistent interest",
        "low": "Flat or declining interest",
    }.get(demand, "Stable interest")
