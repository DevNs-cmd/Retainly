from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from enum import Enum


class RecommendationType(str, Enum):
    DISCOUNT = "discount"
    UPGRADE = "upgrade"
    FEATURE_HIGHLIGHT = "feature_highlight"
    PERSONAL_OUTREACH = "personal_outreach"
    LOYALTY_REWARD = "loyalty_reward"
    PLAN_CHANGE = "plan_change"
    SUPPORT_ESCALATION = "support_escalation"


class RecommendationPriority(str, Enum):
    URGENT = "urgent"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


class Recommendation(BaseModel):
    id: str
    type: RecommendationType
    priority: RecommendationPriority
    title: str
    description: str
    expected_impact: str
    action_url: Optional[str] = None
    metadata: Dict[str, Any] = {}


class RecommendationRequest(BaseModel):
    customer_id: str
    churn_probability: Optional[float] = Field(None, ge=0.0, le=1.0)
    risk_score: Optional[float] = Field(None, ge=0.0, le=100.0)
    tenure_months: Optional[int] = None
    monthly_charges: Optional[float] = None
    num_products: Optional[int] = None
    last_login_days: Optional[int] = None
    nps_score: Optional[int] = Field(None, ge=0, le=10)
    top_n: int = Field(3, ge=1, le=10)


class RecommendationResponse(BaseModel):
    customer_id: str
    recommendations: List[Recommendation]
    total: int
    strategy: str
