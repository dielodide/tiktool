import { useTranslation } from 'react-i18next';
import { TikTokProfile } from '../api/types';

interface ProfileHeaderProps {
  profile: TikTokProfile;
}

function formatNumber(num: number): string {
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1) + 'M';
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(1) + 'K';
  }
  return num.toString();
}

export function ProfileHeader({ profile }: ProfileHeaderProps) {
  const { t } = useTranslation();

  const stats = profile?.stats || { followers: 0, following: 0, likes: 0, videosCount: 0 };

  if (!profile) {
    return null;
  }

  return (
    <div className="flex flex-col md:flex-row items-center gap-6 p-6 bg-tiktok-gray rounded-xl">
      <img
        src={profile.avatarUrl}
        alt={profile.displayName}
        className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-tiktok-pink object-cover"
      />

      <div className="flex-1 text-center md:text-left">
        <h1 className="text-2xl font-bold text-white">{profile.displayName}</h1>
        <p className="text-gray-400">@{profile.username}</p>

        {profile.bio && (
          <p className="mt-2 text-gray-300 max-w-md">{profile.bio}</p>
        )}

        <div className="flex flex-wrap justify-center md:justify-start gap-6 mt-4">
          <div className="text-center">
            <span className="block text-xl font-bold text-white">
              {formatNumber(stats.followers)}
            </span>
            <span className="text-sm text-gray-400">{t('profile.followers')}</span>
          </div>
          <div className="text-center">
            <span className="block text-xl font-bold text-white">
              {formatNumber(stats.following)}
            </span>
            <span className="text-sm text-gray-400">{t('profile.following')}</span>
          </div>
          <div className="text-center">
            <span className="block text-xl font-bold text-white">
              {formatNumber(stats.likes)}
            </span>
            <span className="text-sm text-gray-400">{t('profile.likes')}</span>
          </div>
          <div className="text-center">
            <span className="block text-xl font-bold text-white">
              {formatNumber(stats.videosCount)}
            </span>
            <span className="text-sm text-gray-400">{t('profile.videos')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
