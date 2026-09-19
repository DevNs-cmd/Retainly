from fastapi import APIRouter, HTTPException

from app.schemas.analysis import (
    BatchStudentAnalysisRequest,
    BatchStudentAnalysisResponse,
    StudentAnalysisRequest,
    StudentAnalysisResponse,
)
from app.services.analysis_service import StudentAnalysisService
from app.utils.constants import MAX_BATCH_SIZE


router = APIRouter(prefix="/analysis", tags=["Student Analysis"])
_service = StudentAnalysisService()


@router.post("/student", response_model=StudentAnalysisResponse, summary="Analyze one student's retention risk")
def analyze_student(request: StudentAnalysisRequest):
    """Combine churn, risk and recommendations; no message is sent by this endpoint."""
    try:
        return _service.analyze(request)
    except Exception as exc:
        raise HTTPException(status_code=500, detail="Student analysis could not be completed") from exc


@router.post("/students/batch", response_model=BatchStudentAnalysisResponse, summary="Analyze up to 500 students")
def analyze_students_batch(request: BatchStudentAnalysisRequest):
    if len(request.students) > MAX_BATCH_SIZE:
        raise HTTPException(status_code=400, detail=f"Batch size cannot exceed {MAX_BATCH_SIZE}")
    try:
        return _service.analyze_batch(request)
    except Exception as exc:
        raise HTTPException(status_code=500, detail="Student batch analysis could not be completed") from exc
