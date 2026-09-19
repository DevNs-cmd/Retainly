"""Models for recording the outcome of a retention action."""

from datetime import datetime
from enum import Enum
from typing import List, Optional

from pydantic import BaseModel, Field


class ActionOutcome(str, Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    CONVERTED = "converted"
    DISMISSED = "dismissed"
    CHURNED = "churned"


class RetentionFeedbackRequest(BaseModel):
    customer_id: str = Field(..., min_length=1)
    action_type: str = Field(..., min_length=1, description="For example: discount, outreach, re_engagement")
    outcome: ActionOutcome
    recommendation_id: Optional[str] = None
    notes: Optional[str] = Field(None, max_length=1_000)


class RetentionFeedbackResponse(BaseModel):
    id: str
    customer_id: str
    action_type: str
    outcome: ActionOutcome
    recorded_at: datetime


class FeedbackSummaryResponse(BaseModel):
    total: int
    by_outcome: dict[ActionOutcome, int]


class ActionPerformance(BaseModel):
    action_type: str
    total: int
    converted: int
    churned: int
    conversion_rate: float = Field(..., ge=0.0, le=1.0)


class ActionPerformanceResponse(BaseModel):
    actions: List[ActionPerformance]
