import type { FastifyInstance } from 'fastify';
import { getProfile } from '../modules/tiktok/tiktokClient.js';

const USERNAME_REGEX = /^[a-zA-Z0-9_.]{2,24}$/;

export async function profileRoutes(app: FastifyInstance): Promise<void> {
  app.get<{ Params: { username: string } }>(
    '/api/profile/:username',
    async (request, reply) => {
      const { username } = request.params;
      if (!USERNAME_REGEX.test(username)) {
        return reply.status(400).send({ error: 'invalid_username', message: 'Username invalide' });
      }
      try {
        const profile = await getProfile(username);
        return reply.send(profile);
      } catch (err: unknown) {
        request.log.error(err);
        return reply.status(500).send({ error: 'fetch_failed', message: 'Impossible de récupérer le profil' });
      }
    }
  );
}
