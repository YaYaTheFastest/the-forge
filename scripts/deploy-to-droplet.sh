#!/bin/zsh
set -e

echo "Building locally..."
npm run build

echo "Preparing deployment to droplet..."

if ! command -v sshpass >/dev/null 2>&1; then
  echo "sshpass not found. Installing via Homebrew..."
  if command -v brew >/dev/null 2>&1; then
    brew install sshpass
  else
    echo "Please install Homebrew and sshpass."
    exit 1
  fi
fi

if [ -z "$DROPLET_PASS" ]; then
  PASS_FILE="$HOME/.config/the-mat/droplet.pass"
  if [ -f "$PASS_FILE" ] && [ -r "$PASS_FILE" ]; then
    DROPLET_PASS=$(cat "$PASS_FILE")
    export DROPLET_PASS
    echo "Loaded droplet password from secure file."
  fi
fi

if [ -z "$DROPLET_PASS" ]; then
  echo -n "Enter droplet root password (paste here - input hidden): "
  read -s DROPLET_PASS
  echo
  export DROPLET_PASS
fi

if [ -z "$DROPLET_PASS" ]; then
  echo "No password provided."
  exit 1
fi

echo "Ensuring remote directories exist..."
sshpass -p "$DROPLET_PASS" ssh -o StrictHostKeyChecking=no root@161.35.97.99 \
  'mkdir -p /opt/the-mat/app/api/forge/grok-chat /opt/the-mat/app/components /opt/the-mat/lib /opt/the-mat/app/forge /opt/the-mat/app/domains /opt/the-mat/app'

echo "Syncing updated files to droplet (including landing page bubbles)..."
sshpass -p "$DROPLET_PASS" scp -o StrictHostKeyChecking=no -r app/forge root@161.35.97.99:/opt/the-mat/app/
sshpass -p "$DROPLET_PASS" scp -o StrictHostKeyChecking=no -r app/domains root@161.35.97.99:/opt/the-mat/app/
sshpass -p "$DROPLET_PASS" scp -o StrictHostKeyChecking=no app/page.tsx root@161.35.97.99:/opt/the-mat/app/page.tsx
sshpass -p "$DROPLET_PASS" scp -o StrictHostKeyChecking=no app/layout.tsx root@161.35.97.99:/opt/the-mat/app/layout.tsx
sshpass -p "$DROPLET_PASS" scp -o StrictHostKeyChecking=no app/globals.css root@161.35.97.99:/opt/the-mat/app/globals.css
sshpass -p "$DROPLET_PASS" scp -o StrictHostKeyChecking=no app/components/FloatingGrokButton.tsx root@161.35.97.99:/opt/the-mat/app/components/
sshpass -p "$DROPLET_PASS" scp -o StrictHostKeyChecking=no app/api/forge/grok-chat/route.ts root@161.35.97.99:/opt/the-mat/app/api/forge/grok-chat/route.ts
sshpass -p "$DROPLET_PASS" scp -o StrictHostKeyChecking=no lib/vault.ts root@161.35.97.99:/opt/the-mat/lib/vault.ts

echo "Running remote build and restart (start if not running)..."
sshpass -p "$DROPLET_PASS" ssh -o StrictHostKeyChecking=no root@161.35.97.99 '
  cd /opt/the-mat && 
  npm install framer-motion && 
  npm run build && 
  pm2 restart the-mat --update-env || pm2 start npm --name "the-mat" -- start --update-env
'

echo "Deployment complete!"
echo "Landing page (root of rockinjracing.com) should now be the bubbles."
unset DROPLET_PASS
