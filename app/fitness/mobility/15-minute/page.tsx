import Link from 'next/link';

export const metadata = {
  title: '15-Minute Comprehensive Mobility Flow • Mobility • The Forge',
};

export default function FifteenMinuteMobility() {
  return (
    <div className="max-w-3xl mx-auto p-6 md:p-8">
      <Link href="/fitness/mobility" className="text-sm text-muted-foreground hover:text-foreground">← Back to Mobility</Link>

      <div className="mt-4 mb-8">
        <div className="inline-flex items-center px-3 py-1 rounded-full bg-violet-100 text-violet-700 text-xs font-medium mb-3">
          15 MINUTES
        </div>
        <h1 className="text-4xl font-semibold tracking-tighter">15-Minute Comprehensive Mobility Flow</h1>
        <p className="text-lg text-muted-foreground mt-2">
          Full-body mobility session with deeper work. Ideal for recovery days or when you have more time.
        </p>
      </div>

      {/* VIDEO AT THE TOP */}
      <div className="mb-10">
        <div className="relative rounded-2xl overflow-hidden border bg-black aspect-video group">
          <img 
            src="https://picsum.photos/id/1018/1200/630" 
            alt="15 Minute Full Body Mobility Flow"
            className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition"
          />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <a 
              href="https://www.youtube.com/results?search_query=15+minute+full+body+mobility+flow" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-6 py-3 rounded-full bg-white text-black font-medium hover:bg-white/90 transition"
            >
              <span className="text-xl">▶</span>
              <span>Watch on YouTube</span>
            </a>
          </div>
        </div>
        <div className="mt-2 text-sm text-muted-foreground">
          <span className="font-medium">15 Minute Full Body Mobility Flow</span> — High-quality source (Tom Merrick, Kit Laughlin style, or similar)
        </div>
      </div>

      <div className="space-y-8">
        <div>
          <h2 className="text-xl font-semibold mb-3">Description</h2>
          <p className="text-muted-foreground leading-relaxed">
            A complete, flowing mobility session suitable as a recovery day practice or thorough warm-up/cool-down. 
            Combines active range work, controlled stretching, and light strengthening in end ranges. Designed to leave you feeling unlocked.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">Primary Benefits</h2>
          <ul className="space-y-2 text-muted-foreground">
            <li className="flex gap-2"><span className="text-violet-600">•</span> Comprehensive coverage of hips, spine, shoulders, and ankles</li>
            <li className="flex gap-2"><span className="text-violet-600">•</span> Improved recovery and reduced injury risk from high training volume</li>
            <li className="flex gap-2"><span className="text-violet-600">•</span> Better movement quality that transfers directly to BJJ technique</li>
          </ul>
        </div>

        <h2>Technique List (Approximate Timing)</h2>
        <ol>
          <li><strong>Neck &amp; Upper Thoracic Opener</strong> (1 min) — Gentle circles + chin tucks with breath.</li>
          <li><strong>Cat-Cow + Thread the Needle Variations</strong> (2 min) — Spinal mobility + shoulder work.</li>
          <li><strong>World's Greatest Stretch Flow</strong> (2 min) — Alternating sides with emphasis on depth and control.</li>
          <li><strong>90/90 Hip Flow + Pigeon Variations</strong> (3 min) — Comprehensive hip work (internal + external rotation + extension).</li>
          <li><strong>Couch Stretch + Hip Flexor Opener</strong> (2 min) — Deep hip flexor work with thoracic extension option.</li>
          <li><strong>Shoulder Flexion &amp; Rotation Complex</strong> (2 min) — Band or stick dislocates + floor-based openers.</li>
          <li><strong>Ankle Dorsiflexion + Calf Work</strong> (1.5 min) — Wall leans, loaded stretches, or banded work.</li>
          <li><strong>Final Integration Flow</strong> (1.5 min) — Slow, mindful movement connecting everything.</li>
        </ol>

        <p className="text-sm text-muted-foreground mt-6">
          <strong>Breath Emphasis:</strong> Nasal breathing. Use longer exhales on the more intense positions. Consider finishing with 1–2 minutes of Straw Breathing.
        </p>

        <div className="mt-8 p-4 rounded-xl bg-muted text-sm">
          <strong>Cross-Domain Application:</strong> Excellent on non-BJJ days or after heavy strength sessions. Strong transfer to longevity and movement quality as training volume increases.
        </div>
      </div>

      <div className="mt-10 text-xs text-muted-foreground">
        Full source lives in the vault: <span className="font-mono">Fitness/Mobility/15-Minute Comprehensive Mobility Flow.md</span>
      </div>
    </div>
  );
}
