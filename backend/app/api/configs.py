"""API Router: Configurations (M4 Ownership).

Owner: Member 4 (Database & Integration)
Roadmap: Day 3 implementation.

Endpoints:
- POST /configs: Save a validated scoring configuration.
- GET /configs: List saved configurations and presets.
- GET /configs/{id}: Retrieve a specific configuration by ID.
- PUT /configs/{id}: Update an existing custom configuration.
"""

from uuid import UUID
from fastapi import APIRouter, HTTPException, status
from backend.app.db.models import ConfigurationCreate, ConfigurationUpdate

router = APIRouter(prefix="/configs", tags=["Configurations (M4)"])


@router.post("", status_code=status.HTTP_501_NOT_IMPLEMENTED)
async def create_configuration(config_in: ConfigurationCreate):
    """Save a new scoring configuration.

    Contract: Owned by M4 (Day 3).
    Validates payload against M1 config_validate rules and persists to database.
    """
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="POST /configs is scheduled for Day 3 (Database repository integration)",
    )


@router.get("", status_code=status.HTTP_501_NOT_IMPLEMENTED)
async def list_configurations():
    """List all saved configurations and default presets.

    Contract: Owned by M4 (Day 3).
    Returns list of configurations with is_preset indicator.
    """
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="GET /configs is scheduled for Day 3 (Database repository integration)",
    )


@router.get("/{config_id}", status_code=status.HTTP_501_NOT_IMPLEMENTED)
async def get_configuration(config_id: UUID):
    """Retrieve full configuration by ID.

    Contract: Owned by M4 (Day 3).
    """
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="GET /configs/{id} is scheduled for Day 3 (Database repository integration)",
    )


@router.put("/{config_id}", status_code=status.HTTP_501_NOT_IMPLEMENTED)
async def update_configuration(config_id: UUID, config_in: ConfigurationUpdate):
    """Update a custom configuration (system presets are immutable).

    Contract: Owned by M4 (Day 3).
    """
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="PUT /configs/{id} is scheduled for Day 3 (Database repository integration)",
    )
