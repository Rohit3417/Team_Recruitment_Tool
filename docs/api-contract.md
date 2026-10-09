# Incursion Track 3: Team Recruitment Automation Tool
## API Contract Specification (Day 2 Final)

- **Version:** `1.0.0 (Day 2 Final)`
- **Primary Author:** Member 4 (Database & Integration)
- **Reviewed & Aligned With:** Member 1 (`backend/app/scoring/config_schema.py`), Member 2 (`docs/data-format.md`, `docs/profile-contract.md`), Member 3 (Frontend)
- **Status:** Finalized Day 2 reference contract for all 4 team members.

---

### 1. Architectural Principles & Invariants

1. **Deterministic & Reproducible:** Scoring, eligibility, and ranking are 100% deterministic code. An identical `(dataset, config)` pair MUST always produce the exact same `run_hash` and ranking.
2. **AI Safeguards:** LLMs/Gemini may only extract resume signals into verifiable quotes with confidence scores and source offsets. AI NEVER decides shortlisting or ranks.
3. **Explicit Missingness:** Missing or invalid values are never converted to zero or silently assumed. They are marked `MISSING`, `INVALID`, `UNAVAILABLE`, or `UNCERTAIN` and handled strictly via `missing_policy`.
4. **Auditability & Immutable Runs:** Stored runs are immutable once written. Manual organizer actions (`pin`, `exclude`, `waitlist`) are stored in `overrides` and NEVER rewrite automated `runs.results_json`.
5. **Minimal Database:** Only persistent, auditable state lives in PostgreSQL (4 tables: `datasets`, `configurations`, `runs`, `overrides`). Raw resumes, external GitHub JSON, and temporary enrichment jobs are kept in `cache/` or memory.
6. **Separation of Concerns:** Hard eligibility rules (pass/fail) are decoupled from weighted scoring (0–100 scale).

---

### 2. Team Ownership & Lifecycle Matrix

| Router Group | Endpoints | Owner | Target Day | Status | Primary Responsibility |
|---|---|---|---|---|---|
| **Health & Infra** | `GET /health` | **M4** | Day 1 | **Implemented** | Service liveness and operational check |
| **Ingest (M2)** | `POST /upload`<br>`GET /datasets/{dataset_id}/teams` | **M2** | Day 4 | Planned | CSV/JSON parsing, row validation, duplicate check, data normalization via M4's `save_dataset` |
| **Configurations (M4)** | `POST /configs`<br>`GET /configs`<br>`GET /configs/{id}`<br>`PUT /configs/{id}` | **M4** | Day 3 | Planned | Scoring configuration CRUD, default presets storage (Balanced, Skills-heavy, Projects-heavy) |
| **Runs & Evaluation (M4)** | `POST /runs`<br>`GET /runs`<br>`GET /runs/{id}`<br>`GET /runs/{id}/final`<br>`POST /runs/{id}/verify` | **M4** | Day 6, 9, 13 | Planned | Evaluation execution, config snapshotting, run hashing, final combined ranking, hash verification |
| **Overrides (M4)** | `POST /runs/{id}/overrides`<br>`GET /runs/{id}/overrides` | **M4** | Day 9 | Planned | Auditable manual review decisions (`pin`, `exclude`, `waitlist`) without modifying automated results |
| **Enrichment (M4)** | `POST /enrich`<br>`GET /enrich/{job_id}` | **M4** | Day 10 | Planned | Background threadpool enrichment job orchestrating M2 extractors, cached under `cache/` |
| **Export (M4)** | `GET /runs/{id}/export` | **M4** | Day 11 | Planned | CSV/JSON exports, audit ZIP packaging with config, results, and manifest |
| **Scoring / Re-rank (M1)** | `POST /rank` | **M1** | Day 8 | Planned | Fast in-memory what-if re-ranking from cached member criterion values |
| **Comparison (M1)** | `POST /compare` | **M1** | Day 11 | Planned | Multi-config comparison matrix and sensitivity delta |

