import { useState, useEffect, useCallback } from 'react';
import { TikTokVideo, TikTokError } from '../api/types';
import { fetchReposts } from '../api/tiktoolApi';

interface UseRepostsResult {
  reposts: TikTokVideo[];
  nextCursor: string | null;
  loading: boolean;
  error: TikTokError | null;
  loadMore: () => void;
}

export function useReposts(username: string): UseRepostsResult {
  const [reposts, setReposts] = useState<TikTokVideo[]>([]);
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
    setReposts([]);
    setNextCursor(null);

    fetchReposts(username)
      .then((data) => {
        setReposts(data?.items || []);
        setNextCursor(data?.nextCursor || null);
        setLoading(false);
      })
      .catch((err) => {
        const apiError = err.response?.data as TikTokError | undefined;
        setError(
          apiError || {
            error: 'fetch_failed',
            message: 'Erreur lors de la récupération des reposts.',
          }
        );
        setLoading(false);
      });
  }, [username]);

  const loadMore = useCallback(() => {
    if (!nextCursor || loading) return;

    setLoading(true);

    fetchReposts(username, nextCursor)
      .then((data) => {
        setReposts((prev) => [...prev, ...(data?.items || [])]);
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

  return { reposts, nextCursor, loading, error, loadMore };
}
