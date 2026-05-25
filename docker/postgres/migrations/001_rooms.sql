-- Migration: 001_rooms
-- Tables: rooms, room_members, canvas_snapshots

CREATE TABLE IF NOT EXISTS rooms (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code            VARCHAR(8) UNIQUE NOT NULL,
  name            VARCHAR(100),
  host_user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_rooms_host_user_id ON rooms(host_user_id);

CREATE TABLE IF NOT EXISTS room_members (
  room_id         UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role            VARCHAR(20) NOT NULL DEFAULT 'member',
  joined_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (room_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_room_members_user_id ON room_members(user_id);

CREATE TABLE IF NOT EXISTS canvas_snapshots (
  room_id         UUID PRIMARY KEY REFERENCES rooms(id) ON DELETE CASCADE,
  snapshot        JSONB NOT NULL DEFAULT '{"nodes":[],"edges":[]}',
  saved_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  saved_by        UUID NOT NULL REFERENCES users(id)
);

INSERT INTO schema_migrations (name) VALUES ('001_rooms')
ON CONFLICT (name) DO NOTHING;
