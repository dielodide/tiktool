import { FastifyPluginAsync } from 'fastify';
import { getStories } from '../modules/tiktok/tiktokClient';
import { createError, validateUsername } from '../middlewares/errorHandler';

interface StoriesParams {
  username: string;
}

const storiesRoute: FastifyPluginAsync = async (fastify) => {
  fastify.get<{ Params: StoriesParams }>(
    '/api/profile/:username/stories',
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
        const stories = await getStories(username);
        return reply.send(stories);
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

export default storiesRoute;
