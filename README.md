# LibertyLoft Website

A React + Vite website for LibertyLoft, because apparently community spaces also need deployment pipelines.

## Project Description
What this repo does:

- `web` frontend: Vite + React + TypeScript + Tailwind
- Calendar events are fetched statically from a public Google Calendar ICS feed and parsed locally via a proxy.
- Docker support for running the frontend as a container.

## Local Run
Install deps:

```sh
npm install
```


Open:

- `http://localhost:8080/`

## Docker Run
Build and run the service:

```sh
docker compose up --build
```

Open:

- `http://localhost:8080/`

Services:
- `web` on port `8080`

## Production Docker Compose
The production compose file uses prebuilt images from Docker Hub:
- `smixers/libertyloft-frontend:latest` for `web`

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


