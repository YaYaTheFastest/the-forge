#!/bin/zsh
# To use: source ./scripts/save-droplet-password.sh
# (or . ./scripts/save-droplet-password.sh )
# This will prompt for password and export in CURRENT shell.
echo "Securely save droplet password for this shell session (zsh compatible)."
read -s "?Paste droplet root password (input hidden): " DROPLET_PASS
echo
export DROPLET_PASS
echo "Password saved in \$DROPLET_PASS for this terminal session."

# Optional: persist to a protected file for future non-interactive runs (e.g. in agent/tool shells)
PASS_FILE="$HOME/.config/the-mat/droplet.pass"
mkdir -p "$(dirname "$PASS_FILE")"
if [ -n "$DROPLET_PASS" ]; then
  echo -n "$DROPLET_PASS" > "$PASS_FILE"
  chmod 600 "$PASS_FILE"
  echo "Also saved securely to $PASS_FILE (600 perms) for script use without re-paste."
fi

echo "Now run: ./scripts/deploy-to-droplet.sh"
echo "It will use the saved password without prompting again."
echo "To clear: unset DROPLET_PASS"
