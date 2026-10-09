"""API Router: Compare Configurations (M1 Ownership).

Owner: Member 1 (Backend A: Scoring Engine)
Roadmap: Day 11 implementation.

Endpoints:
- POST /compare: Compare results of two scoring configurations on the same dataset/run.
"""

from fastapi import APIRouter, HTTPException, status

router = APIRouter(prefix="/compare", tags=["Scoring & Ranking (M1)"])


@router.post("", status_code=status.HTTP_501_NOT_IMPLEMENTED)
async def compare_configurations():
    """Compare two scoring configurations.

    Contract: Owned by M1 (Day 11).
    Takes a run_id and two configuration IDs/payloads.
    Returns rank difference table and criterion-by-criterion delta.
    """
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="POST /compare is scheduled for Day 11 (Owned by Member 1 - Scoring Engine)",
    )
