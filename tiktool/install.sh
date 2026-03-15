#!/bin/bash

# TikTool Installation Script
# Pour VPS Ubuntu/Debian

set -e

echo "========================================="
echo "  TikTool - Installation Script"
echo "========================================="

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Vérification root
if [ "$EUID" -ne 0 ]; then
  echo -e "${YELLOW}Note: Ce script peut nécessiter des privilèges root pour certaines installations.${NC}"
fi

# Répertoire de base
INSTALL_DIR="${INSTALL_DIR:-/root/opt/tiktool}"
cd "$(dirname "$0")"

echo -e "\n${GREEN}[1/6] Vérification des prérequis...${NC}"

# Vérifier Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -ge 20 ]; then
        echo -e "  ✓ Node.js $(node -v) installé"
    else
        echo -e "  ${YELLOW}! Node.js version < 20 détectée. Installation de Node.js 20...${NC}"
        curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
        apt-get install -y nodejs
    fi
else
    echo -e "  ${YELLOW}! Node.js non trouvé. Installation...${NC}"
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
fi

# Vérifier npm
if command -v npm &> /dev/null; then
    echo -e "  ✓ npm $(npm -v) installé"
else
    echo -e "  ${RED}✗ npm non trouvé${NC}"
    exit 1
fi

# Vérifier Redis
if command -v redis-server &> /dev/null; then
    echo -e "  ✓ Redis installé"
else
    echo -e "  ${YELLOW}! Redis non trouvé. Installation...${NC}"
    apt-get update
    apt-get install -y redis-server
    systemctl enable redis-server
    systemctl start redis-server
fi

echo -e "\n${GREEN}[2/6] Configuration de l'environnement...${NC}"

# Créer .env si n'existe pas
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo -e "  ✓ Fichier .env créé"
else
    echo -e "  ✓ Fichier .env existant conservé"
fi

echo -e "\n${GREEN}[3/6] Installation des dépendances backend...${NC}"
cd backend
npm install
echo -e "  ✓ Dépendances backend installées"

echo -e "\n${GREEN}[4/6] Build du backend...${NC}"
npm run build
echo -e "  ✓ Backend compilé"

echo -e "\n${GREEN}[5/6] Installation des dépendances frontend...${NC}"
cd ../frontend
npm install
echo -e "  ✓ Dépendances frontend installées"

echo -e "\n${GREEN}[6/6] Build du frontend...${NC}"
npm run build
echo -e "  ✓ Frontend compilé"

cd ..

echo -e "\n${GREEN}=========================================${NC}"
echo -e "${GREEN}  Installation terminée !${NC}"
echo -e "${GREEN}=========================================${NC}"

echo -e "\n${YELLOW}Pour démarrer l'application :${NC}"
echo ""
echo "  # Avec PM2 (recommandé pour production) :"
echo "  npm install -g pm2"
echo "  pm2 start backend/dist/server.js --name tiktool-backend"
echo "  pm2 serve frontend/dist 5173 --name tiktool-frontend --spa"
echo ""
echo "  # Ou manuellement :"
echo "  cd backend && npm start &"
echo "  cd frontend && npm run preview &"
echo ""
echo -e "  Backend : http://localhost:3432"
echo -e "  Frontend : http://localhost:5173"
echo ""
echo -e "${YELLOW}Pour configurer Nginx (optionnel) :${NC}"
echo ""
cat << 'EOF'
server {
    listen 80;
    server_name votre-domaine.com;

    location / {
        root /root/opt/tiktool/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:3432;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF
