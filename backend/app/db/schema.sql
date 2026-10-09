-- ==============================================================================
-- Incursion Track 3: Team Recruitment Automation Tool
-- Minimal 4-Table Database Schema (PostgreSQL)
-- Owner: Member 4 (Database & Integration)
-- ==============================================================================
-- Architecture Principles:
-- 1. PostgreSQL is used ONLY for state that must survive restarts and be auditable.
-- 2. No 12-table over-normalization: each table holds evolving details in JSONB.
-- 3. Ephemeral/cached data (GitHub API responses, resume text, live what-if re-ranks,
--    enrichment progress) is stored in cache/ files or in-memory, NOT in PostgreSQL.
-- 4. Auditability: Overrides NEVER mutate runs.results_json; they are stored separately.
-- 5. Reproducibility: A run stores an immutable snapshot of the configuration used.
-- ==============================================================================

-- Enable UUID extension if running on PostgreSQL < 13
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 1. DATASETS
-- Stores the uploaded dataset and normalized team records for reproducible runs.
-- ==============================================================================
CREATE TABLE IF NOT EXISTS datasets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    content_hash VARCHAR(64) NOT NULL,
    teams_json JSONB NOT NULL,
    validation_report_json JSONB NOT NULL
);

COMMENT ON TABLE datasets IS 'Stores uploaded team registration files and normalized teams for reproducibility.';
COMMENT ON COLUMN datasets.content_hash IS 'SHA-256 hash of raw uploaded file content.';
COMMENT ON COLUMN datasets.teams_json IS 'Normalized teams and member link flags (loaded by M2 ingest).';
COMMENT ON COLUMN datasets.validation_report_json IS 'Validation report detailing errors, warnings, missing flags, and duplicates.';

-- ==============================================================================
-- 2. CONFIGURATIONS
-- Stores saved scoring strategies, custom weightings, eligibility rules, and presets.
-- ==============================================================================
CREATE TABLE IF NOT EXISTS configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    is_preset BOOLEAN NOT NULL DEFAULT FALSE,
    config_json JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE configurations IS 'Scoring configurations, criteria weights, eligibility rules, and default presets.';
COMMENT ON COLUMN configurations.is_preset IS 'True if system default preset (e.g., Balanced, Skills-heavy, Projects-heavy).';
COMMENT ON COLUMN configurations.config_json IS 'Full JSON configuration adhering to M1 ScoringConfiguration schema.';

-- ==============================================================================
-- 3. RUNS
-- Stores evaluation execution history and reproducible deterministic output.
-- A run references the dataset and embeds a complete snapshot of the config.
-- ==============================================================================
CREATE TABLE IF NOT EXISTS runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dataset_id UUID NOT NULL REFERENCES datasets(id) ON DELETE CASCADE,
    config_snapshot_json JSONB NOT NULL,
    run_hash VARCHAR(64) NOT NULL,
    results_json JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE runs IS 'Evaluation run history and deterministic results. Immutable once written.';
COMMENT ON COLUMN runs.config_snapshot_json IS 'Snapshot of configuration at the moment of evaluation (decoupled from configs table mutations).';
COMMENT ON COLUMN runs.run_hash IS 'Deterministic SHA-256 hash computed from canonical JSON of dataset + config.';
COMMENT ON COLUMN runs.results_json IS 'Full output contract: team scores, ranks, breakdowns, explanations, and member criterion values.';

-- ==============================================================================
-- 4. OVERRIDES
-- Stores manual organizer review decisions (pin, exclude, waitlist) without
-- rewriting automated results in the runs table.
-- ==============================================================================
CREATE TABLE IF NOT EXISTS overrides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    run_id UUID NOT NULL REFERENCES runs(id) ON DELETE CASCADE,
    team_id VARCHAR(64) NOT NULL,
    action VARCHAR(20) NOT NULL CHECK (action IN ('pin', 'exclude', 'waitlist')),
    reason TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE overrides IS 'Auditable organizer review decisions. Must NEVER rewrite automated run results.';
COMMENT ON COLUMN overrides.action IS 'Manual action: pin (force shortlist), exclude (force reject), or waitlist.';
COMMENT ON COLUMN overrides.reason IS 'Mandatory organizer rationale for audit trail.';

-- ==============================================================================
-- INDEXES
-- Purposeful, high-selectivity indexes for lookups, joins, and sorting.
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_datasets_content_hash ON datasets(content_hash);
CREATE INDEX IF NOT EXISTS idx_datasets_uploaded_at ON datasets(uploaded_at DESC);

CREATE INDEX IF NOT EXISTS idx_configurations_is_preset ON configurations(is_preset);
CREATE INDEX IF NOT EXISTS idx_configurations_created_at ON configurations(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_runs_dataset_id ON runs(dataset_id);
CREATE INDEX IF NOT EXISTS idx_runs_run_hash ON runs(run_hash);
CREATE INDEX IF NOT EXISTS idx_runs_created_at ON runs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_overrides_run_id ON overrides(run_id);
CREATE INDEX IF NOT EXISTS idx_overrides_run_team ON overrides(run_id, team_id);
