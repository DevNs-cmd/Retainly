"""Request and response models for a complete student retention analysis."""

from typing import List, Optional

from pydantic import BaseModel, Field

from app.schemas.churn import ChurnPredictionResponse, CustomerFeatures
from app.schemas.recommendation import RecommendationResponse
from app.schemas.risk import RiskScoreResponse


class StudentAnalysisRequest(BaseModel):
    """Student signals used to score risk and select retention actions."""

    customer: CustomerFeatures
    payment_failures: int = Field(0, ge=0)
    engagement_score: Optional[float] = Field(None, ge=0.0, le=100.0)
    days_since_last_purchase: Optional[int] = Field(None, ge=0)
    include_explanation: bool = True
    recommendation_count: int = Field(3, ge=1, le=10)


class StudentAnalysisResponse(BaseModel):
    """One call's complete, explainable retention result."""

    customer_id: str
    churn: ChurnPredictionResponse
    risk: RiskScoreResponse
    recommendations: RecommendationResponse


class BatchStudentAnalysisRequest(BaseModel):
    students: List[StudentAnalysisRequest] = Field(..., min_length=1)


class BatchStudentAnalysisResponse(BaseModel):
    results: List[StudentAnalysisResponse]
    total: int
    high_priority_count: int
