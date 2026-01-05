# Use a slim Python image for a smaller footprint
FROM python:3.14-slim

# Install uv by copying the binaries from the official image
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

# Set the working directory inside the container
WORKDIR /app

# 1. Copy only dependency files first to leverage Docker layer caching
# This layer will only be rebuilt if pyproject.toml or uv.lock changes
COPY pyproject.toml uv.lock ./

# 2. Install dependencies without the project itself
# --frozen: ensures uv.lock isn't updated
# --no-cache: reduces image size by not storing build artifacts
RUN uv sync --frozen --no-cache

# 3. Copy the rest of the application code
# Since dependencies are already installed, this layer builds instantly
COPY . .

# Environment variables with defaults (override with --env-file or -e flags)
ENV APP_NAME="Terrarium API" \
    DATABASE_URL="sqlite:///./terrarium.db" \
    DEBUG="False" \
    JWT_SECRET_KEY="change-this-secret-key-in-production" \
    JWT_ALGORITHM="HS256" \
    JWT_EXPIRATION_HOURS="24" \
    API_KEY="change-this-api-key-in-production" \
    ADMIN_USERNAME="admin" \
    ADMIN_PASSWORD="change-this-password-in-production" \
    HEARTBEAT_TIMEOUT_SECONDS="120" \
    HEARTBEAT_CHECK_INTERVAL_SECONDS="60" \
    SOIL_MOIST_MIN="0" \
    SOIL_MOIST_MAX="100" \
    HUMIDITY_MIN="0" \
    HUMIDITY_MAX="100" \
    LIGHT_MIN="0" \
    LIGHT_MAX="50000" \
    TEMP_MIN="0" \
    TEMP_MAX="50"

# Expose port 80 for the API
EXPOSE 80

# Run the application using the executable in the virtual environment
# --host 0.0.0.0 is mandatory to be reachable from outside the container
CMD ["/app/.venv/bin/fastapi", "run", "app/main.py", "--port", "80", "--host", "0.0.0.0"]