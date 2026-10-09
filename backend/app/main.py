"""FastAPI Application Entrypoint for Team Recruitment Automation Tool.

Owner: Member 4 (Database & Integration)
Track: Incursion Track 3
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.app.api.compare import router as compare_router
from backend.app.api.configs import router as configs_router
from backend.app.api.enrich import router as enrich_router
from backend.app.api.export import router as export_router
from backend.app.api.overrides import router as overrides_router
from backend.app.api.rank import router as rank_router
from backend.app.api.runs import router as runs_router
from backend.app.api.upload import router as upload_router
from backend.app.core.config import settings

app = FastAPI(
    title="Team Recruitment Automation Tool API",
    description=(
        "Backend API for configurable, explainable, team-level hackathon shortlisting. "
        "Deterministic scoring, reproducible runs, auditable manual overrides, and zero AI-decided rankings."
    ),
    version=settings.VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS middleware for Next.js frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint.

    Returns simple JSON status indicating service availability.
    """
    return {"status": "ok"}


@app.get("/", tags=["Root"])
async def root_index():
    """Service metadata index."""
    return {
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        "status": "ok",
        "documentation": "/docs",
    }


# Include all team routers
# M2: Upload & Ingest
app.include_router(upload_router)

# M4: Configs, Runs, Overrides, Enrich, Export
app.include_router(configs_router)
app.include_router(runs_router)
app.include_router(overrides_router)
app.include_router(enrich_router)
app.include_router(export_router)

# M1: Scoring & Comparison
app.include_router(rank_router)
app.include_router(compare_router)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