---

### 3. Detailed Endpoint Specifications

#### 3.1 Health & Infrastructure (Owned by M4)

##### `GET /health`
- **Owner:** Member 4 (Application & Infrastructure)
- **Status:** Implemented (Day 1)
- **Purpose:** Health check endpoint indicating service availability.
- **Request Parameters:** None.
- **Response `200 OK`:**
  ```json
  {
    "status": "ok"
  }
  ```

---

#### 3.2 Ingest Endpoints (Owned by M2)

##### `POST /upload`
- **Owner:** Member 2 (Day 4)
- **Status:** Planned (Router scaffolded in `backend/app/api/upload.py`)
- **Dependencies:** M4's `save_dataset` in `backend/app/db/repository.py`, M2 loader & validator
- **Purpose:** Accept CSV (wide format, up to 6 members) or JSON (`members[]` array) registration files, validate rows, save normalized teams using M4's `save_dataset`.
- **Content-Type:** `multipart/form-data`
- **Request Form:**
  - `file`: binary file (`.csv` or `.json`, max 10MB)
- **Response `201 Created`:**
  ```json
  {
    "dataset_id": "7f8b9a20-8012-4e6f-99ab-61d092305e41",
    "filename": "registrations_40.csv",
    "content_hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    "total_teams": 40,
    "total_members": 112,
    "validation_report": {
      "errors_count": 0,
      "warnings_count": 9,
      "duplicate_teams": ["T038"],
      "duplicate_members": ["T039"],
      "missing_fields_summary": {
        "github": 8,
        "resume": 4,
        "linkedin": 11,
        "portfolio": 15
      }
    },
    "preview": [
      {
        "team_id": "T001",
        "team_name": "Byte Bandits",
        "member_count": 1
      }
    ]
  }
  ```
- **Error Responses:**
  - `400 Bad Request`: Non CSV/JSON format, missing mandatory `team_id`/`team_name` columns.
  - `413 Payload Too Large`: File exceeds upload limit (10MB).
  - `422 Unprocessable Entity`: Malformed CSV/JSON structure that cannot be parsed.

##### `GET /datasets/{dataset_id}/teams`
- **Owner:** Member 2 (Day 4)
- **Status:** Planned
- **Dependencies:** M4's `get_dataset`
- **Purpose:** Retrieve full normalized team list and member link statuses from stored dataset.
- **Response `200 OK`:**
  ```json
  {
    "dataset_id": "7f8b9a20-8012-4e6f-99ab-61d092305e41",
    "teams": [
      {
        "team_id": "T001",
        "team_name": "Byte Bandits",
        "members": [
          {
            "name": "Aarav Desai",
            "email": "aarav.desai0@example.com",
            "github": {"value": "aaravdesai0", "status": "OK"},
            "resume": {"value": "https://drive.example.com/resumes/aaravdesai0.pdf", "status": "OK"},
            "linkedin": {"value": "https://www.linkedin.com/in/aaravdesai0", "status": "OK"},
            "portfolio": {"value": "https://aaravdesai0.example.dev", "status": "OK"}
          }
        ]
      }
    ]
  }
  ```
- **Error Responses:**
  - `404 Not Found`: Dataset ID not found.

---

#### 3.3 Configuration Endpoints (Owned by M4)

