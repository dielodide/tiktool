import puppeteer, { Browser, Page } from 'puppeteer';
import { get as cacheGet, set as cacheSet } from '../../cache/redisClient.js';
import { config } from '../../config/index.js';
import type {
  TikTokProfile,
  TikTokVideo,
  TikTokVideoList,
  TikTokStoryList,
} from './tiktokTypes.js';

const BASE_URL = 'https://tokviewer.net/fr';
const STORY_URL = 'https://tokviewer.net/fr/tiktok-story-viewer';
const REPOST_URL = 'https://tokviewer.net/fr/tiktok-repost-viewer';

// ── Puppeteer singleton ────────────────────────────────────────────────────
let browser: Browser | null = null;

async function getBrowser(): Promise<Browser> {
  if (!browser || !browser.connected) {
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-blink-features=AutomationControlled',
        '--window-size=1280,800',
      ],
    });
  }
  return browser;
}

async function newStealthPage(b: Browser): Promise<Page> {
  const page = await b.newPage();
  await page.setUserAgent(config.tiktokUserAgent);
  await page.setExtraHTTPHeaders({ 'Accept-Language': 'fr-FR,fr;q=0.9' });
  // Masquer webdriver
  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => false });
  });
  return page;
}

// ── Helpers internes ───────────────────────────────────────────────────────
async function submitSearch(page: Page, url: string, username: string): Promise<void> {
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

  // XPath input
  await page.waitForSelector('input.search', { timeout: 10000 });
  await page.$eval('input.search', (el: Element, val: string) => {
    (el as HTMLInputElement).value = val;
    el.dispatchEvent(new Event('input', { bubbles: true }));
  }, username);

  // Clic bouton search
  await page.click('button.search-form__button');

  // Attendre les résultats
  await page.waitForSelector('.output-component', { timeout: 20000 });
  // Petite pause pour laisser le rendu se stabiliser
  await new Promise(r => setTimeout(r, 1500));
}

// ── parseProfile depuis le DOM tokviewer ───────────────────────────────────
async function extractProfile(page: Page, username: string): Promise<TikTokProfile> {
  return page.evaluate((uname: string) => {
    const avatarEl = document.querySelector<HTMLImageElement>('.avatar__image');
    const usernameEl = document.querySelector('.user-info__username-text');
    const statsItems = document.querySelectorAll('.stats__item');

    const statsMap: Record<string, number> = {};
    statsItems.forEach(item => {
      const val = item.querySelector('.stats__value')?.textContent?.replace(/\s/g, '') ?? '0';
      const name = item.querySelector('.stats__name')?.textContent?.trim() ?? '';
      statsMap[name] = parseInt(val.replace(/[^0-9]/g, ''), 10) || 0;
    });

    return {
      username: uname,
      displayName: usernameEl?.textContent?.replace('@', '').trim() ?? uname,
      avatarUrl: avatarEl?.src ?? '',
      bio: '',
      profileId: '',
      secUid: '',
      stats: {
        followers: statsMap['Followers'] ?? statsMap['followers'] ?? 0,
        following: statsMap['Suivis'] ?? statsMap['Following'] ?? 0,
        likes: statsMap["J'aime"] ?? statsMap['Likes'] ?? 0,
        videosCount: 0,
      },
    };
  }, username);
}

// ── parseVideos depuis le DOM tokviewer ────────────────────────────────────
async function extractVideos(page: Page): Promise<TikTokVideo[]> {
  return page.evaluate(() => {
    const items = document.querySelectorAll('.profile-media-list__item');
    const results: TikTokVideo[] = [];

    items.forEach((item, idx) => {
      const thumb = item.querySelector<HTMLImageElement>('.media-content__image');
      const dlLink = item.querySelector<HTMLAnchorElement>('a.button--filled');
      if (!dlLink) return;

      const videoUrl = dlLink.href;
      const videoId = `tv_${idx}_${Date.now()}`;

      results.push({
        videoId,
        description: '',
        createdAt: new Date().toISOString(),
        thumbnailUrl: thumb?.src ?? '',
        videoUrl,
        stats: { plays: 0, likes: 0, comments: 0, shares: 0 },
      });
    });

    return results;
  });
}

// ── PUBLIC API ─────────────────────────────────────────────────────────────

