"""Database domain models and schemas for the minimal 4-table design.

Tables:
1. datasets
2. configurations
3. runs
4. overrides

Follows M4 Day-1 specification: clean typing, JSONB representations for
evolving data, UUID primary keys, and auditable overrides.
"""

from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional
from uuid import UUID, uuid4
from pydantic import BaseModel, ConfigDict, Field


class OverrideAction(str, Enum):
    """Allowed actions for manual organizer overrides."""
    PIN = "pin"
    EXCLUDE = "exclude"
    WAITLIST = "waitlist"


# ==============================================================================
# 1. DATASETS
# ==============================================================================

class DatasetBase(BaseModel):
    name: str = Field(..., description="Uploaded file name or dataset label")
    content_hash: str = Field(..., description="SHA-256 of raw uploaded file")


class DatasetCreate(DatasetBase):
    teams_json: List[Dict[str, Any]] = Field(..., description="Normalized teams & members array")
    validation_report_json: Dict[str, Any] = Field(..., description="Validation summary and errors/warnings")


class DatasetRecord(DatasetBase):
    id: UUID = Field(default_factory=uuid4)
    uploaded_at: datetime = Field(default_factory=datetime.utcnow)
    teams_json: List[Dict[str, Any]]
    validation_report_json: Dict[str, Any]

    model_config = ConfigDict(from_attributes=True)


class DatasetSummary(BaseModel):
    id: UUID
    name: str
    uploaded_at: datetime
    content_hash: str
    team_count: int = 0


# ==============================================================================
# 2. CONFIGURATIONS
# ==============================================================================

class ConfigurationBase(BaseModel):
    name: str = Field(..., description="Name of scoring strategy or preset")
    is_preset: bool = Field(default=False, description="True if immutable system preset")
    config_json: Dict[str, Any] = Field(
        ...,
        description="Full ScoringConfiguration (criteria, eligibility_rules, top_x, etc.)"
    )


class ConfigurationCreate(ConfigurationBase):
    pass


class ConfigurationUpdate(BaseModel):
    name: Optional[str] = None
    config_json: Optional[Dict[str, Any]] = None


class ConfigurationRecord(ConfigurationBase):
    id: UUID = Field(default_factory=uuid4)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    model_config = ConfigDict(from_attributes=True)


class ConfigurationListItem(BaseModel):
    id: UUID
    name: str
    is_preset: bool
    created_at: datetime


# ==============================================================================
# 3. RUNS
# ==============================================================================

class RunBase(BaseModel):
    dataset_id: UUID = Field(..., description="Foreign key to datasets table")


class RunCreate(RunBase):
    config_id: Optional[UUID] = Field(None, description="Source config ID (snapshot will be taken)")
    config_snapshot_json: Dict[str, Any] = Field(..., description="Frozen configuration snapshot used for this run")
    run_hash: str = Field(..., description="Deterministic SHA-256 of canonical dataset + config")
    results_json: Dict[str, Any] = Field(..., description="Output contract: scores, ranks, explanations, member values")


class RunRecord(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    dataset_id: UUID
    config_snapshot_json: Dict[str, Any]
    run_hash: str
    results_json: Dict[str, Any]
    created_at: datetime = Field(default_factory=datetime.utcnow)

    model_config = ConfigDict(from_attributes=True)


class RunListItem(BaseModel):
    id: UUID
    dataset_id: UUID
    run_hash: str
    created_at: datetime
    team_count: Optional[int] = None
    shortlisted_count: Optional[int] = None


# ==============================================================================
# 4. OVERRIDES
# ==============================================================================

class OverrideBase(BaseModel):
    team_id: str = Field(..., description="ID of the team being manually adjusted (e.g., 'T001')")
    action: OverrideAction = Field(..., description="Action: pin | exclude | waitlist")
    reason: str = Field(..., min_length=3, description="Auditable organizer rationale")


class OverrideCreate(OverrideBase):
    pass


class OverrideRecord(OverrideBase):
    id: UUID = Field(default_factory=uuid4)
    run_id: UUID = Field(..., description="Associated run ID")
    created_at: datetime = Field(default_factory=datetime.utcnow)

    model_config = ConfigDict(from_attributes=True)
