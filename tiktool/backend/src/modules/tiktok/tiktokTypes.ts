export interface TikTokProfile {
  username: string;
  displayName: string;
  avatarUrl: string;
  bio: string;
  profileId: string;
  secUid: string;
  stats: {
    followers: number;
    following: number;
    likes: number;
    videosCount: number;
  };
}

export interface TikTokVideo {
  videoId: string;
  description: string;
  createdAt: string;
  thumbnailUrl: string;
  videoUrl: string;
  stats: {
    plays: number;
    likes: number;
    comments: number;
    shares: number;
  };
  isRepost?: boolean;
  originalAuthor?: {
    username: string;
    displayName: string;
  };
}

export interface TikTokVideoList {
  items: TikTokVideo[];
  nextCursor: string | null;
}

export interface TikTokStory {
  storyId: string;
  mediaType: 'video' | 'image';
  mediaUrl: string;
  thumbnailUrl: string;
  createdAt: string;
  expiresAt: string;
}

export interface TikTokStoryList {
  items: TikTokStory[];
}

// Types pour errorHandler
export type TikTokErrorCode =
  | 'not_found'
  | 'profile_private'
  | 'rate_limited'
  | 'fetch_failed'
  | 'invalid_username';

export interface TikTokError {
  error: TikTokErrorCode;
  message: string;
}
