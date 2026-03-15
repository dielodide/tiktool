import { useTranslation } from 'react-i18next';

export type TabType = 'profile' | 'videos' | 'reposts' | 'stories';

interface TabBarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export function TabBar({ activeTab, onTabChange }: TabBarProps) {
  const { t } = useTranslation();

  const tabs: { id: TabType; label: string }[] = [
    { id: 'profile', label: t('profile.tabs.profile') },
    { id: 'videos', label: t('profile.tabs.videos') },
    { id: 'reposts', label: t('profile.tabs.reposts') },
    { id: 'stories', label: t('profile.tabs.stories') },
  ];

  return (
    <div className="flex border-b border-gray-700">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
            activeTab === tab.id
              ? 'text-tiktok-pink border-b-2 border-tiktok-pink'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
