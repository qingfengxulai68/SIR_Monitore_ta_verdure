"""
Public Backend Entry Point.
Run this on a separate port (e.g., 8001) and expose it via ngrok.
"""
from dotenv import load_dotenv

# Load environment variables (DB URL, Discord Secrets)
load_dotenv()

from fastapi import FastAPI
from app.routers.alert import router as alert_router

app = FastAPI(title="Terrarium Public Webhook")

# Include ONLY the alert router
# This exposes /alerts/callback
app.include_router(alert_router)

@app.get("/")
def health_check():
    return {"status": "online", "service": "public-webhook"}
