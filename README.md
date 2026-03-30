# LibertyLoft Website

A React + Vite website for LibertyLoft, because apparently community spaces also need deployment pipelines.

## Project Description
What this repo does:

- `web` frontend: Vite + React + TypeScript + Tailwind
- `calendar-backend`: lightweight Node server that prefetches Google Calendar ICS into memory every 10 seconds
- frontend reads events from `/api/calendar` (not directly from external proxy endpoints)
- Docker support for running both services together

## Local Run
Install deps:

```sh
npm install
```

Run backend cache server (`3001`):

```sh
npm run backend
```

Run frontend (`8080`):

```sh
npm run dev
```

Or run both at once:

```sh
npm run dev:full
```

Open:

- `http://localhost:8080/`

## Docker Run
Build and run both services:

```sh
docker compose up --build
```

Open:

- `http://localhost:8080/`

Services:

- `web` on port `8080`
- `calendar-backend` on port `3001`

## Production Docker Compose
The production compose file uses prebuilt images from Docker Hub:

- `smixers/libertyloft-frontend:latest` for `web`
- `smixers/libertyloft-backend:latest` for `calendar-backend`

Deploy/refresh:

```sh
docker compose pull
docker compose up -d
```

Useful overrides:

```sh
WEB_BIND_ADDRESS=0.0.0.0 WEB_PORT=8080 docker compose up -d
```

Cloudflare tunnel service:

```sh
CLOUDFLARE_TUNNEL_TOKEN=your_token docker compose up -d
```

Automatic image updates with Watchtower:

```sh
docker compose up -d
```

Adjust polling interval (seconds):

```sh
WATCHTOWER_POLL_INTERVAL=300 docker compose up -d
```

## Backend Environment Variables
- `CALENDAR_BACKEND_PORT` default: `3001`
- `CALENDAR_PREFETCH_INTERVAL_MS` default: `10000`
- `CALENDAR_MAX_EVENTS` default: `6`
- `CALENDAR_ICS_URL` default: public LibertyLoft ICS URL
- `CALENDAR_BACKEND_URL` default: `http://localhost:3001`

## API Endpoints
- `GET /api/calendar`
- `GET /api/calendar/health`
