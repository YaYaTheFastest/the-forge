#!/bin/zsh
# Simple watcher for new Hermes tasks on Mac.
# Run this in background (or via launchd) while Hermes desktop app is running.
# It watches the Hermes Tasks folder and opens the newest task file in the desktop app.
# Hermes CLI setup with "hermes setup" as you indicated.
# Customize the open command if the terminal launch is different (e.g. hermes open file.md).

TASKS_DIR="/Users/darrenjorgenson/Obsidian/Jorgenson Brain/00 Meta/Hermes Tasks"
HERMES_APP="Hermes Desktop"  # Confirmed by user - launched via open -a "Hermes Desktop"

echo "Watching for new Hermes tasks in $TASKS_DIR ..."
echo "Make sure your Hermes desktop app is running."

fswatch -0 "$TASKS_DIR" | while read -d "" event; do
  # Find the newest .md file
  NEWEST_TASK=$(ls -t "$TASKS_DIR"/*.md 2>/dev/null | head -1)
  if [[ -n "$NEWEST_TASK" ]]; then
    echo "New task detected: $NEWEST_TASK"
    # Open in Hermes Desktop app
    open -a "$HERMES_APP" "$NEWEST_TASK"
    # Optional: move processed tasks to a subfolder after some time
  fi
done
