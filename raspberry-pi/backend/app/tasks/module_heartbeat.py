"""Module heartbeat checker background task."""

import asyncio
from sqlalchemy import select
from sqlalchemy.orm import sessionmaker

from app.common.constants import MODULE_HEARTBEAT_CHECK_INTERVAL_SECONDS
from app.database import engine
from app.models.module import Module
from app.models.plant import Plant
from app.common.utils import is_module_online
from app.websocket import ws_manager


class ModuleHeartbeatChecker:
    """Background task for checking module heartbeats."""

    def __init__(self) -> None:
        self._running = False
        self._task: asyncio.Task | None = None
        self._offline_modules: set[str] = set()
        self._session_factory = sessionmaker(autocommit=False, autoflush=False, bind=engine)

    async def start(self) -> None:
        """Start the heartbeat checker."""
        if not self._running:
            self._running = True
            self._task = asyncio.create_task(self._run())

    async def stop(self) -> None:
        """Stop the heartbeat checker."""
        self._running = False
        if self._task:
            self._task.cancel()
            try:
                await self._task
            except asyncio.CancelledError:
                pass

    async def _run(self) -> None:
        """Main loop for heartbeat checking."""
        interval = MODULE_HEARTBEAT_CHECK_INTERVAL_SECONDS
        while self._running:
            try:
                await self._check_heartbeats()
            except Exception:
                pass
            await asyncio.sleep(interval)

    async def _check_heartbeats(self) -> None:
        """Check all modules for heartbeat timeout."""
        with self._session_factory() as session:
            modules = session.execute(
                select(Module).where(Module.coupled.is_(True))
            ).scalars().all()

            for module in modules:
                is_online = is_module_online(module)
                was_offline = module.id in self._offline_modules

                if not is_online and not was_offline:
                    self._offline_modules.add(module.id)
                    plant = session.execute(
                        select(Plant).where(Plant.module_id == module.id)
                    ).scalars().first()
                    
                    if plant:
                        await ws_manager.emit_module_connection(module.id, False, plant.id)
                elif is_online and was_offline:
                    self._offline_modules.discard(module.id)


# Global heartbeat checker instance
module_heartbeat_checker = ModuleHeartbeatChecker()