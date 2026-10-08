"""API Router: Enrichment (M4 Ownership).

Owner: Member 4 (Database & Integration)
Roadmap: Day 10 implementation.

Endpoints:
- POST /enrich: Start background profile intelligence enrichment job for a dataset.
- GET /enrich/{job_id}: Check enrichment job progress and completion status.
"""

from uuid import UUID
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

router = APIRouter(prefix="/enrich", tags=["Enrichment (M4)"])


class EnrichRequest(BaseModel):
    dataset_id: UUID = Field(..., description="Dataset ID whose team members should be enriched")


@router.post("", status_code=status.HTTP_501_NOT_IMPLEMENTED)
async def start_enrichment(request: EnrichRequest):
    """Trigger background enrichment (resumes, GitHub, portfolio).

    Contract: Owned by M4 (Day 10).
    Orchestrates M2 signal extractors using a thread pool. Progress is tracked
    in memory / job file (NOT PostgreSQL) and results cached under cache/.
    """
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="POST /enrich is scheduled for Day 10 (Background enrichment job)",
    )


@router.get("/{job_id}", status_code=status.HTTP_501_NOT_IMPLEMENTED)
async def get_enrichment_status(job_id: str):
    """Poll enrichment job progress.

    Contract: Owned by M4 (Day 10).
    Returns total members, processed count, errors, and status (pending/running/completed/failed).
    """
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="GET /enrich/{job_id} is scheduled for Day 10 (Job status tracking)",
    )
