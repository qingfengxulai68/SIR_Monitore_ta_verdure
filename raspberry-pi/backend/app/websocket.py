"""WebSocket endpoint handler."""

import json
import logging
import uuid
from typing import Annotated

from fastapi import Depends, Query, WebSocket, WebSocketDisconnect

from app.auth.jwt import decode_token
from app.services.websocket_manager import ws_manager

logger = logging.getLogger(__name__)


async def websocket_endpoint(
    websocket: WebSocket,
    token: Annotated[str | None, Query()] = None,
) -> None:
    """
    WebSocket endpoint for real-time updates.

    Connect with: ws://host/ws?token=<jwt_token>

    Messages from server:
    - PLANT_METRICS: Sensor data updates
    - MODULE_CONNECTION: Module connectivity status
    - ENTITY_CHANGE: Structural changes (CRUD operations)

    Messages from client:
    - PING: Keep-alive (server responds with PONG)
    """
    # Validate token
    if token is None:
        await websocket.close(code=4001, reason="Authentication required")
        return

    payload = decode_token(token)
    if payload is None:
        await websocket.close(code=4001, reason="Invalid or expired token")
        return

    # Generate connection ID
    connection_id = str(uuid.uuid4())

    # Accept connection
    await ws_manager.connect(websocket, connection_id)

    try:
        while True:
            # Receive message from client
            data = await websocket.receive_text()

            try:
                message = json.loads(data)
                message_type = message.get("type")

                if message_type == "PING":
                    await websocket.send_text(json.dumps({"type": "PONG"}))

            except json.JSONDecodeError:
                logger.warning(f"Invalid JSON from connection {connection_id}")

    except WebSocketDisconnect:
        await ws_manager.disconnect(connection_id)
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        await ws_manager.disconnect(connection_id)
