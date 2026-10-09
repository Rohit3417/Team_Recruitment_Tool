"""SQLAlchemy ORM models and schema re-exports for the minimal 4-table design.

Core Tables:
1. datasets
2. configurations
3. runs
4. overrides

Follows M4 Day-2 specification: SQLAlchemy 2.0 DeclarativeBase, UUID primary keys,
PostgreSQL JSONB payloads, timezone-aware TIMESTAMPTZ timestamps, and foreign-key cascades.
"""

from datetime import datetime, timezone
from typing import Any, Dict, List
import uuid
from uuid import uuid4

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    DateTime,
    ForeignKey,
    Index,
    String,
    Text,
    text,
)
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship

# Re-export all Pydantic schemas so existing imports continue working seamlessly
from backend.app.db.schemas import (
    ConfigurationBase,
    ConfigurationCreate,
    ConfigurationListItem,
    ConfigurationRecord,
    ConfigurationUpdate,
    DatasetBase,
    DatasetCreate,
    DatasetRecord,
    DatasetSummary,
    OverrideAction,
    OverrideBase,
    OverrideCreate,
    OverrideRecord,
    RunBase,
    RunCreate,
    RunListItem,
    RunRecord,
)

__all__ = [
    "Base",
    "Dataset",
    "Configuration",
    "Run",
    "Override",
    "DatasetModel",
    "ConfigurationModel",
    "RunModel",
    "OverrideModel",
    "OverrideAction",
    "DatasetBase",
    "DatasetCreate",
    "DatasetRecord",
    "DatasetSummary",
    "ConfigurationBase",
    "ConfigurationCreate",
    "ConfigurationUpdate",
    "ConfigurationRecord",
    "ConfigurationListItem",
    "RunBase",
    "RunCreate",
    "RunRecord",
    "RunListItem",
    "OverrideBase",
    "OverrideCreate",
    "OverrideRecord",
]


def now_utc() -> datetime:
    """Return timezone-aware current UTC time."""
    return datetime.now(timezone.utc)


class Base(DeclarativeBase):
    """Base declarative class for all SQLAlchemy ORM models."""
    pass


# ==============================================================================
# 1. DATASETS
# ==============================================================================

class Dataset(Base):
    """Normalized team registration datasets for reproducible runs."""

    __tablename__ = "datasets"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid4
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    uploaded_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=now_utc,
        server_default=text("CURRENT_TIMESTAMP"),
    )
    content_hash: Mapped[str] = mapped_column(String(64), nullable=False)
    teams_json: Mapped[List[Dict[str, Any]]] = mapped_column(JSONB, nullable=False)
    validation_report_json: Mapped[Dict[str, Any]] = mapped_column(
        JSONB, nullable=False
    )

    # Relationships
    runs = relationship("Run", back_populates="dataset", cascade="all, delete-orphan")

    __table_args__ = (
        Index("idx_datasets_content_hash", "content_hash"),
        Index("idx_datasets_uploaded_at", text("uploaded_at DESC")),
    )


# ==============================================================================
# 2. CONFIGURATIONS
# ==============================================================================

class Configuration(Base):
    """Saved scoring strategies, custom weightings, eligibility rules, and presets."""

    __tablename__ = "configurations"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid4
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    is_preset: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=False, server_default=text("FALSE")
    )
    config_json: Mapped[Dict[str, Any]] = mapped_column(JSONB, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=now_utc,
        server_default=text("CURRENT_TIMESTAMP"),
    )

    __table_args__ = (
        Index("idx_configurations_is_preset", "is_preset"),
        Index("idx_configurations_created_at", text("created_at DESC")),
    )


# ==============================================================================
# 3. RUNS
# ==============================================================================

class Run(Base):
    """Evaluation run history and deterministic results. Immutable once written."""

    __tablename__ = "runs"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid4
    )
    dataset_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("datasets.id", ondelete="CASCADE"),
        nullable=False,
    )
    config_snapshot_json: Mapped[Dict[str, Any]] = mapped_column(
        JSONB, nullable=False
    )
    run_hash: Mapped[str] = mapped_column(String(64), nullable=False)
    results_json: Mapped[Dict[str, Any]] = mapped_column(JSONB, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=now_utc,
        server_default=text("CURRENT_TIMESTAMP"),
    )

    # Relationships
    dataset = relationship("Dataset", back_populates="runs")
    overrides = relationship(
        "Override", back_populates="run", cascade="all, delete-orphan"
    )

    __table_args__ = (
        Index("idx_runs_dataset_id", "dataset_id"),
        Index("idx_runs_run_hash", "run_hash"),
        Index("idx_runs_created_at", text("created_at DESC")),
    )


# ==============================================================================
# 4. OVERRIDES
# ==============================================================================

class Override(Base):
    """Auditable organizer review decisions. Must NEVER rewrite automated run results."""

    __tablename__ = "overrides"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid4
    )
    run_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("runs.id", ondelete="CASCADE"),
        nullable=False,
    )
    team_id: Mapped[str] = mapped_column(String(64), nullable=False)
    action: Mapped[str] = mapped_column(String(20), nullable=False)
    reason: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=now_utc,
        server_default=text("CURRENT_TIMESTAMP"),
    )

    # Relationships
    run = relationship("Run", back_populates="overrides")

    __table_args__ = (
        CheckConstraint(
            "action IN ('pin', 'exclude', 'waitlist')", name="ck_overrides_action"
        ),
        Index("idx_overrides_run_id", "run_id"),
        Index("idx_overrides_run_team", "run_id", "team_id"),
    )


# Model aliases for convenience
DatasetModel = Dataset
ConfigurationModel = Configuration
RunModel = Run
OverrideModel = Override
