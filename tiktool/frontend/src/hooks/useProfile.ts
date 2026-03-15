import { useState, useEffect } from 'react';
import { TikTokProfile, TikTokError } from '../api/types';
import { fetchProfile } from '../api/tiktoolApi';

interface UseProfileResult {
  profile: TikTokProfile | null;
  loading: boolean;
  error: TikTokError | null;
}

export function useProfile(username: string): UseProfileResult {
  const [profile, setProfile] = useState<TikTokProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<TikTokError | null>(null);

  useEffect(() => {
    if (!username) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    setProfile(null);

    fetchProfile(username)
      .then((data) => {
        setProfile(data);
        setLoading(false);
      })
      .catch((err) => {
        const apiError = err.response?.data as TikTokError | undefined;
        setError(
          apiError || {
            error: 'fetch_failed',
            message: 'Erreur lors de la récupération du profil.',
          }
        );
        setLoading(false);
      });
  }, [username]);

  return { profile, loading, error };
}
