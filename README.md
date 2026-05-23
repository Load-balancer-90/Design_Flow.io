# Design_Flow.io

Collaborative system-design canvas — multiplayer React Flow rooms with microservices, WebSockets, Redis, RabbitMQ, and Docker.

## Project structure

```
Design_Flow.io/
├── frontend/                 # React + Vite UI (coming soon)
├── backend/
│   ├── services/
│   │   ├── auth-service/
│   │   ├── room-service/
│   │   ├── realtime-service/
│   │   └── canvas-worker/
│   └── packages/
│       └── shared/
└── docker/                   # nginx, Traefik, Postgres config (coming soon)
    ├── nginx/
    ├── traefik/
    └── postgres/
```

## Stack (planned)

- **Frontend:** React, Vite, React Flow
- **Backend:** Node.js microservices
- **Infra:** Docker Compose, nginx, Traefik, Redis, RabbitMQ, Postgres
