const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const VAULT_PATH = '/Users/darrenjorgenson/Obsidian/Jorgenson Brain/20 Knowledge Base/BJJ/Captures';

function auditTechniques() {
  const files = fs.readdirSync(VAULT_PATH)
    .filter(f => f.endsWith('.md') && !f.startsWith('_'));

  const report = {
    total: files.length,
    missingMedia: [],
    placeholderContent: [],
    goodMedia: [],
    needsReview: []
  };

  files.forEach(file => {
    const fullPath = path.join(VAULT_PATH, file);
    const content = fs.readFileSync(fullPath, 'utf8');
    const { data, content: body } = matter(content);

    const hasVideos = data.videos && data.videos.length > 0;
    const hasPhotos = data.photos && data.photos.length > 0;
    const hasRealContent = body.length > 300 && !body.includes('Full detailed steps, video links, and notes to be added');

    const item = {
      file,
      name: data.name || file,
      hasVideos,
      hasPhotos,
      mediaCount: (hasVideos ? data.videos.length : 0) + (hasPhotos ? data.photos.length : 0)
    };

    if (!hasVideos && !hasPhotos) {
      report.missingMedia.push(item);
    } else if (hasVideos || hasPhotos) {
      report.goodMedia.push(item);
    }

    if (!hasRealContent) {
      report.placeholderContent.push(item);
    }

    if ((hasVideos || hasPhotos) && hasRealContent) {
      // Considered reasonably good
    } else {
      report.needsReview.push(item);
    }
  });

  console.log('=== THE MAT TECHNIQUE QUALITY AUDIT ===\n');
  console.log(`Total Techniques: ${report.total}`);
  console.log(`With Media: ${report.goodMedia.length}`);
  console.log(`Missing Media: ${report.missingMedia.length}`);
  console.log(`Placeholder Content: ${report.placeholderContent.length}\n`);

  console.log('--- NEEDS MEDIA URGENTLY (Top 15) ---');
  report.missingMedia.slice(0, 15).forEach((t, i) => {
    console.log(`${i+1}. ${t.name}`);
  });

  console.log('\n--- ALREADY HAVE MEDIA ---');
  report.goodMedia.forEach(t => {
    console.log(`- ${t.name} (${t.mediaCount} media items)`);
  });

  // === NEW: Principle tags & gold-standard structure health ===
  const principleStats = {
    withTags: 0,
    withoutTags: 0,
    triangleRelated: []
  };
  const structureHealth = {
    hasConcept: 0,
    hasKeyPrinciples: 0,
    hasMediaSection: 0,
    hasHandPlacementRef: 0
  };

  files.forEach(file => {
    const fullPath = path.join(VAULT_PATH, file);
    const content = fs.readFileSync(fullPath, 'utf8');
    const { data, content: body } = matter(content);

    const tags = Array.isArray(data.principle_tags) ? data.principle_tags : [];
    if (tags.length > 0) principleStats.withTags++;
    else principleStats.withoutTags++;

    if (tags.some(t => String(t).toLowerCase().includes('triangle'))) {
      principleStats.triangleRelated.push(data.name || file);
    }

    if (/##\s*Concept/i.test(body)) structureHealth.hasConcept++;
    if (/##\s*Key Principles/i.test(body)) structureHealth.hasKeyPrinciples++;
    if (/##\s*Media|##\s*Visual References/i.test(body)) structureHealth.hasMediaSection++;
    if (/Hand Placement|hand placement|grip mechanics/i.test(body)) structureHealth.hasHandPlacementRef++;
  });

  console.log('\n=== PRINCIPLE TAGS & CATEGORIZATION ===');
  console.log(`Cards with principle_tags: ${principleStats.withTags} / ${files.length}`);
  console.log(`Missing principle_tags:    ${principleStats.withoutTags}`);
  console.log(`Triangle-related tagged:   ${principleStats.triangleRelated.length}`);

  console.log('\n=== GOLD-STANDARD STRUCTURE HEALTH ===');
  console.log(`Have ## Concept section:           ${structureHealth.hasConcept}`);
  console.log(`Have ## Key Principles section:    ${structureHealth.hasKeyPrinciples}`);
  console.log(`Have ## Media & Visual section:    ${structureHealth.hasMediaSection}`);
  console.log(`Mentions Hand Placement / grips:   ${structureHealth.hasHandPlacementRef}`);

  console.log('\nRecommendation:');
  console.log('1. Run scripts/standardize-technique-cards.js to enforce consistent sections.');
  console.log('2. Use the UI "Ask Hermes" → Suggest principles on individual cards + violet Apply button.');
  console.log('3. For bulk tagging, ask Hermes to output principle_tags for batches, then apply via the Advanced reviewer.');

  // Write enhanced report
  const fullReport = {
    ...report,
    principleTags: principleStats,
    structureHealth
  };
  fs.writeFileSync(
    path.join(VAULT_PATH, '_Quality_Audit_Report.json'),
    JSON.stringify(fullReport, null, 2)
  );
  console.log('\nEnhanced report saved to _Quality_Audit_Report.json');
}

auditTechniques();
