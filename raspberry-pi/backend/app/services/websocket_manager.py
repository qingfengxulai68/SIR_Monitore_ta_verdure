"""WebSocket connection manager for real-time updates."""

import asyncio
import json
import logging
from datetime import datetime
from typing import Any

from fastapi import WebSocket
from pydantic import BaseModel

logger = logging.getLogger(__name__)


class WebSocketManager:
    """Manages WebSocket connections and broadcasts."""

    def __init__(self) -> None:
        """Initialize the WebSocket manager."""
        # All active connections
        self.active_connections: dict[str, WebSocket] = {}
        # Lock for thread-safe operations
        self._lock = asyncio.Lock()

    async def connect(self, websocket: WebSocket, connection_id: str) -> None:
        """Accept a new WebSocket connection."""
        await websocket.accept()
        async with self._lock:
            self.active_connections[connection_id] = websocket
        logger.info(f"WebSocket connected: {connection_id}")

    async def disconnect(self, connection_id: str) -> None:
        """Handle WebSocket disconnection."""
        async with self._lock:
            # Remove from active connections
            self.active_connections.pop(connection_id, None)

        logger.info(f"WebSocket disconnected: {connection_id}")

    async def _send_to_connection(
        self, connection_id: str, message: str
    ) -> bool:
        """Send a message to a specific connection."""
        websocket = self.active_connections.get(connection_id)
        if websocket is None:
            return False

        try:
            await websocket.send_text(message)
            return True
        except Exception as e:
            logger.error(f"Error sending to {connection_id}: {e}")
            return False

    async def broadcast(self, message: BaseModel) -> None:
        """Broadcast a message to all connected clients."""
        # Serialize message to JSON string
        message_str = message.model_dump_json()

        disconnected = []
        async with self._lock:
            connection_ids = list(self.active_connections.keys())

        for connection_id in connection_ids:
            success = await self._send_to_connection(connection_id, message_str)
            if not success:
                disconnected.append(connection_id)

        # Clean up disconnected clients
        for connection_id in disconnected:
            await self.disconnect(connection_id)

    async def emit_plant_metrics(self, message: BaseModel) -> None:
        """Emit a PLANT_METRICS message to all clients."""
        await self.broadcast(message)

    async def emit_module_connection(self, message: BaseModel) -> None:
        """Emit a MODULE_CONNECTION message to all clients."""
        await self.broadcast(message)

    async def emit_entity_change(self, message: BaseModel) -> None:
        """Emit an ENTITY_CHANGE message to all clients."""
        await self.broadcast(message)


# Global WebSocket manager instance
ws_manager = WebSocketManager()
