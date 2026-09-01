#!/usr/bin/env bash
# ============================================================
#  CipherNest — First-run Setup
#  Usage: chmod +x setup.sh && ./setup.sh
# ============================================================
set -e

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; BOLD='\033[1m'; NC='\033[0m'

echo -e "\n${BOLD}${CYAN}⬡  CipherNest — Adversarial Deception Platform${NC}"
echo -e "${CYAN}   First-run setup${NC}\n"

# ── 1. Check prerequisites ──────────────────────────────────
echo -e "${BOLD}[1/5] Checking prerequisites...${NC}"

check_cmd() {
  if command -v "$1" &>/dev/null; then
    echo -e "  ${GREEN}✓${NC} $1 found ($(command -v $1))"
  else
    echo -e "  ${RED}✗${NC} $1 not found — ${2}"
    MISSING=1
  fi
}

MISSING=0
check_cmd node    "Install from https://nodejs.org"
check_cmd python3 "Install from https://python.org"
check_cmd pip3    "Usually ships with Python 3"
check_cmd docker  "Install from https://docker.com (optional, for honeypot containers)"

if [ "$MISSING" = "1" ]; then
  echo -e "\n${RED}Install missing prerequisites above, then re-run this script.${NC}"
  exit 1
fi

# ── 2. Copy .env ──────────────────────────────────────────────
echo -e "\n${BOLD}[2/5] Environment configuration...${NC}"
if [ ! -f .env ]; then
  if [ -f .env.example ]; then
    cp .env.example .env
    echo -e "  ${YELLOW}⚠${NC}  Copied .env.example → .env"
    echo -e "  ${YELLOW}→${NC}  Edit .env and fill in your OPENCODE_API_KEY, SMTP_*, DATABASE_URL"
  else
    echo -e "  ${YELLOW}⚠${NC}  No .env found. Create one with your credentials."
  fi
else
  echo -e "  ${GREEN}✓${NC} .env already exists"
fi

# ── 3. Node dependencies ──────────────────────────────────────
echo -e "\n${BOLD}[3/5] Installing Node.js dependencies...${NC}"
if command -v bun &>/dev/null; then
  bun install
else
  npm install
fi
echo -e "  ${GREEN}✓${NC} Node deps installed"

# ── 4. Python dependencies ────────────────────────────────────
echo -e "\n${BOLD}[4/5] Installing Python dependencies...${NC}"
pip3 install -r backend/requirements.txt --quiet
echo -e "  ${GREEN}✓${NC} Python deps installed"

# ── 5. Build Docker honeypot image (optional) ─────────────────
echo -e "\n${BOLD}[5/5] Building Docker honeypot image (optional)...${NC}"
if command -v docker &>/dev/null && docker info &>/dev/null 2>&1; then
  docker build -f docker/Dockerfile.honeypot -t ciphernest-honeypot-01 docker/ --quiet \
    && echo -e "  ${GREEN}✓${NC} ciphernest-honeypot-01 image built" \
    || echo -e "  ${YELLOW}⚠${NC}  Docker build failed — honeypot containers will show 'error' status"
else
  echo -e "  ${YELLOW}⚠${NC}  Docker not running — skipping honeypot image build"
fi

# ── Done ──────────────────────────────────────────────────────
echo -e "\n${GREEN}${BOLD}✓  Setup complete!${NC}\n"
echo -e "  ${BOLD}Run the app:${NC}"
echo -e "    ${CYAN}npm run electron${NC}          # Electron desktop app (starts everything)"
echo -e "    ${CYAN}npm run dev:all${NC}            # Dev mode: FastAPI + Next.js in terminal"
echo -e "    ${CYAN}python3 backend/main.py${NC}    # Python backend only (API :8000 + SSH :2222 + Beacon :8001)"
echo -e "    ${CYAN}npx next dev${NC}               # Next.js frontend only"
echo ""
