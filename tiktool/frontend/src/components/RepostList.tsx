import { useTranslation } from 'react-i18next';
import { TikTokVideo } from '../api/types';
import { VideoCard } from './VideoCard';
import { Spinner } from './Spinner';

interface RepostListProps {
  reposts: TikTokVideo[];
  loading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
}

export function RepostList({
  reposts,
  loading,
  hasMore,
  onLoadMore,
}: RepostListProps) {
  const { t } = useTranslation();
  const safeReposts = reposts || [];

  if (safeReposts.length === 0 && !loading) {
    return (
      <div className="text-center py-12 text-gray-400">
        {t('profile.noContent')}
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {safeReposts.map((video) => (
          <div key={video.videoId} className="relative">
            <VideoCard video={video} />
            {video.originalAuthor && (
              <div className="absolute top-2 right-2 bg-black/70 px-2 py-1 rounded text-xs text-white">
                @{video.originalAuthor.username}
              </div>
            )}
          </div>
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
