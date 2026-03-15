import axios from 'axios';
import {
  TikTokProfile,
  TikTokVideoList,
  TikTokStoryList,
} from './types';

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
});

export async function fetchProfile(username: string): Promise<TikTokProfile> {
  const response = await api.get<TikTokProfile>(`/profile/${username}`);
  return response.data;
}

export async function fetchVideos(
  username: string,
  cursor?: string,
  limit?: number
): Promise<TikTokVideoList> {
  const params: Record<string, string | number> = {};
  if (cursor) params.cursor = cursor;
  if (limit) params.limit = limit;

  const response = await api.get<TikTokVideoList>(
    `/profile/${username}/videos`,
    { params }
  );
  return response.data;
}

export async function fetchReposts(
  username: string,
  cursor?: string
): Promise<TikTokVideoList> {
  const params: Record<string, string> = {};
  if (cursor) params.cursor = cursor;

  const response = await api.get<TikTokVideoList>(
    `/profile/${username}/reposts`,
    { params }
  );
  return response.data;
}

export async function fetchStories(username: string): Promise<TikTokStoryList> {
  const response = await api.get<TikTokStoryList>(`/profile/${username}/stories`);
  return response.data;
}

export function getDownloadUrl(
  type: 'video' | 'story',
  id: string
): string {
  return `/api/download/${type}/${id}`;
}
