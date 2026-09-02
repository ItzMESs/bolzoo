import { Redis } from "@upstash/redis";

// Redis.fromEnv() reads UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN.
// These are set automatically when you connect the "Upstash for Redis"
// integration to your Vercel project (Storage tab -> Create Database).
// Built lazily (not at module load) so `next build` doesn't fail before
// those env vars exist.
let _redis;
function client() {
  if (!_redis) _redis = Redis.fromEnv();
  return _redis;
}

export async function getInvite(id) {
  const raw = await client().get(`invite:${id}`);
  if (!raw) return null;
  return typeof raw === "string" ? JSON.parse(raw) : raw;
}

export async function setInvite(id, invite) {
  await client().set(`invite:${id}`, JSON.stringify(invite));
}
