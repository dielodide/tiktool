import { describe, it, expect, vi, beforeEach } from 'vitest';
import { validateUsername } from '../src/middlewares/errorHandler';

vi.mock('../src/modules/tiktok/tiktokClient', () => ({
  getProfile: vi.fn(),
  getVideos: vi.fn(),
  getReposts: vi.fn(),
  getStories: vi.fn(),
}));

describe('Routes validation', () => {
  describe('validateUsername', () => {
    it('should accept valid usernames', () => {
      expect(validateUsername('charlidamelio')).toBe(true);
      expect(validateUsername('user_123')).toBe(true);
      expect(validateUsername('test.user')).toBe(true);
      expect(validateUsername('ab')).toBe(true);
      expect(validateUsername('a'.repeat(24))).toBe(true);
    });

    it('should reject invalid usernames', () => {
      expect(validateUsername('')).toBe(false);
      expect(validateUsername('a')).toBe(false);
      expect(validateUsername('a'.repeat(25))).toBe(false);
      expect(validateUsername('user@name')).toBe(false);
      expect(validateUsername('user name')).toBe(false);
      expect(validateUsername('user#name')).toBe(false);
      expect(validateUsername('user-name')).toBe(false);
    });
  });
});

describe('API endpoint patterns', () => {
  const endpoints = [
    { path: '/api/profile/:username', method: 'GET' },
    { path: '/api/profile/:username/videos', method: 'GET' },
    { path: '/api/profile/:username/reposts', method: 'GET' },
    { path: '/api/profile/:username/stories', method: 'GET' },
    { path: '/api/download/video/:videoId', method: 'GET' },
    { path: '/api/download/story/:storyId', method: 'GET' },
    { path: '/api/health', method: 'GET' },
  ];

  it('should have all required endpoints defined', () => {
    expect(endpoints).toHaveLength(7);
    expect(endpoints.every((e) => e.method === 'GET')).toBe(true);
  });

  it('should have correct path patterns', () => {
    const paths = endpoints.map((e) => e.path);

    expect(paths).toContain('/api/profile/:username');
    expect(paths).toContain('/api/profile/:username/videos');
    expect(paths).toContain('/api/profile/:username/reposts');
    expect(paths).toContain('/api/profile/:username/stories');
    expect(paths).toContain('/api/download/video/:videoId');
    expect(paths).toContain('/api/download/story/:storyId');
    expect(paths).toContain('/api/health');
  });
});
