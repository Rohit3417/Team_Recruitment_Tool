"""API Router: Runs & Evaluation (M4 Ownership).

Owner: Member 4 (Database & Integration)
Roadmap: Day 6 implementation (execution & retrieval), Day 13 (hash verification).

Endpoints:
- POST /runs: Execute evaluation run for dataset_id + config_id, save snapshot & results.
- GET /runs: List evaluation runs history.
- GET /runs/{run_id}: Retrieve run details, rankings, scores, and explanations.
- POST /runs/{run_id}/verify: Re-run stored dataset and config snapshot to verify deterministic run_hash.
"""

from typing import Optional
from uuid import UUID
from fastapi import APIRouter, HTTPException, Query, status
from pydantic import BaseModel, Field

router = APIRouter(prefix="/runs", tags=["Runs & Evaluation (M4)"])


class RunExecutionRequest(BaseModel):
    dataset_id: UUID = Field(..., description="ID of previously uploaded dataset")
    config_id: UUID = Field(..., description="ID of configuration to evaluate against")


@router.post("", status_code=status.HTTP_501_NOT_IMPLEMENTED)
async def create_run(request: RunExecutionRequest):
    """Trigger an evaluation run for a dataset and configuration.

    Contract: Owned by M4 (Day 6).
    Loads dataset and config, calls M1 evaluator, computes canonical run_hash,
    persists run record and config snapshot, and returns run_id.
    """
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="POST /runs is scheduled for Day 6 (Integration pipeline & scoring execution)",
    )


@router.get("", status_code=status.HTTP_501_NOT_IMPLEMENTED)
async def list_runs(dataset_id: Optional[UUID] = Query(None, description="Filter by dataset ID")):
    """List historical evaluation runs.

    Contract: Owned by M4 (Day 6).
    """
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="GET /runs is scheduled for Day 6 (Database repository integration)",
    )


@router.get("/{run_id}", status_code=status.HTTP_501_NOT_IMPLEMENTED)
async def get_run(run_id: UUID):
    """Retrieve evaluation run results, rankings, scores, and metadata.

    Contract: Owned by M4 (Day 6).
    """
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="GET /runs/{run_id} is scheduled for Day 6 (Database repository integration)",
    )


@router.post("/{run_id}/verify", status_code=status.HTTP_501_NOT_IMPLEMENTED)
async def verify_run(run_id: UUID):
    """Verify reproducibility of a historical run by re-running deterministic calculation.

    Contract: Owned by M4 (Day 13).
    Compares recomputed run_hash against stored run_hash.
    """
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="POST /runs/{run_id}/verify is scheduled for Day 13 (Deterministic hash verification)",
    )
