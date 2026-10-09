"""PostgreSQL Integration tests for the 10 Repository functions.

Owner: Member 4 (Database & Integration)
Requirement: Tests run against real PostgreSQL using an isolated TEST_DATABASE_URL.
"""

from datetime import datetime, timezone
from typing import Generator
from uuid import UUID, uuid4
import pytest
from sqlalchemy import text

from backend.app.core.config import settings
from backend.app.db.models import (
    Base,
    ConfigurationCreate,
    ConfigurationUpdate,
    DatasetCreate,
    OverrideAction,
    OverrideCreate,
    RunCreate,
)
from backend.app.db.repository import Repository
from backend.app.db.session import get_db_context, get_engine


@pytest.fixture(scope="session")
def setup_test_database():
    """Ensure schema exists on the isolated test database."""
    test_url = settings.TEST_DATABASE_URL
    assert "test" in test_url.lower(), "TEST_DATABASE_URL must point to an isolated test database"

    engine = get_engine(test_url)
    with engine.connect() as conn:
        conn.execute(text('CREATE EXTENSION IF NOT EXISTS "pgcrypto";'))
        conn.commit()
    Base.metadata.create_all(bind=engine)
    yield
    # Keep volume intact; do not drop databases


@pytest.fixture
def repo(setup_test_database) -> Generator[Repository, None, None]:
    """Provide a repository instance connected to the clean test database."""
    test_url = settings.TEST_DATABASE_URL
    test_repo = Repository(db_url=test_url)

    # Clean tables before each test for complete repeatability
    with get_db_context(test_url) as session:
        session.execute(
            text("TRUNCATE TABLE overrides, runs, configurations, datasets CASCADE;")
        )

    yield test_repo

    # Clean tables after each test
    with get_db_context(test_url) as session:
        session.execute(
            text("TRUNCATE TABLE overrides, runs, configurations, datasets CASCADE;")
        )


# ==============================================================================
# 1 & 2: DATASETS (save_dataset, get_dataset)
# ==============================================================================

@pytest.mark.asyncio
async def test_save_and_get_dataset(repo: Repository):
    """Test persisting and retrieving a normalized dataset."""
    dataset_in = DatasetCreate(
        name="registrations_40.csv",
        content_hash="e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        teams_json=[
            {
                "team_id": "T001",
                "team_name": "Byte Bandits",
                "members": [
                    {
                        "name": "Aarav Desai",
                        "email": "aarav.desai0@example.com",
                        "github": {"value": "aaravdesai0", "status": "OK"},
                    }
                ],
            }
        ],
        validation_report_json={
            "total_teams": 1,
            "total_members": 1,
            "errors": [],
            "warnings": ["T001 member 1 portfolio missing"],
        },
    )

    # 1. save_dataset
    saved = await repo.save_dataset(dataset_in)
    assert isinstance(saved.id, UUID)
    assert saved.name == "registrations_40.csv"
    assert saved.content_hash == dataset_in.content_hash
    assert len(saved.teams_json) == 1
    assert saved.teams_json[0]["team_id"] == "T001"
    assert saved.uploaded_at is not None

    # 2. get_dataset
    retrieved = await repo.get_dataset(saved.id)
    assert retrieved is not None
    assert retrieved.id == saved.id
    assert retrieved.name == saved.name
    assert retrieved.content_hash == saved.content_hash
    assert retrieved.teams_json == dataset_in.teams_json
    assert retrieved.validation_report_json == dataset_in.validation_report_json

    # Non-existent ID returns None
    missing = await repo.get_dataset(uuid4())
    assert missing is None


