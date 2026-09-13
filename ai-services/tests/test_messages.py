import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_send_email_simulated():
    payload = {
        "to_email": "coach@example.com",
        "template": "churn_alert",
        "context": {
            "customer_id": "student_101",
            "churn_probability": 0.82
        }
    }
    response = client.post("/api/v1/messages/send", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "simulated"
    assert data["to"] == "coach@example.com"
    assert "student_101" in data["subject"]


def test_send_email_missing_context_variable():
    """Missing template variable in context must return 400 Bad Request."""
    payload = {
        "to_email": "coach@example.com",
        "template": "churn_alert",
        "context": {
            # Missing "churn_probability"
            "customer_id": "student_101"
        }
    }
    response = client.post("/api/v1/messages/send", json=payload)
    assert response.status_code == 400
    assert "Missing required template context" in response.json()["detail"]


def test_send_email_unknown_template():
    payload = {
        "to_email": "coach@example.com",
        "template": "nonexistent_template",
        "context": {}
    }
    response = client.post("/api/v1/messages/send", json=payload)
    assert response.status_code == 400
    assert "Unknown template" in response.json()["detail"]


def test_send_churn_alert():
    payload = {
        "customer_id": "student_202",
        "churn_probability": 0.78,
        "to_email": "retention-team@example.com"
    }
    response = client.post("/api/v1/messages/churn-alert", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "simulated"
    assert data["to"] == "retention-team@example.com"
    assert "student_202" in data["subject"]
