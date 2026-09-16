"""
Transparent 0-100 opportunity scoring system.

Weights:
  Market Demand        25%
  Competition          15%
  Budget Fit           20%
  Skill Fit            15%
  Scalability          15%
  Execution Difficulty 10%
"""
from app.services.knowledge_base import COMPETITION_SCORE, DEMAND_SCORE, DIFFICULTY_SCORE

WEIGHTS = {
    "market_demand": 0.25,
    "competition": 0.15,
    "budget_fit": 0.20,
    "skill_fit": 0.15,
    "scalability": 0.15,
    "execution_difficulty": 0.10,
}


def score_opportunity(profile: dict, market_result: dict) -> dict:
    demand_score = DEMAND_SCORE.get(market_result["demand"], 60)
    competition_score = COMPETITION_SCORE.get(market_result["competition"], 60)
    difficulty_score = DIFFICULTY_SCORE.get(market_result["difficulty"], 60)

    budget_fit_score = _budget_fit_score(profile, market_result)
    skill_fit_score = _skill_fit_score(profile, market_result)
    scalability_score = _scalability_score(market_result)

    breakdown = {
        "market_demand": round(demand_score),
        "competition": round(competition_score),
        "budget_fit": round(budget_fit_score),
        "skill_fit": round(skill_fit_score),
        "scalability": round(scalability_score),
        "execution_difficulty": round(difficulty_score),
    }

    total = sum(breakdown[k] * WEIGHTS[k] for k in WEIGHTS)
    total = max(0, min(100, round(total)))

    return {"total": total, "breakdown": breakdown, "explanation": _explain(breakdown)}


def _budget_fit_score(profile: dict, market_result: dict) -> float:
    budget = profile["budget"]
    min_budget = market_result.get("min_budget_pkr", 0)
    if budget <= 0:
        return 40
    if not min_budget:
        return 60
    ratio = budget / max(min_budget, 1)
    if ratio >= 3:
        return 95
    if ratio >= 2:
        return 85
    if ratio >= 1.3:
        return 70
    if ratio >= 1:
        return 55
    return 30


def _skill_fit_score(profile: dict, market_result: dict) -> float:
    matched = len(market_result.get("matched_tags", []))
    if matched >= 3:
        return 95
    if matched == 2:
        return 80
    if matched == 1:
        return 65
    return 45


def _scalability_score(market_result: dict) -> float:
    digital_hint = "digital" in market_result.get("channels", []) or market_result[
        "key"
    ] in ("digital_products", "print_on_demand", "freelance_tech_services")
    base = 75 if digital_hint else 60
    if market_result["demand"] == "high":
        base += 10
    return min(base, 95)


def _explain(breakdown: dict) -> str:
    strongest = max(breakdown, key=breakdown.get)
    weakest = min(breakdown, key=breakdown.get)
    label = {
        "market_demand": "market demand",
        "competition": "manageable competition",
        "budget_fit": "budget fit",
        "skill_fit": "skill fit",
        "scalability": "scalability",
        "execution_difficulty": "ease of execution",
    }
    return (
        f"Strongest factor: {label[strongest]}. "
        f"Area to watch: {label[weakest]}."
    )
