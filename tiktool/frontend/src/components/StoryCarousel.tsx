import { useTranslation } from 'react-i18next';
import { TikTokStory } from '../api/types';

interface StoryCarouselProps {
  stories: TikTokStory[];
  onStoryClick: (story: TikTokStory) => void;
}

export function StoryCarousel({ stories, onStoryClick }: StoryCarouselProps) {
  const { t } = useTranslation();
  const safeStories = stories || [];

  if (safeStories.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        {t('profile.noContent')}
      </div>
    );
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
      {safeStories.map((story) => (
        <button
          key={story.storyId}
          onClick={() => onStoryClick(story)}
          className="flex-shrink-0 group"
        >
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-full p-[3px] bg-tiktok-gradient">
            <div className="w-full h-full rounded-full p-[2px] bg-tiktok-dark">
              <img
                src={story.thumbnailUrl}
                alt="Story"
                className="w-full h-full rounded-full object-cover group-hover:scale-105 transition-transform"
              />
            </div>
          </div>
          <p className="text-xs text-gray-400 text-center mt-2">
            {story.mediaType === 'video' ? 'Video' : 'Photo'}
          </p>
        </button>
      ))}
    </div>
  );
}
