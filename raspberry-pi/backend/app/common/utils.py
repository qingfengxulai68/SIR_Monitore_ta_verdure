"""Utility functions."""

import os
from datetime import UTC, datetime
from typing import TYPE_CHECKING

from backend.app.common.constants import HEARTBEAT_TIMEOUT_SECONDS

if TYPE_CHECKING:
    from app.models.module import Module


def is_module_online(module: Module) -> bool:
    """Check if module is online."""
    if not module.last_seen:
        return False
    last_seen = module.last_seen.replace(tzinfo=UTC) if module.last_seen.tzinfo is None else module.last_seen
    return (datetime.now(UTC) - last_seen).total_seconds() <= HEARTBEAT_TIMEOUT_SECONDS