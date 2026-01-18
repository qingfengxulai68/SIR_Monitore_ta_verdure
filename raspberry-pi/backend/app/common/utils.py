"""Utility functions."""

from datetime import datetime, timezone
from typing import TYPE_CHECKING

from app.common.constants import MODULE_HB_TIMEOUT

if TYPE_CHECKING:
    from app.models.module import Module

def is_module_online(module: Module) -> bool:
    """Check if module is online."""
    if not module.last_seen:
        return False
        
    return (datetime.now(timezone.utc) - module.last_seen).total_seconds() <= MODULE_HB_TIMEOUT

