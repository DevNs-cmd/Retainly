from fastapi import APIRouter, HTTPException
from app.schemas.risk import RiskScoreRequest, RiskScoreResponse, BatchRiskRequest, BatchRiskResponse
from app.services.risk_service import RiskService
from app.utils.constants import MAX_BATCH_SIZE

router = APIRouter(prefix="/risk", tags=["Risk"])
_service = RiskService()


@router.post("/score", response_model=RiskScoreResponse, summary="Score risk for one customer")
def score_risk(request: RiskScoreRequest):
    try:
        return _service.score(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/score/batch", response_model=BatchRiskResponse, summary="Batch risk scoring")
def score_risk_batch(request: BatchRiskRequest):
    if len(request.customers) > MAX_BATCH_SIZE:
        raise HTTPException(status_code=400, detail=f"Batch size cannot exceed {MAX_BATCH_SIZE}")
    try:
        return _service.score_batch(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
