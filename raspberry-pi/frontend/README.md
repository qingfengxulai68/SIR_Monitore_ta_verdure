# Frontend - Terrarium Dashboard

Web application for monitoring and controlling the terrarium management system. Developed with **React Router 7**, **React 19**, and **Vite**.

## Technologies

- **Framework**: React Router 7 (SPA Mode)
- **UI**: TailwindCSS, Radix UI (via Shadcn/ui), Lucide React
- **State Management & Data**: Tanstack Query, Zustand
- **Forms**: React Hook Form, Zod
- **Charts**: Recharts
- **Communication**: WebSocket (react-use-websocket)
- **Formatting**: Prettier is configured to ensure consistent code style

## Structure

```
frontend/
├── app/
│   ├── components/     # Reusable UI components
│   ├── hooks/          # Custom hooks (auth, websocket, etc.)
│   ├── lib/            # Types, utilities, and API client
│   ├── routes/         # Route definitions (pages)
│   ├── root.tsx        # Root layout
│   └── ...
├── public/             # Static assets
└── ...
```

## Local Quickstart

1.  **Install dependencies**
    ```bash
    npm install
    ```

2.  **Environment Configuration**
    Create a `.env` file at the root of the `frontend` folder with the following values:

    | Variable | Description | Example (Local) |
    | :--- | :--- | :--- |
    | `VITE_BACKEND_BASE_URL` | Backend base URL (HTTP for API, auto-converted to WS for WebSocket) | `http://localhost:8000` |

3.  **Start Development Server**
    ```bash
    npm run dev
    ```
    The application will be accessible at `http://localhost:5173`.

## Docker Deployment

The frontend contains a `Dockerfile` optimized for production using Nginx.

1.  **Build Image**
    ```bash
    docker build \
      --build-arg API_BASE_URL=http://your-api-url:8000 \
      --build-arg WS_BASE_URL=ws://your-api-url:8000/ws \
      -t terrarium-frontend .
    ```

2.  **Run Container**
    ```bash
    docker run -d -p 80:80 terrarium-frontend
    ```
