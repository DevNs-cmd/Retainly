from unittest.mock import patch

from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_api_key_is_not_required_in_local_development():
    response = client.get("/api/v1/churn/health")
    assert response.status_code == 200


def test_api_key_is_required_when_enabled():
    with patch("app.core.security.get_settings") as mock_settings:
        mock_settings.return_value.REQUIRE_API_KEY = True
        mock_settings.return_value.API_KEY = "test-secret"
        response = client.get("/api/v1/churn/health")
        assert response.status_code == 401

        response = client.get("/api/v1/churn/health", headers={"X-API-Key": "test-secret"})
        assert response.status_code == 200
