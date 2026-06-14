import { NextRequest, NextResponse } from 'next/server';
import { logMaintenanceCompletion } from '@/lib/forge/state';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { slug, hours, task, notes } = body;

    if (!slug || !hours || !task) {
      return NextResponse.json({ error: 'slug, hours, and task are required' }, { status: 400 });
    }

    const updated = await logMaintenanceCompletion(slug, Number(hours), task, notes);
    return NextResponse.json({ success: true, equipment: updated });
  } catch (error: any) {
    console.error('Forge log-completion error:', error);
    return NextResponse.json({ success: false, message: error?.message || 'Error' }, { status: 500 });
  }
}
