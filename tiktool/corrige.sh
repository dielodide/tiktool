#!/usr/bin/env bash
set -e

# ──────────────────────────────────────────────────────────────────
BLUE='\033[1;34m'; GREEN='\033[1;32m'; RED='\033[1;31m'; YELLOW='\033[1;33m'; NC='\033[0m'
log()  { echo -e "${BLUE}[TikTool]${NC} $1"; }
ok()   { echo -e "${GREEN}[✓]${NC} $1"; }
warn() { echo -e "${YELLOW}[!]${NC} $1"; }
die()  { echo -e "${RED}[✗]${NC} $1"; exit 1; }

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"
ENV_FILE="$BACKEND_DIR/.env"

echo ""
echo -e "${BLUE}╔════════════════════════════════╗${NC}"
echo -e "${BLUE}║   TikTool — Script corrige.sh      ║${NC}"
echo -e "${BLUE}╚════════════════════════════════╝${NC}"
echo ""

# ─────────────────────────────────────────────────────────────────
# ÉTAPE 1 — Désinstaller Chromium classique
# ─────────────────────────────────────────────────────────────────
log "Etape 1/7 — Suppression de chromium si installé..."
if dpkg -l | grep -q '^ii.*chromium'; then
  apt-get remove --purge -y chromium chromium-common chromium-driver 2>/dev/null || true
  apt-get autoremove -y 2>/dev/null || true
  ok "Chromium désinstallé"
else
  warn "Chromium n'était pas installé, skip"
fi

# ─────────────────────────────────────────────────────────────────
# ÉTAPE 2 — Dépendances système Puppeteer
# ─────────────────────────────────────────────────────────────────
log "Etape 2/7 — Installation des dépendances système..."
apt-get update -qq
apt-get install -y \
  ca-certificates fonts-liberation libasound2 libatk-bridge2.0-0 \
  libatk1.0-0 libcups2 libdbus-1-3 libdrm2 libgbm1 libglib2.0-0 \
  libnspr4 libnss3 libx11-6 libx11-xcb1 libxcb1 libxcb-dri3-0 \
  libxcomposite1 libxdamage1 libxext6 libxfixes3 libxkbcommon0 \
  libxrandr2 libxshmfence1 wget 2>/dev/null
ok "Dépendances système installées"

# ─────────────────────────────────────────────────────────────────
# ÉTAPE 3 — npm install backend (+ puppeteer + typescript)
# ─────────────────────────────────────────────────────────────────
log "Etape 3/7 — npm install backend..."
cd "$BACKEND_DIR"
npm install
npm install --save-dev typescript ts-node-dev
ok "npm install backend terminé"

# ─────────────────────────────────────────────────────────────────
# ÉTAPE 4 — Installer chrome-headless-shell via Puppeteer
# ─────────────────────────────────────────────────────────────────
log "Etape 4/7 — Installation chrome-headless-shell..."
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
  npx @puppeteer/browsers install chrome-headless-shell@stable

# Détecter le path installé automatiquement
HEADLESS_PATH=$(find "$HOME/.cache/puppeteer" -name "chrome-headless-shell" -type f 2>/dev/null | head -1)

if [ -z "$HEADLESS_PATH" ]; then
  die "chrome-headless-shell introuvable après install. Vérifie manuellement dans ~/.cache/puppeteer"
fi

ok "chrome-headless-shell trouvé : $HEADLESS_PATH"
chmod +x "$HEADLESS_PATH"

# ─────────────────────────────────────────────────────────────────
# ÉTAPE 5 — Générer / mettre à jour le .env
# ─────────────────────────────────────────────────────────────────
log "Etape 5/7 — Mise à jour du .env..."

# Créer .env s'il n'existe pas
if [ ! -f "$ENV_FILE" ]; then
  touch "$ENV_FILE"
fi

# Fonction pour set/update une clé dans .env
set_env() {
  local KEY="$1"
  local VALUE="$2"
  if grep -q "^${KEY}=" "$ENV_FILE"; then
    sed -i "s|^${KEY}=.*|${KEY}=${VALUE}|" "$ENV_FILE"
  else
    echo "${KEY}=${VALUE}" >> "$ENV_FILE"
  fi
}

set_env "PORT" "4000"
set_env "REDIS_URL" "redis://127.0.0.1:6379"
set_env "FRONTEND_ORIGIN" "http://$(hostname -I | awk '{print $1}'):5173"
set_env "CACHE_TTL_PROFILE" "300"
set_env "CACHE_TTL_VIDEOS" "180"
set_env "RATE_LIMIT_RPM" "30"
set_env "PUPPETEER_EXECUTABLE_PATH" "$HEADLESS_PATH"
set_env "PUPPETEER_SKIP_CHROMIUM_DOWNLOAD" "true"
set_env "TIKTOK_USER_AGENT" "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"

ok ".env mis à jour :"
cat "$ENV_FILE"

# ─────────────────────────────────────────────────────────────────
# ÉTAPE 6 — Build TypeScript backend
# ─────────────────────────────────────────────────────────────────
log "Etape 6/7 — Build TypeScript..."
cd "$BACKEND_DIR"
npx tsc
ok "Build TypeScript terminé"

# ─────────────────────────────────────────────────────────────────
# ÉTAPE 7 — npm install frontend
# ─────────────────────────────────────────────────────────────────
if [ -d "$FRONTEND_DIR" ]; then
  log "Etape 7/7 — npm install frontend..."
  cd "$FRONTEND_DIR"
  npm install
  ok "npm install frontend terminé"
else
  warn "Dossier frontend introuvable, skip"
fi

# ─────────────────────────────────────────────────────────────────
# DONE
# ─────────────────────────────────────────────────────────────────
echo ""
echo -e "${GREEN}╔════════════════════════════════╗${NC}"
echo -e "${GREEN}║   ✓ TikTool prêt à démarrer!        ║${NC}"
echo -e "${GREEN}╚════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}Lancer le backend :${NC}"
echo -e "  cd $BACKEND_DIR && npm start"
echo ""
echo -e "${YELLOW}Lancer le frontend (autre terminal) :${NC}"
echo -e "  cd $FRONTEND_DIR && npm run dev"
echo ""
echo -e "${YELLOW}Ou en dév (avec hot-reload) :${NC}"
echo -e "  cd $BACKEND_DIR && npm run dev"
echo ""
echo -e "${BLUE}chrome-headless-shell :${NC} $HEADLESS_PATH"
echo ""
