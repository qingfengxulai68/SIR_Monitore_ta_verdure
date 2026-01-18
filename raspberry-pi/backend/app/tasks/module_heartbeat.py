"""Module heartbeat checker background task."""

import asyncio
import logging
from datetime import datetime
from sqlalchemy import select
from sqlalchemy.orm import sessionmaker

from app.common.constants import MODULE_HB_CHECK_INTERVAL
from app.database import engine
from app.models.module import Module
from app.models.plant import Plant
from app.models.settings import Settings
from app.common.utils import is_module_online
from app.websocket import ws_manager
from app.common.discord_utils import send_discord_message
from app.common.email_utils import send_email
from dotenv import load_dotenv
import os

load_dotenv()

logger = logging.getLogger(__name__)


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
            await self._initialize_offline_modules()
            self._task = asyncio.create_task(self._run())
            logger.info("Module heartbeat checker started")

    async def _initialize_offline_modules(self) -> None:
        """Initialize the offline modules set by checking current module states."""
        session = self._session_factory()
        try:
            modules = session.execute(
                select(Module).where(Module.coupled.is_(True))
            ).scalars().all()

            for module in modules:
                if not is_module_online(module):
                    self._offline_modules.add(module.id)
                    logger.info(f"Module #{module.id} is offline at startup")
        finally:
            session.close()

    async def stop(self) -> None:
        """Stop the heartbeat checker."""
        self._running = False
        if self._task:
            self._task.cancel()
            try:
                await self._task
            except asyncio.CancelledError:
                pass
            logger.info("Module heartbeat checker stopped")

    def mark_module_online(self, module_id: str) -> None:
        """Mark a module as online. Called when receiving data from a module."""
        if module_id in self._offline_modules:
            self._offline_modules.remove(module_id)
            logger.info(f"Module #{module_id} is back online")

    async def _run(self) -> None:
        """Main loop for heartbeat checking."""
        interval = MODULE_HB_CHECK_INTERVAL
        while self._running:
            try:
                await self._check_heartbeats()
            except Exception as e:
                logger.error(f"Error in heartbeat checker: {e}", exc_info=True)
            await asyncio.sleep(interval)

    async def _check_heartbeats(self) -> None:
        """Check all modules for heartbeat timeout."""
        session = self._session_factory()
        try:
            modules = session.execute(
                select(Module)
            ).scalars().all()

            # Get settings for alerts
            settings = session.execute(select(Settings)).scalars().first()

            for module in modules:
                # Extract module info for easier access
                module_id = module.id
                module_last_seen = module.last_seen
                is_module_coupled = module.coupled
                is_online = is_module_online(module)
                was_offline = module_id in self._offline_modules

                if not is_online and not was_offline:
                    # Module vient de passer offline
                    logger.warning(f"Module #{module_id} is offline.")
                    self._offline_modules.add(module_id)
                    
                    # Prepare last seen string
                    last_seen_str = module_last_seen.strftime('%m/%d/%Y %H:%M:%S') if module_last_seen else 'Unknown'
                    
                    # Get the coupled plant name
                    plant = session.execute(
                        select(Plant).where(Plant.module_id == module_id)
                    ).scalars().first()
                    plant_name = plant.name if plant else "Unknown Plant"
                    
                    # Send alerts if coupled
                    if is_module_coupled:
                        # Discord alert
                        if settings and settings.alerts_discord_enabled and settings.discord_webhook_url:
                            discord_msg = f"🔴 **{plant_name} - Offline module**\n"
                            discord_msg += f"Last seen: {last_seen_str}\n"
                            discord_msg += f"\nThe module #{module_id} is no longer responding."
                            
                            send_discord_message(settings.discord_webhook_url, discord_msg)
                        
                        # Email alert
                        if settings and settings.alerts_email_enabled and settings.receiver_email:
                            email_body = f"{plant_name} - Offline module\n"
                            email_body += f"Last seen: {last_seen_str}\n\n"
                            email_body += f"⚠️ The module #{module_id} is no longer responding and has gone offline."
                            
                            send_email(
                                    sender_email=os.getenv("EMAIL"),
                                    sender_password=os.getenv("EMAIL_PASSWORD"),
                                    receiver_email=settings.receiver_email,
                                    subject=f"🔴 {plant_name} - Offline module",
                                    body=email_body
                                )
                    
                    # WebSocket notification
                    await ws_manager.emit_module_connectivity(module_id, False, module_last_seen)

        finally:
            session.close()


# Global heartbeat checker instance
module_heartbeat_checker = ModuleHeartbeatChecker()