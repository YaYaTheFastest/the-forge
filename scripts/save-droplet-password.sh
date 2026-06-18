#!/bin/zsh
# To use: source ./scripts/save-droplet-password.sh
# (or . ./scripts/save-droplet-password.sh )
# This will prompt for password and export in CURRENT shell.
echo "Securely save droplet password for this shell session (zsh compatible)."
read -s "?Paste droplet root password (input hidden): " DROPLET_PASS
echo
export DROPLET_PASS
echo "Password saved in \$DROPLET_PASS for this terminal session."
echo "Now run: ./scripts/deploy-to-droplet.sh"
echo "It will use the saved password without prompting again."
echo "To clear: unset DROPLET_PASS"
