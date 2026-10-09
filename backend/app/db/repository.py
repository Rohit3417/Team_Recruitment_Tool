"""Database Repository implementation using SQLAlchemy 2.x and PostgreSQL.

Owner: Member 4 (Database & Integration)

Implements the 10 core CRUD functions across the 4 minimal tables:
1. save_dataset
2. get_dataset
3. save_config
4. list_configs
5. get_config
6. save_run
7. get_run
8. list_runs
9. add_override
10. list_overrides
Plus update_config for configuration lifecycle.

All functions are implemented with genuine PostgreSQL persistence,
clean transaction management, JSONB roundtrips, UUID validation,
and auditable immutability invariants.
"""

import asyncio
from typing import List, Optional
from uuid import UUID, uuid4

from sqlalchemy import select

from backend.app.db.models import (
    Configuration,
    ConfigurationCreate,
    ConfigurationRecord,
    ConfigurationUpdate,
    Dataset,
    DatasetCreate,
    DatasetRecord,
    Override,
    OverrideAction,
    OverrideCreate,
    OverrideRecord,
    Run,
    RunCreate,
    RunRecord,
    now_utc,
)
from backend.app.db.session import get_db_context


def _ensure_uuid(val: object) -> UUID:
    """Ensure val is a UUID instance."""
    if isinstance(val, UUID):
        return val
    return UUID(str(val))


