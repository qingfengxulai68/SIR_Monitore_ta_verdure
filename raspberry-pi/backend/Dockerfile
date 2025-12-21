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

# Run the application using the executable in the virtual environment
# --host 0.0.0.0 is mandatory to be reachable from outside the container
CMD ["/app/.venv/bin/fastapi", "run", "app/main.py", "--port", "80", "--host", "0.0.0.0"]