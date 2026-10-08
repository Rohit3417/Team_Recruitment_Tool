# Incursion Track 3: Team Recruitment Automation Tool
## API Contract Specification (Day 1 Draft)

- **Version:** `1.0.0-draft.day1`
- **Primary Author:** Member 4 (Database & Integration)
- **Reviewers:** Member 1 (Scoring Engine), Member 2 (Data & Profiles), Member 3 (Frontend)
- **Lifecycle:** Drafted Day 1, final review & alignment Day 2 morning.

---

### 1. Architectural Principles & Invariants

1. **Deterministic & Reproducible:** Scoring, eligibility, and ranking are 100% deterministic code. An identical `(dataset, config)` pair MUST always produce the exact same `run_hash` and ranking.
2. **AI Safeguards:** LLMs/Gemini may only extract resume signals into verifiable quotes. AI NEVER decides shortlisting or ranks.
3. **Explicit Missingness:** Missing or invalid values are never converted to zero or assumed. They are marked `MISSING`, `INVALID`, or `UNCERTAIN` and handled via `missing_policy`.
4. **Auditability & Immutable Runs:** Stored runs are immutable. Manual organizer actions (`pin`, `exclude`, `waitlist`) are stored in `overrides` and NEVER rewrite the automated `runs.results_json`.
5. **Minimal Database:** Only auditable persistent state lives in PostgreSQL (4 tables: `datasets`, `configurations`, `runs`, `overrides`). Raw resumes, external GitHub JSON, and enrichment jobs are kept in `cache/` or memory.

---

### 2. Team Ownership Matrix

| Router Group | Endpoints | Owner | Target Day | Primary Responsibility |
|---|---|---|---|---|
| **Ingest** | `POST /upload`<br>`GET /datasets/{id}/teams` | **M2** | Day 4 | CSV/JSON parsing, row validation, duplicate check, data normalization |
| **Configurations** | `POST /configs`<br>`GET /configs`<br>`GET /configs/{id}`<br>`PUT /configs/{id}` | **M4** | Day 3 | Scoring configuration CRUD, default presets storage |
| **Runs & Evaluation** | `POST /runs`<br>`GET /runs`<br>`GET /runs/{id}`<br>`POST /runs/{id}/verify` | **M4** | Day 6 & 13 | Evaluation execution, config snapshotting, run hashing, hash verification |
| **Overrides & Final** | `POST /runs/{id}/overrides`<br>`GET /runs/{id}/overrides`<br>`GET /runs/{id}/final` | **M4** | Day 9 | Auditable manual review decisions (`pin`, `exclude`, `waitlist`), final ranking view |
| **Enrichment** | `POST /enrich`<br>`GET /enrich/{job_id}` | **M4** | Day 10 | Background threadpool enrichment job orchestrating M2 extractors |
| **Export** | `GET /runs/{id}/export` | **M4** | Day 11 | CSV/JSON exports, audit ZIP packaging |
| **Scoring / Re-rank** | `POST /rank` | **M1** | Day 8 | Fast in-memory what-if re-ranking from cached member criterion values |
| **Comparison** | `POST /compare` | **M1** | Day 11 | Multi-config comparison matrix and sensitivity delta |

---

### 3. Endpoint Specifications

#### 3.1 Ingest Endpoints (Owned by M2)

##### `POST /upload`
- **Owner:** Member 2 (Day 4)
- **Purpose:** Accept CSV or JSON registration files, validate rows, save normalized teams using M4's `save_dataset`.
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
  - `413 Payload Too Large`: File exceeds upload limit.

##### `GET /datasets/{dataset_id}/teams`
- **Owner:** Member 2 (Day 4)
- **Purpose:** Retrieve the full normalized team list and member link statuses.
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

---

#### 3.2 Configuration Endpoints (Owned by M4)

##### `POST /configs`
- **Owner:** Member 4 (Day 3, validates via M1 `config_validate`)
- **Purpose:** Create and save a scoring strategy.
- **Request Body:**
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
- **Response `201 Created`:** Returns saved configuration with `id` and `created_at`.
- **Error Responses:**
  - `422 Unprocessable Entity`: Weights don't sum to 100, empty criteria list, tie_break doesn't terminate with `team_id`.

##### `GET /configs`
- **Owner:** Member 4 (Day 3)
- **Response `200 OK`:** List of configurations (includes presets: Balanced, Skills-heavy, Projects-heavy).

##### `GET /configs/{id}`
- **Owner:** Member 4 (Day 3)
- **Response `200 OK`:** Single configuration object.

##### `PUT /configs/{id}`
- **Owner:** Member 4 (Day 3)
- **Purpose:** Update configuration. Fails if `is_preset == true` (presets are read-only).

---

#### 3.3 Runs & Evaluation Endpoints (Owned by M4)

