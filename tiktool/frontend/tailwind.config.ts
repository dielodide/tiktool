import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        tiktok: {
          dark: '#0f0f0f',
          pink: '#fe2c55',
          cyan: '#25f4ee',
          gray: '#161823',
        },
      },
      backgroundImage: {
        'tiktok-gradient': 'linear-gradient(135deg, #fe2c55 0%, #8b5cf6 100%)',
      },
    },
  },
  plugins: [],
};

export default config;
