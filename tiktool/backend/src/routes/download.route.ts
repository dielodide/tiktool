import { FastifyPluginAsync } from 'fastify';
import axios from 'axios';
import { resolveVideoUrl, resolveStoryUrl } from '../modules/tiktok/tiktokClient';
import { createError } from '../middlewares/errorHandler';
import { config } from '../config';

interface DownloadVideoParams {
  videoId: string;
}

interface DownloadStoryParams {
  storyId: string;
}

const downloadRoute: FastifyPluginAsync = async (fastify) => {
  fastify.get<{ Params: DownloadVideoParams }>(
    '/api/download/video/:videoId',
    {
      schema: {
        params: {
          type: 'object',
          properties: {
            videoId: { type: 'string' },
          },
          required: ['videoId'],
        },
      },
    },
    async (request, reply) => {
      const { videoId } = request.params;

      try {
        const videoUrl = await resolveVideoUrl(videoId);

        if (!videoUrl) {
          return reply.status(404).send(createError('not_found'));
        }

        const response = await axios.get(videoUrl, {
          responseType: 'stream',
          headers: {
            'User-Agent': config.tiktokUserAgent,
            Referer: 'https://www.tiktok.com/',
          },
        });

        reply.header('Content-Type', 'video/mp4');
        reply.header(
          'Content-Disposition',
          `attachment; filename="tiktok-${videoId}.mp4"`
        );

        if (response.headers['content-length']) {
          reply.header('Content-Length', response.headers['content-length']);
        }

        return reply.send(response.data);
      } catch (err) {
        const error = err as Error;
        fastify.log.error({ videoId, err: error.message }, 'Video download failed');
        return reply.status(500).send(createError('fetch_failed'));
      }
    }
  );

  fastify.get<{ Params: DownloadStoryParams }>(
    '/api/download/story/:storyId',
    {
      schema: {
        params: {
          type: 'object',
          properties: {
            storyId: { type: 'string' },
          },
          required: ['storyId'],
        },
      },
    },
    async (request, reply) => {
      const { storyId } = request.params;

      try {
        const { url, mediaType } = await resolveStoryUrl(storyId);

        if (!url) {
          return reply.status(404).send(createError('not_found'));
        }

        const response = await axios.get(url, {
          responseType: 'stream',
          headers: {
            'User-Agent': config.tiktokUserAgent,
            Referer: 'https://www.tiktok.com/',
          },
        });

        const isVideo = mediaType === 'video';
        const extension = isVideo ? 'mp4' : 'jpg';
        const contentType = isVideo ? 'video/mp4' : 'image/jpeg';

        reply.header('Content-Type', contentType);
        reply.header(
          'Content-Disposition',
          `attachment; filename="tiktok-story-${storyId}.${extension}"`
        );

        if (response.headers['content-length']) {
          reply.header('Content-Length', response.headers['content-length']);
        }

        return reply.send(response.data);
      } catch (err) {
        const error = err as Error;
        fastify.log.error({ storyId, err: error.message }, 'Story download failed');
        return reply.status(500).send(createError('fetch_failed'));
      }
    }
  );
};

export default downloadRoute;
