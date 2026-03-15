import { useTranslation } from 'react-i18next';
import { TikTokVideo } from '../api/types';
import { getDownloadUrl } from '../api/tiktoolApi';

interface VideoCardProps {
  video: TikTokVideo;
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

export function VideoCard({ video }: VideoCardProps) {
  const { t } = useTranslation();

  const stats = video?.stats || { plays: 0, likes: 0, comments: 0, shares: 0 };

  if (!video) {
    return null;
  }

  return (
    <div className="bg-tiktok-gray rounded-lg overflow-hidden group">
      <div className="relative aspect-[9/16]">
        <img
          src={video.thumbnailUrl}
          alt={video.description || 'TikTok video'}
          className="w-full h-full object-cover"
        />

        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <svg
            className="w-16 h-16 text-white"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>

        {video.isRepost && (
          <span className="absolute top-2 left-2 bg-tiktok-pink px-2 py-1 rounded text-xs font-medium text-white">
            Repost
          </span>
        )}
      </div>

      <div className="p-3">
        <p className="text-white text-sm line-clamp-2 mb-2">
          {video.description || 'Video sans description'}
        </p>

        <div className="flex items-center gap-4 text-xs text-gray-400 mb-3">
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
            </svg>
            {formatNumber(stats.plays)}
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
            {formatNumber(stats.likes)}
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M21.99 4c0-1.1-.89-2-1.99-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4-.01-18z" />
            </svg>
            {formatNumber(stats.comments)}
          </span>
        </div>

        <a
          href={getDownloadUrl('video', video.videoId)}
          download
          className="block w-full py-2 bg-tiktok-gradient rounded text-center text-white text-sm font-medium hover:opacity-90 transition-opacity"
        >
          {t('profile.download')}
        </a>
      </div>
    </div>
  );
}
