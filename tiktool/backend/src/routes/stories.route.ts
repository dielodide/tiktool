import type { FastifyInstance } from 'fastify';
import { getStories } from '../modules/tiktok/tiktokClient.js';

const USERNAME_REGEX = /^[a-zA-Z0-9_.]{2,24}$/;

export async function storiesRoutes(app: FastifyInstance): Promise<void> {
  app.get<{ Params: { username: string } }>(
    '/api/profile/:username/stories',
    async (request, reply) => {
      const { username } = request.params;
      if (!USERNAME_REGEX.test(username)) {
        return reply.status(400).send({ error: 'invalid_username', message: 'Username invalide' });
      }
      try {
        const result = await getStories(username);
        return reply.send(result);
      } catch (err) {
        request.log.error(err);
        return reply.status(500).send({ error: 'fetch_failed', message: 'Impossible de récupérer les stories' });
      }
    }
  );
}
