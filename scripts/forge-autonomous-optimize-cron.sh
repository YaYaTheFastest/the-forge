#!/bin/bash
# Forge Autonomous Optimize Cron Script
# Run daily/weekly via cron for zero-input optimization.
# e.g. crontab: 0 2 * * * /path/to/this/script.sh >> /tmp/forge-optimize.log 2>&1
#
# Uses full brain prefs: ADHD simple, visuals, anticipation, RACI, hybrid.

PROJECT_DIR="${PROJECT_DIR:-/Users/darrenjorgenson/Projects/the-mat}"  # Default for Mac; set for droplet
VAULT_DIR="${VAULT_DIR:-/opt/vault}"      # Or local Obsidian path

cd "$PROJECT_DIR" || exit 1

echo "=== Forge Autonomous Optimize Cron $(date) ==="

# Run the cycle (dry-run false for real, or use env)
# Assumes node/tsx or built. For prod, use node on dist or direct.
# Here, use tsx for dev-like; in prod build first.

if command -v npx &> /dev/null; then
  npx tsx -e '
    import { runFullOptimizeCycle } from "./lib/vault.ts";
    const args = process.argv.slice(2);
    const dry = args.includes("--dry-run");
    const focus = args.find(a => a.startsWith("--focus"))?.split("=")[1] || "all";
    const deep = args.includes("--deep");
    runFullOptimizeCycle({dryRun: dry, focus, deep}).then(r => {
      console.log(r.report);
      // Log to vault
      const fs = require("fs");
      const log = "/opt/vault/00 Meta/Systems/Forge Content Update Log.md";
      fs.appendFileSync(log, "\n\n### Cron " + new Date().toISOString() + "\n" + r.report);
    });
  ' -- "$@"
else
  echo "tsx not found, falling back to echo simulation per brain prefs"
  echo "Would run full optimize: sync, audit, anticipate (photos etc), apply Gold Standard, RACI log, report."
fi

# Optional: pm2 restart
pm2 restart the-mat --update-env || echo "pm2 note"

echo "=== End Cron ==="
