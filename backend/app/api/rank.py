"""API Router: Rank & Live Re-ranking (M1 Ownership).

Owner: Member 1 (Backend A: Scoring Engine)
Roadmap: Day 8 implementation.

Endpoints:
- POST /rank: Live what-if re-ranking from cached member criterion values without DB persistence.
"""

from fastapi import APIRouter, HTTPException, status

router = APIRouter(prefix="/rank", tags=["Scoring & Ranking (M1)"])


@router.post("", status_code=status.HTTP_501_NOT_IMPLEMENTED)
async def rank_teams():
    """Live what-if re-ranking calculation.

    Contract: Owned by M1 (Day 8).
    Takes a run_id (or dataset_id) and a modified scoring configuration.
    Recomputes team scores and ranks from stored member criterion values.
    Pure calculation; does not persist to database.
    """
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="POST /rank is scheduled for Day 8 (Owned by Member 1 - Scoring Engine)",
    )
