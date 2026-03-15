import Fastify from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import { config } from './config/index.js';
import { profileRoutes } from './routes/profile.route.js';
import { videosRoutes } from './routes/videos.route.js';
import { repostsRoutes } from './routes/reposts.route.js';
import { storiesRoutes } from './routes/stories.route.js';
import { downloadRoutes } from './routes/download.route.js';

const app = Fastify({ logger: true });

await app.register(cors, { origin: config.frontendOrigin });
await app.register(rateLimit, {
  max: config.rateLimitRpm,
  timeWindow: '1 minute',
});

await app.register(profileRoutes);
await app.register(videosRoutes);
await app.register(repostsRoutes);
await app.register(storiesRoutes);
await app.register(downloadRoutes);

app.get('/health', async () => ({ status: 'ok' }));

try {
  await app.listen({ port: config.port, host: '0.0.0.0' });
  app.log.info(`TikTool backend sur http://0.0.0.0:${config.port}`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
