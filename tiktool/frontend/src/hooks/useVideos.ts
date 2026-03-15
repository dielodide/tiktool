import { useState, useEffect, useCallback } from 'react';
import { TikTokVideo, TikTokError } from '../api/types';
import { fetchVideos } from '../api/tiktoolApi';

interface UseVideosResult {
  videos: TikTokVideo[];
  nextCursor: string | null;
  loading: boolean;
  error: TikTokError | null;
  loadMore: () => void;
}

export function useVideos(username: string): UseVideosResult {
  const [videos, setVideos] = useState<TikTokVideo[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<TikTokError | null>(null);

  useEffect(() => {
    if (!username) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    setVideos([]);
    setNextCursor(null);

    fetchVideos(username)
      .then((data) => {
        setVideos(data?.items || []);
        setNextCursor(data?.nextCursor || null);
        setLoading(false);
      })
      .catch((err) => {
        const apiError = err.response?.data as TikTokError | undefined;
        setError(
          apiError || {
            error: 'fetch_failed',
            message: 'Erreur lors de la récupération des vidéos.',
          }
        );
        setLoading(false);
      });
  }, [username]);

  const loadMore = useCallback(() => {
    if (!nextCursor || loading) return;

    setLoading(true);

    fetchVideos(username, nextCursor)
      .then((data) => {
        setVideos((prev) => [...prev, ...(data?.items || [])]);
        setNextCursor(data?.nextCursor || null);
        setLoading(false);
      })
      .catch((err) => {
        const apiError = err.response?.data as TikTokError | undefined;
        setError(
          apiError || {
            error: 'fetch_failed',
            message: 'Erreur lors du chargement.',
          }
        );
        setLoading(false);
      });
  }, [username, nextCursor, loading]);

  return { videos, nextCursor, loading, error, loadMore };
}
