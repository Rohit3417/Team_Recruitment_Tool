# Team Recruitment Automation Tool (Incursion Track 3)

A configurable, explainable, team-level hackathon shortlisting tool built on deterministic scoring, reproducible run evaluations, and auditable manual overrides.

---

## Day 1 Setup Guide

Follow these quick steps to get the local development environment running:

### 1. Configure Environment Variables
Copy `.env.example` to create your local `.env`:
```bash
cp .env.example .env
```

### 2. Start PostgreSQL with Docker Compose
Start PostgreSQL 16 (includes automatic schema initialization from `backend/app/db/schema.sql`):
```bash
docker compose up -d
```
To verify the database container health:
```bash
docker compose ps
```

### 3. Start FastAPI Locally
Create and activate a Python virtual environment, install requirements, and run the backend server:
```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt
uvicorn backend.app.main:app --reload --port 8000
```

### 4. Verify Health & Interactive Docs
- **Health Check:** Open `http://localhost:8000/health` (should return `{"status": "ok"}`)
- **Interactive Swagger Docs:** Open `http://localhost:8000/docs`
- **ReDoc Documentation:** Open `http://localhost:8000/redoc`

---

## Documentation & Architecture References

- **Shared API Contract:** [`docs/api-contract.md`](docs/api-contract.md)
  *Documents all endpoint contracts, request/response JSON schemas, and member ownership (M1, M2, M3, M4).*
- **Database ER Diagram:** [`docs/er-diagram.png`](docs/er-diagram.png)
  *Visualizes the minimal 4-table schema (`datasets`, `configurations`, `runs`, `overrides`).*
- **Database SQL Schema:** [`backend/app/db/schema.sql`](backend/app/db/schema.sql)
- **Scoring Design Specification:** [`docs/scoring-design.md`](docs/scoring-design.md)
- **Profile Signals Contract:** [`docs/profile-contract.md`](docs/profile-contract.md)
- **Registration Data Format:** [`docs/data-format.md`](docs/data-format.md)