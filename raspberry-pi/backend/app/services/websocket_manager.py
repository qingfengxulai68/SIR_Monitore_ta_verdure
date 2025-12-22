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
        # Subscriptions: plant_id -> set of connection_ids
        self.plant_subscriptions: dict[int, set[str]] = {}
        # Connection to subscriptions mapping for cleanup
        self.connection_subscriptions: dict[str, set[int]] = {}
        # Lock for thread-safe operations
        self._lock = asyncio.Lock()

    async def connect(self, websocket: WebSocket, connection_id: str) -> None:
        """Accept a new WebSocket connection."""
        await websocket.accept()
        async with self._lock:
            self.active_connections[connection_id] = websocket
            self.connection_subscriptions[connection_id] = set()
        logger.info(f"WebSocket connected: {connection_id}")

    async def disconnect(self, connection_id: str) -> None:
        """Handle WebSocket disconnection."""
        async with self._lock:
            # Remove from active connections
            self.active_connections.pop(connection_id, None)

            # Clean up subscriptions
            subscribed_plants = self.connection_subscriptions.pop(connection_id, set())
            for plant_id in subscribed_plants:
                if plant_id in self.plant_subscriptions:
                    self.plant_subscriptions[plant_id].discard(connection_id)
                    if not self.plant_subscriptions[plant_id]:
                        del self.plant_subscriptions[plant_id]

        logger.info(f"WebSocket disconnected: {connection_id}")

    async def subscribe_to_plant(self, connection_id: str, plant_id: int) -> None:
        """Subscribe a connection to a specific plant's updates."""
        async with self._lock:
            if plant_id not in self.plant_subscriptions:
                self.plant_subscriptions[plant_id] = set()
            self.plant_subscriptions[plant_id].add(connection_id)

            if connection_id in self.connection_subscriptions:
                self.connection_subscriptions[connection_id].add(plant_id)

        logger.debug(f"Connection {connection_id} subscribed to plant {plant_id}")

    async def unsubscribe_from_plant(self, connection_id: str, plant_id: int) -> None:
        """Unsubscribe a connection from a plant's updates."""
        async with self._lock:
            if plant_id in self.plant_subscriptions:
                self.plant_subscriptions[plant_id].discard(connection_id)
                if not self.plant_subscriptions[plant_id]:
                    del self.plant_subscriptions[plant_id]

            if connection_id in self.connection_subscriptions:
                self.connection_subscriptions[connection_id].discard(plant_id)

        logger.debug(f"Connection {connection_id} unsubscribed from plant {plant_id}")

    async def _send_to_connection(
        self, connection_id: str, event: str, data: dict[str, Any]
    ) -> bool:
        """Send a message to a specific connection."""
        websocket = self.active_connections.get(connection_id)
        if websocket is None:
            return False

        try:
            message = json.dumps({"event": event, "data": data}, default=str)
            await websocket.send_text(message)
            return True
        except Exception as e:
            logger.error(f"Error sending to {connection_id}: {e}")
            return False

    async def broadcast(self, event: str, data: dict[str, Any] | BaseModel) -> None:
        """Broadcast an event to all connected clients."""
        if isinstance(data, BaseModel):
            data = data.model_dump()

        # Convert datetime objects to ISO format strings
        data = self._serialize_data(data)

        disconnected = []
        async with self._lock:
            connection_ids = list(self.active_connections.keys())

        for connection_id in connection_ids:
            success = await self._send_to_connection(connection_id, event, data)
            if not success:
                disconnected.append(connection_id)

        # Clean up disconnected clients
        for connection_id in disconnected:
            await self.disconnect(connection_id)

    async def broadcast_to_plant_subscribers(
        self, plant_id: int, event: str, data: dict[str, Any] | BaseModel
    ) -> None:
        """Broadcast an event to subscribers of a specific plant."""
        if isinstance(data, BaseModel):
            data = data.model_dump()

        data = self._serialize_data(data)

        async with self._lock:
            subscribers = list(self.plant_subscriptions.get(plant_id, set()))

        disconnected = []
        for connection_id in subscribers:
            success = await self._send_to_connection(connection_id, event, data)
            if not success:
                disconnected.append(connection_id)

        for connection_id in disconnected:
            await self.disconnect(connection_id)

    async def emit_plant_update(self, data: dict[str, Any] | BaseModel) -> None:
        """Emit a plant:update event to all clients."""
        await self.broadcast("plant:update", data)

    async def emit_plant_offline(self, data: dict[str, Any] | BaseModel) -> None:
        """Emit a plant:offline event to all clients."""
        await self.broadcast("plant:offline", data)

    async def emit_module_status(self, data: dict[str, Any] | BaseModel) -> None:
        """Emit a module:status event to all clients."""
        await self.broadcast("module:status", data)

    def _serialize_data(self, data: dict[str, Any]) -> dict[str, Any]:
        """Serialize datetime objects in data."""
        result = {}
        for key, value in data.items():
            if isinstance(value, datetime):
                result[key] = value.isoformat()
            elif isinstance(value, dict):
                result[key] = self._serialize_data(value)
            else:
                result[key] = value
        return result


# Global WebSocket manager instance
ws_manager = WebSocketManager()
