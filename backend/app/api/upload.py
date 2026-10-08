"""API Router: Upload & Datasets (M2 Ownership).

Owner: Member 2 (Backend B: Data and Profiles)
Roadmap: Day 4 implementation.

Endpoints:
- POST /upload: Accept CSV/JSON registration files, parse, validate, and store dataset.
- GET /datasets/{dataset_id}/teams: Retrieve normalized teams for an uploaded dataset.
"""

from uuid import UUID
from fastapi import APIRouter, HTTPException, status

router = APIRouter(tags=["Upload & Ingest (M2)"])


@router.post("/upload", status_code=status.HTTP_501_NOT_IMPLEMENTED)
async def upload_dataset():
    """Upload registration file (CSV or JSON).

    Contract: Owned by M2 (Day 4).
    Accepts multipart file upload, validates rows, saves normalized teams using
    M4's save_dataset, and returns dataset_id with validation report.
    """
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="POST /upload is scheduled for Day 4 (Owned by Member 2 - Data & Profiles)",
    )


@router.get("/datasets/{dataset_id}/teams", status_code=status.HTTP_501_NOT_IMPLEMENTED)
async def get_dataset_teams(dataset_id: UUID):
    """Retrieve normalized teams and members for a dataset.

    Contract: Owned by M2 (Day 4).
    """
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="GET /datasets/{dataset_id}/teams is scheduled for Day 4 (Owned by Member 2)",
    )
