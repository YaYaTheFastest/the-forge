import { getAllTechniques } from '@/lib/vault';
import TechniquesClient from './TechniquesClient';
import Link from 'next/link';

interface SearchParams {
  search?: string;
  category?: string;
  minConfidence?: string;
  gb1?: string;
}

export default async function TechniquesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const techniques = await getAllTechniques();
  
  // Seed the client with URL-driven initial values for category + minConfidence filters
  const initialSearch = params.search || '';
  const initialCategory = params.category || '';
  const initialMinConfidence = params.minConfidence ? Math.max(0, Math.min(5, parseInt(params.minConfidence, 10) || 0)) : 0;
  
  return (
    <div className="max-w-7xl mx-auto p-6 md:p-8">
      {/* The Mat Hub Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-4xl">🥋</span>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tighter">The Mat (BJJ)</h1>
        </div>
        <p className="text-lg text-muted-foreground">
          Primary subdomain of The Forge. Technique library, training tools, and curriculum.
        </p>

        {/* Quick Access to All Mat Areas */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
          <Link 
            href="/techniques" 
            className="rounded-2xl border bg-card p-4 hover:shadow-md transition-all active:scale-[0.995] text-center"
          >
            <div className="text-xl mb-1">📚</div>
            <div className="font-semibold">Techniques</div>
            <div className="text-xs text-muted-foreground">Full library + filters</div>
          </Link>

          <Link 
            href="/routines" 
            className="rounded-2xl border bg-card p-4 hover:shadow-md transition-all active:scale-[0.995] text-center"
          >
            <div className="text-xl mb-1">🔄</div>
            <div className="font-semibold">Routines</div>
            <div className="text-xs text-muted-foreground">Generate training sessions</div>
          </Link>

          <Link 
            href="/mindmaps" 
            className="rounded-2xl border bg-card p-4 hover:shadow-md transition-all active:scale-[0.995] text-center"
          >
            <div className="text-xl mb-1">🗺️</div>
            <div className="font-semibold">Mind Maps</div>
            <div className="text-xs text-muted-foreground">Visual concept maps</div>
          </Link>

          <Link 
            href="/curriculum" 
            className="rounded-2xl border bg-card p-4 hover:shadow-md transition-all active:scale-[0.995] text-center"
          >
            <div className="text-xl mb-1">📖</div>
            <div className="font-semibold">Curriculum</div>
            <div className="text-xs text-muted-foreground">GB structured progression</div>
          </Link>
        </div>
      </div>

      {/* Techniques List */}
      <TechniquesClient 
        initialTechniques={techniques} 
        initialSearch={initialSearch} 
        initialCategory={initialCategory}
        initialMinConfidence={initialMinConfidence}
      />
    </div>
  );
}
