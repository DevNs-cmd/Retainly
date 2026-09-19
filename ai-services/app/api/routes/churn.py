from fastapi import APIRouter, HTTPException, Depends
from app.schemas.churn import ChurnPredictionRequest, ChurnPredictionResponse, BatchChurnRequest, BatchChurnResponse
from app.services.churn_service import ChurnService
from app.utils.constants import MAX_BATCH_SIZE

router = APIRouter(prefix="/churn", tags=["Churn"])
_service = ChurnService()


@router.post("/predict", response_model=ChurnPredictionResponse, summary="Predict churn for one customer")
def predict_churn(request: ChurnPredictionRequest):
    try:
        return _service.predict(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/predict/batch", response_model=BatchChurnResponse, summary="Batch churn prediction")
def predict_churn_batch(request: BatchChurnRequest):
    if len(request.customers) > MAX_BATCH_SIZE:
        raise HTTPException(status_code=400, detail=f"Batch size cannot exceed {MAX_BATCH_SIZE}")
    try:
        return _service.predict_batch(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/health", summary="Churn model health")
def churn_health():
    return {"status": "ok", "model_loaded": _service.predictor.is_loaded}


@router.get("/model-info", summary="Churn model version and evaluation metadata")
def churn_model_info():
    return _service.model_info()
