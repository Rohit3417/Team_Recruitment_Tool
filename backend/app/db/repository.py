"""Database Repository Interface & Scaffold (Day 1).

Owner: Member 4 (Database & Integration)

This module defines the repository boundary for interacting with PostgreSQL.
On Day 1, function signatures, types, and contracts are established to prepare
for Day 2 database wiring (asyncpg / psycopg / SQLAlchemy connection pool).

Required Day 2 methods:
- save_dataset
- get_dataset
- save_config
- list_configs
- get_config
- save_run
- get_run
- list_runs
- add_override
- list_overrides
"""

from typing import List, Optional
from uuid import UUID

from backend.app.db.models import (
    ConfigurationCreate,
    ConfigurationRecord,
    ConfigurationUpdate,
    DatasetCreate,
    DatasetRecord,
    OverrideCreate,
    OverrideRecord,
    RunCreate,
    RunRecord,
)


class Repository:
    """Repository class encapsulating PostgreSQL queries for the 4 core tables."""

    def __init__(self, db_url: Optional[str] = None):
        self.db_url = db_url

    # ==========================================================================
    # DATASETS
    # ==========================================================================

    async def save_dataset(self, dataset: DatasetCreate) -> DatasetRecord:
        """Persist a newly ingested and validated dataset into the datasets table.

        TODO [Day 2]: Insert into PostgreSQL `datasets` table and return persisted DatasetRecord.
        """
        raise NotImplementedError("Repository.save_dataset will be implemented in Day 2.")

    async def get_dataset(self, dataset_id: UUID) -> Optional[DatasetRecord]:
        """Fetch a dataset record by its unique UUID.

        TODO [Day 2]: Query PostgreSQL `datasets` WHERE id = dataset_id.
        """
        raise NotImplementedError("Repository.get_dataset will be implemented in Day 2.")

    # ==========================================================================
    # CONFIGURATIONS
    # ==========================================================================

    async def save_config(self, config: ConfigurationCreate) -> ConfigurationRecord:
        """Persist a new scoring configuration or preset.

        TODO [Day 2]: Insert into PostgreSQL `configurations` table.
        """
        raise NotImplementedError("Repository.save_config will be implemented in Day 2.")

    async def list_configs(self) -> List[ConfigurationRecord]:
        """List all saved configurations and presets, ordered by created_at DESC.

        TODO [Day 2]: Query PostgreSQL `configurations` ORDER BY created_at DESC.
        """
        raise NotImplementedError("Repository.list_configs will be implemented in Day 2.")

    async def get_config(self, config_id: UUID) -> Optional[ConfigurationRecord]:
        """Fetch a configuration by its UUID.

        TODO [Day 2]: Query PostgreSQL `configurations` WHERE id = config_id.
        """
        raise NotImplementedError("Repository.get_config will be implemented in Day 2.")

    async def update_config(self, config_id: UUID, updates: ConfigurationUpdate) -> Optional[ConfigurationRecord]:
        """Update an existing configuration (presets cannot be overwritten).

        TODO [Day 2]: Update non-preset configuration in PostgreSQL.
        """
        raise NotImplementedError("Repository.update_config will be implemented in Day 2.")

    # ==========================================================================
    # RUNS
    # ==========================================================================

    async def save_run(self, run: RunCreate) -> RunRecord:
        """Persist an evaluation run with its configuration snapshot and results JSON.

        TODO [Day 2]: Insert into PostgreSQL `runs` table with foreign key to dataset_id.
        """
        raise NotImplementedError("Repository.save_run will be implemented in Day 2.")

    async def get_run(self, run_id: UUID) -> Optional[RunRecord]:
        """Retrieve an immutable evaluation run by ID.

        TODO [Day 2]: Query PostgreSQL `runs` WHERE id = run_id.
        """
        raise NotImplementedError("Repository.get_run will be implemented in Day 2.")

    async def list_runs(self, dataset_id: Optional[UUID] = None) -> List[RunRecord]:
        """List evaluation runs, optionally filtered by dataset_id, ordered by created_at DESC.

        TODO [Day 2]: Query PostgreSQL `runs` table.
        """
        raise NotImplementedError("Repository.list_runs will be implemented in Day 2.")

    # ==========================================================================
    # OVERRIDES
    # ==========================================================================

    async def add_override(self, run_id: UUID, override: OverrideCreate) -> OverrideRecord:
        """Append a manual organizer decision (pin/exclude/waitlist) to the overrides table.

        TODO [Day 2]: Insert into PostgreSQL `overrides` table.
        NOTE: Never modifies runs.results_json; overrides are purely additive and auditable.
        """
        raise NotImplementedError("Repository.add_override will be implemented in Day 2.")

    async def list_overrides(self, run_id: UUID) -> List[OverrideRecord]:
        """List all manual overrides recorded for a specific run.

        TODO [Day 2]: Query PostgreSQL `overrides` WHERE run_id = run_id ORDER BY created_at ASC.
        """
        raise NotImplementedError("Repository.list_overrides will be implemented in Day 2.")


# Global repository instance scaffold
repository = Repository()
