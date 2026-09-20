from fastapi import APIRouter, HTTPException
from app.services.message_service import MessageService
from app.schemas.message import SendEmailRequest, ChurnAlertRequest

router = APIRouter(prefix="/messages", tags=["Messages"])
_service = MessageService()


@router.post("/send", summary="Send a templated email")
def send_email(request: SendEmailRequest):
    try:
        result = _service.send_email(
            to_email=request.to_email,
            template=request.template,
            context=request.context,
            cc=request.cc,
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/churn-alert", summary="Send a churn alert notification")
def send_churn_alert(request: ChurnAlertRequest):
    try:
        return _service.send_churn_alert(
            customer_id=request.customer_id,
            probability=request.churn_probability,
            to_email=request.to_email,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
