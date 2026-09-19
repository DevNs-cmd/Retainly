"""Minimal API-key protection for service-to-service access."""

from fastapi import HTTPException, Security, status
from fastapi.security import APIKeyHeader

from app.config.settings import get_settings


api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)


def require_api_key(api_key: str | None = Security(api_key_header)) -> None:
    """Protect versioned API routes when production authentication is enabled."""
    settings = get_settings()
    if not settings.REQUIRE_API_KEY:
        return
    if not settings.API_KEY:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="API authentication is enabled but not configured",
        )
    if api_key != settings.API_KEY:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing API key",
        )
