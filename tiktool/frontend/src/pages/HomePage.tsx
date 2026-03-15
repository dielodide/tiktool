import { useTranslation } from 'react-i18next';
import { SearchBar } from '../components/SearchBar';

export function HomePage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-tiktok-dark flex flex-col items-center justify-center px-4">
      <div className="text-center mb-8">
        <h1 className="text-5xl md:text-6xl font-bold mb-4">
          <span className="bg-tiktok-gradient bg-clip-text text-transparent">
            {t('home.title')}
          </span>
        </h1>
        <p className="text-gray-400 text-lg">{t('home.anonymous')}</p>
      </div>

      <SearchBar />

      <div className="mt-12 text-center text-gray-500 text-sm max-w-md">
        <p>
          Visualisez les profils TikTok publics, les vidéos, reposts et stories.
          Téléchargez les contenus sans compte.
        </p>
      </div>
    </div>
  );
}