##### `POST /configs`
- **Owner:** Member 4 (Day 3)
- **Status:** Planned (Router scaffolded in `backend/app/api/configs.py`)
- **Dependencies:** M1 `config_validate` rules, M4 `save_config`
- **Purpose:** Create and save a new scoring strategy.
- **Request Body:** Exactly matches M1 `ScoringConfiguration` from `backend/app/scoring/config_schema.py`:
  ```json
  {
    "name": "Balanced Hackathon Default",
    "is_preset": false,
    "config_json": {
      "criteria": [
        {"name": "technical_skills", "weight": 25, "keywords": ["Python", "FastAPI", "React", "PostgreSQL"]},
        {"name": "projects", "weight": 25, "keywords": ["Fullstack", "Distributed Systems"]},
        {"name": "github_activity", "weight": 20, "keywords": []},
        {"name": "achievements", "weight": 15, "keywords": ["Hackathon Winner", "Published"]},
        {"name": "portfolio", "weight": 15, "keywords": []}
      ],
      "eligibility_rules": [
        {"signal": "team.member_count", "operator": ">=", "value": 2, "scope": "team"},
        {"signal": "github.contributions_12m", "operator": ">=", "value": 50, "scope": "any_member"}
      ],
      "top_x": 10,
      "aggregation": "mean",
      "missing_policy": "redistribute",
      "tie_break": ["github_activity", "projects", "team_id"]
    }
  }
  ```
  *Allowed enum values:*
  - `scope`: `"any_member"` | `"all_members"` | `"team"`
  - `aggregation`: `"mean"` | `"weighted_mean"` | `"at_least_one"`
  - `missing_policy`: `"redistribute"` | `"neutral"` | `"penalty"`
  - `tie_break`: List of criteria names ending strictly with `"team_id"`
- **Response `201 Created`:**
  ```json
  {
    "id": "3c91b8a1-5501-4478-9b81-d41935e40889",
    "name": "Balanced Hackathon Default",
    "is_preset": false,
    "config_json": { ... },
    "created_at": "2026-10-09T09:30:00Z"
  }
  ```
- **Error Responses:**
  - `422 Unprocessable Entity`: Weights don't sum to 100, top_x < 1, tie_break chain does not terminate with `team_id`, or invalid operator/scope.

##### `GET /configs`
- **Owner:** Member 4 (Day 3)
- **Status:** Planned
- **Dependencies:** M4 `list_configs`
- **Purpose:** List all saved configurations and default presets (`is_preset: true`).
- **Response `200 OK`:**
  ```json
  [
    {
      "id": "3c91b8a1-5501-4478-9b81-d41935e40889",
      "name": "Balanced Hackathon Default",
      "is_preset": true,
      "created_at": "2026-10-09T09:00:00Z"
    }
  ]
  ```

##### `GET /configs/{id}`
- **Owner:** Member 4 (Day 3)
- **Status:** Planned
- **Dependencies:** M4 `get_config`
- **Response `200 OK`:** Returns full configuration object with `config_json`.
- **Error Responses:** `404 Not Found`.

##### `PUT /configs/{id}`
- **Owner:** Member 4 (Day 3)
- **Status:** Planned
- **Dependencies:** M4 `update_config`, M1 `config_validate`
- **Purpose:** Update a non-preset configuration. Presets (`is_preset: true`) are immutable.
- **Request Body:**
  ```json
  {
    "name": "Updated Strategy Name",
    "config_json": { ... }
  }
  ```
- **Response `200 OK`:** Updated configuration record.
- **Error Responses:**
  - `400 Bad Request`: Cannot modify system presets (`is_preset == true`).
  - `404 Not Found`: Config ID not found.
  - `422 Unprocessable Entity`: Validation failure on modified `config_json`.

---

#### 3.4 Runs & Evaluation Endpoints (Owned by M4)

##### `POST /runs`
- **Owner:** Member 4 (Day 6)
- **Status:** Planned (Router scaffolded in `backend/app/api/runs.py`)
- **Dependencies:** M1 `evaluator.py`, M4 `save_run`, M4 `hashing.py`
- **Purpose:** Execute deterministic evaluation on dataset with config. Freezes `config_snapshot_json`, computes canonical `run_hash` (SHA-256 of canonical JSON of dataset + config), and stores results.
- **Request Body:**
  ```json
  {
    "dataset_id": "7f8b9a20-8012-4e6f-99ab-61d092305e41",
    "config_id": "3c91b8a1-5501-4478-9b81-d41935e40889"
  }
  ```
