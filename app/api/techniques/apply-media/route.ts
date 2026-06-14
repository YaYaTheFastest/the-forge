import { NextRequest, NextResponse } from 'next/server';
import { applyMediaSuggestions } from '@/lib/vault';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { slug, videos, photos, mediaSectionMarkdown, principle_tags, related_techniques } = body;

    if (!slug) {
      return NextResponse.json({ error: 'Missing slug' }, { status: 400 });
    }

    const result = await applyMediaSuggestions(slug, {
      videos,
      photos,
      mediaSectionMarkdown,
      principle_tags,
      related_techniques,
    });

    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        message: result.message,
        filePath: result.filePath 
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        error: result.message 
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Apply media API error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error?.message || 'Failed to apply updates' 
    }, { status: 500 });
  }
}
