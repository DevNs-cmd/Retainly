"""Models for coach-reviewed retention workflow plans."""

from enum import Enum
from typing import List

from pydantic import BaseModel, Field

from app.schemas.analysis import StudentAnalysisRequest


class WorkflowPriority(str, Enum):
    URGENT = "urgent"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


class WorkflowStep(BaseModel):
    order: int
    action: str
    rationale: str
    requires_coach_approval: bool = True


class WorkflowPlanRequest(BaseModel):
    analysis_input: StudentAnalysisRequest


class WorkflowPlanResponse(BaseModel):
    customer_id: str
    priority: WorkflowPriority
    trigger_reason: str
    steps: List[WorkflowStep]
    automation_allowed: bool = False
