"""Tests for Database Schema, Domain Models, and Repository Scaffolding."""

from pathlib import Path
import pytest
from uuid import uuid4

from backend.app.db.models import (
    ConfigurationCreate,
    ConfigurationRecord,
    DatasetCreate,
    DatasetRecord,
    OverrideAction,
    OverrideCreate,
    OverrideRecord,
    RunCreate,
    RunRecord,
)
from backend.app.db.repository import repository


def test_schema_sql_structure():
    """Verify schema.sql contains the 4 core tables, FKs, and constraints."""
    schema_path = Path(__file__).resolve().parents[2] / "app" / "db" / "schema.sql"
    assert schema_path.exists(), "schema.sql must exist"

    content = schema_path.read_text()

    # Core tables
    assert "CREATE TABLE IF NOT EXISTS datasets" in content
    assert "CREATE TABLE IF NOT EXISTS configurations" in content
    assert "CREATE TABLE IF NOT EXISTS runs" in content
    assert "CREATE TABLE IF NOT EXISTS overrides" in content

    # Minimal database rule: no other domain tables
    assert "teams_json JSONB" in content
    assert "validation_report_json JSONB" in content
    assert "config_json JSONB" in content
    assert "config_snapshot_json JSONB" in content
    assert "results_json JSONB" in content

    # Foreign keys
    assert "REFERENCES datasets(id)" in content
    assert "REFERENCES runs(id)" in content

    # Check constraint on overrides action
    assert "action VARCHAR(20) NOT NULL CHECK (action IN ('pin', 'exclude', 'waitlist'))" in content


def test_models_instantiation():
    """Verify Pydantic models instantiate and validate fields correctly."""
    # 1. Dataset
    dataset_in = DatasetCreate(
        name="registrations_40.csv",
        content_hash="e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        teams_json=[{"team_id": "T001", "team_name": "Byte Bandits"}],
        validation_report_json={"total_teams": 1, "errors": [], "warnings": []},
    )
    dataset_rec = DatasetRecord(
        id=uuid4(),
        name=dataset_in.name,
        content_hash=dataset_in.content_hash,
        teams_json=dataset_in.teams_json,
        validation_report_json=dataset_in.validation_report_json,
    )
    assert dataset_rec.name == "registrations_40.csv"

    # 2. Configuration
    config_in = ConfigurationCreate(
        name="Balanced Default",
        is_preset=True,
        config_json={
            "criteria": [{"name": "technical_skills", "weight": 30}],
            "top_x": 10,
        },
    )
    assert config_in.is_preset is True

    # 3. Run
    run_in = RunCreate(
        dataset_id=dataset_rec.id,
        config_snapshot_json=config_in.config_json,
        run_hash="a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e",
        results_json={"shortlist": ["T001"]},
    )
    assert run_in.dataset_id == dataset_rec.id

    # 4. Override
    override_in = OverrideCreate(
        team_id="T001",
        action=OverrideAction.PIN,
        reason="Winner of preliminary hackathon",
    )
    assert override_in.action == OverrideAction.PIN


@pytest.mark.asyncio
async def test_repository_scaffold_raises_not_implemented():
    """Verify repository functions exist with proper signatures and raise NotImplementedError."""
    dummy_uuid = uuid4()

    with pytest.raises(NotImplementedError):
        await repository.get_dataset(dummy_uuid)

    with pytest.raises(NotImplementedError):
        await repository.get_config(dummy_uuid)

    with pytest.raises(NotImplementedError):
        await repository.get_run(dummy_uuid)

    with pytest.raises(NotImplementedError):
        await repository.list_overrides(dummy_uuid)
