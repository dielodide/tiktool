# TikTool - Anonymous TikTok Viewer

Application web Node.js pour visualiser anonymement les profils TikTok publics (vidéos, reposts, stories) et télécharger les médias. Sans login, sans authentification TikTok.

## Prérequis

- Node.js 20+
- Redis installé localement (`brew install redis` / `apt install redis-server`)
- npm 9+

## Installation

```bash
# Cloner le repo
git clone https://github.com/dielodide/termios.git
cd termios/tiktool

# Installer les dépendances backend
cd backend && npm install

# Installer les dépendances frontend
cd ../frontend && npm install
```

## Configuration

Copier le fichier d'environnement :

```bash
cp .env.example .env
```

Variables d'environnement disponibles :

| Variable | Description | Défaut |
|----------|-------------|--------|
| PORT | Port du serveur backend | 3432 |
| REDIS_URL | URL de connexion Redis | redis://127.0.0.1:6379 |
| FRONTEND_ORIGIN | Origine autorisée CORS | http://localhost:5173 |
| HTTP_PROXY | Proxy HTTP (optionnel) | - |
| CACHE_TTL_PROFILE | TTL cache profil (secondes) | 300 |
| CACHE_TTL_VIDEOS | TTL cache vidéos (secondes) | 180 |
| RATE_LIMIT_RPM | Limite requêtes/minute | 30 |

## Lancement en développement

```bash
# Terminal 1 : Démarrer Redis
redis-server

# Terminal 2 : Démarrer le backend
cd backend && npm run dev

# Terminal 3 : Démarrer le frontend
cd frontend && npm run dev
```

Ouvrir http://localhost:5173

## Build production

```bash
# Backend
cd backend
npm run build
npm start

# Frontend
cd frontend
npm run build
npm run preview
```

## Endpoints API

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | /api/profile/:username | Récupérer le profil |
| GET | /api/profile/:username/videos | Liste des vidéos |
| GET | /api/profile/:username/reposts | Liste des reposts |
| GET | /api/profile/:username/stories | Liste des stories |
| GET | /api/download/video/:videoId | Télécharger une vidéo |
| GET | /api/download/story/:storyId | Télécharger une story |
| GET | /api/health | Health check |

### Exemples curl

```bash
# Profil
curl http://localhost:3432/api/profile/charlidamelio

# Vidéos avec pagination
curl "http://localhost:3432/api/profile/charlidamelio/videos?limit=10"

# Reposts
curl "http://localhost:3432/api/profile/charlidamelio/reposts"

# Stories
curl "http://localhost:3432/api/profile/charlidamelio/stories"

# Télécharger une vidéo
curl -OJ http://localhost:3432/api/download/video/7123456789012345678
```

## Tests

```bash
cd backend
npm run test
```

## Structure du projet

```
tiktool/
├── backend/
│   ├── src/
│   │   ├── config/           # Configuration
│   │   ├── modules/tiktok/   # Client et parser TikTok
│   │   ├── routes/           # Routes API
│   │   ├── middlewares/      # Error handler
│   │   ├── cache/            # Client Redis
│   │   └── server.ts         # Point d'entrée
│   └── tests/                # Tests Vitest
├── frontend/
│   ├── src/
│   │   ├── api/              # API client
│   │   ├── components/       # Composants React
│   │   ├── pages/            # Pages
│   │   ├── hooks/            # Hooks personnalisés
│   │   └── i18n/             # Traductions
│   └── index.html
├── .env
└── README.md
```

## Déploiement VPS

Pour déployer sur un VPS (ex: 217.216.80.132) :

```bash
# Sur le VPS
cd /root/opt/tiktool

# Utiliser le script d'installation
chmod +x install.sh
./install.sh

# Ou manuellement
cd backend && npm install && npm run build
cd ../frontend && npm install && npm run build

# Démarrer avec PM2
pm2 start backend/dist/server.js --name tiktool-backend
pm2 serve frontend/dist 5173 --name tiktool-frontend
```

## Stack technique

**Backend:**
- Node.js 20 LTS + TypeScript
- Fastify
- Redis (ioredis)
- axios
- pino logger

**Frontend:**
- React 18 + Vite
- TypeScript
- Tailwind CSS
- react-router-dom v6
- react-i18next

## Licence

MIT
