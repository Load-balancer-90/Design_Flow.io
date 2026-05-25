export function toPublicUser(row) {
  return {
    id: row.id,
    username: row.username,
    displayName: row.display_name ?? null,
    createdAt: row.created_at,
  };
}
