import { NextRequest, NextResponse } from 'next/server';
import { createHermesEquipmentReviewTask } from '@/lib/vault';

/**
 * POST /api/hermes/review-equipment
 * 
 * Allows the Forge (or future automations) to trigger a Hermes review task
 * that gets written directly into the user's Obsidian vault.
 * 
 * Body:
 * {
 *   slug: string,
 *   recentChange?: string,
 *   triggeredFrom?: string,
 *   focusAreas?: string[]
 * }
 * 
 * This is the technical bridge for "vault or Forge work triggers Hermes".
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { slug, recentChange, triggeredFrom, focusAreas } = body;

    if (!slug) {
      return NextResponse.json({ error: 'slug is required' }, { status: 400 });
    }

    const result = await createHermesEquipmentReviewTask(slug, {
      recentChange: recentChange || 'Triggered via API from The Forge',
      triggeredFrom: triggeredFrom || 'API',
      focusAreas: focusAreas || ['Maintenance Schedule', 'Service Instructions', 'Daily Wins readiness']
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Hermes review API error:', error);
    return NextResponse.json(
      { success: false, message: error?.message || 'Internal error creating Hermes task' },
      { status: 500 }
    );
  }
}
