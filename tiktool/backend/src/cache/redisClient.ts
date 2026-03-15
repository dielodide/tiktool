import Redis from 'ioredis';
import pino from 'pino';
import { config } from '../config';

const logger = pino({ name: 'redis-client' });

let redisClient: Redis | null = null;
const fallbackCache = new Map<string, { value: string; expiresAt: number }>();

function initRedis(): Redis | null {
  try {
    const client = new Redis(config.redisUrl, {
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => Math.min(times * 100, 3000),
      lazyConnect: true,
    });

    client.on('error', (err) => {
      logger.warn({ err: err.message }, 'Redis connection error, using fallback cache');
      redisClient = null;
    });

    client.on('connect', () => {
      logger.info('Redis connected successfully');
    });

    return client;
  } catch (err) {
    logger.warn('Failed to initialize Redis, using fallback in-memory cache');
    return null;
  }
}

async function connectRedis(): Promise<void> {
  redisClient = initRedis();
  if (redisClient) {
    try {
      await redisClient.connect();
    } catch (err) {
      logger.warn('Redis connect failed, using fallback cache');
      redisClient = null;
    }
  }
}

connectRedis().catch(() => {
  logger.warn('Redis initialization skipped');
});

export async function get(key: string): Promise<string | null> {
  if (redisClient) {
    try {
      return await redisClient.get(key);
    } catch (err) {
      logger.warn({ key }, 'Redis GET failed, checking fallback');
    }
  }

  const cached = fallbackCache.get(key);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.value;
  }
  fallbackCache.delete(key);
  return null;
}

export async function set(key: string, value: string, ttl: number): Promise<void> {
  if (redisClient) {
    try {
      await redisClient.setex(key, ttl, value);
      return;
    } catch (err) {
      logger.warn({ key }, 'Redis SET failed, using fallback');
    }
  }

  fallbackCache.set(key, {
    value,
    expiresAt: Date.now() + ttl * 1000,
  });
}

export async function del(key: string): Promise<void> {
  if (redisClient) {
    try {
      await redisClient.del(key);
    } catch (err) {
      logger.warn({ key }, 'Redis DEL failed');
    }
  }
  fallbackCache.delete(key);
}

export function isRedisConnected(): boolean {
  return redisClient !== null && redisClient.status === 'ready';
}
