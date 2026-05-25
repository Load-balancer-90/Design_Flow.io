# Design_Flow.io

Collaborative system-design canvas — multiplayer React Flow rooms with microservices, WebSockets, Redis, RabbitMQ, and Docker.

## Progress

| Area | Status |
|------|--------|
| Monorepo layout (`frontend/`, `backend/`, `docker/`) | Done |
| Docker Compose — Postgres | Done |
| nginx + Traefik (API gateway) | Done |
| **`@design-flow/shared`** — JWT verify + auth middleware factory | Done |
| **auth-service** — signup, login, JWT, `/me` | Done |
| **room-service** — create, get, join, canvas snapshot | Done |
| realtime-service | Planned |
| canvas-worker + RabbitMQ | Planned |
| frontend (React + Vite + React Flow) | Planned |
| Redis, RabbitMQ | Planned |

## Project structure

```
Design_Flow.io/
├── frontend/                          # React + Vite + React Flow (planned)
├── backend/
│   ├── services/
│   │   ├── auth-service/              # ✅ REST auth
│   │   ├── room-service/              # ✅ REST rooms + canvas load
│   │   ├── realtime-service/          # planned — Socket.io live sync
│   │   └── canvas-worker/             # planned — async snapshot saves
│   └── packages/
│       └── shared/                    # ✅ JWT verify + createAuthMiddleware
├── docker/
│   ├── nginx/
│   ├── traefik/
│   └── postgres/
│       ├── init.sql
│       └── migrations/
├── docker-compose.yml
├── .env.docker.example
└── package.json                       # npm workspaces root
```

### auth-service layout

```
backend/services/auth-service/
├── index.js
├── config.js
├── db/
│   ├── db.js
│   └── queries.js
├── routes/auth.routes.js
├── controllers/auth.controller.js
├── utils/
│   ├── user.format.js       # toPublicUser
│   └── auth.token.js        # signToken
├── middleware/
│   ├── auth.middleware.js   # wraps @design-flow/shared
│   └── validate.js
└── validators/auth.schema.js
```

### room-service layout

```
backend/services/room-service/
├── index.js
├── config.js
├── db/
│   ├── db.js
│   └── queries.js
├── routes/room.routes.js
├── controllers/room.controller.js
├── utils/room.format.js     # toPublicRoom, toPublicMember, toPublicSnapshot, buildRoomResponse
├── middleware/
│   ├── auth.middleware.js
│   └── validate.js
└── validators/room.schema.js
```

## Stack

| Layer | Choice |
|-------|--------|
| Frontend (planned) | React, Vite, React Flow |
| Backend | Node.js (ESM), Express |
| Auth | JWT (Bearer), bcryptjs, Zod |
| Database | Postgres 16 |
| Infra | Docker Compose, nginx, Traefik |
| Infra (planned) | Redis, RabbitMQ |

## Architecture

**Current (REST):**

```text
Browser → nginx :8080 → Traefik → auth-service :9000
                                 → room-service :9001
                                          ↓
                                      Postgres
```

**Planned:**

```text
Browser → nginx → realtime ×2 ↔ Redis (WebSocket live sync)
realtime-service → RabbitMQ → canvas-worker → Postgres (batch snapshot save)
```

- Live canvas sync via Socket.io (realtime-service)
- Async saves via RabbitMQ + canvas-worker — no manual save REST route
- Single `snapshot` JSONB per room: `{ nodes, edges }`

## Gateway (nginx + Traefik)

Public API entry: **`http://localhost:8080`**

Auth and room services run on the **host** (`npm run dev:auth`, `npm run dev:room`). Traefik forwards to `host.docker.internal`.

Direct service URLs (debug): `http://localhost:9000/...`, `http://localhost:9001/...`

## Getting started

### Prerequisites

- Docker Desktop (running)
- Node.js 20+

### 1. Environment files

**Docker / Postgres** — copy root env for Compose:

```bash
cp .env.docker.example .env
# Fill in POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB
```

**auth-service:**

```bash
cp backend/services/auth-service/.env.example backend/services/auth-service/.env
```

