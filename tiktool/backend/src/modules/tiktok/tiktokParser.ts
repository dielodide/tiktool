// tiktokParser.ts
// Ce fichier est conservé pour compatibilité mais le parsing
// se fait maintenant directement dans tiktokClient via Puppeteer DOM.
// Il peut être utilisé pour des parsings HTML fallback si besoin.

import type { TikTokProfile, TikTokVideoList, TikTokStoryList } from './tiktokTypes.js';

export function parseProfile(_html: string): TikTokProfile {
  throw new Error('parseProfile: utiliser tiktokClient.getProfile() via Puppeteer');
}

export function parseVideoList(_data: unknown): TikTokVideoList {
  throw new Error('parseVideoList: utiliser tiktokClient.getVideos() via Puppeteer');
}

export function parseStoryList(_data: unknown): TikTokStoryList {
  throw new Error('parseStoryList: utiliser tiktokClient.getStories() via Puppeteer');
}
