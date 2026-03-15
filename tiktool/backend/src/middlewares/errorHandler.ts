import { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import pino from 'pino';
import { TikTokError, TikTokErrorCode } from '../modules/tiktok/tiktokTypes';

const logger = pino({ name: 'error-handler' });

const errorMessages: Record<TikTokErrorCode, string> = {
  not_found: 'Profil introuvable ou inexistant.',
  profile_private: 'Ce profil est privé.',
  rate_limited: 'Trop de requêtes. Réessayez dans quelques secondes.',
  fetch_failed: 'Erreur lors de la récupération des données.',
  invalid_username: 'Nom d\'utilisateur invalide.',
};

export function createError(code: TikTokErrorCode): TikTokError {
  return {
    error: code,
    message: errorMessages[code],
  };
}

export function errorHandler(
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply
): void {
  logger.error({ err: error, url: request.url }, 'Request error');

  if (error.statusCode === 429) {
    reply.status(429).send(createError('rate_limited'));
    return;
  }

  if (error.statusCode === 404) {
    reply.status(404).send(createError('not_found'));
    return;
  }

  if (error.message?.includes('ECONNREFUSED') || error.message?.includes('timeout')) {
    reply.status(503).send(createError('fetch_failed'));
    return;
  }

  const axiosError = error as FastifyError & {
    response?: { status?: number };
    isAxiosError?: boolean;
  };

  if (axiosError.isAxiosError) {
    const status = axiosError.response?.status;

    if (status === 404) {
      reply.status(404).send(createError('not_found'));
      return;
    }

    if (status === 403) {
      reply.status(403).send(createError('profile_private'));
      return;
    }

    if (status === 429) {
      reply.status(429).send(createError('rate_limited'));
      return;
    }

    reply.status(502).send(createError('fetch_failed'));
    return;
  }

  reply.status(500).send({
    error: 'internal_error',
    message: 'Une erreur interne est survenue.',
  });
}

export function validateUsername(username: string): boolean {
  const usernameRegex = /^[a-zA-Z0-9_.]{2,24}$/;
  return usernameRegex.test(username);
}
