import pytest
import numpy as np
from unittest.mock import MagicMock, patch
from app.schemas.churn import CustomerFeatures, ChurnPredictionRequest, BatchChurnRequest, ChurnRisk
from app.services.churn_service import ChurnService


SAMPLE_CUSTOMER = CustomerFeatures(
    customer_id="test_001",
    tenure_months=12,
    monthly_charges=79.99,
    total_charges=959.88,
    num_products=2,
    support_tickets=1,
    last_login_days=7,
    nps_score=7,
    contract_type="monthly",
    payment_method="credit_card",
)


@pytest.fixture
def service():
    with patch("app.services.churn_service.ChurnPredictor") as MockPredictor:
        mock_pred = MockPredictor.return_value
        mock_pred.is_loaded = True
        mock_pred.predict_proba.return_value = 0.75
        svc = ChurnService.__new__(ChurnService)
        svc.predictor = mock_pred
        svc.explainer = MagicMock()
        svc.threshold = 0.5
        svc.model_version = "1.0.0"
        yield svc


def test_predict_high_risk(service):
    request = ChurnPredictionRequest(customer=SAMPLE_CUSTOMER, include_explanation=False)
    response = service.predict(request)
    assert response.churn_probability == 0.75
    assert response.churn_risk == ChurnRisk.HIGH
    assert response.prediction is True
    assert 0 <= response.confidence <= 1


def test_predict_low_risk(service):
    service.predictor.predict_proba.return_value = 0.2
    request = ChurnPredictionRequest(customer=SAMPLE_CUSTOMER, include_explanation=False)
    response = service.predict(request)
    assert response.churn_risk == ChurnRisk.LOW
    assert response.prediction is False


def test_risk_label_thresholds(service):
    assert service._risk_label(0.75) == ChurnRisk.HIGH
    assert service._risk_label(0.5) == ChurnRisk.MEDIUM
    assert service._risk_label(0.2) == ChurnRisk.LOW


def test_batch_predict(service):
    service.predictor.predict_proba.return_value = 0.8
    request = BatchChurnRequest(customers=[SAMPLE_CUSTOMER, SAMPLE_CUSTOMER], include_explanation=False)
    response = service.predict_batch(request)
    assert response.total == 2
    assert response.high_risk_count == 2


def test_explanation_service_shap():
    from app.services.explanation_service import ExplanationService
    from sklearn.ensemble import GradientBoostingClassifier

    # Train a minimal classifier to test tree explainability
    X = np.array([[12, 50.0, 600.0, 2, 1, 5, 7.0, 1, 0],
                  [1, 90.0, 90.0, 1, 4, 30, 2.0, 1, 0]])
    y = np.array([0, 1])
    clf = GradientBoostingClassifier(n_estimators=5, random_state=42).fit(X, y)

    explainer_svc = ExplanationService()
    explanation = explainer_svc.explain_churn(X[0:1], clf)

    assert explanation is not None
    assert explanation["method"] == "SHAP"
    assert "top_factors" in explanation
    assert len(explanation["top_factors"]) > 0
    assert "base_value" in explanation


def test_explanation_service_fallback():
    from app.services.explanation_service import ExplanationService
    explainer_svc = ExplanationService()
    features = np.array([[2, 50.0, 100.0, 1, 4, 35, 7.0, 1, 0]])
    fallback = explainer_svc._fallback_explanation(features)
    assert fallback["method"] == "rule_based"
    assert len(fallback["top_factors"]) > 0

