import {
  TikTokProfile,
  TikTokVideo,
  TikTokVideoList,
  TikTokStory,
  TikTokStoryList,
} from './tiktokTypes';

interface UniversalData {
  __DEFAULT_SCOPE__?: {
    'webapp.user-detail'?: {
      userInfo?: {
        user?: {
          id?: string;
          uniqueId?: string;
          nickname?: string;
          avatarLarger?: string;
          signature?: string;
          secUid?: string;
        };
        stats?: {
          followerCount?: number;
          followingCount?: number;
          heart?: number;
          heartCount?: number;
          videoCount?: number;
        };
      };
    };
  };
}

interface NextData {
  props?: {
    pageProps?: {
      userInfo?: {
        user?: {
          id?: string;
          uniqueId?: string;
          nickname?: string;
          avatarLarger?: string;
          signature?: string;
          secUid?: string;
        };
        stats?: {
          followerCount?: number;
          followingCount?: number;
          heart?: number;
          heartCount?: number;
          videoCount?: number;
        };
      };
    };
  };
}

export function parseProfile(html: string): TikTokProfile {
  let data: UniversalData | null = null;

  const universalMatch = html.match(
    /<script[^>]*id="__UNIVERSAL_DATA_FOR_REHYDRATION__"[^>]*>([^<]+)<\/script>/
  );

  if (universalMatch) {
    try {
      data = JSON.parse(universalMatch[1]) as UniversalData;
    } catch {
      data = null;
    }
  }

  if (data?.__DEFAULT_SCOPE__?.['webapp.user-detail']?.userInfo) {
    const userInfo = data.__DEFAULT_SCOPE__['webapp.user-detail'].userInfo;
    const user = userInfo.user;
    const stats = userInfo.stats;

    if (user && stats) {
      return {
        username: user.uniqueId || '',
        displayName: user.nickname || '',
        avatarUrl: user.avatarLarger || '',
        bio: user.signature || '',
        profileId: user.id || '',
        secUid: user.secUid || '',
        stats: {
          followers: stats.followerCount || 0,
          following: stats.followingCount || 0,
          likes: stats.heartCount || stats.heart || 0,
          videosCount: stats.videoCount || 0,
        },
      };
    }
  }

  const nextDataMatch = html.match(
    /<script[^>]*id="__NEXT_DATA__"[^>]*>([^<]+)<\/script>/
  );

  if (nextDataMatch) {
    try {
      const nextData = JSON.parse(nextDataMatch[1]) as NextData;
      const userInfo = nextData.props?.pageProps?.userInfo;

      if (userInfo?.user && userInfo?.stats) {
        return {
          username: userInfo.user.uniqueId || '',
          displayName: userInfo.user.nickname || '',
          avatarUrl: userInfo.user.avatarLarger || '',
          bio: userInfo.user.signature || '',
          profileId: userInfo.user.id || '',
          secUid: userInfo.user.secUid || '',
          stats: {
            followers: userInfo.stats.followerCount || 0,
            following: userInfo.stats.followingCount || 0,
            likes: userInfo.stats.heartCount || userInfo.stats.heart || 0,
            videosCount: userInfo.stats.videoCount || 0,
          },
        };
      }
    } catch {
      // Fallback failed
    }
  }

  throw new Error('Unable to parse profile data from HTML');
}

interface VideoItem {
  id?: string;
  desc?: string;
  createTime?: number;
  video?: {
    cover?: string;
    playAddr?: string;
    downloadAddr?: string;
  };
  stats?: {
    playCount?: number;
    diggCount?: number;
    commentCount?: number;
    shareCount?: number;
  };
  duetInfo?: {
    duetFromId?: string;
  };
  isAd?: boolean;
  duetEnabled?: boolean;
  author?: {
    uniqueId?: string;
    nickname?: string;
  };
}

interface VideoListResponse {
  itemList?: VideoItem[];
  hasMore?: boolean;
  cursor?: string | number;
}

