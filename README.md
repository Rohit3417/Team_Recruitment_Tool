# Team Recruitment Automation Tool (Incursion Track 3)

A configurable, explainable, team-level hackathon shortlisting tool built on deterministic scoring, reproducible run evaluations, and auditable manual overrides.

---

## Quickstart & Local Development Guide

### 1. Configure Environment Variables
Copy `.env.example` to create your local `.env`:
```bash
cp .env.example .env
```

### 2. Start PostgreSQL with Docker Compose
Start PostgreSQL 16 container:
```bash
docker compose up -d
```
To verify the database container health:
```bash
docker compose ps
```

### 3. Install Dependencies & Apply Alembic Migrations
Activate your virtual environment and install backend requirements:
```bash
source .venv/bin/activate
pip install -r backend/requirements.txt
```

Apply database migrations to the latest revision:
```bash
alembic -c backend/alembic.ini upgrade head
```

To inspect migration status:
```bash
alembic -c backend/alembic.ini current
```

To roll back migrations if needed:
```bash
alembic -c backend/alembic.ini downgrade base
```

### 4. Run Backend Tests
Run the test suite against the isolated PostgreSQL test database:
```bash
pytest -v
```

### 5. Start FastAPI Locally
Run the FastAPI development server:
```bash
uvicorn backend.app.main:app --reload --port 8000
```

### 6. Verify Health & Interactive Docs
- **Health Check:** `http://localhost:8000/health` (returns `{"status": "ok"}`)
- **Interactive Swagger Docs:** `http://localhost:8000/docs`
- **ReDoc Documentation:** `http://localhost:8000/redoc`

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