export const config = {
  port: Number(process.env.PORT) || 4000,
  redisUrl: process.env.REDIS_URL || 'redis://127.0.0.1:6379',
  frontendOrigin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173',
  httpProxy: process.env.HTTP_PROXY || undefined,
  cacheTtlProfile: Number(process.env.CACHE_TTL_PROFILE) || 300,
  cacheTtlVideos: Number(process.env.CACHE_TTL_VIDEOS) || 180,
  rateLimitRpm: Number(process.env.RATE_LIMIT_RPM) || 30,
  tiktokUserAgent:
    process.env.TIKTOK_USER_AGENT ||
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
    '(KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
};
