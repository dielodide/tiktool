import type { FastifyInstance } from 'fastify';
import axios from 'axios';
import { resolveVideoUrl } from '../modules/tiktok/tiktokClient.js';

export async function downloadRoutes(app: FastifyInstance): Promise<void> {
  // Download video par videoUrl encodée en base64 dans le param
  app.get<{ Params: { videoId: string } }>(
    '/api/download/video/:videoId',
    async (request, reply) => {
      try {
        // videoId peut être une URL base64 ou un ID
        let videoUrl = await resolveVideoUrl(request.params.videoId);

        // Fallback : si videoId ressemble à une URL base64
        if (!videoUrl) {
          try {
            videoUrl = Buffer.from(request.params.videoId, 'base64').toString('utf-8');
          } catch {
            return reply.status(404).send({ error: 'not_found', message: 'URL vidéo introuvable' });
          }
        }

        const response = await axios.get(videoUrl, {
          responseType: 'stream',
          headers: {
            'User-Agent': 'Mozilla/5.0',
            Referer: 'https://www.tiktok.com/',
          },
          timeout: 30000,
        });

        reply.header('Content-Disposition', `attachment; filename="tiktok-${request.params.videoId}.mp4"`);
        reply.header('Content-Type', 'video/mp4');
        return reply.send(response.data);
      } catch (err) {
        request.log.error(err);
        return reply.status(500).send({ error: 'fetch_failed', message: 'Erreur de téléchargement' });
      }
    }
  );

  // Download story
  app.get<{ Params: { storyId: string } }>(
    '/api/download/story/:storyId',
    async (request, reply) => {
      try {
        let mediaUrl: string;
        try {
          mediaUrl = Buffer.from(request.params.storyId, 'base64').toString('utf-8');
        } catch {
          return reply.status(400).send({ error: 'invalid_username', message: 'ID story invalide' });
        }

        const response = await axios.get(mediaUrl, {
          responseType: 'stream',
          headers: { 'User-Agent': 'Mozilla/5.0', Referer: 'https://www.tiktok.com/' },
          timeout: 30000,
        });

        const ext = mediaUrl.includes('.mp4') ? 'mp4' : 'mp4';
        reply.header('Content-Disposition', `attachment; filename="tiktok-story-${request.params.storyId}.${ext}"`);
        reply.header('Content-Type', 'video/mp4');
        return reply.send(response.data);
      } catch (err) {
        request.log.error(err);
        return reply.status(500).send({ error: 'fetch_failed', message: 'Erreur de téléchargement story' });
      }
    }
  );
}
