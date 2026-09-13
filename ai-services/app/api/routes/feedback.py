from fastapi import APIRouter, HTTPException

from app.schemas.feedback import (
    ActionPerformanceResponse,
    FeedbackSummaryResponse,
    RetentionFeedbackRequest,
    RetentionFeedbackResponse,
)
from app.services.feedback_service import FeedbackService


router = APIRouter(prefix="/feedback", tags=["Retention Feedback"])
_service = FeedbackService()


@router.post("/retention-action", response_model=RetentionFeedbackResponse, summary="Record a retention action outcome")
def record_retention_feedback(request: RetentionFeedbackRequest):
    try:
        return _service.record(request)
    except Exception as exc:
        raise HTTPException(status_code=500, detail="Feedback could not be recorded") from exc


@router.get("/summary", response_model=FeedbackSummaryResponse, summary="Summarize recorded action outcomes")
def feedback_summary():
    try:
        return _service.summary()
    except Exception as exc:
        raise HTTPException(status_code=500, detail="Feedback summary could not be loaded") from exc


@router.get("/action-performance", response_model=ActionPerformanceResponse, summary="Compare retention action outcomes")
def action_performance():
    try:
        return _service.action_performance()
    except Exception as exc:
        raise HTTPException(status_code=500, detail="Action performance could not be loaded") from exc
