import axios, { AxiosInstance } from 'axios';
import { HttpsProxyAgent } from 'https-proxy-agent';
import pino from 'pino';
import { config } from '../../config';
import * as cache from '../../cache/redisClient';
import {
  TikTokProfile,
  TikTokVideoList,
  TikTokStoryList,
} from './tiktokTypes';
import {
  parseProfile,
  parseVideoList,
  parseRepostList,
  parseStoryList,
} from './tiktokParser';

const logger = pino({ name: 'tiktok-client' });

const profileCache = new Map<string, TikTokProfile>();

function createAxiosInstance(): AxiosInstance {
  const axiosConfig: Parameters<typeof axios.create>[0] = {
    timeout: 15000,
    headers: {
      'User-Agent': config.tiktokUserAgent,
      'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
      Accept:
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br',
      Connection: 'keep-alive',
      'Cache-Control': 'no-cache',
    },
  };

  if (config.httpProxy) {
    axiosConfig.httpsAgent = new HttpsProxyAgent(config.httpProxy);
  }

  return axios.create(axiosConfig);
}

const httpClient = createAxiosInstance();

export async function getProfile(username: string): Promise<TikTokProfile> {
  const cacheKey = `profile:${username}`;

  const cachedData = await cache.get(cacheKey);
  if (cachedData) {
    logger.info({ username }, 'Profile cache hit');
    const profile = JSON.parse(cachedData) as TikTokProfile;
    profileCache.set(username, profile);
    return profile;
  }

  logger.info({ username }, 'Fetching profile from TikTok');

  const url = `https://www.tiktok.com/@${username}`;

  try {
    const response = await httpClient.get<string>(url, {
      headers: {
        Referer: 'https://www.tiktok.com/',
      },
    });

    const profile = parseProfile(response.data);
    profileCache.set(username, profile);

    await cache.set(cacheKey, JSON.stringify(profile), config.cacheTtlProfile);

    return profile;
  } catch (err) {
    logger.error({ username, err }, 'Failed to fetch profile');
    throw err;
  }
}

export async function getVideos(
  username: string,
  cursor?: string,
  limit = 20
): Promise<TikTokVideoList> {
  const cacheKey = `videos:${username}:${cursor || '0'}`;

  const cachedData = await cache.get(cacheKey);
  if (cachedData) {
    logger.info({ username, cursor }, 'Videos cache hit');
    return JSON.parse(cachedData) as TikTokVideoList;
  }

  let profile = profileCache.get(username);
  if (!profile) {
    profile = await getProfile(username);
  }

  logger.info({ username, cursor, limit }, 'Fetching videos from TikTok API');

  const url = 'https://www.tiktok.com/api/post/item_list/';

  try {
    const response = await httpClient.get(url, {
      params: {
        secUid: profile.secUid,
        count: Math.min(limit, 30),
        cursor: cursor || '0',
        aid: 1988,
        app_language: 'fr',
        app_name: 'tiktok_web',
      },
      headers: {
        Referer: `https://www.tiktok.com/@${username}`,
      },
    });

    const videoList = parseVideoList(response.data);

    await cache.set(cacheKey, JSON.stringify(videoList), config.cacheTtlVideos);

    return videoList;
  } catch (err) {
    logger.error({ username, err }, 'Failed to fetch videos');
    throw err;
  }
}

export async function getReposts(
  username: string,
  cursor?: string
): Promise<TikTokVideoList> {
  const cacheKey = `reposts:${username}:${cursor || '0'}`;

  const cachedData = await cache.get(cacheKey);
  if (cachedData) {
    logger.info({ username, cursor }, 'Reposts cache hit');
    return JSON.parse(cachedData) as TikTokVideoList;
  }

  let profile = profileCache.get(username);
  if (!profile) {
    profile = await getProfile(username);
  }

  logger.info({ username, cursor }, 'Fetching reposts from TikTok API');

  const url = 'https://www.tiktok.com/api/user/repost/';

  try {
    const response = await httpClient.get(url, {
      params: {
        secUid: profile.secUid,
        count: 20,
        cursor: cursor || '0',
      },
      headers: {
        Referer: `https://www.tiktok.com/@${username}`,
      },
    });

    const repostList = parseRepostList(response.data);

    await cache.set(cacheKey, JSON.stringify(repostList), config.cacheTtlVideos);

    return repostList;
  } catch (err) {
    logger.error({ username, err }, 'Failed to fetch reposts');
    throw err;
  }
}

export async function getStories(username: string): Promise<TikTokStoryList> {
  const cacheKey = `stories:${username}`;

  const cachedData = await cache.get(cacheKey);
  if (cachedData) {
    logger.info({ username }, 'Stories cache hit');
    return JSON.parse(cachedData) as TikTokStoryList;
  }

  let profile = profileCache.get(username);
  if (!profile) {
    profile = await getProfile(username);
  }

  logger.info({ username }, 'Fetching stories from TikTok API');

  const url = 'https://www.tiktok.com/api/user/story/list/';

  try {
    const response = await httpClient.get(url, {
      params: {
        secUid: profile.secUid,
      },
      headers: {
        Referer: `https://www.tiktok.com/@${username}`,
      },
    });

    const storyList = parseStoryList(response.data);

    await cache.set(cacheKey, JSON.stringify(storyList), 60);

    return storyList;
  } catch (err) {
    logger.error({ username, err }, 'Failed to fetch stories');
    throw err;
  }
}

const videoUrlCache = new Map<string, string>();

export async function resolveVideoUrl(videoId: string): Promise<string> {
  const cached = videoUrlCache.get(videoId);
  if (cached) {
    return cached;
  }

  const cacheKey = `videourl:${videoId}`;
  const cachedData = await cache.get(cacheKey);
  if (cachedData) {
    videoUrlCache.set(videoId, cachedData);
    return cachedData;
  }

  logger.info({ videoId }, 'Resolving video URL');

  const url = `https://www.tiktok.com/api/item/detail/`;

  try {
    const response = await httpClient.get(url, {
      params: {
        itemId: videoId,
      },
      headers: {
        Referer: 'https://www.tiktok.com/',
      },
    });

    interface ItemDetailResponse {
      itemInfo?: {
        itemStruct?: {
          video?: {
            downloadAddr?: string;
            playAddr?: string;
          };
        };
      };
    }

    const data = response.data as ItemDetailResponse;
    const videoUrl =
      data.itemInfo?.itemStruct?.video?.downloadAddr ||
      data.itemInfo?.itemStruct?.video?.playAddr ||
      '';

    if (videoUrl) {
      videoUrlCache.set(videoId, videoUrl);
      await cache.set(cacheKey, videoUrl, 3600);
    }

    return videoUrl;
  } catch (err) {
    logger.error({ videoId, err }, 'Failed to resolve video URL');
    throw err;
  }
}

export async function resolveStoryUrl(storyId: string): Promise<{
  url: string;
  mediaType: 'video' | 'image';
}> {
  const cacheKey = `storyurl:${storyId}`;
  const cachedData = await cache.get(cacheKey);
  if (cachedData) {
    return JSON.parse(cachedData) as { url: string; mediaType: 'video' | 'image' };
  }

  logger.warn({ storyId }, 'Story URL resolution not fully implemented');

  return {
    url: '',
    mediaType: 'video',
  };
}
