import Link from 'next/link';

export const metadata = {
  title: '5-Minute Daily Mobility Reset • Mobility • The Forge',
};

export default function FiveMinuteMobility() {
  // Placeholder video - user/Hermes can update this
  const video = {
    title: "5 Minute Daily Hip & Thoracic Mobility Flow",
    instructor: "Tom Merrick (or similar high-quality source)",
    url: "https://www.youtube.com/results?search_query=5+minute+daily+hip+thoracic+mobility+flow",
    thumbnail: "https://picsum.photos/id/1015/1200/630", // Nice placeholder - replace with real YouTube thumbnail later
  };

  return (
    <div className="max-w-3xl mx-auto p-6 md:p-8">
      <Link href="/fitness/mobility" className="text-sm text-muted-foreground hover:text-foreground">← Back to Mobility</Link>

      {/* Header */}
      <div className="mt-4 mb-8">
        <div className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-medium mb-3">
          5 MINUTES
        </div>
        <h1 className="text-4xl font-semibold tracking-tighter">5-Minute Daily Mobility Reset</h1>
        <p className="text-lg text-muted-foreground mt-2">
          Quick full-body reset focused on hips, thoracic spine, and shoulders. Designed for daily use.
        </p>
      </div>

      {/* VIDEO AT THE TOP */}
      <div className="mb-10">
        <div className="relative rounded-2xl overflow-hidden border bg-black aspect-video group">
          <img 
            src={video.thumbnail} 
            alt={video.title}
            className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition"
          />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <a 
              href={video.url} 
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
          <span className="font-medium">{video.title}</span> — {video.instructor}
        </div>
      </div>

      {/* DESCRIPTION & CONTENT BELOW VIDEO */}
      <div className="space-y-8">
        <div>
          <h2 className="text-xl font-semibold mb-3">Description</h2>
          <p className="text-muted-foreground leading-relaxed">
            A short, repeatable flow to restore range of motion and reduce stiffness from sitting, training, or daily life. 
            Emphasizes controlled movement and breath rather than aggressive stretching. Excellent as a standalone daily habit or warm-up primer.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">Primary Benefits</h2>
          <ul className="space-y-2 text-muted-foreground">
            <li className="flex gap-2"><span className="text-emerald-600">•</span> Opens hips and thoracic spine (critical for guard work and posture)</li>
            <li className="flex gap-2"><span className="text-emerald-600">•</span> Prepares shoulders for loading and overhead positions</li>
            <li className="flex gap-2"><span className="text-emerald-600">•</span> Activates breath and parasympathetic tone before or after sessions</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">Technique List</h2>
          <div className="space-y-4">
            <div className="border-l-2 border-emerald-200 pl-4">
              <div className="font-medium">1. World's Greatest Stretch (alternating sides)</div>
              <div className="text-sm text-muted-foreground mt-1">3–4 slow reps per side. Exhale into the rotation.</div>
            </div>
            <div className="border-l-2 border-emerald-200 pl-4">
              <div className="font-medium">2. 90/90 Hip Flow</div>
              <div className="text-sm text-muted-foreground mt-1">Shift weight side to side and rotate through the hips. Controlled and smooth (~60s).</div>
            </div>
            <div className="border-l-2 border-emerald-200 pl-4">
              <div className="font-medium">3. Cat-Cow with Thread the Needle</div>
              <div className="text-sm text-muted-foreground mt-1">Combine spinal movement with shoulder mobility. 8–10 slow cycles.</div>
            </div>
            <div className="border-l-2 border-emerald-200 pl-4">
              <div className="font-medium">4. Shoulder Circles + Dislocates</div>
              <div className="text-sm text-muted-foreground mt-1">Large controlled circles, then dislocates if you have a stick or band. 10 reps each direction.</div>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t">
          <div className="text-sm">
            <span className="font-medium">Breath Cue:</span> Nasal breathing throughout. Exhale on the “effort” portion of each movement.
          </div>
        </div>

        <div className="rounded-2xl bg-muted p-5 text-sm">
          <div className="font-medium mb-1">Cross-Domain Note</div>
          <p className="text-muted-foreground">
            This short reset pairs extremely well with Straw Breathing (even 1–2 minutes immediately after compounds recovery and calm). 
            Excellent before BJJ technique drilling or after long periods of sitting.
          </p>
        </div>
      </div>

      <div className="mt-12 pt-6 border-t text-xs text-muted-foreground">
        Full source lives in the vault: <span className="font-mono">Fitness/Mobility/5-Minute Daily Mobility Reset.md</span>
      </div>
    </div>
  );
}
