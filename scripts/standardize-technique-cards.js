const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const VAULT_PATH = '/Users/darrenjorgenson/Obsidian/Jorgenson Brain/20 Knowledge Base/BJJ/Captures';

// Gold-standard canonical section order and names (from the Triangle Retention card)
const CANONICAL_SECTIONS = [
  'Concept',
  'Setup',
  'Execution',
  'Common Mistakes',
  'Key Principles',
  'Media & Visual References',
  'Personal Cues & Notes'
];

function cleanName(name) {
  if (!name) return name;
  // Remove leading date + trailing " — Instructor"
  return name.replace(/^\d{4}-\d{2}-\d{2}\s+/, '').replace(/\s*[—–-]\s+.*$/, '').trim();
}

function normalizeFrontmatter(data, originalFileName) {
  const cleaned = { ...data };

  // Clean name to pure technique title
  if (cleaned.name) {
    cleaned.name = cleanName(cleaned.name);
  } else {
    // Derive from filename as last resort
    cleaned.name = cleanName(originalFileName.replace(/\.md$/, ''));
  }

  // Ensure arrays
  cleaned.videos = Array.isArray(cleaned.videos) ? cleaned.videos : (cleaned.video ? [cleaned.video] : []);
  if (cleaned.video) delete cleaned.video;

  cleaned.photos = Array.isArray(cleaned.photos) ? cleaned.photos : [];
  cleaned.principle_tags = Array.isArray(cleaned.principle_tags) ? cleaned.principle_tags : [];
  cleaned.related_techniques = Array.isArray(cleaned.related_techniques) ? cleaned.related_techniques : [];
  cleaned.gb_curriculum = Array.isArray(cleaned.gb_curriculum) ? cleaned.gb_curriculum : [];

  // Normalize category/position to lowercase kebab where reasonable (light touch)
  if (cleaned.category) cleaned.category = String(cleaned.category).toLowerCase().replace(/\s+/g, '-');
  if (cleaned.position) cleaned.position = String(cleaned.position).toLowerCase().replace(/\s+/g, '-');

  return cleaned;
}

// Very heuristic section mapper — maps common old headings to gold standard
function mapToCanonicalSection(heading) {
  const h = heading.toLowerCase().trim();
  if (h.includes('concept') || h.includes('overview') || h.includes('what')) return 'Concept';
  if (h.includes('setup') || h.includes('entry') || h.includes('starting')) return 'Setup';
  if (h.includes('execution') || h.includes('how to') || h.includes('steps') || h.includes('perform')) return 'Execution';
  if (h.includes('mistake') || h.includes('error') || h.includes('avoid') || h.includes('common')) return 'Common Mistakes';
  if (h.includes('principle') || h.includes('key point') || h.includes('why')) return 'Key Principles';
  if (h.includes('media') || h.includes('video') || h.includes('photo') || h.includes('visual')) return 'Media & Visual References';
  if (h.includes('personal') || h.includes('note') || h.includes('cue') || h.includes('my')) return 'Personal Cues & Notes';
  return null;
}

