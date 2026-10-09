# This defines the exact shape of the data M2's parsers will hand over to your scoring engine.

{
  "member_id": "string",
  "signals": {
    "github_contributions_12m": {
      "value": 142,
      "status": "OK",
      "source": "github_api",
      "confidence": 1.0,
      "snippet": null
    },
    "technical_skills_matched": {
      "value": ["Python", "Go", "PostgreSQL", "Redis"],
      "status": "OK",
      "source": "resume_parser",
      "confidence": 0.9,
      "snippet": "Experienced in building backends with Python, Go, and PostgreSQL..."
    },
    "portfolio_reachable": {
      "value": null,
      "status": "INVALID",
      "source": "portfolio_check",
      "confidence": 1.0,
      "snippet": null
    }
  }
}