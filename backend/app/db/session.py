"""Database session management and connection pooling.

Owner: Member 4 (Database & Integration)
Provides thread-safe session factories, context managers, and FastAPI dependencies.
"""

from contextlib import contextmanager
from typing import Dict, Generator, Optional

from sqlalchemy import create_engine
from sqlalchemy.engine import Engine
from sqlalchemy.orm import Session, sessionmaker

from backend.app.core.config import settings

# Engine cache by connection URL to avoid creating redundant connection pools
_engines: Dict[str, Engine] = {}
_session_factories: Dict[str, sessionmaker] = {}


def get_engine(db_url: Optional[str] = None) -> Engine:
    """Retrieve or create a SQLAlchemy engine with connection health pre-ping."""
    url = db_url or settings.DATABASE_URL
    if url not in _engines:
        _engines[url] = create_engine(
            url,
            pool_pre_ping=True,
            pool_size=10,
            max_overflow=20,
        )
    return _engines[url]


def get_session_factory(db_url: Optional[str] = None) -> sessionmaker:
    """Retrieve or create a sessionmaker bound to the corresponding engine."""
    url = db_url or settings.DATABASE_URL
    if url not in _session_factories:
        engine = get_engine(url)
        _session_factories[url] = sessionmaker(
            autocommit=False,
            autoflush=False,
            bind=engine,
            expire_on_commit=False,
        )
    return _session_factories[url]


def SessionLocal() -> Session:
    """Create a default session bound to the primary application DATABASE_URL."""
    factory = get_session_factory()
    return factory()


@contextmanager
def get_db_context(db_url: Optional[str] = None) -> Generator[Session, None, None]:
    """Context manager for database operations with automatic commit, rollback, and cleanup."""
    factory = get_session_factory(db_url)
    session: Session = factory()
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()


def get_db() -> Generator[Session, None, None]:
    """FastAPI dependency for obtaining a database session."""
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()
