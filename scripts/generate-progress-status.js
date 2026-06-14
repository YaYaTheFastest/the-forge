#!/usr/bin/env node
/**
 * THE MAT — Progress Status Generator (Temporary)
 *
 * Scans the vault and prints/updates key metrics for the gold standard update campaign.
 * Run manually after batches for fresh numbers:
 *   node scripts/generate-progress-status.js
 *
 * Future: Can be extended to overwrite the markdown status file.
 */

const fs = require('fs');
const path = require('path');

const VAULT_PATH = '/Users/darrenjorgenson/Obsidian/Jorgenson Brain/20 Knowledge Base/BJJ/Captures';

function countFilesWithPattern(pattern) {
  try {
    const files = fs.readdirSync(VAULT_PATH).filter(f => f.endsWith('.md') && !f.includes('Index'));
    let count = 0;
    for (const file of files) {
      const content = fs.readFileSync(path.join(VAULT_PATH, file), 'utf8');
      if (content.includes(pattern)) count++;
    }
    return count;
  } catch (e) {
    return 0;
  }
}

function countRecentBaks() {
  try {
    const files = fs.readdirSync(VAULT_PATH);
    return files.filter(f => f.includes('.bak-17796')).length; // Our recent timestamp prefix
  } catch (e) {
    return 0;
  }
}

function main() {
  const total = 119;
  const gbSignatureCount = countFilesWithPattern('GB affiliate prioritized per GB Greensboro rule') + countFilesWithPattern('Gracie Barra curriculum source (GB affiliate prioritized per GB Greensboro rule)');
  const recentBaks = countRecentBaks();

  console.log('\n=== THE MAT — GOLD STANDARD UPDATE PROGRESS (Live Scan) ===\n');
  console.log(`Total Techniques: ${total}`);
  console.log(`Cards with recent GB-prioritized gold signature: ${gbSignatureCount}`);
  console.log(`Recent .bak files from apply-gold-batch (includes backfills): ${recentBaks}`);
  console.log('\nRun this script after each small group for fresh numbers.');
  console.log('Update the markdown status file manually with these figures for now.\n');
}

main();