@pytest.mark.asyncio
async def test_jsonb_round_trip(repo: Repository):
    """Verify complex nested JSONB roundtrips accurately without loss."""
    complex_teams = [
        {
            "team_id": "T042",
            "nested": {"deep": {"value": True, "float_val": 42.5, "null_val": None}},
            "tags": ["alpha", "beta", "gamma"],
            "unicode_text": "Hackathon 🚀 - München / Tokyo 2026",
        }
    ]
    report = {"counts": {"passed": 1, "failed": 0}, "meta": {"tool": "loader.py"}}

    dataset_in = DatasetCreate(
        name="complex.json",
        content_hash="hash123",
        teams_json=complex_teams,
        validation_report_json=report,
    )
    saved = await repo.save_dataset(dataset_in)
    fetched = await repo.get_dataset(saved.id)

    assert fetched is not None
    assert fetched.teams_json == complex_teams
    assert fetched.teams_json[0]["nested"]["deep"]["float_val"] == 42.5
    assert fetched.teams_json[0]["nested"]["deep"]["null_val"] is None
    assert fetched.teams_json[0]["unicode_text"] == "Hackathon 🚀 - München / Tokyo 2026"
    assert fetched.validation_report_json == report


# ==============================================================================
# 3, 4, 5: CONFIGURATIONS (save_config, list_configs, get_config)
# ==============================================================================

@pytest.mark.asyncio
async def test_save_get_list_configurations(repo: Repository):
    """Test saving, retrieving, and listing scoring configurations and presets."""
    config_1 = ConfigurationCreate(
        name="Balanced Strategy",
        is_preset=True,
        config_json={
            "criteria": [
                {"name": "technical_skills", "weight": 40},
                {"name": "projects", "weight": 30},
                {"name": "github_activity", "weight": 30},
            ],
            "top_x": 10,
            "aggregation": "mean",
            "missing_policy": "redistribute",
            "tie_break": ["github_activity", "team_id"],
        },
    )
    config_2 = ConfigurationCreate(
        name="Projects Heavy",
        is_preset=False,
        config_json={
            "criteria": [
                {"name": "projects", "weight": 60},
                {"name": "technical_skills", "weight": 40},
            ],
            "top_x": 5,
            "aggregation": "weighted_mean",
            "missing_policy": "neutral",
            "tie_break": ["team_id"],
        },
    )

    # Save both
    saved_1 = await repo.save_config(config_1)
    saved_2 = await repo.save_config(config_2)

    assert isinstance(saved_1.id, UUID)
    assert saved_1.is_preset is True
    assert isinstance(saved_2.id, UUID)
    assert saved_2.is_preset is False

    # Get by ID
    fetched_1 = await repo.get_config(saved_1.id)
    assert fetched_1 is not None
    assert fetched_1.name == "Balanced Strategy"
    assert fetched_1.config_json["top_x"] == 10

    # List configs
    configs = await repo.list_configs()
    assert len(configs) == 2
    ids = [c.id for c in configs]
    assert saved_1.id in ids
    assert saved_2.id in ids

    # Non-existent config
    assert await repo.get_config(uuid4()) is None


@pytest.mark.asyncio
async def test_update_config_and_preset_immutability(repo: Repository):
    """Test updating custom configs while preserving system preset immutability."""
    preset = await repo.save_config(
        ConfigurationCreate(
            name="Immutable Preset",
            is_preset=True,
            config_json={"top_x": 10},
        )
    )
    custom = await repo.save_config(
        ConfigurationCreate(
            name="Editable Custom",
            is_preset=False,
            config_json={"top_x": 10},
        )
    )

    # Updating preset must be rejected
    with pytest.raises(ValueError, match="presets are immutable"):
        await repo.update_config(
            preset.id, ConfigurationUpdate(name="Modified Preset")
        )

    # Updating custom config succeeds
    updated = await repo.update_config(
        custom.id,
        ConfigurationUpdate(name="Updated Custom", config_json={"top_x": 20}),
    )
    assert updated is not None
    assert updated.name == "Updated Custom"
    assert updated.config_json["top_x"] == 20


# ==============================================================================
# 6, 7, 8: RUNS (save_run, get_run, list_runs)
# ==============================================================================