export async function getProfile(username: string): Promise<TikTokProfile> {
  const cacheKey = `profile:${username}`;
  const cached = await cacheGet(cacheKey);
  if (cached) return JSON.parse(cached);

  const b = await getBrowser();
  const page = await newStealthPage(b);
  try {
    await submitSearch(page, BASE_URL, username);
    const profile = await extractProfile(page, username);
    const videos = await extractVideos(page);
    profile.stats.videosCount = videos.length;
    await cacheSet(cacheKey, JSON.stringify(profile), config.cacheTtlProfile);
    return profile;
  } finally {
    await page.close();
  }
}

export async function getVideos(
  username: string,
  cursor = '0',
  limit = 20
): Promise<TikTokVideoList> {
  const cacheKey = `videos:${username}:${cursor}`;
  const cached = await cacheGet(cacheKey);
  if (cached) return JSON.parse(cached);

  const b = await getBrowser();
  const page = await newStealthPage(b);
  try {
    await submitSearch(page, BASE_URL, username);

    // Charger plus si cursor > 0
    const cursorNum = parseInt(cursor, 10) || 0;
    for (let i = 0; i < cursorNum; i++) {
      const seeMoreBtn = await page.$('button.profile-media-list__button--see-more');
      if (!seeMoreBtn) break;
      await seeMoreBtn.click();
      await new Promise(r => setTimeout(r, 1500));
    }

    const allVideos = await extractVideos(page);
    const items = allVideos.slice(0, limit);
    const nextCursor = allVideos.length >= limit ? String(cursorNum + 1) : null;

    const result: TikTokVideoList = { items, nextCursor };
    await cacheSet(cacheKey, JSON.stringify(result), config.cacheTtlVideos);
    return result;
  } finally {
    await page.close();
  }
}

export async function getReposts(
  username: string,
  cursor = '0'
): Promise<TikTokVideoList> {
  const cacheKey = `reposts:${username}:${cursor}`;
  const cached = await cacheGet(cacheKey);
  if (cached) return JSON.parse(cached);

  const b = await getBrowser();
  const page = await newStealthPage(b);
  try {
    await submitSearch(page, REPOST_URL, username);
    const items = await extractVideos(page);
    // Marquer comme repost
    const tagged = items.map(v => ({ ...v, isRepost: true }));
    const result: TikTokVideoList = { items: tagged, nextCursor: null };
    await cacheSet(cacheKey, JSON.stringify(result), config.cacheTtlVideos);
    return result;
  } finally {
    await page.close();
  }
}

export async function getStories(username: string): Promise<TikTokStoryList> {
  const cacheKey = `stories:${username}`;
  const cached = await cacheGet(cacheKey);
  if (cached) return JSON.parse(cached);

  const b = await getBrowser();
  const page = await newStealthPage(b);
  try {
    await submitSearch(page, STORY_URL, username);

    const items = await page.evaluate(() => {
      const storyItems = document.querySelectorAll('.profile-media-list__item');
      const results: Array<{
        storyId: string;
        mediaType: 'video' | 'image';
        mediaUrl: string;
        thumbnailUrl: string;
        createdAt: string;
        expiresAt: string;
      }> = [];

      storyItems.forEach((item, idx) => {
        const thumb = item.querySelector<HTMLImageElement>('.media-content__image');
        const dlLink = item.querySelector<HTMLAnchorElement>('a.button--filled');
        if (!dlLink) return;

        const mediaUrl = dlLink.href;
        const isVideo = mediaUrl.includes('video') || mediaUrl.includes('.mp4');
        const now = new Date();
        const exp = new Date(now.getTime() + 24 * 3600 * 1000);

        results.push({
          storyId: `story_${idx}_${Date.now()}`,
          mediaType: isVideo ? 'video' : 'image',
          mediaUrl,
          thumbnailUrl: thumb?.src ?? '',
          createdAt: now.toISOString(),
          expiresAt: exp.toISOString(),
        });
      });

      return results;
    });

    const result: TikTokStoryList = { items };
    await cacheSet(cacheKey, JSON.stringify(result), 60);
    return result;
  } finally {
    await page.close();
  }
}

export async function resolveVideoUrl(videoId: string): Promise<string> {
  const cached = await cacheGet(`videourl:${videoId}`);
  return cached ?? '';
}
