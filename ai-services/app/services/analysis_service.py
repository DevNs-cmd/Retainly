"""Orchestrates the individual AI services into one retention assessment."""

from app.schemas.analysis import (
    BatchStudentAnalysisRequest,
    BatchStudentAnalysisResponse,
    StudentAnalysisRequest,
    StudentAnalysisResponse,
)
from app.schemas.churn import ChurnPredictionRequest
from app.schemas.recommendation import RecommendationRequest
from app.schemas.risk import RiskScoreRequest
from app.services.churn_service import ChurnService
from app.services.recommendation_service import RecommendationService
from app.services.risk_service import RiskService


class StudentAnalysisService:
    """Produce risk, churn and recommended actions without sending messages."""

    def __init__(self) -> None:
        self.churn_service = ChurnService()
        self.risk_service = RiskService()
        self.recommendation_service = RecommendationService()

    def analyze(self, request: StudentAnalysisRequest) -> StudentAnalysisResponse:
        customer = request.customer
        churn = self.churn_service.predict(
            ChurnPredictionRequest(
                customer=customer,
                include_explanation=request.include_explanation,
            )
        )
        risk = self.risk_service.score(
            RiskScoreRequest(
                customer_id=customer.customer_id,
                tenure_months=customer.tenure_months,
                monthly_charges=customer.monthly_charges,
                support_tickets=customer.support_tickets,
                last_login_days=customer.last_login_days,
                payment_failures=request.payment_failures,
                engagement_score=request.engagement_score,
                nps_score=customer.nps_score,
                days_since_last_purchase=request.days_since_last_purchase,
            )
        )
        recommendations = self.recommendation_service.recommend(
            RecommendationRequest(
                customer_id=customer.customer_id,
                churn_probability=churn.churn_probability,
                risk_score=risk.risk_score,
                tenure_months=customer.tenure_months,
                monthly_charges=customer.monthly_charges,
                num_products=customer.num_products,
                last_login_days=customer.last_login_days,
                nps_score=customer.nps_score,
                top_n=request.recommendation_count,
            )
        )
        return StudentAnalysisResponse(
            customer_id=customer.customer_id,
            churn=churn,
            risk=risk,
            recommendations=recommendations,
        )

    def analyze_batch(self, request: BatchStudentAnalysisRequest) -> BatchStudentAnalysisResponse:
        results = [self.analyze(student) for student in request.students]
        high_priority_count = sum(
            result.risk.risk_level.value in {"high", "critical"}
            or result.churn.churn_risk.value == "high"
            for result in results
        )
        return BatchStudentAnalysisResponse(
            results=results,
            total=len(results),
            high_priority_count=high_priority_count,
        )
