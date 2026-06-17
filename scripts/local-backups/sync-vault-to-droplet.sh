#!/bin/zsh
# Frictionless vault sync between your Mac (Obsidian editing) and DigitalOcean droplet (remote app).
#
# GOAL: Run the app 24/7 on the droplet so you can access it from anywhere (phone, any computer).
#       Use the in-app floating Grok chat on the live site to ask questions or request updates.
#       The chat backend runs on the droplet and can read/write the live /opt/vault directly.
#       Run this script from your Mac only when you want to pull remote changes into your local Obsidian
#       or push local Obsidian edits to the droplet.
#
# USAGE (run from your Mac Terminal):
#   ./scripts/sync-vault-to-droplet.sh          # push Mac vault -> droplet (after local Obsidian edits)
#   ./scripts/sync-vault-to-droplet.sh --pull   # pull droplet vault -> Mac (to see remote chat updates in Obsidian)
#
# The app on the droplet serves at https://rockinjracing.com (protected by basic auth) after nginx setup.
# Once deployed, you never need the Mac running for access or chat-driven updates.

set -e

VAULT_SRC="/Users/darrenjorgenson/Obsidian/Jorgenson Brain/"
DROPLET="root@161.35.97.99"
DROPLET_VAULT="/opt/vault"

PULL=false
if [[ "$1" == "--pull" ]]; then
  PULL=true
fi

if $PULL; then
  echo "Pulling vault FROM droplet -> local Mac (for Obsidian)..."
  rsync -avz --delete \
    --exclude='.git' \
    --exclude='.obsidian' \
    --exclude='*.bak' \
    --exclude='node_modules' \
    --exclude='.DS_Store' \
    "$DROPLET:$DROPLET_VAULT/" \
    "$VAULT_SRC"
  echo "Vault pulled to Mac. Open Obsidian to see updates made via the remote chat."
else
  echo "Pushing local Mac vault -> droplet (for the live app)..."
  rsync -avz --delete \
    --exclude='.git' \
    --exclude='.obsidian' \
    --exclude='*.bak' \
    --exclude='node_modules' \
    --exclude='.DS_Store' \
    "$VAULT_SRC" \
    "$DROPLET:$DROPLET_VAULT/"
  echo "Vault pushed to droplet."
fi

# Optional hard refresh of the running app (uncomment if you want automatic restart after sync)
# echo "Restarting the app on droplet..."
# ssh "$DROPLET" 'cd /root/the-forge && pm2 restart the-forge --update-env || pm2 start npm --name "the-forge" -- start'

echo "Done. Access the live app (with floating chat) at https://rockinjracing.com"
echo "The site requires HTTP Basic Auth (browser will prompt)."
echo "The chat on the live site can directly update the droplet's vault with no Mac involvement."