from typing import List
from app.schemas.risk import (
    RiskScoreRequest, RiskScoreResponse,
    BatchRiskRequest, BatchRiskResponse,
    RiskLevel, RiskFactor
)


class RiskService:
    """Rule-based + weighted risk scoring engine."""

    WEIGHTS = {
        "support_tickets": 0.25,
        "last_login_days": 0.20,
        "payment_failures": 0.20,
        "nps_score": 0.15,
        "engagement_score": 0.10,
        "tenure_months": 0.10,
    }

    def score(self, request: RiskScoreRequest) -> RiskScoreResponse:
        breakdown = {}
        factors = []

        # Support tickets risk (0-100)
        ticket_score = min(request.support_tickets * 20, 100)
        breakdown["support_tickets"] = ticket_score
        if request.support_tickets >= 3:
            factors.append(RiskFactor(factor="High support tickets", weight=self.WEIGHTS["support_tickets"],
                                       value=str(request.support_tickets), impact="negative"))

        # Last login risk
        login_score = min(request.last_login_days * 2, 100)
        breakdown["last_login_days"] = login_score
        if request.last_login_days > 30:
            factors.append(RiskFactor(factor="Low engagement", weight=self.WEIGHTS["last_login_days"],
                                       value=f"{request.last_login_days}d", impact="negative"))

        # Payment failure risk
        payment_score = min(request.payment_failures * 40, 100)
        breakdown["payment_failures"] = payment_score
        if request.payment_failures > 0:
            factors.append(RiskFactor(factor="Payment failures", weight=self.WEIGHTS["payment_failures"],
                                       value=str(request.payment_failures), impact="negative"))

        # NPS risk
        nps_score = 0
        if request.nps_score is not None:
            nps_score = max(0, (6 - request.nps_score) * 14)
        breakdown["nps_score"] = nps_score

        # Engagement
        engagement_score = 0
        if request.engagement_score is not None:
            engagement_score = max(0, 100 - request.engagement_score)
        breakdown["engagement_score"] = engagement_score

        # Tenure (newer customers are higher risk)
        tenure_score = max(0, 60 - request.tenure_months * 2)
        breakdown["tenure_months"] = tenure_score

        # Weighted total
        total = sum(breakdown[k] * self.WEIGHTS[k] for k in breakdown if k in self.WEIGHTS)
        total = round(min(total, 100), 2)

        level = self._risk_level(total)
        actions = self._recommended_actions(level, factors)

        return RiskScoreResponse(
            customer_id=request.customer_id,
            risk_score=total,
            risk_level=level,
            risk_factors=factors,
            recommended_actions=actions,
            score_breakdown=breakdown,
        )

    def score_batch(self, request: BatchRiskRequest) -> BatchRiskResponse:
        results = [self.score(c) for c in request.customers]
        return BatchRiskResponse(
            results=results,
            total=len(results),
            critical_count=sum(1 for r in results if r.risk_level == RiskLevel.CRITICAL),
            high_count=sum(1 for r in results if r.risk_level == RiskLevel.HIGH),
        )

    def _risk_level(self, score: float) -> RiskLevel:
        if score >= 75:
            return RiskLevel.CRITICAL
        elif score >= 50:
            return RiskLevel.HIGH
        elif score >= 25:
            return RiskLevel.MEDIUM
        return RiskLevel.LOW

    def _recommended_actions(self, level: RiskLevel, factors: List[RiskFactor]) -> List[str]:
        actions = []
        if level in (RiskLevel.CRITICAL, RiskLevel.HIGH):
            actions.append("Schedule immediate customer success call")
            actions.append("Offer retention discount")
        if any(f.factor == "High support tickets" for f in factors):
            actions.append("Escalate open support tickets")
        if any(f.factor == "Low engagement" for f in factors):
            actions.append("Send re-engagement email campaign")
        if any(f.factor == "Payment failures" for f in factors):
            actions.append("Assist with payment method update")
        return actions or ["Monitor and check in next quarter"]