@pytest.mark.asyncio
async def test_save_and_get_run_preserves_config_snapshot(repo: Repository):
    """Verify that runs freeze and preserve their config snapshot independently."""
    dataset = await repo.save_dataset(
        DatasetCreate(
            name="test_dataset.csv",
            content_hash="hash999",
            teams_json=[{"team_id": "T001"}],
            validation_report_json={},
        )
    )

    config_snapshot = {
        "criteria": [{"name": "technical_skills", "weight": 100}],
        "top_x": 1,
        "aggregation": "mean",
    }

    run_in = RunCreate(
        dataset_id=dataset.id,
        config_snapshot_json=config_snapshot,
        run_hash="runhash_sha256_canonical",
        results_json={
            "shortlist": ["T001"],
            "scores": {"T001": 95.0},
            "ranks": {"T001": 1},
        },
    )

    saved_run = await repo.save_run(run_in)
    assert isinstance(saved_run.id, UUID)
    assert saved_run.dataset_id == dataset.id
    assert saved_run.run_hash == "runhash_sha256_canonical"

    # Retrieve and verify frozen snapshot
    fetched_run = await repo.get_run(saved_run.id)
    assert fetched_run is not None
    assert fetched_run.config_snapshot_json == config_snapshot
    assert fetched_run.results_json["shortlist"] == ["T001"]


@pytest.mark.asyncio
async def test_list_runs_with_filtering(repo: Repository):
    """Test listing runs with and without dataset_id filtering."""
    d1 = await repo.save_dataset(
        DatasetCreate(name="d1.csv", content_hash="h1", teams_json=[], validation_report_json={})
    )
    d2 = await repo.save_dataset(
        DatasetCreate(name="d2.csv", content_hash="h2", teams_json=[], validation_report_json={})
    )

    run_1 = await repo.save_run(
        RunCreate(
            dataset_id=d1.id,
            config_snapshot_json={"version": 1},
            run_hash="hash_r1",
            results_json={},
        )
    )
    run_2 = await repo.save_run(
        RunCreate(
            dataset_id=d1.id,
            config_snapshot_json={"version": 2},
            run_hash="hash_r2",
            results_json={},
        )
    )
    run_3 = await repo.save_run(
        RunCreate(
            dataset_id=d2.id,
            config_snapshot_json={"version": 3},
            run_hash="hash_r3",
            results_json={},
        )
    )

    # All runs
    all_runs = await repo.list_runs()
    assert len(all_runs) == 3

    # Filtered by d1
    d1_runs = await repo.list_runs(dataset_id=d1.id)
    assert len(d1_runs) == 2
    d1_run_ids = [r.id for r in d1_runs]
    assert run_1.id in d1_run_ids
    assert run_2.id in d1_run_ids
    assert run_3.id not in d1_run_ids

    # Filtered by non-existent dataset
    empty_runs = await repo.list_runs(dataset_id=uuid4())
    assert empty_runs == []


# ==============================================================================
# 9 & 10: OVERRIDES (add_override, list_overrides)
# ==============================================================================

@pytest.mark.asyncio
async def test_add_and_list_overrides(repo: Repository):
    """Test recording manual organizer overrides and querying them."""
    dataset = await repo.save_dataset(
        DatasetCreate(name="d.csv", content_hash="h", teams_json=[], validation_report_json={})
    )
    run = await repo.save_run(
        RunCreate(
            dataset_id=dataset.id,
            config_snapshot_json={},
            run_hash="runhash",
            results_json={"shortlist": ["T001"]},
        )
    )

    o1 = await repo.add_override(
        run.id,
        OverrideCreate(
            team_id="T002",
            action=OverrideAction.PIN,
            reason="Wildcard winner from regional contest",
        ),
    )
    o2 = await repo.add_override(
        run.id,
        OverrideCreate(
            team_id="T003",
            action=OverrideAction.EXCLUDE,
            reason="Violated code of conduct rule 4",
        ),
    )
    o3 = await repo.add_override(
        run.id,
        OverrideCreate(
            team_id="T004",
            action=OverrideAction.WAITLIST,
            reason="Pending portfolio link review",
        ),
    )

    assert isinstance(o1.id, UUID)
    assert o1.action == OverrideAction.PIN
    assert o2.action == OverrideAction.EXCLUDE
    assert o3.action == OverrideAction.WAITLIST

    # List overrides for this run
    overrides = await repo.list_overrides(run.id)
    assert len(overrides) == 3
    assert [o.team_id for o in overrides] == ["T002", "T003", "T004"]


