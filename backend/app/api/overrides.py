"""API Router: Overrides & Final Results (M4 Ownership).

Owner: Member 4 (Database & Integration)
Roadmap: Day 9 implementation.

Endpoints:
- POST /runs/{run_id}/overrides: Add manual organizer decision (pin, exclude, waitlist).
- GET /runs/{run_id}/overrides: List audit log of overrides for a run.
- GET /runs/{run_id}/final: Retrieve finalized team order with original automated rank preserved.
"""

from uuid import UUID
from fastapi import APIRouter, HTTPException, status
from backend.app.db.models import OverrideCreate

router = APIRouter(prefix="/runs/{run_id}", tags=["Overrides & Final View (M4)"])


@router.post("/overrides", status_code=status.HTTP_501_NOT_IMPLEMENTED)
async def create_override(run_id: UUID, override: OverrideCreate):
    """Record a manual organizer override (pin, exclude, waitlist).

    Contract: Owned by M4 (Day 9).
    Appends audit record to overrides table without modifying the stored automated run results.
    """
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="POST /runs/{run_id}/overrides is scheduled for Day 9 (Auditable override logging)",
    )


@router.get("/overrides", status_code=status.HTTP_501_NOT_IMPLEMENTED)
async def list_overrides(run_id: UUID):
    """List all manual overrides recorded for this evaluation run.

    Contract: Owned by M4 (Day 9).
    """
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="GET /runs/{run_id}/overrides is scheduled for Day 9 (Auditable override logging)",
    )


@router.get("/final", status_code=status.HTTP_501_NOT_IMPLEMENTED)
async def get_final_results(run_id: UUID):
    """Retrieve final ranking after manual overrides are applied.

    Contract: Owned by M4 (Day 9).
    CRITICAL: Preserves original automated rank side-by-side with overridden status.
    """
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="GET /runs/{run_id}/final is scheduled for Day 9 (Finalized ranking view)",
    )
