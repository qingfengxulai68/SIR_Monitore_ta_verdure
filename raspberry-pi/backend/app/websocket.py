"""WebSocket connection management and endpoint handler."""

import asyncio
import json
import uuid
from typing import Annotated, Literal
from fastapi import Query, WebSocket, WebSocketDisconnect
from pydantic import BaseModel

from app.auth.jwt import decode_token

# WebSocket Manager
class WebSocketManager:
    """Manages WebSocket connections and broadcasts messages."""

    def __init__(self) -> None:
        """Initialize the WebSocket manager."""
        self.active_connections: dict[str, WebSocket] = {}
        self._lock = asyncio.Lock()

    async def connect(self, websocket: WebSocket, connection_id: str) -> None:
        """Accept and register a new WebSocket connection."""
        await websocket.accept()
        async with self._lock:
            self.active_connections[connection_id] = websocket

    async def disconnect(self, connection_id: str) -> None:
        """Remove a WebSocket connection."""
        async with self._lock:
            self.active_connections.pop(connection_id, None)

    async def broadcast(self, message: BaseModel) -> None:
        """Broadcast a Pydantic message to all connected clients."""
        message_str = message.model_dump_json()
        disconnected = []

        async with self._lock:
            connection_ids = list(self.active_connections.keys())

        for connection_id in connection_ids:
            websocket = self.active_connections.get(connection_id)
            if websocket:
                try:
                    await websocket.send_text(message_str)
                except Exception:
                    disconnected.append(connection_id)

        # Clean up disconnected clients
        for connection_id in disconnected:
            await self.disconnect(connection_id)

    async def emit_plant_metrics(self, plant_id: int, metrics) -> None:
        """Broadcast plant metrics to all clients."""
        from app.schemas.websocket import PlantMetricsMessage, PlantMetricsPayload
        message = PlantMetricsMessage(
            payload=PlantMetricsPayload(
                plantId=plant_id,
                metrics=metrics,
            )
        )
        await self.broadcast(message)

    async def emit_module_connectivity(self, module_id: str, is_online: bool, last_seen) -> None:
        """Broadcast module connectivity status to all clients."""
        from app.schemas.websocket import ModuleConnectivityMessage, ModuleConnectivityPayload, ModuleConnectivityUpdate
        message = ModuleConnectivityMessage(
            payload=ModuleConnectivityPayload(
                moduleId=module_id,
                connectivity=ModuleConnectivityUpdate(isOnline=is_online, lastSeen=last_seen),
            )
        )
        await self.broadcast(message)

    async def emit_entity_change(self, entity: str, action: str, entity_id) -> None:
        """Broadcast entity changes to all clients."""
        from app.schemas.websocket import EntityChangeMessage, EntityChangePayload
        message = EntityChangeMessage(
            payload=EntityChangePayload(
                entity=entity,
                action=action,
                id=entity_id,
            )
        )
        await self.broadcast(message)

# Global WebSocket manager instance
ws_manager = WebSocketManager()

# WebSocket endpoint
async def websocket_endpoint(
    websocket: WebSocket,
    token: Annotated[str | None, Query()] = None,
) -> None:
    """
    WebSocket endpoint for real-time updates.

    Connect with: ws://host/ws?token=<jwt_token>

    Messages from server:
    - PLANT_METRICS: Metrics data updates
    - MODULE_CONNECTIVITY: Module connectivity status
    - ENTITY_CHANGE: Structural changes (CRUD operations)

    Messages from client:
    - PING: Keep-alive (server responds with PONG)
    """
    # Validate authentication token
    if not token or not decode_token(token):
        await websocket.accept()
        await websocket.close(code=4001, reason="Authentication required")
        return

    # Generate unique connection ID
    connection_id = str(uuid.uuid4())

    # Accept and register connection
    await ws_manager.connect(websocket, connection_id)

    try:
        while True:
            data = await websocket.receive_text()
            try:
                message = json.loads(data)
                if message.get("type") == "PING":
                    await websocket.send_text(json.dumps({"type": "PONG"}))
            except json.JSONDecodeError:
                pass
    except WebSocketDisconnect:
        await ws_manager.disconnect(connection_id)
    except Exception:
        await ws_manager.disconnect(connection_id)
