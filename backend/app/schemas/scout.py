from typing import Literal, Optional

from pydantic import BaseModel, Field

RiskLevel = Literal["low", "medium", "high"]
SalesChannel = Literal[
    "online_store", "marketplace", "social_media", "physical_store", "b2b", "services"
]


class BusinessProfileInput(BaseModel):
    budget: float = Field(gt=0, description="Available startup budget")
    currency: str = Field(default="PKR")
    country: str
    city: str
    business_type: Optional[str] = Field(
        default=None, description="e.g. product, service, digital, retail"
    )
    skills: list[str] = Field(default_factory=list)
    interests: list[str] = Field(default_factory=list)
    experience: Literal["beginner", "intermediate", "experienced"] = "beginner"
    risk_level: RiskLevel = "medium"
    sales_channel: SalesChannel = "online_store"
    goal: Optional[str] = Field(
        default=None, description="e.g. side income, full-time business, scale-up"
    )


class ScoutSessionResponse(BaseModel):
    id: str
    status: str
    created_at: str
    completed_at: Optional[str] = None
    profile: BusinessProfileInput


class OpportunityOut(BaseModel):
    id: str
    session_id: str
    title: str
    description: str
    score: int
    score_breakdown: dict
    demand: str
    competition: str
    startup_cost: float
    estimated_margin: str
    difficulty: str
    reasoning: str
    risks: list[str]
    market_gaps: list[str] = Field(default_factory=list)
    marketing: dict = Field(default_factory=dict)
    finance: dict = Field(default_factory=dict)
    saved: bool = False


class ScoutResultResponse(BaseModel):
    session: ScoutSessionResponse
    opportunities: list[OpportunityOut]
    best_opportunity_id: Optional[str] = None
    advisor_summary: Optional[str] = None
