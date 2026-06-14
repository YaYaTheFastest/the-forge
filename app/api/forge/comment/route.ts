import { NextRequest, NextResponse } from 'next/server';
import { addForgeImprovementComment } from '@/lib/forge/state';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, equipmentSlug } = body;

    if (!message) {
      return NextResponse.json({ error: 'message is required' }, { status: 400 });
    }

    await addForgeImprovementComment(message, equipmentSlug);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Forge comment error:', error);
    return NextResponse.json({ success: false, message: error?.message || 'Error' }, { status: 500 });
  }
}
