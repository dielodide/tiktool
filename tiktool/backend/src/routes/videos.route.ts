import type { FastifyInstance } from 'fastify';
import { getVideos } from '../modules/tiktok/tiktokClient.js';

const USERNAME_REGEX = /^[a-zA-Z0-9_.]{2,24}$/;

export async function videosRoutes(app: FastifyInstance): Promise<void> {
  app.get<{
    Params: { username: string };
    Querystring: { cursor?: string; limit?: string };
  }>(
    '/api/profile/:username/videos',
    async (request, reply) => {
      const { username } = request.params;
      if (!USERNAME_REGEX.test(username)) {
        return reply.status(400).send({ error: 'invalid_username', message: 'Username invalide' });
      }
      const cursor = request.query.cursor ?? '0';
      const limit = Math.min(parseInt(request.query.limit ?? '20', 10), 30);
      try {
        const result = await getVideos(username, cursor, limit);
        return reply.send(result);
      } catch (err) {
        request.log.error(err);
        return reply.status(500).send({ error: 'fetch_failed', message: 'Impossible de récupérer les vidéos' });
      }
    }
  );
}
