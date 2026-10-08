"""API package organizing routers across team roles (M1, M2, M4)."""

from backend.app.api.compare import router as compare_router
from backend.app.api.configs import router as configs_router
from backend.app.api.enrich import router as enrich_router
from backend.app.api.export import router as export_router
from backend.app.api.overrides import router as overrides_router
from backend.app.api.rank import router as rank_router
from backend.app.api.runs import router as runs_router
from backend.app.api.upload import router as upload_router

__all__ = [
    "compare_router",
    "configs_router",
    "enrich_router",
    "export_router",
    "overrides_router",
    "rank_router",
    "runs_router",
    "upload_router",
]