export function parseVideoList(apiResponse: unknown): TikTokVideoList {
  const response = apiResponse as VideoListResponse;
  const items: TikTokVideo[] = [];

  if (response.itemList && Array.isArray(response.itemList)) {
    for (const item of response.itemList) {
      const video: TikTokVideo = {
        videoId: item.id || '',
        description: item.desc || '',
        createdAt: item.createTime
          ? new Date(item.createTime * 1000).toISOString()
          : new Date().toISOString(),
        thumbnailUrl: item.video?.cover || '',
        videoUrl: item.video?.downloadAddr || item.video?.playAddr || '',
        stats: {
          plays: item.stats?.playCount || 0,
          likes: item.stats?.diggCount || 0,
          comments: item.stats?.commentCount || 0,
          shares: item.stats?.shareCount || 0,
        },
        isRepost: false,
      };
      items.push(video);
    }
  }

  return {
    items,
    nextCursor: response.cursor ? String(response.cursor) : null,
  };
}

interface RepostItem extends VideoItem {
  video?: VideoItem['video'] & {
    originCover?: string;
  };
  originalItem?: {
    author?: {
      uniqueId?: string;
      nickname?: string;
    };
  };
}

interface RepostListResponse {
  itemList?: RepostItem[];
  hasMore?: boolean;
  cursor?: string | number;
}

export function parseRepostList(apiResponse: unknown): TikTokVideoList {
  const response = apiResponse as RepostListResponse;
  const items: TikTokVideo[] = [];

  if (response.itemList && Array.isArray(response.itemList)) {
    for (const item of response.itemList) {
      const video: TikTokVideo = {
        videoId: item.id || '',
        description: item.desc || '',
        createdAt: item.createTime
          ? new Date(item.createTime * 1000).toISOString()
          : new Date().toISOString(),
        thumbnailUrl: item.video?.originCover || item.video?.cover || '',
        videoUrl: item.video?.downloadAddr || item.video?.playAddr || '',
        stats: {
          plays: item.stats?.playCount || 0,
          likes: item.stats?.diggCount || 0,
          comments: item.stats?.commentCount || 0,
          shares: item.stats?.shareCount || 0,
        },
        isRepost: true,
        originalAuthor: item.originalItem?.author
          ? {
              username: item.originalItem.author.uniqueId || '',
              displayName: item.originalItem.author.nickname || '',
            }
          : item.author
            ? {
                username: item.author.uniqueId || '',
                displayName: item.author.nickname || '',
              }
            : undefined,
      };
      items.push(video);
    }
  }

  return {
    items,
    nextCursor: response.cursor ? String(response.cursor) : null,
  };
}

interface StoryItem {
  id?: string;
  mediaType?: number;
  video?: {
    playAddr?: string;
    cover?: string;
  };
  image?: {
    urlList?: string[];
  };
  createTime?: number;
  expireTime?: number;
}

interface StoryListResponse {
  storyList?: StoryItem[];
}

export function parseStoryList(apiResponse: unknown): TikTokStoryList {
  const response = apiResponse as StoryListResponse;
  const items: TikTokStory[] = [];

  if (response.storyList && Array.isArray(response.storyList)) {
    for (const item of response.storyList) {
      const isVideo = item.mediaType === 1 || Boolean(item.video?.playAddr);

      const story: TikTokStory = {
        storyId: item.id || '',
        mediaType: isVideo ? 'video' : 'image',
        mediaUrl: isVideo
          ? item.video?.playAddr || ''
          : item.image?.urlList?.[0] || '',
        thumbnailUrl: item.video?.cover || item.image?.urlList?.[0] || '',
        createdAt: item.createTime
          ? new Date(item.createTime * 1000).toISOString()
          : new Date().toISOString(),
        expiresAt: item.expireTime
          ? new Date(item.expireTime * 1000).toISOString()
          : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      };
      items.push(story);
    }
  }

  return { items };
}
