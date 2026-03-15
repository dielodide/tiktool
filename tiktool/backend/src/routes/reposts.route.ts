import type { FastifyInstance } from 'fastify';
import { getReposts } from '../modules/tiktok/tiktokClient.js';

const USERNAME_REGEX = /^[a-zA-Z0-9_.]{2,24}$/;

export async function repostsRoutes(app: FastifyInstance): Promise<void> {
  app.get<{
    Params: { username: string };
    Querystring: { cursor?: string };
  }>(
    '/api/profile/:username/reposts',
    async (request, reply) => {
      const { username } = request.params;
      if (!USERNAME_REGEX.test(username)) {
        return reply.status(400).send({ error: 'invalid_username', message: 'Username invalide' });
      }
      const cursor = request.query.cursor ?? '0';
      try {
        const result = await getReposts(username, cursor);
        return reply.send(result);
      } catch (err) {
        request.log.error(err);
        return reply.status(500).send({ error: 'fetch_failed', message: 'Impossible de récupérer les reposts' });
      }
    }
  );
}
