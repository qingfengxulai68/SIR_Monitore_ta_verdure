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

    Events from server:
    - plant:update: Sent when sensor data is ingested
    - plant:offline: Sent when a module times out
    - module:status: Sent when module online status changes

    Events from client:
    - subscribe:plant: Subscribe to a specific plant's updates
    - unsubscribe:plant: Unsubscribe from a plant's updates
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
                event = message.get("event")
                event_data = message.get("data")

                if event == "subscribe:plant" and isinstance(event_data, int):
                    await ws_manager.subscribe_to_plant(connection_id, event_data)
                    await websocket.send_text(
                        json.dumps(
                            {
                                "event": "subscribed",
                                "data": {"plantId": event_data},
                            }
                        )
                    )

                elif event == "unsubscribe:plant" and isinstance(event_data, int):
                    await ws_manager.unsubscribe_from_plant(connection_id, event_data)
                    await websocket.send_text(
                        json.dumps(
                            {
                                "event": "unsubscribed",
                                "data": {"plantId": event_data},
                            }
                        )
                    )

                elif event == "ping":
                    await websocket.send_text(json.dumps({"event": "pong"}))

            except json.JSONDecodeError:
                logger.warning(f"Invalid JSON from connection {connection_id}")

    except WebSocketDisconnect:
        await ws_manager.disconnect(connection_id)
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        await ws_manager.disconnect(connection_id)
