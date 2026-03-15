import { useTranslation } from 'react-i18next';
import { TikTokStory } from '../api/types';
import { getDownloadUrl } from '../api/tiktoolApi';

interface StoryModalProps {
  story: TikTokStory;
  onClose: () => void;
}

export function StoryModal({ story, onClose }: StoryModalProps) {
  const { t } = useTranslation();

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
      onClick={handleBackdropClick}
    >
      <div className="relative max-w-md w-full mx-4">
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
        >
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <div className="bg-tiktok-gray rounded-xl overflow-hidden">
          {story.mediaType === 'video' ? (
            <video
              src={story.mediaUrl}
              controls
              autoPlay
              loop
              className="w-full aspect-[9/16] object-cover"
            />
          ) : (
            <img
              src={story.mediaUrl}
              alt="Story"
              className="w-full aspect-[9/16] object-cover"
            />
          )}

          <div className="p-4">
            <a
              href={getDownloadUrl('story', story.storyId)}
              download
              className="block w-full py-3 bg-tiktok-gradient rounded-lg text-center text-white font-medium hover:opacity-90 transition-opacity"
            >
              {t('profile.download')}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
