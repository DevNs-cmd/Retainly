"""Produces safe, coach-reviewed retention workflow plans."""

from app.schemas.analysis import StudentAnalysisRequest
from app.schemas.workflow import WorkflowPlanResponse, WorkflowPriority, WorkflowStep
from app.services.analysis_service import StudentAnalysisService


class WorkflowService:
    def __init__(self) -> None:
        self.analysis_service = StudentAnalysisService()

    def plan(self, request: StudentAnalysisRequest) -> WorkflowPlanResponse:
        analysis = self.analysis_service.analyze(request)
        risk = analysis.risk
        churn = analysis.churn

        if risk.risk_level.value == "critical" or churn.churn_risk.value == "high":
            priority = WorkflowPriority.URGENT
            trigger_reason = "Critical retention risk or high predicted churn"
            steps = [
                WorkflowStep(order=1, action="Assign a coach outreach task", rationale="Immediate human follow-up is needed."),
                WorkflowStep(order=2, action="Review support and payment issues", rationale="Resolve the risk factors before making an offer."),
                WorkflowStep(order=3, action="Approve a personalized retention offer", rationale="Use only after coach review."),
            ]
        elif risk.risk_level.value in {"high", "medium"} or churn.churn_risk.value == "medium":
            priority = WorkflowPriority.HIGH
            trigger_reason = "Elevated engagement or churn risk"
            steps = [
                WorkflowStep(order=1, action="Review the recommended actions", rationale="Choose the most relevant response for this student."),
                WorkflowStep(order=2, action="Send a re-engagement message", rationale="Encourage the next successful course activity."),
                WorkflowStep(order=3, action="Check progress in 7 days", rationale="Record the action outcome for future learning."),
            ]
        else:
            priority = WorkflowPriority.LOW
            trigger_reason = "Student currently shows low retention risk"
            steps = [
                WorkflowStep(order=1, action="Keep the student in the regular success cadence", rationale="No intervention is currently needed."),
                WorkflowStep(order=2, action="Review again after the next activity update", rationale="New data may change the risk assessment."),
            ]

        return WorkflowPlanResponse(
            customer_id=analysis.customer_id,
            priority=priority,
            trigger_reason=trigger_reason,
            steps=steps,
        )
