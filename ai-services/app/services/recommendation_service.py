import uuid
from typing import List
from app.schemas.recommendation import (
    RecommendationRequest, RecommendationResponse,
    Recommendation, RecommendationType, RecommendationPriority
)


class RecommendationService:
    """Rule-based recommendation engine for customer retention."""

    def recommend(self, request: RecommendationRequest) -> RecommendationResponse:
        recommendations: List[Recommendation] = []
        churn_prob = request.churn_probability or 0.0
        risk_score = request.risk_score or 0.0

        # High churn risk — immediate discount
        if churn_prob >= 0.7 or risk_score >= 75:
            recommendations.append(Recommendation(
                id=str(uuid.uuid4()),
                type=RecommendationType.DISCOUNT,
                priority=RecommendationPriority.URGENT,
                title="Offer 20% Retention Discount",
                description="Customer is at high churn risk. Offer a time-limited discount.",
                expected_impact="30-40% reduction in churn probability",
            ))
            recommendations.append(Recommendation(
                id=str(uuid.uuid4()),
                type=RecommendationType.PERSONAL_OUTREACH,
                priority=RecommendationPriority.URGENT,
                title="Personal Success Manager Call",
                description="Schedule a 1:1 call to understand pain points.",
                expected_impact="25% improvement in NPS",
            ))

        # Low engagement
        if request.last_login_days and request.last_login_days > 14:
            recommendations.append(Recommendation(
                id=str(uuid.uuid4()),
                type=RecommendationType.FEATURE_HIGHLIGHT,
                priority=RecommendationPriority.HIGH,
                title="Re-engagement Feature Spotlight",
                description="Send personalized email highlighting unused features.",
                expected_impact="15% increase in product engagement",
            ))

        # Single product upsell
        if request.num_products and request.num_products == 1 and churn_prob < 0.5:
            recommendations.append(Recommendation(
                id=str(uuid.uuid4()),
                type=RecommendationType.UPGRADE,
                priority=RecommendationPriority.MEDIUM,
                title="Upgrade to Bundle Plan",
                description="Customer uses only one product. Recommend a bundle.",
                expected_impact="Increase MRR by 40%",
            ))

        # Long tenure — loyalty reward
        if request.tenure_months and request.tenure_months >= 12 and churn_prob < 0.5:
            recommendations.append(Recommendation(
                id=str(uuid.uuid4()),
                type=RecommendationType.LOYALTY_REWARD,
                priority=RecommendationPriority.LOW,
                title="Loyalty Anniversary Gift",
                description="Celebrate 1+ year milestone with a gift or badge.",
                expected_impact="Improved sentiment, 10% NPS increase",
            ))

        # Default fallback
        if not recommendations:
            recommendations.append(Recommendation(
                id=str(uuid.uuid4()),
                type=RecommendationType.FEATURE_HIGHLIGHT,
                priority=RecommendationPriority.LOW,
                title="Monthly Newsletter",
                description="Include customer in monthly product update newsletter.",
                expected_impact="Maintain engagement",
            ))

        top = recommendations[:request.top_n]
        strategy = "high_risk_retention" if churn_prob >= 0.7 else "growth" if churn_prob < 0.3 else "engagement"

        return RecommendationResponse(
            customer_id=request.customer_id,
            recommendations=top,
            total=len(top),
            strategy=strategy,
        )
