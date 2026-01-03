# Terrarium — Frontend

Lightweight Vite + React frontend for the SIR “Monitore ta verdure” terrarium monitoring UI.

## Quick Start

- Prerequisites: Node.js 18+ and npm (or pnpm/yarn)
- Install dependencies:

```bash
npm install
```

- Start development server:

```bash
npm run dev
```

- Build for production:

```bash
npm run build
```

- Preview production build:

```bash
npm run start
```

- Type check:

```bash
npm run typecheck
```

## Structure (important paths)

- `app/` — source routes, components and UI primitives
- `build/` — generated output after build
- `public/` — static assets
- `package.json` — scripts and deps

## Notes

- Uses `react-router` tooling and Vite for dev/preview. Keep Node and deps up to date.
- For CI: run `npm ci`, `npm run typecheck`, then `npm run build`.

If you want, I can add usage examples, screenshots, or CI config next.

## Environment variables

- **VITE_API_BASE_URL**: The frontend reads the API base URL from the Vite env var `VITE_API_BASE_URL`. For local development, create a `.env` file in the project root with:

```text
VITE_API_BASE_URL="http://localhost:8000"
```

During a production Docker build you can override the value using a build-arg. Example:

```bash
docker build --build-arg VITE_API_BASE_URL="https://api.example.com" -t terrarium-front .
```

### Threshold env vars (client-exposed)

The frontend uses the following Vite env variables to set hard limits for sensor thresholds. These are embedded at build time like `VITE_API_BASE_URL`.

| Variable | Description |
|---|---|
| `VITE_SOIL_MOIST_MIN` | Minimum allowed soil moisture (%) |
| `VITE_SOIL_MOIST_MAX` | Maximum allowed soil moisture (%) |
| `VITE_HUMIDITY_MIN` | Minimum allowed humidity (%) |
| `VITE_HUMIDITY_MAX` | Maximum allowed humidity (%) |
| `VITE_LIGHT_MIN` | Minimum allowed light (lux) |
| `VITE_LIGHT_MAX` | Maximum allowed light (lux) |
| `VITE_TEMP_MIN` | Minimum allowed temperature (°C) |
| `VITE_TEMP_MAX` | Maximum allowed temperature (°C) |

The Dockerfile sets the build ARG and `ENV` so Vite can embed the value at build time.

## Docker deployment

This repository includes a multi-stage `Dockerfile` that builds the app and serves the static assets with Nginx.

- To build the image (you should provide `VITE_API_BASE_URL` at build time if you want to set the API base URL embedded in the static build):

```bash
docker build --build-arg VITE_API_BASE_URL="https://api.example.com" -t terrarium-front .
```

- Run the container (serve on port 5000):

```bash
docker run -p 5000:80 terrarium-front
```

Notes:
- The image is multi-stage: the first stage runs `npm run build` and the second stage serves `build/client` with Nginx.
- `VITE_API_BASE_URL` is read at *build time* by Vite and embedded into the generated static files. If you don't pass `--build-arg`, no API URL will be injected into the build and the app will use whatever runtime / dev `.env` provides.
- Adjust `nginx.conf` or ports as needed for your environment or reverse-proxy setup.

