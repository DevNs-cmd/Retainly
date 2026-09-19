from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_urgent_workflow_plan_requires_coach_approval():
    response = client.post(
        "/api/v1/workflows/plan",
        json={
            "analysis_input": {
                "customer": {
                    "customer_id": "student_workflow_001",
                    "tenure_months": 1,
                    "monthly_charges": 89.99,
                    "total_charges": 89.99,
                    "num_products": 1,
                    "support_tickets": 5,
                    "last_login_days": 60,
                    "nps_score": 2,
                    "contract_type": "monthly",
                    "payment_method": "card",
                },
                "payment_failures": 2,
                "engagement_score": 10,
                "include_explanation": False,
            }
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["priority"] == "urgent"
    assert data["automation_allowed"] is False
    assert all(step["requires_coach_approval"] for step in data["steps"])
