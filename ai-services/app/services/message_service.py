import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional, Dict, Any
from app.config.settings import get_settings

settings = get_settings()


class MessageService:
    """Handles outbound email and notification delivery."""

    TEMPLATES = {
        "churn_alert": {
            "subject": "Action Required: High Churn Risk Customer — {customer_id}",
            "body": "Customer {customer_id} has a churn probability of {churn_probability:.0%}. Immediate action recommended.",
        },
        "retention_offer": {
            "subject": "Exclusive Offer for You, {customer_name}!",
            "body": "Hi {customer_name},\n\nWe value your loyalty. Enjoy {discount}% off your next invoice.",
        },
        "re_engagement": {
            "subject": "We miss you, {customer_name}!",
            "body": "Hi {customer_name},\n\nWe noticed you haven't logged in recently. Here's what's new...",
        },
    }

    def send_email(
        self,
        to_email: str,
        template: str,
        context: Dict[str, Any],
        cc: Optional[str] = None,
    ) -> Dict[str, Any]:
        if template not in self.TEMPLATES:
            raise ValueError(f"Unknown template: {template}")

        tmpl = self.TEMPLATES[template]
        try:
            subject = tmpl["subject"].format(**context)
            body = tmpl["body"].format(**context)
        except KeyError as e:
            raise ValueError(f"Missing required template context variable: {e}")

        if not settings.SMTP_HOST:
            # Log only in dev mode
            print(f"[DEV] Email to {to_email}: {subject}")
            return {"status": "simulated", "to": to_email, "subject": subject}

        try:
            msg = MIMEMultipart()
            msg["From"] = settings.SMTP_USER
            msg["To"] = to_email
            msg["Subject"] = subject
            if cc:
                msg["Cc"] = cc
            msg.attach(MIMEText(body, "plain"))

            with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
                server.starttls()
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                server.sendmail(settings.SMTP_USER, to_email, msg.as_string())

            return {"status": "sent", "to": to_email, "subject": subject}
        except Exception as e:
            return {"status": "failed", "error": str(e)}

    def send_churn_alert(self, customer_id: str, probability: float, to_email: str) -> Dict:
        return self.send_email(
            to_email=to_email,
            template="churn_alert",
            context={"customer_id": customer_id, "churn_probability": probability},
        )
