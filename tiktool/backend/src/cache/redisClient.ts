import Redis from 'ioredis';
import { config } from '../config/index.js';

let client: Redis | null = null;
const fallback = new Map<string, { value: string; exp: number }>();

function getClient(): Redis {
  if (!client || client.status === 'end') {
    client = new Redis(config.redisUrl, {
      lazyConnect: true,
      enableOfflineQueue: false,
      maxRetriesPerRequest: 1,
      connectTimeout: 3000,
    });
    client.on('error', (err) => {
      console.warn('[Redis] fallback in-memory actif:', err.message);
      client = null;
    });
  }
  return client;
}

export async function get(key: string): Promise<string | null> {
  try {
    return await getClient().get(key);
  } catch {
    const e = fallback.get(key);
    if (!e || Date.now() > e.exp) { fallback.delete(key); return null; }
    return e.value;
  }
}

export async function set(key: string, value: string, ttl: number): Promise<void> {
  try {
    await getClient().set(key, value, 'EX', ttl);
  } catch {
    fallback.set(key, { value, exp: Date.now() + ttl * 1000 });
  }
}

export async function del(key: string): Promise<void> {
  try { await getClient().del(key); }
  catch { fallback.delete(key); }
}
