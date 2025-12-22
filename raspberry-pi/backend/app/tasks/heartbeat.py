"""Heartbeat checker background task."""

import asyncio
import logging
import os
from datetime import UTC, datetime

from sqlalchemy import select
from sqlalchemy.orm import Session, sessionmaker

from app.database import engine
from app.models.module import Module
from app.models.plant import Plant
from app.schemas.websocket import ModuleStatusEvent, PlantOfflineEvent
from app.services.websocket_manager import ws_manager

logger = logging.getLogger(__name__)


def _is_module_online(module: Module) -> bool:
    """Check if module is online."""
    if not module.last_seen:
        return False
    last_seen = module.last_seen.replace(tzinfo=UTC) if module.last_seen.tzinfo is None else module.last_seen
    return (datetime.now(UTC) - last_seen).total_seconds() <= int(os.environ.get('HEARTBEAT_TIMEOUT_SECONDS', '120'))


class HeartbeatChecker:
    """Background task for checking module heartbeats."""

    def __init__(self) -> None:
        """Initialize the heartbeat checker."""
        self._running = False
        self._task: asyncio.Task | None = None
        self._offline_modules: set[str] = set()

    async def start(self) -> None:
        """Start the heartbeat checker."""
        if self._running:
            return
        self._running = True
        self._task = asyncio.create_task(self._run())
        logger.info("Heartbeat checker started")

    async def stop(self) -> None:
        """Stop the heartbeat checker."""
        self._running = False
        if self._task:
            self._task.cancel()
            try:
                await self._task
            except asyncio.CancelledError:
                pass
        logger.info("Heartbeat checker stopped")

    async def _run(self) -> None:
        """Main loop for heartbeat checking."""
        while self._running:
            try:
                await self._check_heartbeats()
            except Exception as e:
                logger.error(f"Error in heartbeat checker: {e}")
            await asyncio.sleep(int(os.environ.get('HEARTBEAT_CHECK_INTERVAL_SECONDS', '60')))

    async def _check_heartbeats(self) -> None:
        """Check all modules for heartbeat timeout."""
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        session = SessionLocal()
        try:
            # Get coupled modules directly
            modules = session.execute(select(Module).where(Module.coupled == True)).scalars().all()  # noqa: E712

            for module in modules:
                is_online = _is_module_online(module)

                if not is_online and module.id not in self._offline_modules:
                    self._offline_modules.add(module.id)
                    plant = session.execute(select(Plant).where(Plant.module_id == module.id)).scalars().first()
                    if plant:
                        logger.warning(f"Module {module.id} (Plant: {plant.name}) went offline")
                        await ws_manager.emit_plant_offline(
                            PlantOfflineEvent(
                                plantId=plant.id,
                                name=plant.name,
                                moduleId=module.id,
                                status="offline",
                                timestamp=datetime.now(UTC),
                            )
                        )
                        await ws_manager.emit_module_status(
                            ModuleStatusEvent(
                                moduleId=module.id,
                                isOnline=False,
                                lastSeen=module.last_seen or datetime.now(UTC),
                            )
                        )

                elif is_online and module.id in self._offline_modules:
                    self._offline_modules.discard(module.id)
        finally:
            session.close()


# Global heartbeat checker instance
heartbeat_checker = HeartbeatChecker()
