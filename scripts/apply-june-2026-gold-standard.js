const fs = require('fs');
const path = require('path');

// Simple script to create Hermes tasks for all techniques to re-polish to June 2026 standard.
// Run with node to generate tasks. Hermes will then find photos etc.

const capturesDir = '/Users/darrenjorgenson/Obsidian/Jorgenson Brain/20 Knowledge Base/BJJ/Captures';
const taskDir = '/Users/darrenjorgenson/Obsidian/Jorgenson Brain/00 Meta/Hermes Tasks';

if (!fs.existsSync(taskDir)) fs.mkdirSync(taskDir, { recursive: true });

const files = fs.readdirSync(capturesDir).filter(f => f.endsWith('.md') && !f.startsWith('_') && !f.includes('README') && (f.startsWith('GB1-') || f.includes('Guard') || f.includes('Mount') || f.includes('Sweep')) );

console.log(`Found ${files.length} technique cards. Creating June 2026 tasks...`);

const today = new Date().toISOString().slice(0,10);

const permanentRef = `Read and strictly follow:
- 00 Meta/Systems/BJJ - Permanent Best Quality Standing Instructions for Hermes & Grok.md
- Hermes - BJJ Card Golden Standard Instructions.md
- JUNE 2026 GOLD STANDARD BJJ CARD TEMPLATE.md

Use the EXACT structure. Especially find and include VISIBLE photos as ![[...jpg]] in Observe section. Research images for the technique.`;

files.forEach((file, idx) => {
  const slug = file.replace('.md', '');
  const name = slug.replace(/GB1-[^ ]+ - /, '').replace(/-/g, ' ');
  const taskName = `${today} - June2026-Gold-${idx.toString().padStart(3,'0')}-${slug.slice(0,50).replace(/[^a-z0-9]/gi,'-')}.md`;
  const content = `# Hermes Polish Task: Re-polish ${name} to JUNE 2026 GOLD STANDARD

**Technique file**: 20 Knowledge Base/BJJ/Captures/${file}
**Priority**: High

## Instructions (non-negotiable)
${permanentRef}

**PHOTOS**: Specifically find high-quality photos of this technique (search " ${name} bjj photo", GB1 curriculum stills, competition footage screenshots). Embed visibly with ![[${slug.toLowerCase().replace(/\\s+/g,'-')}-photo.jpg|500]] etc. in the Observe section. Make them render in the final card.

Use the full current content of the card as baseline and rewrite to the exact June 2026 template.

## Current Content (baseline)
---
${fs.readFileSync(path.join(capturesDir, file), 'utf8').slice(0, 2000)}
---

## Output
Append the full polished card (frontmatter + full sections with photo embeds) under:

## Polished Card Output (June 2026 Gold Standard)

[full card here]

Then the system can apply it.
`;

  fs.writeFileSync(path.join(taskDir, taskName), content);
  if (idx % 20 === 0) console.log(`Created ${idx} tasks...`);
});

console.log(`Done. Created tasks for ${files.length} cards in ${taskDir}`);
console.log('User/Hermes watcher can now process them via Telegram or desktop.');
