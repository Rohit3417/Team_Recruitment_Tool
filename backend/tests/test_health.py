"""Test health and app entrypoint."""

from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)


def test_health_check_returns_ok():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_root_metadata():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "version" in data
    assert data["service"] == "Team Recruitment Automation Tool"


def test_all_team_routes_registered():
    route_paths = {route.path for route in app.routes}
    expected_paths = {
        "/health",
        "/upload",
        "/datasets/{dataset_id}/teams",
        "/configs",
        "/configs/{config_id}",
        "/runs",
        "/runs/{run_id}",
        "/runs/{run_id}/overrides",
        "/runs/{run_id}/final",
        "/runs/{run_id}/verify",
        "/runs/{run_id}/export",
        "/enrich",
        "/enrich/{job_id}",
        "/rank",
        "/compare",
    }
    assert expected_paths.issubset(route_paths)
