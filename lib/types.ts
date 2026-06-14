export interface TechniqueCard {
  slug: string;
  name: string;
  position?: string;
  category?: string;
  gb_curriculum?: string[];
  principle_tags?: string[];
  lineage_tags?: string[];
  confidence?: number;
  videos?: string[] | any[];
  photos?: string[] | any[];
  last_drilled?: string;
  last_reviewed?: string;
  related_techniques?: string[];
  status?: string;
  content: string;
  personalNotes?: string;
  filePath: string;
}

/** Fitness Domain Entity (Principle / Protocol / Physiology / Session) — 6-section flavored cards per 2026 standard */
export interface FitnessEntity {
  slug: string;
  name: string;
  entity_type: 'physiology' | 'protocol' | 'principle' | 'session';
  principle_tags?: string[];
  last_reviewed?: string | Date;   // gray-matter can return Date for YAML dates
  status?: string;
  content?: string;           // full markdown body for excerpts / future detail
  filePath?: string;
  // Physiology-specific (from Health synthesis + Hermes)
  hrv?: number;
  resting_hr?: number;
  readiness?: 'High' | 'Medium' | 'Low' | 'Unknown';
  sleep_efficiency?: number;
  rem_min?: number;
  bjj_transfers?: string[];   // explicit cross-domain notes extracted or frontmatter
  connected_to_bjj?: boolean;
}

/** Shop / Ranch Equipment Card (The Forge standard 6-section operational card) */
export interface ShopEquipment {
  slug: string;
  name: string;                    // e.g. "KTM 350 EXCF"
  fullName?: string;               // e.g. "2025 KTM 350 EXCF Championship Edition"
  equipmentType?: string;          // Tractor, Motorcycle, Mower, Chainsaw, etc.
  status?: string;
  currentHours?: string;
  nextServiceDue?: string;
  primaryLocation?: string;
  content: string;                 // full markdown body (Observe, Learn, Execute, Manuals, Notes & Log, etc.)
  personalNotes?: string;          // extracted from ## Notes & Log / Personal Cues & Notes
  filePath: string;
  fleet?: string;                  // "Ranch Operations" | "Household" — new taxonomy distinction
  // Optional structured fields we can parse later
  relatedJobCards?: string[];
  crossDomainNotes?: string[];
}

/** Mind Map persisted in the Obsidian vault */
export interface MindMap {
  slug: string;
  title: string;
  nodes: any[];
  edges: any[];
  created?: string;
  updated?: string;
  filePath?: string;
}

export type MindMapMeta = Pick<MindMap, 'slug' | 'title' | 'created' | 'updated'>;
