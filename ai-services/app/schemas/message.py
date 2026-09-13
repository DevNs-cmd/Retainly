from pydantic import BaseModel, Field, EmailStr
from typing import Optional, Dict, Any


class SendEmailRequest(BaseModel):
    to_email: str = Field(..., description="Recipient email address")
    template: str = Field(..., description="Template name (e.g. churn_alert, retention_offer, re_engagement)")
    context: Dict[str, Any] = Field(default_factory=dict, description="Variables to render in the template")
    cc: Optional[str] = Field(None, description="Optional CC email address")


class ChurnAlertRequest(BaseModel):
    customer_id: str = Field(..., description="Identifier of the at-risk customer / student")
    churn_probability: float = Field(..., ge=0.0, le=1.0, description="Predicted churn probability (0.0 to 1.0)")
    to_email: str = Field(..., description="Recipient email address for coach / staff alert")
