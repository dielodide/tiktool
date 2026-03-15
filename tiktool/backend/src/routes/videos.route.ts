import { FastifyPluginAsync } from 'fastify';
import { getVideos } from '../modules/tiktok/tiktokClient';
import { createError, validateUsername } from '../middlewares/errorHandler';

interface VideosParams {
  username: string;
}

interface VideosQuery {
  cursor?: string;
  limit?: number;
}

const videosRoute: FastifyPluginAsync = async (fastify) => {
  fastify.get<{ Params: VideosParams; Querystring: VideosQuery }>(
    '/api/profile/:username/videos',
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
            limit: { type: 'number', maximum: 30 },
          },
        },
      },
    },
    async (request, reply) => {
      const { username } = request.params;
      const { cursor, limit } = request.query;

      if (!validateUsername(username)) {
        return reply.status(400).send(createError('invalid_username'));
      }

      try {
        const videos = await getVideos(
          username,
          cursor,
          limit ? Math.min(limit, 30) : 20
        );
        return reply.send(videos);
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

export default videosRoute;