function extractPersonalCues(body) {
  const match = body.match(/##{1,3}\s*Personal Cues & Notes\s*([\s\S]*?)(?=\n##{1,3}|$)/i);
  return match ? match[1].trim() : '';
}

function rebuildBodyWithGoldStructure(originalBody, originalData) {
  const personalCues = extractPersonalCues(originalBody);

  // Split body into sections heuristically
  const sectionRegex = /^##{1,3}\s+(.+?)\s*$/gm;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = sectionRegex.exec(originalBody)) !== null) {
    if (lastIndex < match.index) {
      parts.push({ heading: null, content: originalBody.slice(lastIndex, match.index).trim() });
    }
    parts.push({ heading: match[1].trim(), content: '' });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < originalBody.length) {
    parts.push({ heading: null, content: originalBody.slice(lastIndex).trim() });
  }

  // Bucket content into canonical sections
  const buckets = {};
  CANONICAL_SECTIONS.forEach(s => buckets[s] = '');

  let currentBucket = 'Concept'; // default starting bucket

  for (const part of parts) {
    if (part.heading) {
      const mapped = mapToCanonicalSection(part.heading);
      if (mapped) currentBucket = mapped;
    }
    if (part.content) {
      buckets[currentBucket] = (buckets[currentBucket] || '') + '\n' + part.content;
    }
  }

  // Build the new body in strict gold-standard order
  let newBody = '';

  // Concept
  if (buckets['Concept'].trim()) {
    newBody += `## Concept\n\n${buckets['Concept'].trim()}\n\n`;
  } else {
    newBody += `## Concept\n\n[One-paragraph explanation of what this technique accomplishes and when to use it.]\n\n`;
  }

  // Setup
  if (buckets['Setup'].trim()) {
    newBody += `## Setup\n\n${buckets['Setup'].trim()}\n\n`;
  } else {
    newBody += `## Setup\n\n[Prerequisites, starting position, and what the opponent is doing. Include wikilinks to entries.]\n\n`;
  }

  // Execution (with gold-standard Hand Placement emphasis)
  let exec = buckets['Execution'].trim();
  if (!exec) exec = '[Detailed steps. Be extremely specific about grips, posture, weight distribution, and timing.]';

  newBody += `## Execution\n\n${exec}\n\n`;

  // Add a Hand Placement Reference subsection if not obviously present
  if (!/hand placement|hand position|grip|posture/i.test(exec)) {
    newBody += `### Hand Placement Reference\n- See related techniques for exact grip mechanics: [[Add wikilink here]]\n\n`;
  }

  // Common Mistakes
  if (buckets['Common Mistakes'].trim()) {
    newBody += `## Common Mistakes\n\n${buckets['Common Mistakes'].trim()}\n\n`;
  } else {
    newBody += `## Common Mistakes\n\n- [Common error 1]\n- [Common error 2]\n\n`;
  }

  // Key Principles (very important for the user's filtering needs)
  if (buckets['Key Principles'].trim()) {
    newBody += `## Key Principles\n\n${buckets['Key Principles'].trim()}\n\n`;
  } else {
    newBody += `## Key Principles\n\n- [Core principle 1 — short and memorable]\n- [Core principle 2]\n\n`;
  }

  // Media & Visual References (gold standard location)
  if (buckets['Media & Visual References'].trim()) {
    newBody += `## Media & Visual References\n\n${buckets['Media & Visual References'].trim()}\n\n`;
  } else {
    newBody += `## Media & Visual References\n\n### Videos\n\n*Prioritize YouTube. Add with title, instructor, timestamp, and why the visual is valuable (especially hand placement or timing).*\n\n### Recommended Photos / Diagrams\n\n- Close-up of critical hand placement or hip position\n- Photo showing key angle/posture difference\n\n`;
  }

  // Personal Cues — always last and untouched
  newBody += `## Personal Cues & Notes\n\n${personalCues}\n`;

  return newBody.trim() + '\n';
}

function standardizeFile(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const { data, content: body } = matter(raw);

  const fileName = path.basename(filePath);
  const normalizedData = normalizeFrontmatter(data, fileName);
  const newBody = rebuildBodyWithGoldStructure(body, normalizedData);

  // Reconstruct with gray-matter (preserves frontmatter formatting reasonably)
  const newFileContent = matter.stringify(newBody, normalizedData);

  if (newFileContent !== raw) {
    fs.writeFileSync(filePath, newFileContent, 'utf8');
    return true;
  }
  return false;
}

function run() {
  console.log('=== THE MAT — GOLD STANDARD STRUCTURAL STANDARDIZER ===\n');
  console.log('Target structure based on: Counter to Triangle Stack Escape (Roy Dean)\n');

  const files = fs.readdirSync(VAULT_PATH)
    .filter(f => f.endsWith('.md') && !f.startsWith('_') && !f.includes('Quality_Audit'));

  let updated = 0;
  let skipped = 0;

  files.forEach(file => {
    const fullPath = path.join(VAULT_PATH, file);
    try {
      if (standardizeFile(fullPath)) {
        updated++;
        console.log(`✓ Standardized: ${file}`);
      } else {
        skipped++;
      }
    } catch (e) {
      console.error(`✗ Error on ${file}:`, e.message);
    }
  });

  console.log(`\nDone. ${updated} files updated, ${skipped} already compliant or unchanged.`);
  console.log('Next step: Run the quality audit script, then use Hermes + the violet Apply button in the UI to populate rich principle_tags and media on the cards that need it.');
}

run();