class Repository:
    """Repository class encapsulating PostgreSQL operations for the 4 core tables."""

    def __init__(self, db_url: Optional[str] = None):
        self.db_url = db_url

    # ==========================================================================
    # DATASETS
    # ==========================================================================

    def save_dataset_sync(self, dataset: DatasetCreate) -> DatasetRecord:
        """Synchronously persist a validated dataset into the datasets table."""
        with get_db_context(self.db_url) as session:
            dataset_id = uuid4()
            now = now_utc()
            orm_obj = Dataset(
                id=dataset_id,
                name=dataset.name,
                content_hash=dataset.content_hash,
                teams_json=dataset.teams_json,
                validation_report_json=dataset.validation_report_json,
                uploaded_at=now,
            )
            session.add(orm_obj)
            session.flush()
            return DatasetRecord.model_validate(orm_obj)

    async def save_dataset(self, dataset: DatasetCreate) -> DatasetRecord:
        """Persist a newly ingested and validated dataset into the datasets table."""
        return await asyncio.to_thread(self.save_dataset_sync, dataset)

    def get_dataset_sync(self, dataset_id: UUID) -> Optional[DatasetRecord]:
        """Synchronously fetch a dataset record by its unique UUID."""
        uid = _ensure_uuid(dataset_id)
        with get_db_context(self.db_url) as session:
            orm_obj = session.get(Dataset, uid)
            if not orm_obj:
                return None
            return DatasetRecord.model_validate(orm_obj)

    async def get_dataset(self, dataset_id: UUID) -> Optional[DatasetRecord]:
        """Fetch a dataset record by its unique UUID."""
        return await asyncio.to_thread(self.get_dataset_sync, dataset_id)

    # ==========================================================================
    # CONFIGURATIONS
    # ==========================================================================

    def save_config_sync(self, config: ConfigurationCreate) -> ConfigurationRecord:
        """Synchronously persist a new scoring configuration or preset."""
        with get_db_context(self.db_url) as session:
            config_id = uuid4()
            now = now_utc()
            orm_obj = Configuration(
                id=config_id,
                name=config.name,
                is_preset=config.is_preset,
                config_json=config.config_json,
                created_at=now,
            )
            session.add(orm_obj)
            session.flush()
            return ConfigurationRecord.model_validate(orm_obj)

    async def save_config(self, config: ConfigurationCreate) -> ConfigurationRecord:
        """Persist a new scoring configuration or preset."""
        return await asyncio.to_thread(self.save_config_sync, config)

    def list_configs_sync(self) -> List[ConfigurationRecord]:
        """Synchronously list all configurations, ordered by created_at DESC."""
        with get_db_context(self.db_url) as session:
            stmt = select(Configuration).order_by(Configuration.created_at.desc())
            results = session.execute(stmt).scalars().all()
            return [ConfigurationRecord.model_validate(obj) for obj in results]

    async def list_configs(self) -> List[ConfigurationRecord]:
        """List all saved configurations and presets, ordered by created_at DESC."""
        return await asyncio.to_thread(self.list_configs_sync)

    def get_config_sync(self, config_id: UUID) -> Optional[ConfigurationRecord]:
        """Synchronously fetch a configuration by its UUID."""
        uid = _ensure_uuid(config_id)
        with get_db_context(self.db_url) as session:
            orm_obj = session.get(Configuration, uid)
            if not orm_obj:
                return None
            return ConfigurationRecord.model_validate(orm_obj)

    async def get_config(self, config_id: UUID) -> Optional[ConfigurationRecord]:
        """Fetch a configuration by its UUID."""
        return await asyncio.to_thread(self.get_config_sync, config_id)

    def update_config_sync(
        self, config_id: UUID, updates: ConfigurationUpdate
    ) -> Optional[ConfigurationRecord]:
        """Synchronously update a non-preset configuration."""
        uid = _ensure_uuid(config_id)
        with get_db_context(self.db_url) as session:
            orm_obj = session.get(Configuration, uid)
            if not orm_obj:
                return None
            if orm_obj.is_preset:
                raise ValueError("System presets are immutable and cannot be updated.")
            if updates.name is not None:
                orm_obj.name = updates.name
            if updates.config_json is not None:
                orm_obj.config_json = updates.config_json
            session.flush()
            return ConfigurationRecord.model_validate(orm_obj)

    async def update_config(
        self, config_id: UUID, updates: ConfigurationUpdate
    ) -> Optional[ConfigurationRecord]:
        """Update an existing configuration (presets cannot be overwritten)."""
        return await asyncio.to_thread(self.update_config_sync, config_id, updates)

    # ==========================================================================
    # RUNS
    # ==========================================================================

    def save_run_sync(self, run: RunCreate) -> RunRecord:
        """Synchronously persist an evaluation run with its configuration snapshot."""
        dataset_uid = _ensure_uuid(run.dataset_id)
        with get_db_context(self.db_url) as session:
            dataset_orm = session.get(Dataset, dataset_uid)
            if not dataset_orm:
                raise ValueError(f"Dataset with id {dataset_uid} does not exist.")

            run_id = uuid4()
            now = now_utc()
            orm_obj = Run(
                id=run_id,
                dataset_id=dataset_uid,
                config_snapshot_json=run.config_snapshot_json,
                run_hash=run.run_hash,
                results_json=run.results_json,
                created_at=now,
            )
            session.add(orm_obj)
            session.flush()
            return RunRecord.model_validate(orm_obj)

    async def save_run(self, run: RunCreate) -> RunRecord:
        """Persist an evaluation run with its configuration snapshot and results JSON."""
        return await asyncio.to_thread(self.save_run_sync, run)

    def get_run_sync(self, run_id: UUID) -> Optional[RunRecord]:
        """Synchronously retrieve an evaluation run by ID."""
        uid = _ensure_uuid(run_id)
        with get_db_context(self.db_url) as session:
            orm_obj = session.get(Run, uid)
            if not orm_obj:
                return None
            return RunRecord.model_validate(orm_obj)

    async def get_run(self, run_id: UUID) -> Optional[RunRecord]:
        """Retrieve an immutable evaluation run by ID."""
        return await asyncio.to_thread(self.get_run_sync, run_id)

    def list_runs_sync(self, dataset_id: Optional[UUID] = None) -> List[RunRecord]:
        """Synchronously list evaluation runs, optionally filtered by dataset_id."""
        with get_db_context(self.db_url) as session:
            stmt = select(Run)
            if dataset_id is not None:
                dataset_uid = _ensure_uuid(dataset_id)
                stmt = stmt.where(Run.dataset_id == dataset_uid)
            stmt = stmt.order_by(Run.created_at.desc())
            results = session.execute(stmt).scalars().all()
            return [RunRecord.model_validate(obj) for obj in results]

    async def list_runs(self, dataset_id: Optional[UUID] = None) -> List[RunRecord]:
        """List evaluation runs, optionally filtered by dataset_id, ordered by created_at DESC."""
        return await asyncio.to_thread(self.list_runs_sync, dataset_id)

    # ==========================================================================
    # OVERRIDES
    # ==========================================================================

    def add_override_sync(
        self, run_id: UUID, override: OverrideCreate
    ) -> OverrideRecord:
        """Synchronously append an auditable manual organizer decision."""
        action_str = (
            override.action.value
            if isinstance(override.action, OverrideAction)
            else str(override.action)
        )
        if action_str not in ("pin", "exclude", "waitlist"):
            raise ValueError(
                f"Invalid override action '{action_str}'. Must be 'pin', 'exclude', or 'waitlist'."
            )

        run_uid = _ensure_uuid(run_id)
        with get_db_context(self.db_url) as session:
            run_orm = session.get(Run, run_uid)
            if not run_orm:
                raise ValueError(f"Run with id {run_uid} does not exist.")

            override_id = uuid4()
            now = now_utc()
            orm_obj = Override(
                id=override_id,
                run_id=run_uid,
                team_id=override.team_id,
                action=action_str,
                reason=override.reason,
                created_at=now,
            )
            session.add(orm_obj)
            session.flush()

            # Audit invariant: runs.results_json is NOT mutated
            return OverrideRecord.model_validate(orm_obj)

    async def add_override(
        self, run_id: UUID, override: OverrideCreate
    ) -> OverrideRecord:
        """Append a manual organizer decision (pin/exclude/waitlist) to the overrides table."""
        return await asyncio.to_thread(self.add_override_sync, run_id, override)

    def list_overrides_sync(self, run_id: UUID) -> List[OverrideRecord]:
        """Synchronously list all manual overrides recorded for a specific run."""
        run_uid = _ensure_uuid(run_id)
        with get_db_context(self.db_url) as session:
            stmt = (
                select(Override)
                .where(Override.run_id == run_uid)
                .order_by(Override.created_at.asc())
            )
            results = session.execute(stmt).scalars().all()
            return [OverrideRecord.model_validate(obj) for obj in results]

    async def list_overrides(self, run_id: UUID) -> List[OverrideRecord]:
        """List all manual overrides recorded for a specific run."""
        return await asyncio.to_thread(self.list_overrides_sync, run_id)


# Global repository instance using default application settings
repository = Repository()
