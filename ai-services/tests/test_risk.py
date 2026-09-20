import pytest
from app.schemas.risk import RiskScoreRequest, RiskLevel
from app.services.risk_service import RiskService


@pytest.fixture
def service():
    return RiskService()


SAMPLE_REQUEST = RiskScoreRequest(
    customer_id="test_001",
    tenure_months=6,
    monthly_charges=49.99,
    support_tickets=3,
    last_login_days=35,
    payment_failures=1,
    engagement_score=40.0,
    nps_score=4,
)


def test_score_returns_valid_response(service):
    response = service.score(SAMPLE_REQUEST)
    assert response.customer_id == "test_001"
    assert 0 <= response.risk_score <= 100
    assert response.risk_level in RiskLevel.__members__.values()
    assert isinstance(response.recommended_actions, list)
    assert len(response.recommended_actions) > 0


def test_high_support_tickets_increases_score(service):
    low_tickets = SAMPLE_REQUEST.model_copy(update={"support_tickets": 0})
    high_tickets = SAMPLE_REQUEST.model_copy(update={"support_tickets": 5})
    low_resp = service.score(low_tickets)
    high_resp = service.score(high_tickets)
    assert high_resp.risk_score > low_resp.risk_score


def test_new_customer_higher_risk(service):
    new = SAMPLE_REQUEST.model_copy(update={"tenure_months": 1})
    established = SAMPLE_REQUEST.model_copy(update={"tenure_months": 36})
    new_resp = service.score(new)
    est_resp = service.score(established)
    assert new_resp.risk_score > est_resp.risk_score


def test_risk_level_critical(service):
    critical_req = RiskScoreRequest(
        customer_id="crit_001",
        tenure_months=1,
        monthly_charges=20.0,
        support_tickets=5,
        last_login_days=60,
        payment_failures=3,
        nps_score=1,
    )
    response = service.score(critical_req)
    assert response.risk_level in (RiskLevel.CRITICAL, RiskLevel.HIGH)


def test_risk_level_low(service):
    safe_req = RiskScoreRequest(
        customer_id="safe_001",
        tenure_months=48,
        monthly_charges=99.0,
        support_tickets=0,
        last_login_days=2,
        payment_failures=0,
        nps_score=9,
        engagement_score=90.0,
    )
    response = service.score(safe_req)
    assert response.risk_level in (RiskLevel.LOW, RiskLevel.MEDIUM)
