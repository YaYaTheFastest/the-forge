/**
 * Forge Operational State Manager — Option A
 *
 * Responsibilities:
 * - Fast load/save of the lightweight operational state (JSON)
 * - Calculate RAG status for equipment
 * - Support "Mark Complete + Log Hours" mutation
 * - Provide data for RAG dashboard, Daily Wins, and home screen
 * - Keep The Mat fast on iOS (no repeated heavy vault scans for daily ops)
 *
 * This is the execution heart of the new Forge model.
 */

import fs from 'fs/promises';
import path from 'path';
import type { ForgeOperationalState, EquipmentOperational, MaintenanceItem, RAGStatus, ServiceLogEntry } from './types';

const DEFAULT_STATE_PATH = path.join(process.cwd(), 'data', 'forge-state.json');

// Ensure data directory exists
async function ensureDataDir() {
  const dir = path.dirname(DEFAULT_STATE_PATH);
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch {}
}

export async function loadForgeState(): Promise<ForgeOperationalState> {
  await ensureDataDir();

  try {
    const raw = await fs.readFile(DEFAULT_STATE_PATH, 'utf8');
    const state = JSON.parse(raw) as ForgeOperationalState;
    return state;
  } catch {
    // Return a fresh starter state if none exists yet
    return createEmptyState();
  }
}

export async function saveForgeState(state: ForgeOperationalState): Promise<void> {
  await ensureDataDir();
  state.lastUpdated = new Date().toISOString();
  await fs.writeFile(DEFAULT_STATE_PATH, JSON.stringify(state, null, 2), 'utf8');
}

function createEmptyState(): ForgeOperationalState {
  return {
    version: "2026-05-a",
    lastUpdated: new Date().toISOString(),
    equipment: [],
    pendingImprovements: [],
  };
}

/**
 * Calculate RAG status for a single maintenance item.
 */
export function calculateItemStatus(item: MaintenanceItem, currentHours: number): RAGStatus {
  if (!item.nextDueAt) return 'green';

  if (currentHours >= item.nextDueAt) {
    return 'red';
  }

  if (item.tenPercentWindowStartsAt && currentHours >= item.tenPercentWindowStartsAt) {
    return 'yellow';
  }

  return 'green';
}

/**
 * Recalculate all RAG statuses for an equipment record.
 * Call this after any hours update.
 */
export function recalculateRAG(equipment: EquipmentOperational): EquipmentOperational {
  if (!equipment.currentHours) return equipment;

  equipment.maintenanceItems = equipment.maintenanceItems.map(item => ({
    ...item,
    status: calculateItemStatus(item, equipment.currentHours!),
  }));

  return equipment;
}

/**
 * Log completion of a maintenance task + update hours.
 * This is the core "daily work" action.
 */
export async function logMaintenanceCompletion(
  equipmentSlug: string,
  newHours: number,
  task: string,
  notes?: string
): Promise<EquipmentOperational | null> {
  const state = await loadForgeState();

  const eqIndex = state.equipment.findIndex(e => e.slug === equipmentSlug);
  if (eqIndex === -1) return null;

  const equipment = state.equipment[eqIndex];

  // Update current hours
  const previousHours = equipment.currentHours || 0;
  equipment.currentHours = newHours;
  equipment.lastServiceDate = new Date().toISOString().slice(0, 10);
  equipment.lastServiceHours = newHours;

  // Add to service history
  const logEntry: ServiceLogEntry = {
    date: new Date().toISOString().slice(0, 10),
    hours: newHours,
    task,
    notes,
  };
  equipment.serviceHistory = [logEntry, ...(equipment.serviceHistory || [])].slice(0, 50); // keep last 50

  // Recalculate all RAG statuses
  const updated = recalculateRAG(equipment);
  state.equipment[eqIndex] = updated;

  await saveForgeState(state);
  return updated;
}

/**
 * Get high-importance equipment with RAG summary (for home dashboard + RAG view)
 */
export async function getHighImportanceRAG(): Promise<{
  equipment: EquipmentOperational[];
  summary: { red: number; yellow: number; green: number };
}> {
  const state = await loadForgeState();

  const high = state.equipment
    .filter(e => e.importance === 'high')
    .sort((a, b) => {
      // Sort red first, then yellow, then green
      const order = { red: 0, yellow: 1, green: 2 };
      const aStatus = a.maintenanceItems.some(i => i.status === 'red') ? 'red' :
                      a.maintenanceItems.some(i => i.status === 'yellow') ? 'yellow' : 'green';
      const bStatus = b.maintenanceItems.some(i => i.status === 'red') ? 'red' :
                      b.maintenanceItems.some(i => i.status === 'yellow') ? 'yellow' : 'green';
      return order[aStatus] - order[bStatus];
    });

  const summary = {
    red: high.filter(e => e.maintenanceItems.some(i => i.status === 'red')).length,
    yellow: high.filter(e => !e.maintenanceItems.some(i => i.status === 'red') && e.maintenanceItems.some(i => i.status === 'yellow')).length,
    green: high.filter(e => e.maintenanceItems.every(i => i.status === 'green')).length,
  };

  return { equipment: high, summary };
}

/**
 * Add a user comment / improvement request (feeds Hermes in timely manner)
 */
export async function addForgeImprovementComment(
  message: string,
  equipmentSlug?: string
): Promise<void> {
  const state = await loadForgeState();

  if (!state.pendingImprovements) state.pendingImprovements = [];

  state.pendingImprovements.push({
    id: `imp_${Date.now()}`,
    equipmentSlug,
    message,
    createdAt: new Date().toISOString(),
    status: 'open',
  });

  await saveForgeState(state);
}
