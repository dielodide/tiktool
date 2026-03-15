import { useTranslation } from 'react-i18next';
import { TikTokVideo } from '../api/types';
import { VideoCard } from './VideoCard';
import { Spinner } from './Spinner';

interface VideoGridProps {
  videos: TikTokVideo[];
  loading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
}

export function VideoGrid({
  videos,
  loading,
  hasMore,
  onLoadMore,
}: VideoGridProps) {
  const { t } = useTranslation();
  const safeVideos = videos || [];

  if (safeVideos.length === 0 && !loading) {
    return (
      <div className="text-center py-12 text-gray-400">
        {t('profile.noContent')}
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {safeVideos.map((video) => (
          <VideoCard key={video.videoId} video={video} />
        ))}
      </div>

      {loading && <Spinner />}

      {hasMore && !loading && (
        <div className="flex justify-center mt-6">
          <button
            onClick={onLoadMore}
            className="px-6 py-3 bg-tiktok-gray border border-gray-700 rounded-lg text-white hover:bg-gray-800 transition-colors"
          >
            {t('profile.loadMore')}
          </button>
        </div>
      )}
    </div>
  );
}
