from pydantic import BaseModel, Field
from typing import Optional, List, Dict
from enum import Enum


class RiskLevel(str, Enum):
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


class RiskFactor(BaseModel):
    factor: str
    weight: float
    value: str
    impact: str


class RiskScoreRequest(BaseModel):
    customer_id: str
    tenure_months: int = Field(..., ge=0)
    monthly_charges: float = Field(..., ge=0)
    support_tickets: int = Field(0, ge=0)
    last_login_days: int = Field(..., ge=0)
    payment_failures: int = Field(0, ge=0)
    engagement_score: Optional[float] = Field(None, ge=0.0, le=100.0)
    nps_score: Optional[int] = Field(None, ge=0, le=10)
    days_since_last_purchase: Optional[int] = Field(None, ge=0)


class RiskScoreResponse(BaseModel):
    customer_id: str
    risk_score: float = Field(..., ge=0.0, le=100.0)
    risk_level: RiskLevel
    risk_factors: List[RiskFactor]
    recommended_actions: List[str]
    score_breakdown: Dict[str, float]


class BatchRiskRequest(BaseModel):
    customers: List[RiskScoreRequest]


class BatchRiskResponse(BaseModel):
    results: List[RiskScoreResponse]
    total: int
    critical_count: int
    high_count: int
