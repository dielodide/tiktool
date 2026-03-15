import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ProfileHeader } from '../components/ProfileHeader';
import { TabBar, TabType } from '../components/TabBar';
import { VideoGrid } from '../components/VideoGrid';
import { RepostList } from '../components/RepostList';
import { StoryCarousel } from '../components/StoryCarousel';
import { StoryModal } from '../components/StoryModal';
import { Spinner } from '../components/Spinner';
import { VideoCard } from '../components/VideoCard';
import { useProfile } from '../hooks/useProfile';
import { useVideos } from '../hooks/useVideos';
import { useReposts } from '../hooks/useReposts';
import { useStories } from '../hooks/useStories';
import { TikTokStory } from '../api/types';

export function ProfilePage() {
  const { username } = useParams<{ username: string }>();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [selectedStory, setSelectedStory] = useState<TikTokStory | null>(null);

  const { profile, loading: profileLoading, error: profileError } = useProfile(
    username || ''
  );
  const {
    videos,
    nextCursor: videosNextCursor,
    loading: videosLoading,
    loadMore: loadMoreVideos,
  } = useVideos(username || '');
  const {
    reposts,
    nextCursor: repostsNextCursor,
    loading: repostsLoading,
    loadMore: loadMoreReposts,
  } = useReposts(username || '');
  const { stories, loading: storiesLoading } = useStories(username || '');

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-tiktok-dark flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (profileError || !profile) {
    return (
      <div className="min-h-screen bg-tiktok-dark flex flex-col items-center justify-center px-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            {t(`error.${profileError?.error || 'not_found'}`)}
          </h2>
          <Link
            to="/"
            className="text-tiktok-pink hover:underline"
          >
            Retour à l'accueil
          </Link>
        </div>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-6">
            {profile.bio && (
              <div className="bg-tiktok-gray rounded-lg p-4">
                <h3 className="text-white font-medium mb-2">Bio</h3>
                <p className="text-gray-300">{profile.bio}</p>
              </div>
            )}

            {(videos || []).length > 0 && (
              <div>
                <h3 className="text-white font-medium mb-4">
                  Dernières vidéos
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {(videos || []).slice(0, 3).map((video) => (
                    <VideoCard key={video.videoId} video={video} />
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 'videos':
        return (
          <VideoGrid
            videos={videos}
            loading={videosLoading}
            hasMore={videosNextCursor !== null}
            onLoadMore={loadMoreVideos}
          />
        );

      case 'reposts':
        return (
          <RepostList
            reposts={reposts}
            loading={repostsLoading}
            hasMore={repostsNextCursor !== null}
            onLoadMore={loadMoreReposts}
          />
        );

      case 'stories':
        return (
          <>
            {storiesLoading ? (
              <Spinner />
            ) : (
              <StoryCarousel
                stories={stories}
                onStoryClick={setSelectedStory}
              />
            )}
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-tiktok-dark">
      <header className="bg-tiktok-gray border-b border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold">
            <span className="bg-tiktok-gradient bg-clip-text text-transparent">
              TikTool
            </span>
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <ProfileHeader profile={profile} />
        <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
        <div className="py-4">{renderTabContent()}</div>
      </main>

      {selectedStory && (
        <StoryModal
          story={selectedStory}
          onClose={() => setSelectedStory(null)}
        />
      )}
    </div>
  );
}
