import { FastifyPluginAsync } from 'fastify';
import { getProfile } from '../modules/tiktok/tiktokClient';
import { createError, validateUsername } from '../middlewares/errorHandler';

interface ProfileParams {
  username: string;
}

const profileRoute: FastifyPluginAsync = async (fastify) => {
  fastify.get<{ Params: ProfileParams }>(
    '/api/profile/:username',
    {
      schema: {
        params: {
          type: 'object',
          properties: {
            username: { type: 'string' },
          },
          required: ['username'],
        },
      },
    },
    async (request, reply) => {
      const { username } = request.params;

      if (!validateUsername(username)) {
        return reply.status(400).send(createError('invalid_username'));
      }

      try {
        const profile = await getProfile(username);
        return reply.send(profile);
      } catch (err) {
        const error = err as Error & { response?: { status?: number } };

        if (error.response?.status === 404) {
          return reply.status(404).send(createError('not_found'));
        }

        throw err;
      }
    }
  );
};

export default profileRoute;
