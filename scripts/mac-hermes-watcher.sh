#!/bin/zsh
# Simple watcher for new Hermes tasks on Mac.
# Run this in background (or via launchd) while Hermes desktop app is running.
# It watches the Hermes Tasks folder and opens the newest task file.
# Customize the open command based on your Hermes desktop app.

TASKS_DIR="/Users/darrenjorgenson/Obsidian/Jorgenson Brain/00 Meta/Hermes Tasks"
HERMES_APP="Hermes Desktop"  # Change to the actual app name or CLI command, e.g. "open -a Claude" or "hermes-cli"

echo "Watching for new Hermes tasks in $TASKS_DIR ..."
echo "Make sure your Hermes desktop app is running."

fswatch -0 "$TASKS_DIR" | while read -d "" event; do
  # Find the newest .md file
  NEWEST_TASK=$(ls -t "$TASKS_DIR"/*.md 2>/dev/null | head -1)
  if [[ -n "$NEWEST_TASK" ]]; then
    echo "New task detected: $NEWEST_TASK"
    # Open in Hermes app - customize this line for your app
    # Examples:
    # open -a "$HERMES_APP" "$NEWEST_TASK"
    # or for CLI: hermes-process "$NEWEST_TASK"
    open -a "$HERMES_APP" "$NEWEST_TASK"
    # Optional: move processed tasks to a subfolder after some time
  fi
done