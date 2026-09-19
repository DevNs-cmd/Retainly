from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from enum import Enum


class ChurnRisk(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class CustomerFeatures(BaseModel):
    customer_id: str = Field(..., description="Unique customer identifier")
    tenure_months: int = Field(..., ge=0)
    monthly_charges: float = Field(..., ge=0)
    total_charges: float = Field(..., ge=0)
    num_products: int = Field(..., ge=1)
    support_tickets: int = Field(0, ge=0)
    last_login_days: int = Field(..., ge=0)
    nps_score: Optional[int] = Field(None, ge=0, le=10)
    contract_type: str = Field(...)
    payment_method: str = Field(...)


class ChurnPredictionRequest(BaseModel):
    customer: CustomerFeatures
    include_explanation: bool = True


class ChurnPredictionResponse(BaseModel):
    customer_id: str
    churn_probability: float = Field(..., ge=0.0, le=1.0)
    churn_risk: ChurnRisk
    prediction: bool
    confidence: float
    explanation: Optional[Dict[str, Any]] = None
    model_version: str


class BatchChurnRequest(BaseModel):
    customers: List[CustomerFeatures]
    include_explanation: bool = False


class BatchChurnResponse(BaseModel):
    results: List[ChurnPredictionResponse]
    total: int
    high_risk_count: int
    medium_risk_count: int
    low_risk_count: int
