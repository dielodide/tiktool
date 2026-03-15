import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export function SearchBar() {
  const [username, setUsername] = useState('');
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const cleanUsername = username.replace('@', '').trim();
    if (cleanUsername) {
      navigate(`/profile/${cleanUsername}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md">
      <div className="flex gap-2">
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder={t('home.placeholder')}
          className="flex-1 px-4 py-3 rounded-lg bg-tiktok-gray border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-tiktok-pink focus:ring-1 focus:ring-tiktok-pink transition-colors"
        />
        <button
          type="submit"
          className="px-6 py-3 bg-tiktok-gradient rounded-lg text-white font-semibold hover:opacity-90 transition-opacity"
        >
          {t('home.cta')}
        </button>
      </div>
    </form>
  );
}
