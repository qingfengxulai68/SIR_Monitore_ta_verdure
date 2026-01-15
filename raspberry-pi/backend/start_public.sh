#!/bin/bash

# Check for Ngrok Authtoken
if [ -z "$NGROK_AUTHTOKEN" ]; then
    echo "Error: NGROK_AUTHTOKEN environment variable is required."
    exit 1
fi

# Start the public backend in the background
fastapi run public_main.py --port 8001 --host 0.0.0.0 &

# Configure and start ngrok in the foreground
ngrok config add-authtoken "$NGROK_AUTHTOKEN"
ngrok http 8001 --url https://default.internal --log stdout