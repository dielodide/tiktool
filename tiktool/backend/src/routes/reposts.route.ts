import { FastifyPluginAsync } from 'fastify';
import { getReposts } from '../modules/tiktok/tiktokClient';
import { createError, validateUsername } from '../middlewares/errorHandler';

interface RepostsParams {
  username: string;
}

interface RepostsQuery {
  cursor?: string;
}

const repostsRoute: FastifyPluginAsync = async (fastify) => {
  fastify.get<{ Params: RepostsParams; Querystring: RepostsQuery }>(
    '/api/profile/:username/reposts',
    {
      schema: {
        params: {
          type: 'object',
          properties: {
            username: { type: 'string' },
          },
          required: ['username'],
        },
        querystring: {
          type: 'object',
          properties: {
            cursor: { type: 'string' },
          },
        },
      },
    },
    async (request, reply) => {
      const { username } = request.params;
      const { cursor } = request.query;

      if (!validateUsername(username)) {
        return reply.status(400).send(createError('invalid_username'));
      }

      try {
        const reposts = await getReposts(username, cursor);
        return reply.send(reposts);
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

export default repostsRoute;
