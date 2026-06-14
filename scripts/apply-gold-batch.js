#!/usr/bin/env node
/**
 * THE MAT — Gold Standard Batch Updater (Reusable)
 *
 * Usage:
 *   node scripts/apply-gold-batch.js --payload path/to/research-payload.json
 *
 * Payload format (JSON):
 * {
 *   "GB1-W01-B2 - X-Collar Choke (Four Fingers).md": {
 *     "frontmatter": { "name": "...", "position": "closed-guard", "principle_tags": [...], "related_techniques": [...], "videos": [...] , ... },
 *     "body": "## Concept\n\n... full researched body up to but not including Personal Cues ..."
 *   },
 *   ...
 * }
 *
 * Safety guarantees:
 * - Timestamped .bak- files created for every modified card.
 * - Personal Cues & Notes extracted from original and appended verbatim (never overwritten).
 * - Arrays (principle_tags, related_techniques, videos, gb_curriculum) are merged + deduped.
 * - Frontmatter is merged intelligently.
 * - Body before Personal Cues is fully replaced with researched gold content.
 */

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const VAULT_PATH = '/Users/darrenjorgenson/Obsidian/Jorgenson Brain/20 Knowledge Base/BJJ/Captures';

function getArg(name) {
  const idx = process.argv.indexOf(name);
  return idx !== -1 && process.argv[idx + 1] ? process.argv[idx + 1] : null;
}

function backupFile(filePath) {
  const backupPath = filePath + '.bak-' + Date.now();
  fs.copyFileSync(filePath, backupPath);
  return backupPath;
}

function extractPersonalCues(body) {
  const match = body.match(/##{1,3}\s*Personal Cues & Notes\s*([\s\S]*?)(?=\n##{1,3}|$)/i);
  return match ? match[1].trim() : '';
}

function mergeArrays(existing, incoming) {
  const ex = Array.isArray(existing) ? existing : (existing ? [existing] : []);
  const inc = Array.isArray(incoming) ? incoming : (incoming ? [incoming] : []);
  return Array.from(new Set([...ex, ...inc]));
}

function applyCardUpdate(fileName, update) {
  const fullPath = path.join(VAULT_PATH, fileName);
  if (!fs.existsSync(fullPath)) {
    console.log(`✗ File not found: ${fileName}`);
    return false;
  }

  const raw = fs.readFileSync(fullPath, 'utf8');
  const { data: originalData, content: originalBody } = matter(raw);

  const personalCues = extractPersonalCues(originalBody);

  // Build new frontmatter (intelligent merge)
  const newData = { ...originalData, ...update.frontmatter };

  // Array merges
  if (update.frontmatter.principle_tags) {
    newData.principle_tags = mergeArrays(originalData.principle_tags, update.frontmatter.principle_tags);
  }
  if (update.frontmatter.related_techniques) {
    newData.related_techniques = mergeArrays(originalData.related_techniques, update.frontmatter.related_techniques);
  }
  if (update.frontmatter.videos) {
    const existingVideos = Array.isArray(originalData.videos) ? originalData.videos : [];
    newData.videos = mergeArrays(existingVideos, update.frontmatter.videos);
  }
  if (update.frontmatter.gb_curriculum) {
    newData.gb_curriculum = mergeArrays(originalData.gb_curriculum, update.frontmatter.gb_curriculum);
  }

  // Rebuild body: researched gold content + preserved personal cues
  let newBody = (update.body || '').trim();
  if (personalCues) {
    newBody = newBody.replace(/##\s*Personal Cues & Notes[\s\S]*$/i, '').trim();
    newBody += `\n\n## Personal Cues & Notes\n\n${personalCues}\n`;
  } else {
    newBody += `\n\n## Personal Cues & Notes\n\n`;
  }

  const newFileContent = matter.stringify(newBody, newData);

  const backup = backupFile(fullPath);
  fs.writeFileSync(fullPath, newFileContent, 'utf8');

  console.log(`✓ Updated: ${fileName}`);
  console.log(`  Backup: ${path.basename(backup)}`);
  return true;
}

function run() {
  const payloadPath = getArg('--payload');
  if (!payloadPath) {
    console.error('Usage: node scripts/apply-gold-batch.js --payload path/to/payload.json');
    process.exit(1);
  }

  if (!fs.existsSync(payloadPath)) {
    console.error('Payload file not found:', payloadPath);
    process.exit(1);
  }

  const payload = JSON.parse(fs.readFileSync(payloadPath, 'utf8'));
  const cards = Object.keys(payload);

  console.log('=== THE MAT — GOLD STANDARD BATCH UPDATER ===\n');
  console.log(`Payload: ${payloadPath}`);
  console.log(`Cards to update: ${cards.length}\n`);

  let updated = 0;
  let failed = 0;

  for (const fileName of cards) {
    try {
      if (applyCardUpdate(fileName, payload[fileName])) {
        updated++;
      } else {
        failed++;
      }
    } catch (e) {
      console.error(`✗ Error on ${fileName}:`, e.message);
      failed++;
    }
  }

  console.log(`\n=== Batch complete: ${updated} updated, ${failed} failed ===`);
  console.log('Backups created with .bak- timestamp suffix in the vault.');
}

run();
