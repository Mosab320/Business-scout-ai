"""
Orchestrator for the Business Scout AI multi-agent pipeline.

Pipeline:
  Planner -> Market Research -> [Competitor Analysis + Finance + Marketing] (per idea)
          -> Scoring -> Business Advisor -> Execution (for the saved/selected idea)

Each stage is a small, focused agent module under app/agents/. This keeps
responsibilities separated the way a real multi-agent system would, while
remaining fully functional offline (DEMO_MODE) via deterministic reasoning
grounded in app/services/knowledge_base.py, with an optional real-LLM layer
in app.services.ai_client used automatically when configured.
"""
import uuid

from app.agents import (
    business_advisor_agent,
    competitor_analysis_agent,
    execution_agent,
    finance_agent,
    market_research_agent,
    marketing_agent,
    planner_agent,
)
from app.agents.scoring import score_opportunity


async def run_scouting_pipeline(session_id: str, profile: dict) -> dict:
    plan = await planner_agent.run(profile)
    market_results = await market_research_agent.run(profile, plan["business_categories"])

    opportunities = []
    for market_result in market_results:
        competitor_result = await competitor_analysis_agent.run(market_result)
        finance_result = await finance_agent.run(profile, market_result)
        marketing_result = await marketing_agent.run(profile, market_result)
        scored = score_opportunity(profile, market_result)

        opportunity_id = str(uuid.uuid4())
        opportunities.append(
            {
                "id": opportunity_id,
                "session_id": session_id,
                "key": market_result["key"],
                "title": market_result["title"],
                "description": market_result["description"],
                "score": scored["total"],
                "score_breakdown": scored["breakdown"],
                "demand": market_result["demand"],
                "competition": market_result["competition"],
                "startup_cost": finance_result["initial_investment"],
                "estimated_margin": finance_result["estimated_gross_margin_pct"] + "%",
                "difficulty": market_result["difficulty"],
                "reasoning": scored["explanation"]
                + " "
                + competitor_result["competitor_positioning"],
                "risks": [
                    "Market conditions can shift; re-validate demand regularly",
                    "Actual costs may vary from category-average estimates",
                ],
                "market_gaps": competitor_result["market_gaps"],
                "marketing": marketing_result,
                "finance": finance_result,
                "competitor_analysis": competitor_result,
            }
        )

    advisor_result = await business_advisor_agent.run(opportunities)

    return {
        "plan": plan,
        "opportunities": opportunities,
        "best_opportunity_id": advisor_result["best_opportunity_id"],
        "advisor_summary": advisor_result["summary"],
    }


async def generate_execution_plan(opportunity_title: str) -> dict:
    return await execution_agent.run(opportunity_title)
