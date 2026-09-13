from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_record_retention_feedback():
    response = client.post(
        "/api/v1/feedback/retention-action",
        json={
            "customer_id": "student_feedback_001",
            "action_type": "personal_outreach",
            "outcome": "completed",
            "notes": "Coach completed the scheduled call.",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["customer_id"] == "student_feedback_001"
    assert data["outcome"] == "completed"
    assert data["id"]


def test_feedback_summary():
    response = client.get("/api/v1/feedback/summary")
    assert response.status_code == 200
    data = response.json()
    assert "total" in data
    assert "by_outcome" in data


def test_action_performance():
    client.post(
        "/api/v1/feedback/retention-action",
        json={
            "customer_id": "student_feedback_002",
            "action_type": "personal_outreach",
            "outcome": "converted",
        },
    )
    response = client.get("/api/v1/feedback/action-performance")
    assert response.status_code == 200
    actions = response.json()["actions"]
    outreach = next(action for action in actions if action["action_type"] == "personal_outreach")
    assert outreach["total"] >= 1
    assert 0 <= outreach["conversion_rate"] <= 1
