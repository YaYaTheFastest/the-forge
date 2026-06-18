#!/bin/zsh
# MAGIC ONE-COMMAND UPDATE (run from your Mac)
#
# This pulls latest code from GitHub (triggers any auto-deploy if needed),
# syncs your local vault to the droplet (so remote chat sees fresh content),
# and gives you the live URL.
#
# After running this, the app on the droplet has the latest everything.
# You can then use the floating Grok chat on the live site (https://rockinjracing.com)
# to ask questions or request updates. Many updates will complete automatically
# with no further steps from you (the backend writes directly to the droplet's vault).
#
# For full zero-Mac: Once deployed, you never need to run this again unless you
# make Obsidian edits on your Mac that you want on the live site.
# The chat on the live site handles updates without touching your Mac.

set -e

echo "=== The Forge Magic Update ==="
echo "1. Pulling latest code changes from GitHub..."
git pull origin main || echo "(No git changes or not a git dir - continuing)"

echo ""
echo "2. Syncing local vault to droplet (so remote app/chat sees it)..."
./scripts/sync-vault-to-droplet.sh

echo ""
echo "3. (Optional) If you want to force a code redeploy, push to GitHub now:"
echo "   git add . && git commit -m 'magic update' && git push"
echo "   (the GH Action will auto-deploy to the droplet)"

echo ""
echo "=== Done ==="
echo "Live app (with floating chat that can read/write the live vault):"
echo "https://rockinjracing.com"
echo ""
echo "NOTE: The site is protected with HTTP Basic Auth (username + password)."
echo "You will be prompted in the browser on first visit. Save the password in your browser."
echo ""
echo "Use the chat button on the live site for questions + updates."
echo "No Mac required for access or chat-driven changes."