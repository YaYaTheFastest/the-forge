/**
 * Forge Operational Types — Option A (Lightweight App-Owned State)
 *
 * This is the clean operational data layer for the entire Forge system.
 * It powers:
 * - RAG (Red/Yellow/Green) status for equipment
 * - Daily Wins low-noise suggestions (Equipment column + proactive surfacing)
 * - Fast logging ("Mark Complete + Log Hours")
 * - The Mat home dashboard visualization
 * - Future Fitness + BJJ cross-domain awareness
 *
 * Rich instructional content (Service Instructions, detailed Job Cards, photos)
 * lives in the Knowledge Layer (Obsidian .md cards or app content).
 * This file is purely for fast, reliable daily operations.
 */

export type RAGStatus = 'red' | 'yellow' | 'green';

export type Fleet = 'Ranch Operations' | 'Household';

export type EquipmentImportance = 'high' | 'medium' | 'low';

export interface MaintenanceItem {
  task: string;                    // e.g. "Oil & Filter Change"
  intervalHours?: number;          // e.g. 100
  intervalType?: 'hours' | 'months' | 'seasonal' | 'annual';
  lastCompletedDate?: string;      // YYYY-MM-DD
  lastCompletedHours?: number;
  nextDueAt?: number;              // hours
  tenPercentWindowStartsAt?: number;
  status: RAGStatus;
  notes?: string;
}

export interface ServiceLogEntry {
  date: string;                    // YYYY-MM-DD
  hours: number;
  task: string;
  notes?: string;
}

export interface EquipmentOperational {
  slug: string;                    // stable identifier, e.g. "1987-john-deere-2150"
  name: string;                    // Display name
  shortName?: string;
  fleet: Fleet;
  type: string;                    // Tractor, Mower, Chainsaw, Motorcycle, etc.
  importance: EquipmentImportance; // Drives visibility in RAG views

  // Live operational numbers
  currentHours?: number;
  lastServiceDate?: string;
  lastServiceHours?: number;

  // Structured maintenance (powers 10% rule + RAG)
  maintenanceItems: MaintenanceItem[];

  // History
  serviceHistory: ServiceLogEntry[];

  // References (for linking to rich content)
  richCardPath?: string;           // Path to the beautiful Equipment Card (for "View notes")
  jobCardSlugs?: string[];         // Links to specific Job Cards

  // Cross-domain hooks (The Mat capabilities)
  bjjNotes?: string[];             // e.g. grip, hip drive, mental toughness transfers
  fitnessNotes?: string[];         // e.g. physical demands, recovery recommendations

  // Status
  status: 'active' | 'seasonal_storage' | 'in_repair' | 'retired';
  lastUpdated: string;             // ISO timestamp
}

/**
 * The single source of truth for Forge operational state (Option A).
 * This file is designed to be small, fast to load, and easy to mutate on iOS.
 */
export interface ForgeOperationalState {
  version: string;                 // e.g. "2026-05-a"
  lastUpdated: string;
  lastSyncedFromVault?: string;

  // Core equipment operational records (the RAG source of truth)
  equipment: EquipmentOperational[];

  // Future expansion for full Forge (Daily Wins across domains)
  chores?: any[];                  // Will be defined when Chores Registry is wired
  fitnessProtocols?: any[];        // Standing items + readiness-aware suggestions

  // Simple comments / improvement requests (feeds Hermes in timely manner)
  pendingImprovements?: Array<{
    id: string;
    equipmentSlug?: string;
    message: string;
    createdAt: string;
    status: 'open' | 'in_progress' | 'addressed';
  }>;
}

export type ForgeRAGSummary = {
  red: number;
  yellow: number;
  green: number;
  totalHighImportance: number;
};