- **Response `201 Created`:**
  ```json
  {
    "run_id": "8d3e21aa-4251-4c6e-8123-aa998240f91a",
    "dataset_id": "7f8b9a20-8012-4e6f-99ab-61d092305e41",
    "run_hash": "c84f6d90d8a66fbc625de0268a2bf6895c29be190011b93f2c537237937510d9",
    "created_at": "2026-10-09T09:30:00Z",
    "summary": {
      "total_teams": 40,
      "shortlisted_count": 10,
      "ineligible_count": 4,
      "needs_review_count": 6
    }
  }
  ```
- **Error Responses:**
  - `404 Not Found`: Dataset ID or Config ID not found.

##### `GET /runs`
- **Owner:** Member 4 (Day 6)
- **Status:** Planned
- **Query Params:** `dataset_id` (optional UUID)
- **Response `200 OK`:** List of past runs ordered by `created_at DESC`.

##### `GET /runs/{id}`
- **Owner:** Member 4 (Day 6)
- **Status:** Planned
- **Purpose:** Retrieve full evaluation run details: rankings, scores, explanations, member values, and immutable config snapshot.
- **Response `200 OK`:**
  ```json
  {
    "run_id": "8d3e21aa-4251-4c6e-8123-aa998240f91a",
    "dataset_id": "7f8b9a20-8012-4e6f-99ab-61d092305e41",
    "run_hash": "c84f6d90d8a66fbc625de0268a2bf6895c29be190011b93f2c537237937510d9",
    "created_at": "2026-10-09T09:30:00Z",
    "config_snapshot": { ... },
    "results": [
      {
        "rank": 1,
        "team_id": "T007",
        "team_name": "AlgoArchitects",
        "team_score": 88.5,
        "status": "Shortlisted",
        "eligibility": {"status": "Eligible", "failed_rules": []},
        "criterion_breakdown": {
          "technical_skills": {"score": 90, "weight": 25, "weighted_points": 22.5},
          "projects": {"score": 85, "weight": 25, "weighted_points": 21.25},
          "github_activity": {"score": 95, "weight": 20, "weighted_points": 19.0},
          "achievements": {"score": 80, "weight": 15, "weighted_points": 12.0},
          "portfolio": {"score": 91.6, "weight": 15, "weighted_points": 13.75}
        },
        "strengths": ["github_activity", "technical_skills"],
        "weakest_criterion": "achievements",
        "explanation": "Shortlisted: High GitHub volume and balanced team technical depth.",
        "missing_warnings": [],
        "member_criterion_values": {
          "member_1": {"technical_skills": 95, "github_activity": 100},
          "member_2": {"technical_skills": 85, "github_activity": 90}
        }
      }
    ]
  }
  ```

##### `GET /runs/{id}/final`
- **Owner:** Member 4 (Day 9)
- **Status:** Planned
- **Purpose:** Retrieve finalized team order with manual overrides applied.
- **Rule:** Automated rank is strictly preserved alongside final rank and override badge.
- **Response `200 OK`:**
  ```json
  {
    "run_id": "8d3e21aa-4251-4c6e-8123-aa998240f91a",
    "final_results": [
      {
        "final_rank": 1,
        "automated_rank": 12,
        "team_id": "T012",
        "team_name": "Wildcard Warriors",
        "team_score": 74.2,
        "override": {
          "action": "pin",
          "reason": "Top performer in regional qualifier"
        },
        "status": "Shortlisted (Pinned)"
      }
    ]
  }
  ```

##### `POST /runs/{id}/verify`
- **Owner:** Member 4 (Day 13)
- **Status:** Planned
- **Dependencies:** M4 `hashing.py`, M1 `evaluator.py`
- **Purpose:** Re-run the deterministic evaluation pipeline on stored dataset and config snapshot, verifying exact hash reproducibility.
- **Response `200 OK`:**
  ```json
  {
    "run_id": "8d3e21aa-4251-4c6e-8123-aa998240f91a",
    "stored_run_hash": "c84f6d90d8a66fbc625de0268a2bf6895c29be190011b93f2c537237937510d9",
    "computed_run_hash": "c84f6d90d8a66fbc625de0268a2bf6895c29be190011b93f2c537237937510d9",
    "verified": true,
    "timestamp": "2026-10-09T09:35:00Z"
  }
  ```

