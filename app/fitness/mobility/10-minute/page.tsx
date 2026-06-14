import Link from 'next/link';

export const metadata = {
  title: '10-Minute BJJ-Focused Mobility • Mobility • The Forge',
};

export default function TenMinuteMobility() {
  const video = {
    title: "10 Minute BJJ-Specific Mobility Routine",
    instructor: "High-quality BJJ mobility coach (e.g. Kit Laughlin style or Tom Merrick combat edition)",
    url: "https://www.youtube.com/results?search_query=10+minute+bjj+mobility+routine",
    thumbnail: "https://picsum.photos/id/1005/1200/630",
  };

  return (
    <div className="max-w-3xl mx-auto p-6 md:p-8">
      <Link href="/fitness/mobility" className="text-sm text-muted-foreground hover:text-foreground">← Back to Mobility</Link>

      {/* Header */}
      <div className="mt-4 mb-8">
        <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-medium mb-3">
          10 MINUTES
        </div>
        <h1 className="text-4xl font-semibold tracking-tighter">10-Minute BJJ-Focused Mobility</h1>
        <p className="text-lg text-muted-foreground mt-2">
          Targeted mobility for hip rotation, thoracic spine, and shoulders with direct Brazilian Jiu-Jitsu transfer.
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

      {/* CONTENT BELOW VIDEO */}
      <div className="space-y-8">
        <div>
          <h2 className="text-xl font-semibold mb-3">Description</h2>
          <p className="text-muted-foreground leading-relaxed">
            A deliberate 10-minute session built around the positions and movements most stressed in BJJ. 
            More depth than the 5-minute reset, with specific emphasis on guard retention, guard passing, and top pressure positions.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">Primary Benefits</h2>
          <ul className="space-y-2 text-muted-foreground">
            <li className="flex gap-2"><span className="text-blue-600">•</span> Improved hip mobility for closed guard, butterfly, and leg entanglements</li>
            <li className="flex gap-2"><span className="text-blue-600">•</span> Better thoracic rotation for sweeps, escapes, and passing</li>
            <li className="flex gap-2"><span className="text-blue-600">•</span> Enhanced shoulder flexion and external rotation for framing and posting</li>
            <li className="flex gap-2"><span className="text-blue-600">•</span> Reduced stiffness that accumulates from training volume</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">Technique List</h2>
          <div className="space-y-4">
            <div className="border-l-2 border-blue-200 pl-4">
              <div className="font-medium">1. 90/90 Hip Switches + Internal Rotation Holds (2 min)</div>
              <div className="text-sm text-muted-foreground mt-1">Move between 90/90 positions. Add controlled pulses and static holds on the more restricted side.</div>
            </div>
            <div className="border-l-2 border-blue-200 pl-4">
              <div className="font-medium">2. Couch Stretch + Thoracic Extension (2 min)</div>
              <div className="text-sm text-muted-foreground mt-1">One leg elevated. Add gentle thoracic extension. Alternate sides.</div>
            </div>
            <div className="border-l-2 border-blue-200 pl-4">
              <div className="font-medium">3. World's Greatest Stretch + T-Spine Opener (2 min)</div>
              <div className="text-sm text-muted-foreground mt-1">Deep lunge with rotation + thread-the-needle variation.</div>
            </div>
            <div className="border-l-2 border-blue-200 pl-4">
              <div className="font-medium">4. Shoulder Flexion + External Rotation Flow (2 min)</div>
              <div className="text-sm text-muted-foreground mt-1">Band or stick dislocates + floor-based shoulder openers.</div>
            </div>
            <div className="border-l-2 border-blue-200 pl-4">
              <div className="font-medium">5. Ankle + Hip Opener Combo (2 min)</div>
              <div className="text-sm text-muted-foreground mt-1">Pigeon or 90/90 variations with ankle dorsiflexion work.</div>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t">
          <div className="text-sm">
            <span className="font-medium">Breath &amp; Tension Note:</span> Use power breathing or straw breathing during the more challenging positions. Maintain light tension where appropriate.
          </div>
        </div>

        <div className="rounded-2xl bg-muted p-5 text-sm">
          <div className="font-medium mb-1">BJJ Transfer</div>
          <p className="text-muted-foreground">
            This session directly supports longer guard retention sessions and better posture when passing or maintaining top pressure. 
            Use before hard rolling or after training as active recovery.
          </p>
        </div>
      </div>

      <div className="mt-12 pt-6 border-t text-xs text-muted-foreground">
        Full source lives in the vault: <span className="font-mono">Fitness/Mobility/10-Minute BJJ-Focused Mobility.md</span>
      </div>
    </div>
  );
}
