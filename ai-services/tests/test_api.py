import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
from app.main import app

client = TestClient(app)


def test_root():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "service" in data
    assert "version" in data


def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_churn_health():
    response = client.get("/api/v1/churn/health")
    assert response.status_code == 200


def test_churn_model_info():
    response = client.get("/api/v1/churn/model-info")
    assert response.status_code == 200
    data = response.json()
    assert data["model_loaded"] is True
    assert data["model_version"] == "0.1.0-sample"
    assert data["metadata"]["dataset_type"] == "synthetic"
    assert "roc_auc" in data["metadata"]["metrics"]


def test_risk_score_endpoint():
    payload = {
        "customer_id": "api_test_001",
        "tenure_months": 12,
        "monthly_charges": 49.99,
        "support_tickets": 2,
        "last_login_days": 10,
        "payment_failures": 0,
    }
    response = client.post("/api/v1/risk/score", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "risk_score" in data
    assert "risk_level" in data


def test_recommendation_endpoint():
    payload = {
        "customer_id": "api_test_001",
        "churn_probability": 0.8,
        "risk_score": 70.0,
        "last_login_days": 20,
        "num_products": 1,
        "tenure_months": 6,
        "top_n": 3,
    }
    response = client.post("/api/v1/recommendations/", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "recommendations" in data
    assert len(data["recommendations"]) > 0


def test_churn_predict_endpoint():
    """The churn endpoint returns a valid prediction."""
    payload = {
        "customer": {
            "customer_id": "api_test_002",
            "tenure_months": 8,
            "monthly_charges": 59.99,
            "total_charges": 479.92,
            "num_products": 2,
            "support_tickets": 0,
            "last_login_days": 5,
            "nps_score": 8,
            "contract_type": "monthly",
            "payment_method": "credit_card",
        },
        "include_explanation": False,
    }
    response = client.post("/api/v1/churn/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "churn_probability" in data


def test_churn_predict_with_explanation():
    """Predict churn and verify SHAP explanation factor output."""
    payload = {
        "customer": {
            "customer_id": "api_test_003",
            "tenure_months": 2,
            "monthly_charges": 89.99,
            "total_charges": 179.98,
            "num_products": 1,
            "support_tickets": 3,
            "last_login_days": 35,
            "nps_score": 3,
            "contract_type": "monthly",
            "payment_method": "credit_card",
        },
        "include_explanation": True,
    }
    response = client.post("/api/v1/churn/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "churn_probability" in data
    assert data["explanation"] is not None
    assert data["explanation"]["method"] == "SHAP"
    assert len(data["explanation"]["top_factors"]) > 0


def test_churn_batch_predict_endpoint():
    customer = {
        "customer_id": "batch_001",
        "tenure_months": 12,
        "monthly_charges": 49.99,
        "total_charges": 599.88,
        "num_products": 2,
        "support_tickets": 1,
        "last_login_days": 7,
        "nps_score": 8,
        "contract_type": "annual",
        "payment_method": "card",
    }
    response = client.post("/api/v1/churn/predict/batch", json={"customers": [customer, customer]})
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 2
    assert len(data["results"]) == 2


def test_risk_score_batch_endpoint():
    customer = {
        "customer_id": "batch_risk_001",
        "tenure_months": 3,
        "monthly_charges": 59.99,
        "support_tickets": 2,
        "last_login_days": 15,
        "payment_failures": 0,
    }
    response = client.post("/api/v1/risk/score/batch", json={"customers": [customer, customer]})
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 2
    assert len(data["results"]) == 2


def test_student_analysis_endpoint():
    payload = {
        "customer": {
            "customer_id": "student_analysis_001",
            "tenure_months": 2,
            "monthly_charges": 89.99,
            "total_charges": 179.98,
            "num_products": 1,
            "support_tickets": 3,
            "last_login_days": 35,
            "nps_score": 3,
            "contract_type": "monthly",
            "payment_method": "card",
        },
        "payment_failures": 1,
        "engagement_score": 25,
        "include_explanation": False,
    }
    response = client.post("/api/v1/analysis/student", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["customer_id"] == "student_analysis_001"
    assert "churn_probability" in data["churn"]
    assert "risk_score" in data["risk"]
    assert data["recommendations"]["recommendations"]


def test_student_batch_analysis_endpoint():
    student = {
        "customer": {
            "customer_id": "student_batch_analysis_001",
            "tenure_months": 6,
            "monthly_charges": 59.99,
            "total_charges": 359.94,
            "num_products": 2,
            "support_tickets": 1,
            "last_login_days": 10,
            "nps_score": 7,
            "contract_type": "annual",
            "payment_method": "card",
        },
        "include_explanation": False,
    }
    response = client.post("/api/v1/analysis/students/batch", json={"students": [student, student]})
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 2
    assert len(data["results"]) == 2
