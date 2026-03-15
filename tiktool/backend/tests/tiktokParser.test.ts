import { describe, it, expect } from 'vitest';
import {
  parseProfile,
  parseVideoList,
  parseRepostList,
  parseStoryList,
} from '../src/modules/tiktok/tiktokParser';

describe('tiktokParser', () => {
  describe('parseProfile', () => {
    it('should parse profile from UNIVERSAL_DATA script', () => {
      const html = `
        <html>
          <head>
            <script id="__UNIVERSAL_DATA_FOR_REHYDRATION__">
              {
                "__DEFAULT_SCOPE__": {
                  "webapp.user-detail": {
                    "userInfo": {
                      "user": {
                        "id": "123456",
                        "uniqueId": "testuser",
                        "nickname": "Test User",
                        "avatarLarger": "https://example.com/avatar.jpg",
                        "signature": "Test bio",
                        "secUid": "secuid123"
                      },
                      "stats": {
                        "followerCount": 1000,
                        "followingCount": 500,
                        "heartCount": 50000,
                        "videoCount": 100
                      }
                    }
                  }
                }
              }
            </script>
          </head>
        </html>
      `;

      const profile = parseProfile(html);

      expect(profile.username).toBe('testuser');
      expect(profile.displayName).toBe('Test User');
      expect(profile.avatarUrl).toBe('https://example.com/avatar.jpg');
      expect(profile.bio).toBe('Test bio');
      expect(profile.profileId).toBe('123456');
      expect(profile.secUid).toBe('secuid123');
      expect(profile.stats.followers).toBe(1000);
      expect(profile.stats.following).toBe(500);
      expect(profile.stats.likes).toBe(50000);
      expect(profile.stats.videosCount).toBe(100);
    });

    it('should throw error for invalid HTML', () => {
      const html = '<html><body>No data here</body></html>';

      expect(() => parseProfile(html)).toThrow('Unable to parse profile data');
    });
  });

  describe('parseVideoList', () => {
    it('should parse video list from API response', () => {
      const apiResponse = {
        itemList: [
          {
            id: 'video123',
            desc: 'Test video description',
            createTime: 1700000000,
            video: {
              cover: 'https://example.com/thumb.jpg',
              downloadAddr: 'https://example.com/video.mp4',
            },
            stats: {
              playCount: 10000,
              diggCount: 500,
              commentCount: 50,
              shareCount: 10,
            },
          },
        ],
        hasMore: true,
        cursor: '12345',
      };

      const result = parseVideoList(apiResponse);

      expect(result.items).toHaveLength(1);
      expect(result.items[0].videoId).toBe('video123');
      expect(result.items[0].description).toBe('Test video description');
      expect(result.items[0].thumbnailUrl).toBe('https://example.com/thumb.jpg');
      expect(result.items[0].videoUrl).toBe('https://example.com/video.mp4');
      expect(result.items[0].stats.plays).toBe(10000);
      expect(result.nextCursor).toBe('12345');
    });

    it('should return empty list for empty response', () => {
      const result = parseVideoList({});

      expect(result.items).toHaveLength(0);
      expect(result.nextCursor).toBeNull();
    });
  });

  describe('parseRepostList', () => {
    it('should parse repost list with original author', () => {
      const apiResponse = {
        itemList: [
          {
            id: 'repost123',
            desc: 'Reposted video',
            createTime: 1700000000,
            video: {
              cover: 'https://example.com/thumb.jpg',
              downloadAddr: 'https://example.com/video.mp4',
            },
            stats: {
              playCount: 5000,
              diggCount: 200,
              commentCount: 20,
              shareCount: 5,
            },
            originalItem: {
              author: {
                uniqueId: 'originaluser',
                nickname: 'Original User',
              },
            },
          },
        ],
        cursor: '67890',
      };

      const result = parseRepostList(apiResponse);

      expect(result.items).toHaveLength(1);
      expect(result.items[0].isRepost).toBe(true);
      expect(result.items[0].originalAuthor?.username).toBe('originaluser');
      expect(result.items[0].originalAuthor?.displayName).toBe('Original User');
    });
  });

  describe('parseStoryList', () => {
    it('should parse story list', () => {
      const apiResponse = {
        storyList: [
          {
            id: 'story123',
            mediaType: 1,
            video: {
              playAddr: 'https://example.com/story.mp4',
              cover: 'https://example.com/storythumb.jpg',
            },
            createTime: 1700000000,
            expireTime: 1700086400,
          },
        ],
      };

      const result = parseStoryList(apiResponse);

      expect(result.items).toHaveLength(1);
      expect(result.items[0].storyId).toBe('story123');
      expect(result.items[0].mediaType).toBe('video');
      expect(result.items[0].mediaUrl).toBe('https://example.com/story.mp4');
    });

    it('should return empty list for no stories', () => {
      const result = parseStoryList({ storyList: [] });

      expect(result.items).toHaveLength(0);
    });
  });
});
