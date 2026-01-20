"""Settings router."""

import os
from fastapi.responses import HTMLResponse, RedirectResponse
import httpx
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth.jwt import verify_jwt_user
from app.database import get_session
from app.models.settings import Settings
from app.models.user import User
from app.schemas.settings import AlertsResponse, DiscordAlertsUpdateRequest, EmailAlertsUpdateRequest


router = APIRouter(prefix="/settings", tags=["Settings"])


@router.get("/alerts", response_model=AlertsResponse)
async def get_alerts(
    session: Annotated[Session, Depends(get_session)],
    _current_user: Annotated[User, Depends(verify_jwt_user)],
) -> AlertsResponse:
    """Get global alert settings."""
    settings = session.execute(select(Settings)).scalars().first()
    return AlertsResponse(
        discord_enabled=settings.alerts_discord_enabled,
        discord_webhook_url=settings.discord_webhook_url,
        email_enabled=settings.alerts_email_enabled,
        receiver_email=settings.receiver_email,
    )


@router.put("/alerts/discord", status_code=204)
async def update_discord_alerts(
    request: DiscordAlertsUpdateRequest,
    session: Annotated[Session, Depends(get_session)],
    _current_user: Annotated[User, Depends(verify_jwt_user)],
) -> None:
    """Update Discord alert settings."""
    settings = session.execute(select(Settings)).scalars().first()
    settings.alerts_discord_enabled = request.discord_enabled
    settings.discord_webhook_url = str(request.discord_webhook_url) if request.discord_webhook_url else None
    session.add(settings)
    session.commit()

@router.get("/alerts/discord/login")
def discord_login():
    """
    Redirect to Discord OAuth2 authorization.
    """
    auth_url = (
        f"https://discord.com/api/oauth2/authorize?"
        f"client_id={os.getenv("DISCORD_CLIENT_ID")}&"
        f"redirect_uri={os.getenv("DISCORD_REDIRECT_URI")}&"
        f"response_type=code&"
        f"scope=webhook.incoming"
    )
    return RedirectResponse(auth_url)

@router.get("/alerts/discord/callback")
async def discord_webhook_callback(
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
        'client_id': os.getenv("DISCORD_CLIENT_ID"),
        'client_secret': os.getenv("DISCORD_CLIENT_SECRET"),
        'grant_type': 'authorization_code',
        'code': code,
        'redirect_uri': os.getenv("DISCORD_REDIRECT_URI")

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
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Discord Connected</title>
                <style>
                    * {
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                    }
                    
                    body {
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        min-height: 100vh;
                        background-color: hsl(0 0% 100%);
                        color: hsl(222.2 84% 4.9%);
                    }
                    
                    @media (prefers-color-scheme: dark) {
                        body {
                            background-color: oklch(14.1% .005 285.823);
                            color: hsl(210 40% 98%);
                        }
                    }
                    
                    .card {
                        background: hsl(0 0% 100%);
                        border: 1px solid oklch(92% .004 286.32);
                        border-radius: 0.5rem;
                        padding: 2rem;
                        width: 90%;
                        max-width: 400px;
                        box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
                    }
                    
                    @media (prefers-color-scheme: dark) {
                        .card {
                            background: oklch(21% .006 285.885);
                            border-color: oklch(27.4% .006 286.033);
                        }
                    }
                    
                    .icon-container {
                        width: 48px;
                        height: 48px;
                        margin: 0 auto 1.5rem;
                        background-color: hsl(142.1 76.2% 36.3% / 0.1);
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    }
                    
                    @media (prefers-color-scheme: dark) {
                        .icon-container {
                            background-color: hsl(142.1 70% 50% / 0.15);
                        }
                    }
                    
                    .checkmark {
                        width: 24px;
                        height: 24px;
                        color: hsl(142.1 76.2% 36.3%);
                    }
                    
                    h1 {
                        font-size: 1.5rem;
                        font-weight: 600;
                        line-height: 1.2;
                        text-align: center;
                        margin-bottom: 0.5rem;
                        color: hsl(222.2 84% 4.9%);
                    }
                    
                    @media (prefers-color-scheme: dark) {
                        h1 {
                            color: hsl(210 40% 98%);
                        }
                    }
                    
                    .description {
                        text-align: center;
                        color: hsl(215.4 16.3% 46.9%);
                        font-size: 0.875rem;
                        line-height: 1.5;
                        margin-bottom: 1.5rem;
                    }
                    
                    @media (prefers-color-scheme: dark) {
                        .description {
                            color: hsl(215.4 16.3% 65%);
                        }
                    }
                    
                    .timer-text {
                        font-size: 0.875rem;
                        color: hsl(215.4 16.3% 46.9%);
                        text-align: center;
                    }
                    
                    @media (prefers-color-scheme: dark) {
                        .timer-text {
                            color: hsl(215.4 16.3% 65%);
                        }
                    }
                </style>
            </head>
            <body>
                <div class="card">
                    <div class="icon-container">
                        <svg class="checkmark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"></path>
                        </svg>
                    </div>
                    
                    <h1>Discord Connected!</h1>
                    <p class="description">The webhook has been saved successfully.</p>
                    
                    <p class="timer-text">This window will close in <span id="countdown">5</span> seconds.</p>
                </div>

                <script>
                    let timeLeft = 5;
                    const countdownEl = document.getElementById('countdown');
                    
                    const timer = setInterval(() => {
                        timeLeft--;
                        countdownEl.textContent = timeLeft;
                        
                        if (timeLeft <= 0) {
                            clearInterval(timer);
                            window.close();
                        }
                    }, 1000);
                </script>
            </body>
            </html>
        """
        return HTMLResponse(content=html_content, status_code=200)
    else:
        raise HTTPException(status_code=400, detail="Failed to create webhook.")

@router.put("/alerts/email", status_code=204)
async def update_email_alerts(
    request: EmailAlertsUpdateRequest,
    session: Annotated[Session, Depends(get_session)],
    _current_user: Annotated[User, Depends(verify_jwt_user)],
) -> None:
    """Update Email alert settings."""
    settings = session.execute(select(Settings)).scalars().first()
    settings.alerts_email_enabled = request.email_enabled
    settings.receiver_email = request.receiver_email
    session.add(settings)
    session.commit()