@pytest.mark.asyncio
async def test_override_never_mutates_run_results(repo: Repository):
    """Audit invariant: overrides MUST NEVER mutate stored automated run results."""
    dataset = await repo.save_dataset(
        DatasetCreate(name="d.csv", content_hash="h", teams_json=[], validation_report_json={})
    )
    initial_results = {
        "shortlist": ["T001", "T002"],
        "ranks": {"T001": 1, "T002": 2},
    }
    run = await repo.save_run(
        RunCreate(
            dataset_id=dataset.id,
            config_snapshot_json={},
            run_hash="runhash",
            results_json=initial_results,
        )
    )

    # Exclude team T001
    await repo.add_override(
        run.id,
        OverrideCreate(
            team_id="T001",
            action=OverrideAction.EXCLUDE,
            reason="Disqualified during manual review",
        ),
    )

    # Fetch run again and verify results_json is completely untouched
    refetched_run = await repo.get_run(run.id)
    assert refetched_run is not None
    assert refetched_run.results_json == initial_results
    assert refetched_run.results_json["shortlist"] == ["T001", "T002"]


@pytest.mark.asyncio
async def test_reject_unsupported_override_actions(repo: Repository):
    """Verify unsupported action strings are strictly rejected."""
    dataset = await repo.save_dataset(
        DatasetCreate(name="d.csv", content_hash="h", teams_json=[], validation_report_json={})
    )
    run = await repo.save_run(
        RunCreate(
            dataset_id=dataset.id,
            config_snapshot_json={},
            run_hash="runhash",
            results_json={},
        )
    )

    # Construct invalid override
    invalid_override = OverrideCreate.model_construct(
        team_id="T001",
        action="promote",  # Invalid action (not pin/exclude/waitlist)
        reason="Invalid manual action",
    )

    with pytest.raises(ValueError, match="Invalid override action"):
        await repo.add_override(run.id, invalid_override)


# ==============================================================================
# INTEGRITY, UUID & ERROR HANDLING
# ==============================================================================

@pytest.mark.asyncio
async def test_foreign_key_violations(repo: Repository):
    """Verify foreign key integrity when referencing non-existent records."""
    non_existent_dataset_id = uuid4()
    with pytest.raises(ValueError, match="Dataset with id .* does not exist"):
        await repo.save_run(
            RunCreate(
                dataset_id=non_existent_dataset_id,
                config_snapshot_json={},
                run_hash="hash",
                results_json={},
            )
        )

    non_existent_run_id = uuid4()
    with pytest.raises(ValueError, match="Run with id .* does not exist"):
        await repo.add_override(
            non_existent_run_id,
            OverrideCreate(
                team_id="T001",
                action=OverrideAction.PIN,
                reason="Invalid run reference",
            ),
        )


@pytest.mark.asyncio
async def test_uuid_string_and_type_coercion(repo: Repository):
    """Verify UUIDs passed as strings are correctly handled."""
    dataset = await repo.save_dataset(
        DatasetCreate(name="d.csv", content_hash="h", teams_json=[], validation_report_json={})
    )
    # Pass string representation
    fetched = await repo.get_dataset(str(dataset.id))  # type: ignore
    assert fetched is not None
    assert fetched.id == dataset.id


@pytest.mark.asyncio
async def test_session_cleanup_and_rollback_on_failure(repo: Repository):
    """Verify failed transactions roll back cleanly and do not corrupt subsequent operations."""
    test_url = settings.TEST_DATABASE_URL

    # Intentionally trigger an error inside a context block
    with pytest.raises(RuntimeError):
        with get_db_context(test_url) as session:
            session.execute(text("SELECT 1;"))
            raise RuntimeError("Forced simulation error")

    # Subsequent operation on the connection pool must succeed normally
    dataset = await repo.save_dataset(
        DatasetCreate(name="healthy.csv", content_hash="h", teams_json=[], validation_report_json={})
    )
    assert dataset is not None
    fetched = await repo.get_dataset(dataset.id)
    assert fetched is not None
