#!/bin/bash
# Watches the exact Health Auto Export source directory the user designated.
# When new HealthExport-*.json files appear, prints a notification line.
# This is intended to be run via the `monitor` tool or in background.

SOURCE_DIR="/Users/darrenjorgenson/Library/Mobile Documents/iCloud~com~ifunography~HealthExport/Documents/Obsidian Fitness Export"
STATE_FILE="/Users/darrenjorgenson/Projects/the-mat/scripts/health/.last_health_export_check"

mkdir -p "$(dirname "$STATE_FILE")"

if [ ! -f "$STATE_FILE" ]; then
  # First run: touch with a time in the past so we see recent files
  touch -t 202605240000 "$STATE_FILE"
  echo "HEALTH_WATCH: First run - will report any files newer than 2026-05-24"
fi

while true; do
  find "$SOURCE_DIR" -type f -name "HealthExport-*.json" -newer "$STATE_FILE" 2>/dev/null | while read -r file; do
    filename=$(basename "$file")
    echo "NEW_HEALTH_EXPORT:$filename:$file"
  done
  touch "$STATE_FILE"
  sleep 45
done
