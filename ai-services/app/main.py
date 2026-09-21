from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import analysis, churn, feedback, risk, recommendations, messages, workflows
from app.config.settings import get_settings
from app.core.logging import configure_logging
from app.core.security import require_api_key

settings = get_settings()
configure_logging(settings.DEBUG)

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="AI-powered churn prediction, risk scoring, and retention recommendation services for Retainly.",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS
allow_all_origins = "*" in settings.CORS_ORIGINS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=not allow_all_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
prefix = settings.API_PREFIX
protected_route_options = {"dependencies": [Depends(require_api_key)]}
app.include_router(churn.router, prefix=prefix, **protected_route_options)
app.include_router(risk.router, prefix=prefix, **protected_route_options)
app.include_router(recommendations.router, prefix=prefix, **protected_route_options)
app.include_router(messages.router, prefix=prefix, **protected_route_options)
app.include_router(analysis.router, prefix=prefix, **protected_route_options)
app.include_router(feedback.router, prefix=prefix, **protected_route_options)
app.include_router(workflows.router, prefix=prefix, **protected_route_options)


@app.get("/", tags=["Root"])
def root():
    return {
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "docs": "/docs",
        "health": "/health",
    }


@app.get("/health", tags=["Root"])
def health():
    return {"status": "ok", "version": settings.APP_VERSION}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=settings.DEBUG)
