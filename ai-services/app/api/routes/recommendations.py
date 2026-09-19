from fastapi import APIRouter, HTTPException
from app.schemas.recommendation import RecommendationRequest, RecommendationResponse
from app.services.recommendation_service import RecommendationService

router = APIRouter(prefix="/recommendations", tags=["Recommendations"])
_service = RecommendationService()


@router.post("/", response_model=RecommendationResponse, summary="Get retention recommendations")
def get_recommendations(request: RecommendationRequest):
    try:
        return _service.recommend(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
