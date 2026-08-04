#!/usr/bin/env bash
set -euo pipefail

echo "==> Instalando dependências (npm install)..."
npm install

echo "==> Gerando Prisma Client..."
npx prisma generate

echo "==> Configurando .env a partir dos secrets do Codespaces..."
if [ ! -f .env ]; then
  : > .env
  add_env() {
    local key="$1"
    if [ -n "${!key:-}" ]; then
      printf '%s=%s\n' "$key" "${!key}" >> .env
      echo "  - $key configurado"
    fi
  }
  add_env DATABASE_URL
  add_env NEXTAUTH_SECRET
  add_env NEXTAUTH_URL
  add_env NEXT_PUBLIC_APP_URL
  add_env NEXT_PUBLIC_VAPID_PUBLIC_KEY
  add_env VAPID_PRIVATE_KEY
  add_env VAPID_SUBJECT
  add_env STRIPE_SECRET_KEY
  add_env STRIPE_PREMIUM_PRICE_ID
  add_env STRIPE_WEBHOOK_SECRET

  if ! grep -q '^DATABASE_URL=' .env; then
    echo "!! ATENÇÃO: faltou DATABASE_URL. Adicione em GitHub > repo > Settings > Secrets and variables > Codespaces"
  fi
  if ! grep -q '^NEXTAUTH_SECRET=' .env; then
    echo "!! ATENÇÃO: faltou NEXTAUTH_SECRET. Adicione o mesmo secret usado no Vercel."
  fi
else
  echo "==> .env já existe no container, mantendo como está."
fi

echo "==> Instalando Vercel CLI (para publicar direto do Codespace)..."
npm install -g vercel >/dev/null 2>&1 || echo "(vercel CLI opcional — siga se quiser publicar daqui)"

echo "==> Instalando browser do Playwright (para E2E na nuvem)..."
npx playwright install chromium --with-deps || echo "(sem browser do Playwright — só afeta a suíte E2E local ao container)"

echo "==> Setup concluído."