##### `POST /runs`
- **Owner:** Member 4 (Day 6)
- **Purpose:** Execute deterministic evaluation on a dataset using a configuration. Computes canonical SHA-256 `run_hash` and freezes `config_snapshot_json`.
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
    "created_at": "2026-10-08T20:00:00Z",
    "summary": {
      "total_teams": 40,
      "shortlisted_count": 10,
      "ineligible_count": 4,
      "needs_review_count": 6
    }
  }
  ```

##### `GET /runs`
- **Owner:** Member 4 (Day 6)
- **Query Params:** `dataset_id` (optional)
- **Response `200 OK`:** List of past evaluation runs.

##### `GET /runs/{id}`
- **Owner:** Member 4 (Day 6)
- **Purpose:** Retrieve complete evaluation results, ranked teams, explanations, and member criterion scores.
- **Response `200 OK`:**
  ```json
  {
    "run_id": "8d3e21aa-4251-4c6e-8123-aa998240f91a",
    "dataset_id": "7f8b9a20-8012-4e6f-99ab-61d092305e41",
    "run_hash": "c84f6d90d8a66fbc625de0268a2bf6895c29be190011b93f2c537237937510d9",
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

##### `POST /runs/{id}/verify`
- **Owner:** Member 4 (Day 13)
- **Purpose:** Re-run the deterministic evaluation pipeline on the stored dataset and configuration snapshot, then compare computed hash with stored `run_hash`.
- **Response `200 OK`:**
  ```json
  {
    "run_id": "8d3e21aa-4251-4c6e-8123-aa998240f91a",
    "stored_run_hash": "c84f6d90d8a66fbc625de0268a2bf6895c29be190011b93f2c537237937510d9",
    "computed_run_hash": "c84f6d90d8a66fbc625de0268a2bf6895c29be190011b93f2c537237937510d9",
    "verified": true,
    "timestamp": "2026-10-08T20:05:00Z"
  }
  ```

---

#### 3.4 Overrides & Final Results Endpoints (Owned by M4)

##### `POST /runs/{id}/overrides`
- **Owner:** Member 4 (Day 9)
- **Purpose:** Record manual organizer decision (`pin`, `exclude`, `waitlist`).
- **Request Body:**
  ```json
  {
    "team_id": "T012",
    "action": "pin",
    "reason": "Top performer in regional qualifier, granted automatic wildcard"
  }
  ```
- **Response `201 Created`:**
  ```json
  {
    "override_id": "a9012e12-3200-4b88-8129-ef9200421881",
    "run_id": "8d3e21aa-4251-4c6e-8123-aa998240f91a",
    "team_id": "T012",
    "action": "pin",
    "reason": "Top performer in regional qualifier, granted automatic wildcard",
    "created_at": "2026-10-08T20:10:00Z"
  }
  ```

##### `GET /runs/{id}/overrides`
- **Owner:** Member 4 (Day 9)
- **Response `200 OK`:** List of override entries for the run.

##### `GET /runs/{id}/final`
- **Owner:** Member 4 (Day 9)
- **Purpose:** Produce the final modified ranking.
- **Rule:** Automated rank is strictly preserved alongside final rank and override tag.
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

---

#### 3.5 Enrichment Endpoints (Owned by M4)

##### `POST /enrich`
- **Owner:** Member 4 (Day 10)
- **Purpose:** Start background enrichment job across resumes, GitHub API, and portfolios using thread pool. Cached under `cache/`.
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

#### 3.6 Export Endpoints (Owned by M4)

##### `GET /runs/{id}/export`
- **Owner:** Member 4 (Day 11)
- **Query Params:**
  - `type`: `shortlist` | `rejected` | `waitlist` | `breakdown` | `zip`
  - `format`: `csv` | `json` | `zip`
- **Response:**
  - `text/csv` or `application/json` or `application/zip` (contains `config.json`, `results.json`, and `manifest.json` with hash stamps).

---

#### 3.7 Scoring & Comparison Endpoints (Owned by M1)

##### `POST /rank`
- **Owner:** Member 1 (Day 8)
- **Purpose:** Live what-if re-ranking simulator. Calculates new ranks from stored member criterion values without touching database or re-parsing resumes.
- **Request Body:**
  ```json
  {
    "run_id": "8d3e21aa-4251-4c6e-8123-aa998240f91a",
    "modified_config": {
      "criteria": [
        {"name": "technical_skills", "weight": 50},
        {"name": "projects", "weight": 20},
        {"name": "github_activity", "weight": 10},
        {"name": "achievements", "weight": 10},
        {"name": "portfolio", "weight": 10}
      ],
      "top_x": 10
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

### 4. Day 2 Alignment & Finalization Checklist

- [ ] Confirm exact M1 `ScoringConfiguration` JSON fields from `backend/app/scoring/config_schema.py`.
- [ ] Align M2 team/member ingestion models with `docs/data-format.md`.
- [ ] Validate M3 frontend type definitions against this API contract.
