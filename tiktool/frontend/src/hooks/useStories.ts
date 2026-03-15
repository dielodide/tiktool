import { useState, useEffect } from 'react';
import { TikTokStory, TikTokError } from '../api/types';
import { fetchStories } from '../api/tiktoolApi';

interface UseStoriesResult {
  stories: TikTokStory[];
  loading: boolean;
  error: TikTokError | null;
}

export function useStories(username: string): UseStoriesResult {
  const [stories, setStories] = useState<TikTokStory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<TikTokError | null>(null);

  useEffect(() => {
    if (!username) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    setStories([]);

    fetchStories(username)
      .then((data) => {
        setStories(data?.items || []);
        setLoading(false);
      })
      .catch((err) => {
        const apiError = err.response?.data as TikTokError | undefined;
        setError(
          apiError || {
            error: 'fetch_failed',
            message: 'Erreur lors de la récupération des stories.',
          }
        );
        setLoading(false);
      });
  }, [username]);

  return { stories, loading, error };
}
