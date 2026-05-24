# Design_Flow.io

Collaborative system-design canvas — multiplayer React Flow rooms with microservices, WebSockets, Redis, RabbitMQ, and Docker.

## Progress

| Area | Status |
|------|--------|
| Monorepo layout (`frontend/`, `backend/`, `docker/`) | Done |
| Docker Compose — Postgres | Done |
| **auth-service** — signup, login, JWT, `/me` | Done |
| **room-service** — health endpoint | Done |
| nginx + Traefik (API gateway) | Done |
| room-service — room routes | Planned |
| realtime-service | Planned |
| canvas-worker | Planned |
| frontend | Planned |
| nginx, Traefik, Redis, RabbitMQ | nginx + Traefik done; Redis, RabbitMQ planned |

## Project structure

```
Design_Flow.io/
├── frontend/                          # React + Vite + React Flow (planned)
├── backend/
│   ├── services/
│   │   ├── auth-service/              # ✅ implemented
│   │   ├── room-service/
│   │   ├── realtime-service/
│   │   └── canvas-worker/
│   └── packages/
│       └── shared/
├── docker/
│   ├── nginx/
│   ├── traefik/
│   └── postgres/
│       └── init.sql                   # users table (+ more tables later)
├── docker-compose.yml
├── .env.docker.example                # Postgres credentials for Docker Compose
└── package.json                       # npm workspaces root
```

### auth-service layout

```
backend/services/auth-service/
├── index.js                 # Express entry (cors, cookie-parser, routes)
├── config.js
├── db/
│   ├── db.js                # pg connection pool
│   └── queries.js           # user DB queries
├── routes/auth.routes.js
├── controllers/auth.controller.js
├── middleware/
│   ├── auth.middleware.js   # JWT Bearer verify
│   └── validate.js          # Zod request validation
└── validators/auth.schema.js
```

## Stack

| Layer | Choice |
|-------|--------|
| Frontend (planned) | React, Vite, React Flow |
| Backend | Node.js (ESM), Express |
| Auth | JWT (Bearer), bcryptjs, Zod |
| Database | Postgres 16 |
| Infra (planned) | Docker Compose, nginx, Traefik, Redis, RabbitMQ |

## Gateway (nginx + Traefik)

Public API entry: **`http://localhost:8080`**

```text
Browser → nginx :8080 → Traefik → auth-service :9000 / room-service :9001
```

Auth and room services run on the **host** (`npm run dev:auth`, `npm run dev:room`). Traefik forwards to `host.docker.internal`.

### Start gateway

```bash
docker compose up -d postgres traefik nginx
npm run dev:auth    # terminal 2 — port 9000
npm run dev:room    # terminal 3 — port 9001
```

### Test via gateway

```bash
curl http://localhost:8080/services/auth/health
curl http://localhost:8080/services/room/health
```

Direct service URLs (debug): `http://localhost:9000/...`, `http://localhost:9001/...`


### Prerequisites

- Docker Desktop (running)
- Node.js 20+

### 1. Environment files

**Docker / Postgres** — copy root env for Compose:

```bash
cp .env.docker.example .env
```

**auth-service** — copy service env:

```bash
cp backend/services/auth-service/.env.example backend/services/auth-service/.env
```

Ensure `DATABASE_URL` in auth `.env` matches your Postgres credentials.

### 2. Install dependencies

```bash
npm install
```

### 3. Start infrastructure

```bash
docker compose up -d postgres traefik nginx
```

### 4. Start services

```bash
npm run dev:auth
npm run dev:room
```

Use **`http://localhost:8080/services/...`** through the gateway (see [Gateway](#gateway-nginx--traefik)).

Default ports: auth `9000`, room `9001` (set in each service `.env`).

## Auth API

All paths below are relative to the gateway base `http://localhost:8080` (or direct service ports for local debug).

| Method | Path | Description |
|--------|------|-------------|
| GET | `/services/auth/health` | Auth service + DB health check |
| POST | `/services/auth/signup` | Register — `{ username, password, displayName? }` |
| POST | `/services/auth/login` | Login — `{ username, password }` |
| GET | `/services/auth/me` | Current user — `Authorization: Bearer <token>` |
| GET | `/services/room/health` | Room service + DB health check |

**Signup / login response:**

```json
{
  "accessToken": "eyJ...",
  "user": {
    "id": "uuid",
    "username": "alice",
    "displayName": "Alice",
    "createdAt": "..."
  }
}
```

## Database

Postgres runs in Docker (`design-flow-postgres`).

**Inspect tables (terminal):**

```bash
docker exec -it design-flow-postgres psql -U design_flow -d design_flow -c "\dt"
docker exec -it design-flow-postgres psql -U design_flow -d design_flow -c "SELECT id, username, display_name, created_at FROM users;"
```

**Current schema:** `users` (see `docker/postgres/init.sql`)

## Architecture (planned)

```
Browser → nginx → Traefik → auth / room (REST)
Browser → nginx → realtime ×2 ↔ Redis (WebSocket)
room-service → RabbitMQ → canvas-worker → Postgres
```

Live canvas sync via Socket.io; async saves via RabbitMQ. Single `snapshot` JSONB (`nodes`, `edges`) per room.

## Pause / stop Docker

```bash
docker compose down          # stops containers, keeps data
docker compose up -d postgres  # resume later
```

## Next steps

1. `backend/packages/shared` — shared JWT verify + event constants
2. Add remaining tables to `init.sql` (`rooms`, `room_members`, `canvas_snapshots`)
3. **room-service**
4. **frontend** — login / signup UI
5. **realtime-service** + Redis adapter
6. **canvas-worker** + RabbitMQ
7. nginx + Traefik in Docker Compose
