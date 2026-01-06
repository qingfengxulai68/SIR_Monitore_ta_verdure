# Backend - Terrarium API

RESTful API and WebSocket manager for the terrarium monitoring system. Developed with **FastAPI** and **Python**.

## Technologies

- **Framework**: FastAPI
- **Server**: Uvicorn
- **Database**: SQLAlchemy (Compatible with SQLite, PostgreSQL, etc.)
- **Validation**: Pydantic
- **Authentication**: JWT (for frontend) & API Key (for ESP32)
- **Dependency Management**: uv
- **Formatting**: Ruff is configured to ensure consistent code style

## Structure

```
backend/
├── app/
│   ├── auth/           # Authentication (JWT, API Keys)
│   ├── models/         # Database models (SQLAlchemy)
│   ├── routers/        # API Routes (Endpoints)
│   ├── schemas/        # Validation schemas (Pydantic)
│   ├── tasks/          # Background tasks (Heartbeat, etc.)
│   ├── database.py     # Database configuration
│   ├── main.py         # Application entry point
│   └── websocket.py    # WebSocket manager
├── Dockerfile          # Docker configuration (based on uv)
├── pyproject.toml      # Project dependencies and configuration
└── ...
```

## Local Quickstart

1.  **Install dependencies**
    
    This project uses **uv** for dependency management.

    ```bash
    uv sync
    ```

2.  **Environment Configuration**
    Create a `.env` file at the root of the `backend` folder with the following values:

    | Variable | Description | Example (Local) |
    | :--- | :--- | :--- |
    | `DATABASE_URL` | DB connection URL | `sqlite:///./terrarium.db` |
    | `JWT_SECRET_KEY` | Secret key for JWT tokens | `a-very-secret-string` |
    | `API_KEY` | API Key for sensors (ESP32) | `your-secret-api-key` |
    | `ADMIN_USERNAME` | Initial admin username | `admin` |
    | `ADMIN_PASSWORD` | Initial admin password | `demo1234` |

3.  **Start Development Server**
    ```bash
    uv run fastapi dev app/main.py
    ```
    The API will be accessible at `http://localhost:8000`.
    Interactive documentation (Swagger UI) is available at `http://localhost:8000/docs`.

## Docker Deployment

The backend contains an optimized `Dockerfile` using `uv` for fast builds.

1.  **Build Image**
    ```bash
    docker build -t terrarium-backend .
    ```

2.  **Run Container**
    ```bash
    docker run -d -p 8000:80 \
      -e DATABASE_URL="sqlite:///./terrarium.db" \
      -e JWT_SECRET_KEY="your-secret" \
      -e API_KEY="your-key" \
      -e ADMIN_USERNAME="admin" \
      -e ADMIN_PASSWORD="secure-password" \
      -v $(pwd)/data:/app/data \
      terrarium-backend
    ```
