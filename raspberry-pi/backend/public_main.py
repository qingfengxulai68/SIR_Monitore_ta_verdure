"""
Public Backend Entry Point.
Run this on a separate port (e.g., 8001) and expose it via ngrok.
"""
from dotenv import load_dotenv

# Load environment variables (DB URL, Discord Secrets)
load_dotenv()

from fastapi import FastAPI
from fastapi.responses import RedirectResponse
import os
from app.routers.alert import router as alert_router

app = FastAPI(title="Terrarium Public Webhook")

# Include ONLY the alert router
# This exposes /alerts/callback
app.include_router(alert_router)

CLIENT_ID = os.getenv("DISCORD_CLIENT_ID")
REDIRECT_URI = os.getenv("DISCORD_REDIRECT_URI")

@app.get("/auth/discord/login")
def discord_login():
    """
    Redirect to Discord OAuth2 authorization.
    """
    auth_url = (
        f"https://discord.com/api/oauth2/authorize?"
        f"client_id={CLIENT_ID}&"
        f"redirect_uri={REDIRECT_URI}&"
        f"response_type=code&"
        f"scope=webhook.incoming"
    )
    return RedirectResponse(auth_url)

@app.get("/")
def health_check():
    return {"status": "online", "service": "public-webhook"}
