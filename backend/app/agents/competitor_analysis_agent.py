"""Competitor Analysis Agent: analyzes the competitive landscape for each opportunity."""

COMPETITION_NOTES = {
    "low": {
        "positioning": "Few established players; room to define the category locally.",
        "gap": "First-mover advantage on branding and customer trust.",
    },
    "medium": {
        "positioning": "A handful of known players with mixed quality and service.",
        "gap": "Differentiate on customer service, speed, or niche targeting.",
    },
    "high": {
        "positioning": "Crowded space with established brands and price competition.",
        "gap": "Differentiate on a specific niche, bundling, or superior experience.",
    },
}


async def run(market_result: dict) -> dict:
    level = market_result["competition"]
    notes = COMPETITION_NOTES.get(level, COMPETITION_NOTES["medium"])

    return {
        "competition_level": level,
        "competitor_positioning": notes["positioning"],
        "pricing_signals": _pricing_signal(market_result),
        "market_gaps": [notes["gap"], "Underserved segments willing to pay for convenience"],
        "differentiation_opportunities": [
            "Localized service and faster fulfillment",
            "Stronger storytelling and social proof",
            "Bundled offers competitors don't provide",
        ],
    }


def _pricing_signal(market_result: dict) -> str:
    low, high = market_result["margin_range"]
    return (
        f"Typical gross margins observed in this category range from {low}% to {high}%, "
        "suggesting moderate room for competitive pricing."
    )
