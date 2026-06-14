import { NextRequest, NextResponse } from 'next/server';
import { saveMindMap } from '@/lib/vault';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, nodes, edges, slug } = body;

    if (!title || typeof title !== 'string') {
      return NextResponse.json({ success: false, message: 'Title is required' }, { status: 400 });
    }

    const result = await saveMindMap(
      title,
      Array.isArray(nodes) ? nodes : [],
      Array.isArray(edges) ? edges : [],
      typeof slug === 'string' ? slug : undefined
    );

    if (result.success) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json(result, { status: 500 });
    }
  } catch (error: any) {
    console.error('Mind map save API error:', error);
    return NextResponse.json(
      { success: false, message: error?.message || 'Save failed' },
      { status: 500 }
    );
  }
}