---

#### 3.5 Overrides Endpoints (Owned by M4)

##### `POST /runs/{id}/overrides`
- **Owner:** Member 4 (Day 9)
- **Status:** Planned (Router scaffolded in `backend/app/api/overrides.py`)
- **Dependencies:** M4 `add_override`
- **Purpose:** Record manual organizer decision (`pin`, `exclude`, `waitlist`). Never mutates stored automated results.
- **Request Body:**
  ```json
  {
    "team_id": "T012",
    "action": "pin",
    "reason": "Top performer in regional qualifier, granted automatic wildcard"
  }
  ```
  *Allowed actions:* `"pin"`, `"exclude"`, `"waitlist"` (minimum reason length: 3 characters).
- **Response `201 Created`:**
  ```json
  {
    "id": "a9012e12-3200-4b88-8129-ef9200421881",
    "run_id": "8d3e21aa-4251-4c6e-8123-aa998240f91a",
    "team_id": "T012",
    "action": "pin",
    "reason": "Top performer in regional qualifier, granted automatic wildcard",
    "created_at": "2026-10-09T09:32:00Z"
  }
  ```
- **Error Responses:**
  - `400 Bad Request`: Invalid action (must be pin, exclude, or waitlist).
  - `404 Not Found`: Run ID not found.

##### `GET /runs/{id}/overrides`
- **Owner:** Member 4 (Day 9)
- **Status:** Planned
- **Dependencies:** M4 `list_overrides`
- **Purpose:** List all audit records of manual overrides for a run, ordered by `created_at ASC`.
- **Response `200 OK`:** Array of override objects.

---

#### 3.6 Enrichment Endpoints (Owned by M4)

##### `POST /enrich`
- **Owner:** Member 4 (Day 10)
- **Status:** Planned (Router scaffolded in `backend/app/api/enrich.py`)
- **Dependencies:** M2 extractors (`resume_text`, `resume_parser`, `github_client`, `signals`), M4 threadpool job runner
- **Purpose:** Start background enrichment across resumes, GitHub API, and portfolios. Writes cache under `cache/` (not stored in PostgreSQL).
- **Request Body:**
  ```json
  {
    "dataset_id": "7f8b9a20-8012-4e6f-99ab-61d092305e41"
  }
  ```
- **Response `202 Accepted`:**
  ```json
  {
    "job_id": "enrich-job-7f8b9a20",
    "status": "running",
    "total_members": 112,
    "processed_members": 0,
    "eta_seconds": 45
  }
  ```

##### `GET /enrich/{job_id}`
- **Owner:** Member 4 (Day 10)
- **Status:** Planned
- **Purpose:** Check progress and results of background enrichment job.
- **Response `200 OK`:**
  ```json
  {
    "job_id": "enrich-job-7f8b9a20",
    "status": "completed",
    "total_members": 112,
    "processed_members": 112,
    "errors": [
      {"member_id": "m_T005_1", "error": "Invalid GitHub profile URL"}
    ]
  }
  ```

---

#### 3.7 Export Endpoints (Owned by M4)

##### `GET /runs/{id}/export`
- **Owner:** Member 4 (Day 11)
- **Status:** Planned (Router scaffolded in `backend/app/api/export.py`)
- **Dependencies:** M4 `runs` and `overrides` repositories
- **Query Params:**
  - `type`: `shortlist` | `rejected` | `waitlist` | `breakdown` | `zip`
  - `format`: `csv` | `json` | `zip`
- **Response:**
  - `text/csv` or `application/json` or `application/zip` (ZIP includes `config.json`, `results.json`, and `manifest.json` with hash stamps and override columns).

---

#### 3.8 Scoring & Comparison Endpoints (Owned by M1)

