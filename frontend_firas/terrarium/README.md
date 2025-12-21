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

## Docker deployment

This repository includes a multi-stage `Dockerfile` that builds the app and serves the static assets with Nginx.

- Build the image:

```bash
docker build -t terrarium:latest .
```

- Run the container (serve on port 80):

```bash
docker run --rm -p 80:80 terrarium:latest
```

- Example `docker-compose.yml`:

```yaml
version: '3.8'
services:
	terrarium:
		build: .
		ports:
			- '80:80'
		restart: unless-stopped
```

Start with:

```bash
docker compose up --build -d
```

Notes:
- The image is multi-stage: the first stage runs `npm run build` and the second stage serves `build/client` with Nginx.
- Adjust `nginx.conf` or ports as needed for your environment or reverse-proxy setup.

