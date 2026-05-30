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
| **realtime-service** — JWT, join/leave room, presence events (1 instance) | Done |
| nginx → Socket.io proxy (`/socket.io/`) | Done |
| realtime ×2 + Redis adapter | Planned |
| canvas-worker + RabbitMQ | Planned |
| frontend (React + Vite + React Flow) | Planned |

## Project structure

```
Design_Flow.io/
├── frontend/                          # React + Vite + React Flow (planned)
├── backend/
│   ├── services/
│   │   ├── auth-service/              # ✅ REST auth
│   │   ├── room-service/              # ✅ REST rooms + canvas load
│   │   ├── realtime-service/          # ✅ Socket.io (join/leave; canvas sync later)
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

**Current:**

```text
Browser → nginx :8080 → Traefik → auth-service :9000
                      → Traefik → room-service :9001
                      → realtime-service :9002  (/socket.io/, /services/realtime/)
                                          ↓
                                      Postgres
```

**Planned:**

```text
realtime ×2 ↔ Redis (scale Socket.io)
realtime-service → RabbitMQ → canvas-worker → Postgres (batch snapshot save)
```

- Live canvas sync via Socket.io (realtime-service)
- Async saves via RabbitMQ + canvas-worker — no manual save REST route
- Single `snapshot` JSONB per room: `{ nodes, edges }`

## Gateway (nginx + Traefik)

Public API entry: **`http://localhost:8080`**

Auth, room, and realtime run on the **host** (`npm run dev:auth`, `npm run dev:room`, `npm run dev:realtime`). Traefik forwards REST; nginx proxies Socket.io to `:9002`.

Direct service URLs (debug): `http://localhost:9000/...`, `http://localhost:9001/...`, `http://localhost:9002/...`

Socket.io client URL: `http://localhost:8080` with `path: '/socket.io'`.

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

**realtime-service:**

```bash
cp backend/services/realtime-service/.env.example backend/services/realtime-service/.env
```

All three services need a matching `DATABASE_URL` and the **same `JWT_SECRET`**.

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
npm run dev:auth      # port 9000
npm run dev:room      # port 9001
npm run dev:realtime  # port 9002
```

Reload nginx after config changes: `docker compose up -d nginx` (or restart the nginx container).

### 5. Health checks

```bash
curl http://localhost:8080/services/auth/health
curl http://localhost:8080/services/room/health
curl http://localhost:8080/services/realtime/health
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

### Realtime (Socket.io)

Connect through the gateway (single instance, no Redis yet):

```js
import { io } from 'socket.io-client';

const socket = io('http://localhost:8080', {
  path: '/socket.io',
  auth: { token: accessToken },
});

socket.emit('join-room', { roomId }, (err, data) => {
  if (err) console.error(err);
});

socket.on('room:user-joined', (payload) => { /* ... */ });
socket.on('room:user-left', (payload) => { /* ... */ });
socket.on('room:joined', (payload) => { /* ... */ });
```

| Event | Direction | Payload |
|-------|-----------|---------|
| `join-room` | client → server | `{ roomId }` |
| `leave-room` | client → server | `{ roomId? }` |
| `room:joined` | server → client | `{ roomId }` |
| `room:user-joined` | server → others | `{ roomId, user }` |
| `room:user-left` | server → others | `{ roomId, user }` |
| `room:error` | server → client | `{ error }` |

User must already be a room member via REST (`POST /services/room/join`) before `join-room`.

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

1. **frontend** — login/signup UI, lobby (create/join), Socket.io join-room, React Flow canvas
2. **realtime** — canvas op events (node/edge sync)
3. **canvas-worker + RabbitMQ** — debounced batch saves to `canvas_snapshots`
4. **Redis + 2× realtime** — nginx upstream second server, Socket.io Redis adapter
