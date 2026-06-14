'use client';

import { useState } from 'react';
import type { TechniqueCard } from '@/lib/vault';
import { StarRating } from '@/app/components/StarRating';
import { CategoryBadge } from '@/app/components/CategoryBadge';

interface RoutineGeneratorProps {
  techniques: TechniqueCard[];
}

export function RoutineGenerator({ techniques }: RoutineGeneratorProps) {
  const [routine, setRoutine] = useState<TechniqueCard[]>([]);
  const [focus, setFocus] = useState<string>('Week 1');

  const gb1Weeks = Array.from(
    new Set(techniques.flatMap(t => t.gb_curriculum || []).filter(g => g.includes('Week')))
  ).sort();

  const generateRoutine = (selectedFocus: string) => {
    let pool = techniques;

    if (selectedFocus.startsWith('Week')) {
      pool = techniques.filter(t =>
        t.gb_curriculum?.some(g => g.includes(selectedFocus))
      );
    } else if (selectedFocus === 'Submissions') {
      pool = techniques.filter(t => t.category === 'submission');
    } else if (selectedFocus === 'Guard') {
      pool = techniques.filter(t => t.position?.includes('guard'));
    }

    // Smart selection: mix of positions + good confidence
    const selected = [...pool]
      .sort((a, b) => (b.confidence || 0) - (a.confidence || 0))
      .slice(0, 8);

    setRoutine(selected);
    setFocus(selectedFocus);
  };

  return (
    <div className="grid lg:grid-cols-12 gap-8">
      {/* Controls */}
      <div className="lg:col-span-4 space-y-6">
        <div className="rounded-2xl border bg-card p-6">
          <h3 className="font-semibold mb-4">Generate Routine</h3>

          <div className="space-y-3">
            <div>
              <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">GB1 Weeks</div>
              <div className="flex flex-wrap gap-2">
                {gb1Weeks.slice(0, 10).map(w => (
                  <button
                    key={w}
                    onClick={() => generateRoutine(w)}
                    className={`px-3 py-1.5 text-sm rounded-xl border transition ${focus === w ? 'bg-black text-white border-black' : 'hover:bg-muted'}`}
                  >
                    {w}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t">
              <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Focus Areas</div>
              <div className="flex flex-col gap-2">
                {['Submissions', 'Guard', 'Defense'].map(f => (
                  <button
                    key={f}
                    onClick={() => generateRoutine(f)}
                    className={`text-left px-4 py-3 rounded-xl border text-sm font-medium hover:bg-muted transition ${focus === f ? 'ring-1 ring-black' : ''}`}
                  >
                    {f} Focus Flow
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => generateRoutine('Random')}
              className="w-full mt-4 rounded-xl bg-black text-white py-3 text-sm font-medium hover:bg-zinc-900"
            >
              Generate Random High-Quality Flow
            </button>
          </div>
        </div>

        <div className="text-xs text-muted-foreground px-1">
          Routines pull directly from your Obsidian vault. Add <code>videos</code> and <code>confidence</code> in frontmatter for richer results.
        </div>
      </div>

      {/* Mind Map / Flow Visualization */}
      <div className="lg:col-span-8">
        {routine.length > 0 ? (
          <div className="rounded-2xl border bg-card p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="text-sm font-medium text-muted-foreground">CURRENT FLOW</div>
                <div className="text-2xl font-semibold tracking-tight">{focus} • {routine.length} techniques</div>
              </div>
              <button onClick={() => setRoutine([])} className="text-sm text-muted-foreground hover:text-foreground">Clear</button>
            </div>

            {/* Visual Flow - Clean Mind Map Style */}
            <div className="space-y-3 md:space-y-4">
              {routine.map((tech, index) => (
                <div key={index} className="relative flex items-start gap-4 group">
                  {/* Connector Line */}
                  {index < routine.length - 1 && (
                    <div className="absolute left-5 top-12 bottom-0 w-px bg-border" />
                  )}

                  {/* Node */}
                  <div className="relative z-10 flex h-10 w-10 md:h-9 md:w-9 shrink-0 items-center justify-center rounded-full border-2 bg-background text-sm font-semibold tabular-nums border-black">
                    {index + 1}
                  </div>

                  <div className="flex-1 pt-1 pb-4 rounded-xl border bg-white p-4 group-hover:shadow-sm transition">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <a href={`/techniques/${encodeURIComponent(tech.slug)}`} className="font-semibold hover:underline">
                          {tech.name}
                        </a>
                        <div className="text-sm text-muted-foreground mt-0.5 capitalize">
                          {tech.position?.replace(/-/g, ' ')}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <CategoryBadge category={tech.category} />
                        <StarRating value={tech.confidence} size="sm" showNumber={false} />
                      </div>
                    </div>

                    {tech.videos && tech.videos.length > 0 && (
                      <div className="mt-3 text-xs text-violet-600 flex items-center gap-1">
                        ▶ {tech.videos.length} video{tech.videos.length > 1 ? 's' : ''} available
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t text-xs text-muted-foreground">
              This flow was intelligently selected from your vault. In a future version this will be fully interactive with drag-and-drop reordering and branching paths.
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border bg-card p-12 text-center text-muted-foreground">
            Select a focus above to generate a training routine with visual flow.
          </div>
        )}
      </div>
    </div>
  );
}
