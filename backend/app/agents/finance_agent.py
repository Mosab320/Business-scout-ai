"""Finance Agent: calculates realistic, clearly-labeled cost estimates."""


async def run(profile: dict, market_result: dict) -> dict:
    budget = profile["budget"]
    base_fraction = market_result["base_cost_fraction"]
    min_budget = market_result.get("min_budget_pkr", 0)

    # Anchor the estimate to a realistic floor for this category, letting it
    # creep up (not scale linearly) with extra budget -- capped at what the
    # user actually has. A pure "budget * fraction" scale meant literally
    # every category's cost would auto-adjust to fit any typed budget, which
    # made the budget input meaningless for filtering or differentiation.
    if min_budget:
        headroom = max(0, budget - min_budget)
        startup_cost = round(min(budget, min_budget + 0.15 * headroom), 2)
    else:
        startup_cost = round(budget * base_fraction, 2)

    inventory = round(startup_cost * 0.40, 2)
    marketing = round(startup_cost * 0.20, 2)
    packaging = round(startup_cost * 0.10, 2)
    tools = round(startup_cost * 0.15, 2)
    operations = round(startup_cost * 0.15, 2)

    low_margin, high_margin = market_result["margin_range"]
    avg_margin = (low_margin + high_margin) / 2
    est_selling_price_multiplier = round(1 / (1 - avg_margin / 100), 2)

    monthly_revenue_estimate = round(startup_cost * 0.6, 2)
    monthly_costs_estimate = round(operations + marketing * 0.5, 2)
    breakeven_months = (
        round(startup_cost / max(monthly_revenue_estimate - monthly_costs_estimate, 1), 1)
        if monthly_revenue_estimate > monthly_costs_estimate
        else None
    )

    return {
        "currency": profile["currency"],
        "initial_investment": startup_cost,
        "breakdown": {
            "inventory": inventory,
            "marketing": marketing,
            "packaging": packaging,
            "tools_equipment": tools,
            "operational_expenses": operations,
        },
        "estimated_gross_margin_pct": f"{low_margin}-{high_margin}",
        "selling_price_multiplier_hint": est_selling_price_multiplier,
        "estimated_breakeven_months": breakeven_months,
        "disclaimer": (
            "These figures are rough planning estimates based on category "
            "averages, not guaranteed outcomes. Validate with real supplier "
            "quotes and local pricing before committing funds."
        ),
    }