##### `POST /rank`
- **Owner:** Member 1 (Day 8)
- **Status:** Planned (Router scaffolded in `backend/app/api/rank.py`)
- **Dependencies:** M4 run storage with member criterion values (`backend/app/api/runs.py` Day 7)
- **Purpose:** Live what-if re-ranking simulator. Calculates new ranks from stored member criterion values in-memory without database writes or re-parsing resumes.
- **Request Body:**
  ```json
  {
    "run_id": "8d3e21aa-4251-4c6e-8123-aa998240f91a",
    "modified_config": {
      "criteria": [
        {"name": "technical_skills", "weight": 50, "keywords": ["Python"]},
        {"name": "projects", "weight": 20, "keywords": ["Distributed Systems"]},
        {"name": "github_activity", "weight": 10, "keywords": []},
        {"name": "achievements", "weight": 10, "keywords": []},
        {"name": "portfolio", "weight": 10, "keywords": []}
      ],
      "eligibility_rules": [],
      "top_x": 10,
      "aggregation": "mean",
      "missing_policy": "redistribute",
      "tie_break": ["technical_skills", "team_id"]
    }
  }
  ```
- **Response `200 OK`:**
  ```json
  {
    "reranked_teams": [
      {
        "team_id": "T001",
        "baseline_rank": 5,
        "new_rank": 2,
        "delta": 3,
        "entered_shortlist": true,
        "left_shortlist": false
      }
    ]
  }
  ```

##### `POST /compare`
- **Owner:** Member 1 (Day 11)
- **Status:** Planned (Router scaffolded in `backend/app/api/compare.py`)
- **Purpose:** Compare two scoring configurations on the same dataset/run.
- **Request Body:**
  ```json
  {
    "run_id": "8d3e21aa-4251-4c6e-8123-aa998240f91a",
    "config_id_a": "3c91b8a1-5501-4478-9b81-d41935e40889",
    "config_id_b": "5a22c190-2200-4710-8b10-e12984a90123"
  }
  ```
- **Response `200 OK`:**
  ```json
  {
    "comparison_table": [
      {
        "team_id": "T007",
        "rank_a": 1,
        "rank_b": 4,
        "score_a": 88.5,
        "score_b": 81.2,
        "rank_delta": -3
      }
    ]
  }
  ```

---

### 4. M1 / M2 Contract Alignment Verification

1. **Configuration Schema (M1):**
   - Criteria schema matches `backend/app/scoring/config_schema.py`:
     - `Criterion(name: str, weight: int 0-100, keywords: List[str])`
     - `EligibilityRule(signal: str, operator: str, value: Union[int, float, str, bool], scope: RuleScope)`
     - `ScoringConfiguration(criteria, eligibility_rules, top_x >= 1, aggregation, missing_policy, tie_break)`
   - All enum values align:
     - `RuleScope`: `"any_member"`, `"all_members"`, `"team"`
     - `AggregationMethod`: `"mean"`, `"weighted_mean"`, `"at_least_one"`
     - `MissingPolicy`: `"redistribute"`, `"neutral"`, `"penalty"`
   - Constraint: `tie_break` list MUST terminate with `"team_id"` for deterministic tie resolution.

2. **Ingestion & Data Format (M2):**
   - Matches `docs/data-format.md`:
     - Wide CSV columns: `team_id`, `team_name`, `member_1_name` ... `member_6_portfolio`.
     - JSON structure: `teams` array with nested `members` array.
     - Link signals status: `OK`, `MISSING`, `INVALID` (plus `UNAVAILABLE`, `UNCERTAIN` for extracted resume signals).
   - Validation report fields: `errors_count`, `warnings_count`, `duplicate_teams`, `duplicate_members`, `missing_fields_summary`.

3. **Database Invariant (M4):**
   - 4 core tables: `datasets`, `configurations`, `runs`, `overrides`.
   - `overrides` table maintains audit trail (`pin`, `exclude`, `waitlist`) and NEVER alters `runs.results_json`.
