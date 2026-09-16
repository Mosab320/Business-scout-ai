"""Business Advisor Agent: combines every other agent's output into final recommendations."""


async def run(opportunities: list[dict]) -> dict:
    if not opportunities:
        return {"best_opportunity_id": None, "summary": "No opportunities were generated."}

    ranked = sorted(opportunities, key=lambda o: o["score"], reverse=True)
    best = ranked[0]

    summary = (
        f"Based on your profile, \"{best['title']}\" is the strongest research-based match "
        f"with a score of {best['score']}/100. {best['reasoning']} "
        "This is a data-informed estimate, not a guarantee of success -- validate demand "
        "with real customers before investing significant funds."
    )

    return {"best_opportunity_id": best["id"], "summary": summary, "ranked_ids": [o["id"] for o in ranked]}
