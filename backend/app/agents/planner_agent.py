"""Planner Agent: receives the user's profile and produces a research plan."""
from app.services.ai_client import generate_json
from app.services.knowledge_base import BUSINESS_ARCHETYPES


async def run(profile: dict) -> dict:
    candidate_keys = _shortlist_categories(profile)

    plan = {
        "research_objectives": [
            f"Identify viable businesses within a {profile['currency']} "
            f"{profile['budget']:.0f} budget in {profile['city']}, {profile['country']}",
            "Match opportunities to the user's declared skills and interests",
            "Surface realistic demand, competition and cost signals per idea",
        ],
        "business_categories": candidate_keys,
        "required_market_info": [
            "demand", "growth_trend", "local_relevance", "customer_needs"
        ],
        "competitor_research_requirements": [
            "existing_players", "pricing_signals", "positioning", "market_gaps"
        ],
    }

    ai_plan = await generate_json(
        system_prompt=(
            "You are the Planner Agent inside Business Scout AI, an autonomous "
            "business research system. Given a user profile, output ONLY a JSON "
            "object with keys: research_objectives (array of strings), "
            "business_categories (array of short category keys), "
            "required_market_info (array of strings), "
            "competitor_research_requirements (array of strings)."
        ),
        user_prompt=str(profile),
    )
    if ai_plan:
        plan.update(ai_plan)
    return plan


def _shortlist_categories(profile: dict, min_results: int = 3, max_results: int = 6) -> list[str]:
    interests = {i.lower() for i in profile.get("interests", [])}
    skills = {s.lower() for s in profile.get("skills", [])}
    budget = profile.get("budget", 0)

    # Respect the user's actual budget as a real constraint: only consider
    # categories they can plausibly afford, based on a fixed realistic floor
    # per category -- not a percentage of whatever they typed, which would
    # let literally everything "fit" any budget.
    affordable = [a for a in BUSINESS_ARCHETYPES if budget >= a["min_budget_pkr"]]
    pool = affordable if len(affordable) >= min_results else BUSINESS_ARCHETYPES

    scored = []
    for arche in pool:
        tag_overlap = len(interests.union(skills).intersection(arche["tags"]))
        channel_match = profile.get("sales_channel") in arche["channels"]
        comfortably_affordable = budget >= arche["min_budget_pkr"] * 1.5
        score = tag_overlap * 3 + (2 if channel_match else 0) + (1 if comfortably_affordable else 0)
        scored.append((score, arche["key"]))

    scored.sort(key=lambda x: x[0], reverse=True)

    # Only keep genuine matches (real tag overlap, channel match, or clearly
    # comfortable budget) instead of always padding to a fixed count with
    # whatever's left over -- that padding is what made every profile see
    # the same number of ideas regardless of input.
    relevant = [key for score, key in scored if score > 0]
    top = relevant[:max_results]

    if len(top) < min_results:
        remaining = [key for _, key in scored if key not in top]
        top += remaining[: min_results - len(top)]

    return top