**room-service:**

```bash
cp backend/services/room-service/.env.example backend/services/room-service/.env
```

Both services need a matching `DATABASE_URL` and the **same `JWT_SECRET`**.

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
npm run dev:auth    # port 9000
npm run dev:room    # port 9001
```

### 5. Health checks

```bash
curl http://localhost:8080/services/auth/health
curl http://localhost:8080/services/room/health
```

Expected: `"status":"ok"` and `"db":"connected"`.

## API

All paths below use gateway base `http://localhost:8080`. Protected routes require `Authorization: Bearer <token>`.

### Auth

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/services/auth/health` | — | Health + DB check |
| POST | `/services/auth/signup` | — | `{ username, password, displayName? }` |
| POST | `/services/auth/login` | — | `{ username, password }` |
| GET | `/services/auth/me` | Bearer | Current user |

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

### Room

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/services/room/health` | — | Health + DB check |
| POST | `/services/room/create` | Bearer | Create room — `{ name? }` |
| POST | `/services/room/join` | Bearer | Join by code — `{ code }` (8-char) |
| GET | `/services/room/:roomId` | Bearer | Room + members (members only) |
| GET | `/services/room/:roomId/canvas` | Bearer | Load canvas snapshot (members only) |

**Create / get / join response:**

```json
{
  "room": {
    "id": "uuid",
    "code": "ABCD1234",
    "name": "My canvas",
    "hostUserId": "uuid",
    "createdAt": "...",
    "updatedAt": "..."
  },
  "members": [
    {
      "userId": "uuid",
      "username": "alice",
      "displayName": "Alice",
      "role": "host",
      "joinedAt": "..."
    }
  ]
}
```

**Canvas response:**

```json
{
  "snapshot": { "nodes": [], "edges": [] },
  "savedAt": "...",
  "savedBy": "uuid"
}
```

### Example flow (curl)

```bash
# Signup
curl -s -X POST http://localhost:8080/services/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","password":"secret12","displayName":"Alice"}'

export TOKEN="<accessToken from response>"

# Create room
curl -s -X POST http://localhost:8080/services/room/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"My canvas"}'

export ROOM_ID="<room.id>"
export CODE="<room.code>"

# Join (as another user with their token)
curl -s -X POST http://localhost:8080/services/room/join \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"code\":\"$CODE\"}"

# Load canvas
curl -s "http://localhost:8080/services/room/$ROOM_ID/canvas" \
  -H "Authorization: Bearer $TOKEN"
```

## Database

Postgres runs in Docker (`design-flow-postgres`).

| Source | Tables |
|--------|--------|
| `docker/postgres/init.sql` | `users` |
| `docker/postgres/migrations/000_schema_migrations.sql` | `schema_migrations` |
| `docker/postgres/migrations/001_rooms.sql` | `rooms`, `room_members`, `canvas_snapshots` |

**Apply migrations on an existing database:**

```bash
docker exec -i design-flow-postgres psql -U design_flow -d design_flow \
  < docker/postgres/migrations/000_schema_migrations.sql

docker exec -i design-flow-postgres psql -U design_flow -d design_flow \
  < docker/postgres/migrations/001_rooms.sql
```

Fresh install (`docker compose down -v && docker compose up -d postgres`) runs init + migrations automatically.

**Inspect tables:**

```bash
docker exec -it design-flow-postgres psql -U design_flow -d design_flow -c "\dt"
docker exec -it design-flow-postgres psql -U design_flow -d design_flow -c "SELECT * FROM schema_migrations;"
```

## Pause / stop Docker

```bash
docker compose down          # stops containers, keeps data
docker compose up -d postgres traefik nginx   # resume later
```

## Next steps

1. **frontend** — login/signup UI, lobby (create/join), React Flow canvas loading snapshot
2. **realtime-service** — Socket.io live canvas sync, JWT on connect
3. **canvas-worker + RabbitMQ** — debounced batch saves to `canvas_snapshots`
4. **Redis** — pub/sub adapter when scaling realtime to 2+ instances
