import os
import httpx
from typing import Annotated
from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.responses import HTMLResponse
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.database import get_session
from app.models.settings import Settings

router = APIRouter(prefix="/alerts", tags=["Alerts"])

CLIENT_ID = os.getenv("DISCORD_CLIENT_ID")
CLIENT_SECRET = os.getenv("DISCORD_CLIENT_SECRET")
# Note: Ensure this URL is added to your Discord Application's Redirects
REDIRECT_URI = os.getenv("DISCORD_REDIRECT_URI")

@router.get("/callback")
async def callback(
    code: str,
    state: str | None = None,
    session: Annotated[Session, Depends(get_session)] = None,
):
    """
    OAuth2 Callback for Discord.
    Exchanges the authorization code for a webhook URL.
    """
    # Exchange the code for an Access Token and Webhook info
    data = {
        'client_id': CLIENT_ID,
        'client_secret': CLIENT_SECRET,
        'grant_type': 'authorization_code',
        'code': code,
        'redirect_uri': REDIRECT_URI
    }
    headers = {'Content-Type': 'application/x-www-form-urlencoded'}
    
    async with httpx.AsyncClient() as client:
        response = await client.post('https://discord.com/api/v10/oauth2/token', data=data, headers=headers)
    
    token_data = response.json()

    # Extract the Webhook URL
    webhook_info = token_data.get('webhook', {})
    webhook_url = webhook_info.get('url')

    if webhook_url:
        # Save to settings. 
        # Note: 'state' contains the user_id passed from the frontend.
        # Since we currently use a single global Settings row (id=1), we update that.
        if session:
            settings = session.execute(select(Settings)).scalars().first()
            if settings:
                settings.discord_webhook_url = webhook_url
                settings.alerts_discord_enabled = True
                session.add(settings)
                session.commit()
        print(f"Webhook URL: {webhook_url}")
        print(f"User Identifier: {state}")
        
        html_content = """
        <!DOCTYPE html>
        <html>
            <head>
                <title>Discord Connected</title>
                <style>
                    body {
                        font-family: system-ui, -apple-system, sans-serif;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        height: 100vh;
                        margin: 0;
                        background-color: #f9fafb;
                    }
                    .card {
                        background: white;
                        padding: 2rem;
                        border-radius: 0.5rem;
                        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                        text-align: center;
                    }
                    h1 { color: #10B981; margin-bottom: 1rem; }
                    p { color: #4B5563; margin-bottom: 0; }
                </style>
            </head>
            <body>
                <div class="card">
                    <h1>✅ Discord Connected!</h1>
                    <p>The webhook has been saved successfully.</p>
                    <p>You can close this window now.</p>
                </div>
                <script>
                    setTimeout(() => window.close(), 3000);
                </script>
            </body>
        </html>
        """
        return HTMLResponse(content=html_content, status_code=200)
    else:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Failed to create webhook.")