"""Rate limiter singleton — shared across the application.

Separated from ``main.py`` to avoid circular imports (routes need the limiter,
and main.py needs the routes).
"""

from __future__ import annotations

from slowapi import Limiter
from slowapi.util import get_remote_address

# Rate limiter - keyed by client IP. Used to protect the Vertex AI-backed
# /api/insights endpoint from quota exhaustion and billing abuse.
# NOTE: This is process-local state. See "Known limitations" in docs/ARCHITECTURE.md
# regarding the single-instance deployment assumption.
limiter = Limiter(key_func=get_remote_address)
