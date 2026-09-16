from typing import Optional

from pydantic import BaseModel


class BusinessPlanRequest(BaseModel):
    opportunity_id: str


class DayTask(BaseModel):
    day: int
    week: int
    task: str
    description: str
    status: str = "pending"


class BusinessPlanOut(BaseModel):
    id: str
    opportunity_id: str
    business_name: str
    executive_summary: str
    business_concept: str
    target_customer: str
    product_strategy: str
    pricing_strategy: str
    competitor_strategy: str
    marketing_strategy: str
    sales_channels: list[str]
    startup_cost_estimate: dict
    operations: str
    risks: list[str]
    launch_plan: list[DayTask]
    created_at: str


class TaskStatusUpdate(BaseModel):
    day: int
    status: str
