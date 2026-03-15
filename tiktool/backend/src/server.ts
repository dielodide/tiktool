import Fastify from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import { config } from './config';
import { errorHandler } from './middlewares/errorHandler';
import profileRoute from './routes/profile.route';
import videosRoute from './routes/videos.route';
import repostsRoute from './routes/reposts.route';
import storiesRoute from './routes/stories.route';
import downloadRoute from './routes/download.route';

const fastify = Fastify({
  logger: {
    level: 'info',
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
      },
    },
  },
});

async function buildServer() {
  await fastify.register(cors, {
    origin: true,
    methods: ['GET', 'OPTIONS'],
    credentials: true,
  });

  await fastify.register(rateLimit, {
    max: config.rateLimitRpm,
    timeWindow: '1 minute',
    errorResponseBuilder: () => ({
      error: 'rate_limited',
      message: 'Trop de requêtes. Réessayez dans quelques secondes.',
    }),
  });

  fastify.setErrorHandler(errorHandler);

  await fastify.register(profileRoute);
  await fastify.register(videosRoute);
  await fastify.register(repostsRoute);
  await fastify.register(storiesRoute);
  await fastify.register(downloadRoute);

  fastify.get('/api/health', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  });

  return fastify;
}

async function start() {
  try {
    const server = await buildServer();

    await server.listen({
      port: config.port,
      host: '0.0.0.0',
    });

    server.log.info(`TikTool Backend running on http://0.0.0.0:${config.port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

start();
