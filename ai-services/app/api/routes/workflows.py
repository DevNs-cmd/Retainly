from fastapi import APIRouter, HTTPException

from app.schemas.workflow import WorkflowPlanRequest, WorkflowPlanResponse
from app.services.workflow_service import WorkflowService


router = APIRouter(prefix="/workflows", tags=["Retention Workflows"])
_service = WorkflowService()


@router.post("/plan", response_model=WorkflowPlanResponse, summary="Create a coach-reviewed retention workflow plan")
def create_workflow_plan(request: WorkflowPlanRequest):
    try:
        return _service.plan(request.analysis_input)
    except Exception as exc:
        raise HTTPException(status_code=500, detail="Workflow plan could not be created") from exc
