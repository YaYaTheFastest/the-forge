import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';
import { cache } from 'react';
import { cleanTechniqueDisplayName } from './utils';
import type { FitnessEntity, TechniqueCard, ShopEquipment, MindMap, MindMapMeta } from './types';

export type { TechniqueCard, FitnessEntity, MindMap, MindMapMeta } from './types';

const VAULT_PATH = process.env.THE_MAT_VAULT_PATH || '/opt/vault';

export const getAllTechniques = cache(async function getAllTechniques(): Promise<TechniqueCard[]> {
  if (!VAULT_PATH) {
    return [];
  }

  try {
    // Prefer scanning inside BJJ for techniques (avoid picking up unrelated .md from other domains)
    const bjjPath = path.join(VAULT_PATH, '20 Knowledge Base', 'BJJ');
    let scanPath = VAULT_PATH;
    try {
      await fs.access(bjjPath);
      scanPath = bjjPath;
    } catch {}

    const allMdFiles = await getAllMdFiles(scanPath);
    const techniques: TechniqueCard[] = [];

    for (const filePath of allMdFiles) {
      try {
        const fileContent = await fs.readFile(filePath, 'utf8');
        const { data, content } = matter(fileContent);

        const baseName = path.basename(filePath);
        const hasYamlKeys = !!(data.position || data.gb_curriculum || data.name);
        const looksLikeTechnique = /^GB1-|^Other -/i.test(baseName);
        if (hasYamlKeys || looksLikeTechnique) {
          const personalNotesMatch = content.match(/### Personal Cues & Notes\s*\n([\s\S]*?)(?=\n###|$)/);
          const personalNotes = personalNotesMatch ? personalNotesMatch[1].trim() : '';

          const fileName = baseName;
          const slug = fileName.replace('.md', '').normalize('NFC').replace(/[—–−]/g, '-');
          techniques.push({
            slug,
            name: data.name || fileName.replace('.md', ''),
            position: data.position,
            category: data.category,
            videos: data.videos || data.video ? (Array.isArray(data.videos) ? data.videos : data.video ? [data.video] : []) : [],
            gb_curriculum: data.gb_curriculum,
            principle_tags: data.principle_tags,
            lineage_tags: data.lineage_tags,
            confidence: typeof data.confidence === 'number' ? Math.max(0, Math.min(5, Math.round(data.confidence))) : data.confidence,
            last_drilled: data.last_drilled,
            last_reviewed: data.last_reviewed,
            related_techniques: data.related_techniques,
            status: data.status || 'active',
            content,
            personalNotes,
            filePath,
          });
        }
      } catch (fileError: any) {
        // Defensive: one bad file (e.g. malformed YAML frontmatter) should not break the entire app
        console.error(`Error parsing technique file: ${path.basename(filePath)} — ${fileError.message || fileError}`);
        // Continue to next file
      }
    }

    techniques.sort((a, b) => a.name.localeCompare(b.name));
    return techniques;
  } catch (error) {
    console.error('Error reading vault directory:', error);
    return [];
  }
});

async function getAllMdFiles(dir: string): Promise<string[]> {
  const dirents = await fs.readdir(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const dirent of dirents) {
    const res = path.join(dir, dirent.name);
    if (dirent.isDirectory()) {
      files.push(...await getAllMdFiles(res));
    } else if (dirent.name.endsWith('.md')) {
      files.push(res);
    }
  }
  return files;
}


export async function getTechniqueBySlug(slug: string): Promise<TechniqueCard | null> {
  const techniques = await getAllTechniques();

  // Incoming slug from Next.js dynamic route may arrive percent-encoded (e.g. %20, %E2%80%94).
  // Decode first, then normalize to NFC and dashes for reliable matching.
  let normalizedSlug: string;
  try {
    normalizedSlug = decodeURIComponent(slug).normalize('NFC');
  } catch {
    normalizedSlug = slug.normalize('NFC');
  }
  normalizedSlug = normalizedSlug.replace(/[—–−]/g, '-').replace(/\s+/g, ' ').trim();

  const nSlugLower = normalizedSlug.toLowerCase();

  // Exact match (preferred, with dash norm)
  const exact = techniques.find(t => t.slug === normalizedSlug || t.slug.replace(/[—–−]/g, '-') === normalizedSlug);
  if (exact) return exact;

  // Robust key match: strips EVERYTHING except alphanum (handles " - " vs " — " vs "–", extra spaces, GB1- prefixes, etc.)
  // This is the key fix for real vault filenames that use em/en dashes or slight formatting diffs vs URL slugs.
  const key = (s: string) => (s || '').normalize('NFC').toLowerCase().replace(/[^a-z0-9]/g, '');
  const targetKey = key(normalizedSlug);
  const robust = techniques.find(t => key(t.slug) === targetKey || key(t.name || '') === targetKey);
  if (robust) return robust;

  // Fallback 1: match against the 'name' field
  const byName = techniques.find(t => t.name === normalizedSlug || (t.name && t.name.replace(/[—–−]/g, '-') === normalizedSlug));
  if (byName) return byName;

  // Fallback 2: cleaned display name match
  const cleaned = cleanTechniqueDisplayName(normalizedSlug);
  const byClean = techniques.find(t => cleanTechniqueDisplayName(t.slug) === cleaned || cleanTechniqueDisplayName(t.name) === cleaned);
  if (byClean) return byClean;

  // Fallback 3: loose contains match (with norm)
  const loose = techniques.find(t =>
    t.slug.toLowerCase().includes(nSlugLower) ||
    (t.name && t.name.toLowerCase().includes(nSlugLower)) ||
    nSlugLower.includes(t.slug.toLowerCase())
  );
  if (loose) return loose;

  // Fallback 4: match by internal id
  const byId = techniques.find(t => (t as any).id === normalizedSlug || String((t as any).id) === normalizedSlug);
  if (byId) return byId;

  return null;
}

export async function updatePersonalNotes(slug: string, newNotes: string): Promise<boolean> {
  const technique = await getTechniqueBySlug(slug);
  if (!technique) return false;

  try {
    const fileContent = await fs.readFile(technique.filePath, 'utf8');
    const { data, content } = matter(fileContent);

    const updatedContent = content.replace(
      /##{1,3} Personal Cues & Notes\s*\n[\s\S]*?(?=\n##{1,3}|$)/,
      `## Personal Cues & Notes\n\n${newNotes}\n`
    );

    const newFileContent = matter.stringify(updatedContent, data);
    await fs.writeFile(technique.filePath, newFileContent, 'utf8');

    return true;
  } catch (error) {
    console.error('Error updating notes:', error);
    return false;
  }
}

/**
 * Safely applies media / visual updates from Hermes research.
 * - Merges videos (deduped by url) into frontmatter (stores as url strings for max compatibility; rich metadata goes in the body section)
 * - Replaces or inserts the ## Media & Visual References section with clean markdown
 * - Never touches the ### Personal Cues & Notes section or other user prose
 */
/**
 * Applies a full polished version of a technique card directly.
 * Accepts either a full markdown string (with optional frontmatter)
 * or just the body. Preserves/merges frontmatter.
 */
export async function applyPolishedTechniqueCard(
  slug: string,
  polishedMarkdown: string
): Promise<{ success: boolean; message: string; filePath?: string }> {
  const technique = await getTechniqueBySlug(slug);
  if (!technique) {
    return { success: false, message: 'Technique not found in vault.' };
  }

  try {
    const originalRaw = await fs.readFile(technique.filePath, 'utf8');
    const { data: existingFrontmatter } = matter(originalRaw);

    let finalFrontmatter = { ...existingFrontmatter };
    let finalBody = polishedMarkdown.trim();

    // If the polished input starts with frontmatter, parse and merge
    if (polishedMarkdown.trim().startsWith('---')) {
      const { data: newFront, content: newBody } = matter(polishedMarkdown);
      finalFrontmatter = { ...existingFrontmatter, ...newFront };
      finalBody = newBody.trim();
    }

    const updatedFile = matter.stringify(finalBody, finalFrontmatter);
    await fs.writeFile(technique.filePath, updatedFile, 'utf8');

    return {
      success: true,
      message: 'Full polished card content applied directly to the vault.',
      filePath: technique.filePath,
    };
  } catch (error: any) {
    console.error('Error applying polished technique card:', error);
    return { success: false, message: error?.message || 'Failed to write polished content' };
  }
}

export async function applyMediaSuggestions(
  slug: string,
  updates: {
    videos?: Array<string | { url: string; title?: string; credit?: string; timestamp?: string; why?: string }>;
    photos?: Array<string | { description: string }>;
    mediaSectionMarkdown?: string; // pre-formatted full section to insert
    principle_tags?: string[];     // NEW: for bulk Hermes tagging campaigns
    related_techniques?: string[]; // NEW: for improving cross-links
    confidence?: number;           // NEW: direct confidence updates (0-5)
  }
): Promise<{ success: boolean; message: string; filePath?: string }> {
  const technique = await getTechniqueBySlug(slug);
  if (!technique) {
    return { success: false, message: 'Technique not found' };
  }

  try {
    const fileContent = await fs.readFile(technique.filePath, 'utf8');
    const { data, content } = matter(fileContent);

    // 1. Merge videos (existing logic)
    const incomingVideos = (updates.videos || []).map(v => (typeof v === 'string' ? v : v.url)).filter(Boolean);
    const existingVideos: string[] = Array.isArray(data.videos) 
      ? data.videos.map((v: any) => typeof v === 'string' ? v : v?.url || '').filter(Boolean)
      : (data.video ? [data.video] : []);

    const mergedUrls = Array.from(new Set([...existingVideos, ...incomingVideos]));
    if (mergedUrls.length > 0) {
      data.videos = mergedUrls;
    }
    if (data.video) delete data.video;

    // 2. Merge principle_tags (deduped, for the categorization/filtering goal)
    if (updates.principle_tags && updates.principle_tags.length > 0) {
      const existing = Array.isArray(data.principle_tags) ? data.principle_tags : [];
      data.principle_tags = Array.from(new Set([...existing, ...updates.principle_tags]));
    }

    // 3. Merge related_techniques
    if (updates.related_techniques && updates.related_techniques.length > 0) {
      const existing = Array.isArray(data.related_techniques) ? data.related_techniques : [];
      data.related_techniques = Array.from(new Set([...existing, ...updates.related_techniques]));
    }

    // 4. Update confidence (simple scalar frontmatter field)
    if (typeof updates.confidence === 'number' && updates.confidence >= 0 && updates.confidence <= 5) {
      data.confidence = Math.round(updates.confidence);
    }

    // 4. Media section replacement (existing logic, slightly cleaned)
    let updatedContent = content;
    const mediaHeadingRegex = /^##\s*(Media & Visual References|Videos & Photos|Media|Visual References|Videos)\s*$/m;
    const personalCueRegex = /##{1,3} Personal Cues & Notes[\s\S]*$/;

    const personalMatch = content.match(personalCueRegex);
    const contentBeforePersonal = personalMatch ? content.slice(0, personalMatch.index) : content;

    if (updates.mediaSectionMarkdown) {
      const section = updates.mediaSectionMarkdown.trim();
      if (mediaHeadingRegex.test(contentBeforePersonal)) {
        updatedContent = contentBeforePersonal.replace(
          /##\s*(Media & Visual References|Videos & Photos|Media|Visual References|Videos)\s*[\s\S]*?(?=\n##\s|\n##{1,3} Personal Cues|$)/,
          `${section}\n\n`
        );
      } else if (personalMatch) {
        const insertPoint = personalMatch.index!;
        updatedContent = content.slice(0, insertPoint).trimEnd() + `\n\n${section}\n\n` + content.slice(insertPoint);
      } else {
        updatedContent = contentBeforePersonal.trimEnd() + `\n\n${section}\n`;
      }
    }

    if (personalMatch) {
      const personalPart = personalMatch[0];
      if (!updatedContent.includes('Personal Cues & Notes')) {
        updatedContent = updatedContent.trimEnd() + '\n\n' + personalPart;
      }
    }

    const newFileContent = matter.stringify(updatedContent, data);
    await fs.writeFile(technique.filePath, newFileContent, 'utf8');

    return { 
      success: true, 
      message: 'Updates (media + tags + relations) applied cleanly to the vault file.', 
      filePath: technique.filePath 
    };
  } catch (error: any) {
    console.error('Error applying updates:', error);
    return { success: false, message: error?.message || 'Write failed' };
  }
}

/* ============================================================
   Fitness Domain Loaders (Phase 1+)
   Scans 00 Meta/Systems/Domains/Fitness/{Physiology,Protocols,Principles,...}
   Reuses gray-matter + NFC safety. Returns FitnessEntity[]
   Env: THE_MAT_VAULT_ROOT (full "Jorgenson Brain" root) or derive from THE_MAT_VAULT_PATH
   Fallback absolute matches dev machine for immediate runnability.
   ============================================================ */

const DEFAULT_VAULT_ROOT = '/Users/darrenjorgenson/Obsidian/Jorgenson Brain';

export function getVaultRoot(): string {
  if (process.env.THE_MAT_VAULT_ROOT) return process.env.THE_MAT_VAULT_ROOT;
  const envPath = process.env.THE_MAT_VAULT_PATH || '';
  if (envPath.includes('Jorgenson Brain')) {
    const idx = envPath.indexOf('Jorgenson Brain');
    return envPath.slice(0, idx + 'Jorgenson Brain'.length);
  }
  // On the droplet (or any server) when THE_MAT_VAULT_PATH=/opt/vault, use that as the root
  // so Fitness + Shop scans look under /opt/vault/... instead of the Mac path
  if (envPath) {
    return envPath;
  }
  return DEFAULT_VAULT_ROOT;
}

const FITNESS_DOMAIN_DIR = () => path.join(getVaultRoot(), '00 Meta/Systems/Domains/Fitness');

function toSlug(filename: string): string {
  return filename.replace(/\.md$/, '').normalize('NFC');
}

function extractBjjTransfers(content: string): string[] {
  // Simple extractor for the mandated "Cross-Domain BJJ Performance Transfer" section or bullet lines
  const section = content.match(/##\s*Cross-Domain BJJ[\s\S]*?(?=\n##|$)/i);
  if (!section) return [];
  const lines = section[0].split('\n').filter(l => l.trim().startsWith('-') || l.trim().startsWith('*'));
  return lines.slice(0, 6).map(l => l.replace(/^[-*]\s*/, '').trim()).filter(Boolean);
}

async function scanFitnessSubdir(subdir: string, entity_type: FitnessEntity['entity_type']): Promise<FitnessEntity[]> {
  const base = path.join(FITNESS_DOMAIN_DIR(), subdir);
  try {
    const files = await fs.readdir(base);
    const mdFiles = files.filter(f => f.endsWith('.md') && !f.startsWith('_') && !f.includes('README'));
    const entities: FitnessEntity[] = [];

    for (const file of mdFiles) {
      const filePath = path.join(base, file);
      try {
        const raw = await fs.readFile(filePath, 'utf8');
        const { data, content } = matter(raw);
        const slug = toSlug(file);

        // Physiology metrics from frontmatter or Hermes synthesis (example shape)
        let hrv: number | undefined;
        let resting_hr: number | undefined;
        let readiness: FitnessEntity['readiness'] = 'Unknown';
        let sleep_efficiency: number | undefined;
        let rem_min: number | undefined;

        if (entity_type === 'physiology') {
          if (typeof data.hrv === 'number') hrv = data.hrv;
          if (typeof data.resting_hr === 'number') resting_hr = data.resting_hr;
          if (data.readiness) readiness = data.readiness;
          const hrvMatch = content.match(/HRV[^:]*:\s*(\d+)\s*ms/i);
          if (!hrv && hrvMatch) hrv = parseInt(hrvMatch[1], 10);
          const rhrMatch = content.match(/Resting HR[^:]*:\s*(\d+)/i);
          if (!resting_hr && rhrMatch) resting_hr = parseInt(rhrMatch[1], 10);
          if (content.includes('High Readiness')) readiness = 'High';
          const sleepMatch = content.match(/(\d+(?:\.\d+)?)\s*hours?.*?(\d+)%\s*efficiency/i);
          if (sleepMatch) sleep_efficiency = parseFloat(sleepMatch[2]);
          const remMatch = content.match(/REM\s*(\d+)\s*min/i);
          if (remMatch) rem_min = parseInt(remMatch[1], 10);
        }

        const bjj = extractBjjTransfers(content);
        const connected = data.connected_to_bjj === true || bjj.length > 0 || (data.principle_tags || []).includes('bjj-transfer');

        let lastReviewed: string | undefined;
        const lr = data.last_reviewed;
        if (typeof lr === 'string') {
          lastReviewed = lr;
        } else if (lr instanceof Date) {
          lastReviewed = lr.toISOString().slice(0, 10);
        }

        entities.push({
          slug,
          name: data.name || slug,
          entity_type,
          principle_tags: Array.isArray(data.principle_tags) ? data.principle_tags : undefined,
          last_reviewed: lastReviewed,
          status: data.status || 'active',
          content,
          filePath,
          hrv,
          resting_hr,
          readiness,
          sleep_efficiency,
          rem_min,
          bjj_transfers: bjj.length ? bjj : undefined,
          connected_to_bjj: connected,
        });
      } catch (fileError: any) {
        console.error(`Error parsing Fitness file ${file} in ${subdir}:`, fileError.message || fileError);
        // Skip bad file, continue with others
      }
    }
    return entities.sort((a, b) => a.name.localeCompare(b.name));
  } catch (e) {
    console.error(`Fitness scan failed for ${subdir}:`, e);
    return [];
  }
}

export async function getFitnessPhysiology(): Promise<FitnessEntity[]> {
  return scanFitnessSubdir('Physiology', 'physiology');
}

export async function getFitnessProtocols(): Promise<FitnessEntity[]> {
  return scanFitnessSubdir('Protocols', 'protocol');
}

export async function getFitnessPrinciples(): Promise<FitnessEntity[]> {
  return scanFitnessSubdir('Principles', 'principle');
}

// Convenience aggregator for Phase 1 home
export const getFitnessSummary = cache(async function getFitnessSummary() {
  const [physiology, protocols, principles] = await Promise.all([
    getFitnessPhysiology(),
    getFitnessProtocols(),
    getFitnessPrinciples(),
  ]);
  return { physiology, protocols, principles, total: physiology.length + protocols.length + principles.length };
});

/* ============================================================
   Equipment Domain (The Forge)
   Equipment Cards live under:
   20 Knowledge Base/Shop-Property-Ranch/Equipment/<Category>/<Machine Name>/<Machine - Equipment Card.md>
   Follows the 2026 Equipment Card Template (6-section operational format).
   ============================================================ */

const SHOP_BASE = () => path.join(getVaultRoot(), '20 Knowledge Base/Shop-Property-Ranch');

// Dedicated folder for generated Hermes review / task files that the user can send to Hermes.
// This is a key mechanism for "Forge / vault triggers Hermes" workflows.
const HERMES_TASKS_DIR = () => path.join(getVaultRoot(), '00 Meta/Hermes Tasks');

function extractPersonalNotesFromShop(content: string): string {
  const match = content.match(/##\s*Notes & Log[\s\S]*?\*\*Personal Cues & Notes:\*\*\s*([\s\S]*?)(?=\n##|$)/i);
  if (match) return match[1].trim();
  // Fallback for older or slightly different headings
  const fallback = content.match(/Personal Cues & Notes\s*\n([\s\S]*?)(?=\n##|$)/i);
  return fallback ? fallback[1].trim() : '';
}

async function scanShopEquipment(): Promise<ShopEquipment[]> {
  const baseDir = path.join(SHOP_BASE(), 'Equipment');
  const equipment: ShopEquipment[] = [];

  try {
    // Recursively find all "*- Equipment Card.md" files
    const findCards = async (dir: string): Promise<void> => {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          await findCards(fullPath);
        } else if (entry.name.endsWith(' - Equipment Card.md')) {
          try {
            const raw = await fs.readFile(fullPath, 'utf8');
            const { data, content } = matter(raw);

            const slug = entry.name.replace(' - Equipment Card.md', '').normalize('NFC');
            // Make a nicer display name
            const name = data.name || data['Year / Make / Model'] || slug;

            const personalNotes = extractPersonalNotesFromShop(content);

            equipment.push({
              slug,
              name: typeof name === 'string' ? name : slug,
              fullName: data['Year / Make / Model'] || data.fullName,
              equipmentType: data.Type,
              status: data.Status,
              currentHours: data['Current Hours'],
              nextServiceDue: data['Next Service Due'],
              primaryLocation: data['Primary Location'],
              fleet: data.Fleet || data.fleet || undefined,
              content,
              personalNotes,
              filePath: fullPath,
            });
          } catch (e: any) {
            console.error(`Error parsing Equipment Card: ${fullPath} — ${e.message || e}`);
            // Continue scanning other cards
          }
        }
      }
    };

    await findCards(baseDir);
  } catch (e: any) {
    console.error('Shop Equipment directory scan failed:', e.message || e);
  }

  return equipment.sort((a, b) => a.name.localeCompare(b.name));
}

export const getAllShopEquipment = cache(async function getAllShopEquipment(): Promise<ShopEquipment[]> {
  return scanShopEquipment();
});

export const getShopEquipmentBySlug = cache(async function getShopEquipmentBySlug(slug: string): Promise<ShopEquipment | null> {
  const all = await getAllShopEquipment();

  // Be very defensive: try both the raw value and a decoded version.
  // In some environments (Tailscale, certain refreshes, direct URL paste),
  // Next.js can pass the still-encoded slug to the server component.
  const candidates = [
    slug,
    (() => {
      try {
        return decodeURIComponent(slug);
      } catch {
        return slug;
      }
    })(),
  ].map(s => s.normalize('NFC').trim());

  for (const normalized of candidates) {
    // Exact match
    let match = all.find(e => e.slug === normalized);
    if (match) return match;

    // Case-insensitive exact on slug
    match = all.find(e => e.slug.toLowerCase() === normalized.toLowerCase());
    if (match) return match;

    // Case-insensitive on name
    match = all.find(e => e.name.toLowerCase() === normalized.toLowerCase());
    if (match) return match;

    // Contains (handles slight differences)
    match = all.find(e =>
      e.slug.toLowerCase().includes(normalized.toLowerCase()) ||
      normalized.toLowerCase().includes(e.slug.toLowerCase())
    );
    if (match) return match;

    // Very loose alphanumeric match (last resort)
    const loose = normalized.toLowerCase().replace(/[^a-z0-9]/g, '');
    match = all.find(e =>
      e.name.toLowerCase().replace(/[^a-z0-9]/g, '').includes(loose)
    );
    if (match) return match;
  }

  return null;
});

export async function updateShopEquipmentNotes(slug: string, newNotes: string): Promise<boolean> {
  const equipment = await getShopEquipmentBySlug(slug);
  if (!equipment) return false;

  try {
    const fileContent = await fs.readFile(equipment.filePath, 'utf8');
    const { data, content } = matter(fileContent);

    // Replace or insert the Personal Cues & Notes section under Notes & Log
    let updatedContent = content;

    const notesSectionRegex = /(##\s*Notes & Log[\s\S]*?\*\*Personal Cues & Notes:\*\*\s*)[\s\S]*?(?=\n##\s|$)/i;
    const simpleNotesRegex = /(\*\*Personal Cues & Notes:\*\*\s*)[\s\S]*?(?=\n##\s|$)/i;

    if (notesSectionRegex.test(updatedContent)) {
      updatedContent = updatedContent.replace(
        notesSectionRegex,
        `$1\n${newNotes}\n`
      );
    } else if (simpleNotesRegex.test(updatedContent)) {
      updatedContent = updatedContent.replace(
        simpleNotesRegex,
        `$1\n${newNotes}\n`
      );
    } else {
      // Append a new Notes & Log section if missing
      updatedContent = updatedContent.trimEnd() + `\n\n## Notes & Log\n\n**Personal Cues & Notes:**\n\n${newNotes}\n`;
    }

    const newFileContent = matter.stringify(updatedContent, data);
    await fs.writeFile(equipment.filePath, newFileContent, 'utf8');
    return true;
  } catch (error) {
    console.error('Error updating shop equipment notes:', error);
    return false;
  }
}

export async function updateShopEquipmentHours(
  slug: string, 
  newHours: string, 
  serviceNote?: string
): Promise<boolean> {
  const equipment = await getShopEquipmentBySlug(slug);
  if (!equipment) return false;

  try {
    const fileContent = await fs.readFile(equipment.filePath, 'utf8');
    const { data, content } = matter(fileContent);

    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

    // Update the Current Hours frontmatter field with date
    data['Current Hours'] = `${newHours} (as of ${today})`;

    let updatedContent = content;

    // If a service note is provided, append it to the Service History section
    if (serviceNote) {
      const historyRegex = /(##\s*Notes & Log[\s\S]*?\*\*Service History[^:]*:\*\*\s*)[\s\S]*?(?=\n##\s|$)/i;
      
      if (historyRegex.test(updatedContent)) {
        updatedContent = updatedContent.replace(
          historyRegex,
          `$1\n- ${today} — ${newHours}h — ${serviceNote}\n`
        );
      } else {
        // Append a basic Service History if the section doesn't exist yet
        updatedContent = updatedContent.trimEnd() + 
          `\n\n## Notes & Log\n\n**Service History:**\n- ${today} — ${newHours}h — ${serviceNote}\n`;
      }
    }

    const newFileContent = matter.stringify(updatedContent, data);
    await fs.writeFile(equipment.filePath, newFileContent, 'utf8');
    return true;
  } catch (error) {
    console.error('Error updating shop equipment hours:', error);
    return false;
  }
}

// Re-export the type for convenience
export type { ShopEquipment } from './types';

/* ============================================================
   Hermes Trigger System
   Allows the Forge to materialize ready-to-send review tasks
   directly into the user's Obsidian vault (00 Meta/Hermes Tasks).
   This creates a persistent, first-class "trigger" the user can
   open and forward to Hermes — solving the "how does the vault
   or my work in Forge prompt Hermes?" gap.
   ============================================================ */

export async function createHermesEquipmentReviewTask(
  slug: string,
  context: {
    recentChange?: string;      // e.g. "Hours updated to 1,860h via Daily Wins on 2026-02-03"
    focusAreas?: string[];      // specific things to emphasize
    triggeredFrom?: string;     // "Daily Wins" | "Equipment Detail" | "Manual"
  } = {}
): Promise<{ success: boolean; taskFilePath?: string; taskContent?: string; message: string }> {
  const equipment = await getShopEquipmentBySlug(slug);
  if (!equipment) {
    return { success: false, message: 'Equipment card not found in vault.' };
  }

  const today = new Date().toISOString().slice(0, 10);
  const safeName = equipment.name.replace(/[/\\?%*:|"<>]/g, '-').slice(0, 80);
  const taskFilename = `${today} - Hermes Standardization Review - ${safeName}.md`;

  const taskDir = HERMES_TASKS_DIR();

  try {
    await fs.mkdir(taskDir, { recursive: true });

    const focus = context.focusAreas && context.focusAreas.length > 0
      ? context.focusAreas.join(', ')
      : 'Maintenance Schedule structure + Service Instructions quality';

    const changeNote = context.recentChange
      ? `\n**Recent Change Detected**: ${context.recentChange}\n`
      : '';

    const triggeredNote = context.triggeredFrom
      ? `This review was triggered from: **${context.triggeredFrom}** in The Forge.\n`
      : '';

    const taskContent = `# Hermes Review Task: Standardize ${equipment.name} Against New Daily Wins Requirements

**Date**: ${today}
**Equipment**: ${equipment.name} (slug: ${equipment.slug})
**Priority**: High
**Focus**: ${focus}

${changeNote}${triggeredNote}

## Context (for Hermes)

We have introduced a new mandatory standard for all Equipment Cards to power the Daily Wins execution layer.

You must review this specific card against the standards defined in these two attached/reference documents (please have the human attach them):

1. **Forge Systems - Daily Wins & Equipment Maintenance Standardization.md**
2. **Hermes Task - Standardize All Equipment Cards for Daily Wins.md**

### Primary Requirements for This Card
- Add or fully rewrite the \`## Maintenance Schedule\` section using the exact structured format (Task, Interval, Last Completed with hours, Current Hours at last service, Next Due At, 10% Window Starts At).
- Add or fully rewrite the \`## Service Instructions\` section with clear, field-usable, machine-specific step-by-step instructions for each major maintenance task.
- Ensure the card can reliably feed the 10% rule in Daily Wins and surface instructions when the user clicks "View notes".
- Update any related frontmatter (Current Hours, Next Service Due) if the data is stale.
- Keep the user's Personal Cues & Notes intact.

## Current Card Snapshot (from the Forge)
The full current content of the card is below. Use this as the baseline.

---
${equipment.content}
---

## Output Instructions
Please return:
1. The full updated Equipment Card in clean markdown (with the two new sections properly added).
2. A short summary of what was missing or weak against the new standard.
3. Any recommendations for related Job Cards or cross-domain notes.

After you respond, the human will paste the improved sections back into the source card in the vault.

---
*Generated automatically by The Forge on ${today}*
`;

    const taskPath = path.join(taskDir, taskFilename);
    await fs.writeFile(taskPath, taskContent, 'utf8');

    return {
      success: true,
      taskFilePath: taskPath,
      taskContent, // Full content so the app can auto-trigger sending to Hermes
      message: `Hermes review task created: 00 Meta/Hermes Tasks/${taskFilename}`
    };
  } catch (error: any) {
    console.error('Failed to create Hermes Equipment review task:', error);
    return {
      success: false,
      message: `Failed to write Hermes task file: ${error?.message || error}`
    };
  }
}

export async function createHermesTechniquePolishTask(
  slug: string,
  context: {
    recentChange?: string;
    focusAreas?: string[];
    triggeredFrom?: string;
  } = {}
): Promise<{ success: boolean; taskFilePath?: string; taskContent?: string; message: string }> {
  const technique = await getTechniqueBySlug(slug);
  if (!technique) {
    return { success: false, message: 'Technique not found in vault.' };
  }

  const today = new Date().toISOString().slice(0, 10);
  const safeName = technique.name.replace(/[/\\?%*:|"<>]/g, '-').slice(0, 80);
  const taskFilename = `${today} - Hermes Polish to GB1 Golden - ${safeName}.md`;

  const taskDir = HERMES_TASKS_DIR();

  try {
    await fs.mkdir(taskDir, { recursive: true });

    const focus = context.focusAreas && context.focusAreas.length > 0
      ? context.focusAreas.join(', ')
      : 'Full 2026 GB1 Standard, Personal cues quality, Structure, clarity, media';

    const changeNote = context.recentChange
      ? `\n**Recent Change Detected**: ${context.recentChange}\n`
      : '';

    const triggeredNote = context.triggeredFrom
      ? `This polish was triggered from: **${context.triggeredFrom}** in The Forge.\n`
      : '';

    const taskContent = `# Hermes Polish Task: Update ${technique.name} to 2026 GB1 Golden Standard

**Date**: ${today}
**Technique**: ${technique.name} (slug: ${slug})
**Priority**: High
**Focus**: ${focus}

${changeNote}${triggeredNote}

## Context (for Hermes)

Polish this technique card to the permanent 2026 GB1 golden standard.

Use the full current card content below as baseline.

Improve:
- Clear, field-usable Execute steps
- Fatigue-aware, testable Personal Cues & Notes
- Structure, clarity, any media suggestions
- Common failures and when it wins

## Current Card Content

---
${technique.content || '(content)'}
---

## Output Instructions

Return the full updated technique card in clean markdown.

*Generated automatically by live Grok chat on the deployed Forge ${today}*
`;

    const taskPath = path.join(taskDir, taskFilename);
    await fs.writeFile(taskPath, taskContent, 'utf8');

    return {
      success: true,
      taskFilePath: taskPath,
      taskContent,
      message: `Hermes polish task created: 00 Meta/Hermes Tasks/${taskFilename}`
    };
  } catch (error: any) {
    console.error('Failed to create Hermes Technique polish task:', error);
    return {
      success: false,
      message: `Failed to write Hermes task file: ${error?.message || error}`
    };
  }
}

/* ============================================================
   Mind Maps Persistence (Obsidian Vault)
   Stored in <Vault Root>/Mind Maps/*.md
   Frontmatter: title, created, updated
   Body contains a ```json block with { nodes, edges }
   ============================================================ */

const MIND_MAPS_DIR = () => path.join(getVaultRoot(), 'Mind Maps');

function slugifyTitle(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFC')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80);
}

function parseGraphFromContent(content: string): { nodes: any[]; edges: any[] } {
  // Look for a json or mindmap fenced code block
  const match = content.match(/```(?:json|mindmap)\s*([\s\S]*?)\s*```/i);
  if (!match) return { nodes: [], edges: [] };
  try {
    const parsed = JSON.parse(match[1]);
    return {
      nodes: Array.isArray(parsed?.nodes) ? parsed.nodes : [],
      edges: Array.isArray(parsed?.edges) ? parsed.edges : [],
    };
  } catch {
    return { nodes: [], edges: [] };
  }
}

export const getAllMindMaps = cache(async function getAllMindMaps(): Promise<MindMap[]> {
  const dir = MIND_MAPS_DIR();
  try {
    await fs.mkdir(dir, { recursive: true });
    const files = await fs.readdir(dir);
    const mdFiles = files.filter(f => f.endsWith('.md'));

    const maps: MindMap[] = [];

    for (const file of mdFiles) {
      const filePath = path.join(dir, file);
      try {
        const fileContent = await fs.readFile(filePath, 'utf8');
        const { data, content } = matter(fileContent);
        const { nodes, edges } = parseGraphFromContent(content);

        const title = data.title || file.replace('.md', '');
        const slug = file.replace('.md', '').normalize('NFC');

        maps.push({
          slug,
          title,
          nodes,
          edges,
          created: data.created || data.date,
          updated: data.updated,
          filePath,
        });
      } catch (fileError: any) {
        console.error(`Error parsing mind map file: ${file} — ${fileError.message || fileError}`);
      }
    }

    // Sort by updated desc, then title
    maps.sort((a, b) => {
      const ua = a.updated || a.created || '';
      const ub = b.updated || b.created || '';
      if (ua && ub) return ub.localeCompare(ua);
      if (ua) return -1;
      if (ub) return 1;
      return a.title.localeCompare(b.title);
    });

    return maps;
  } catch (error) {
    console.error('Error reading mind maps directory:', error);
    return [];
  }
});

export async function getMindMap(slug: string): Promise<MindMap | null> {
  const maps = await getAllMindMaps();
  const normalized = slug.normalize('NFC');
  return maps.find(m => m.slug === normalized) || null;
}

export async function saveMindMap(
  title: string,
  nodes: any[],
  edges: any[],
  existingSlug?: string
): Promise<{ success: boolean; slug?: string; message?: string; filePath?: string }> {
  if (!title || title.trim().length === 0) {
    title = 'Untitled Mind Map';
  }

  const dir = MIND_MAPS_DIR();
  await fs.mkdir(dir, { recursive: true });

  let slug = existingSlug ? existingSlug.normalize('NFC') : slugifyTitle(title);

  // Handle slug collisions for new maps
  if (!existingSlug) {
    let candidate = slug;
    let counter = 2;
    while (true) {
      const candidatePath = path.join(dir, `${candidate}.md`);
      try {
        await fs.access(candidatePath);
        candidate = `${slug}-${counter}`;
        counter++;
      } catch {
        slug = candidate;
        break;
      }
    }
  }

  const now = new Date().toISOString();
  const filePath = path.join(dir, `${slug}.md`);

  // Read existing to preserve created date if updating
  let created = now;
  try {
    const existing = await fs.readFile(filePath, 'utf8');
    const { data } = matter(existing);
    if (data.created) created = data.created;
  } catch {
    // new file
  }

  const frontmatter = {
    title: title.trim(),
    created,
    updated: now,
  };

  const graphJson = JSON.stringify({ nodes: nodes || [], edges: edges || [] }, null, 2);

  const body = `# ${title.trim()}\n\n\`\`\`json\n${graphJson}\n\`\`\`\n`;

  const fileContent = matter.stringify(body, frontmatter);

  try {
    await fs.writeFile(filePath, fileContent, 'utf8');
    return {
      success: true,
      slug,
      filePath,
      message: 'Mind map saved to vault.',
    };
  } catch (error: any) {
    console.error('Failed to save mind map:', error);
    return {
      success: false,
      message: error?.message || 'Failed to write mind map file',
    };
  }
}
