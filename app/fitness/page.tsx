import { getFitnessSummary } from '@/lib/vault';
import { FitnessEntityCard } from '../components/fitness/FitnessEntityCard';
import Link from 'next/link';

export const metadata = {
  title: 'Fitness • The Mat',
  description: 'StrongFirst + Pavel protocols, breath mastery, recovery physiology, and explicit BJJ performance transfers. Powered by your vault + Apple Watch data.',
};

export default async function FitnessDomainPage() {
  const summary = await getFitnessSummary().catch(() => ({
    physiology: [] as any[],
    protocols: [] as any[],
    principles: [] as any[],
    total: 0,
  }));

  // Live example snapshot (2026-05-24 HealthExport + Hermes synthesis)
  const healthSnapshot = {
    date: '2026-05-24',
    workout: 'S&S 24kg • 40min • 385kcal • RPE 7',
    hrv: 47,
    restingHr: 52,
    sleep: { hours: 7.75, efficiency: 89, remMin: 92 },
    readiness: 'High' as const,
    load: 'Moderate volume, quality focus (minimal effective dose)',
  };

  const readinessNote =
    healthSnapshot.readiness === 'High'
      ? 'High readiness + strong REM → push quality S&S whales or heavy pressure BJJ guard retention / comp sim rounds. Expect sharper frames and composure.'
      : 'Low readiness signal → prioritize GGP + straw breathing (1-3) + reduced volume to protect foundation and BJJ power.';

  return (
    <div className="max-w-7xl mx-auto p-6 md:p-8 pb-24 md:pb-8">
      {/* Domain Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-4xl">💪</span>
          <h1 className="text-4xl font-semibold tracking-tighter">Fitness Domain</h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-3xl">
          StrongFirst / Pavel Tsatsouline protocols, antifragile minimal effective dose, breath &amp; tension mastery (Macek/Huberman), and objective recovery via Apple Watch.
          Every artifact carries explicit <span className="font-medium text-foreground">BJJ performance transfers</span> (guard retention under fatigue, scramble composure, round endurance, longevity).
        </p>
        <div className="mt-2 text-xs uppercase tracking-[1px] text-muted-foreground">
          Hermes synthesis • 3-source intake (Readwise + Public X + Health Auto Export) • Vault is single source of truth
        </div>
      </div>

      {/* Health Snapshot Widget (Phase 1 — live from Health Exports/2026-05-24) */}
      <div className="mb-10 rounded-3xl border bg-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="uppercase text-xs tracking-[1.5px] text-muted-foreground font-medium">Apple Watch • Health Auto Export</div>
            <div className="font-semibold text-xl tracking-tight">Last Snapshot — {healthSnapshot.date}</div>
          </div>
          <div className={`px-4 py-1 rounded-full text-sm font-semibold ${healthSnapshot.readiness === 'High' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
            {healthSnapshot.readiness} Readiness
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="rounded-2xl bg-muted/50 p-4">
            <div className="text-xs text-muted-foreground">HRV (SDNN)</div>
            <div className="text-4xl font-semibold tabular-nums mt-1">{healthSnapshot.hrv}<span className="text-base font-normal text-muted-foreground">ms</span></div>
            <div className="text-emerald-600 text-xs mt-1">Stable / good baseline</div>
          </div>
          <div className="rounded-2xl bg-muted/50 p-4">
            <div className="text-xs text-muted-foreground">Resting HR</div>
            <div className="text-4xl font-semibold tabular-nums mt-1">{healthSnapshot.restingHr}<span className="text-base font-normal text-muted-foreground">bpm</span></div>
            <div className="text-emerald-600 text-xs mt-1">Excellent recovery capacity</div>
          </div>
          <div className="rounded-2xl bg-muted/50 p-4">
            <div className="text-xs text-muted-foreground">Sleep</div>
            <div className="text-3xl font-semibold tabular-nums mt-1">{healthSnapshot.sleep.hours}h <span className="text-base font-normal text-muted-foreground">• {healthSnapshot.sleep.efficiency}% eff</span></div>
            <div className="text-xs mt-1">REM {healthSnapshot.sleep.remMin} min — strong consolidation</div>
          </div>
          <div className="rounded-2xl bg-muted/50 p-4 text-sm">
            <div className="text-xs text-muted-foreground mb-1">Workout Load</div>
            <div className="font-medium">{healthSnapshot.workout}</div>
            <div className="text-xs mt-1 text-muted-foreground">{healthSnapshot.load}</div>
          </div>
        </div>

        <div className="mt-4 text-sm p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-800">
          <strong>Hermes Heuristic:</strong> {readinessNote}
          <span className="block mt-1 text-xs opacity-75">Source: HealthExport-2026-05-24.json + 2026-05-24-Health-Synthesis.md (see Fitness/Workouts/Health Exports/)</span>
        </div>
      </div>

      {/* Frictionless Actions + Shortcuts Recipes (Phase 1) */}
      <div className="mb-10">
        <h2 className="font-semibold mb-3 text-sm uppercase tracking-widest text-muted-foreground">Frictionless Loops</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <a href="#shortcuts" className="rounded-2xl border p-4 hover:bg-muted active:scale-[0.985] transition block">
            <div className="font-medium">📲 Log Session from Watch</div>
            <div className="text-xs text-muted-foreground mt-1">One-tap Shortcut: pulls recent workout + HRV/sleep from Health, pre-fills Training Session .md in vault (via iCloud Files or Tailscale Working Copy). Ready for Hermes BJJ notes.</div>
          </a>
          <a href="#shortcuts" className="rounded-2xl border p-4 hover:bg-muted active:scale-[0.985] transition block">
            <div className="font-medium">📤 Export Health to Vault</div>
            <div className="text-xs text-muted-foreground mt-1">Health Auto Export automation → dated JSON + optional -Synthesis.md in Fitness/Workouts/Health Exports/. 5-step setup in README.md.</div>
          </a>
          <a href="#shortcuts" className="rounded-2xl border p-4 hover:bg-muted active:scale-[0.985] transition block">
            <div className="font-medium">🌅 Start Morning Recharge</div>
            <div className="text-xs text-muted-foreground mt-1">Timer + cues for Huberman + GGP + straw breathing sequence. High-readiness days get full version; low-readiness gets reduced GGP + breath focus.</div>
          </a>
        </div>
        <div id="shortcuts" className="text-[10px] text-muted-foreground mt-2 px-1">
          Full recipes + iCloud/Tailscale setup: see <span className="font-mono">Fitness/Workouts/Health Exports/README.md</span> and <span className="font-mono">00 Meta/Systems/Readwise + X + Health Integration.md</span>
        </div>
      </div>

      {/* Physiology Entities */}
      <div className="mb-10">
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="font-semibold">Physiology &amp; Recovery</h2>
          <span className="text-xs text-muted-foreground">{summary.physiology.length} cards • Health-driven</span>
        </div>
        {summary.physiology.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {summary.physiology.map((e, i) => (
              <FitnessEntityCard key={i} entity={e} />
            ))}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">Physiology cards will appear here once loaded from vault (HRV &amp; Recovery Tracking, Tension &amp; Breath..., Morning Recharge... live in 00 Meta/Systems/Domains/Fitness/Physiology/)</div>
        )}
      </div>

      {/* Protocols */}
      <div className="mb-10">
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="font-semibold">Protocols</h2>
          <span className="text-xs text-muted-foreground">{summary.protocols.length} cards</span>
        </div>
        {summary.protocols.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {summary.protocols.map((e, i) => (
              <FitnessEntityCard key={i} entity={e} compact />
            ))}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">Protocols (Simple &amp; Sinister, Great Gama, Built Strong Minimalist...) live in vault.</div>
        )}
      </div>

      {/* Principles */}
      <div className="mb-10">
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="font-semibold">Principles</h2>
          <span className="text-xs text-muted-foreground">{summary.principles.length} cards</span>
        </div>
        {summary.principles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {summary.principles.map((e, i) => (
              <FitnessEntityCard key={i} entity={e} compact />
            ))}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">Principles (Straw Breathing, StrongFirst Plank, AGT...) live in vault.</div>
        )}
      </div>

      {/* Cross-Domain BJJ Actionability (core mandate) */}
      <div className="mb-10 rounded-2xl border bg-card p-6">
        <h2 className="font-semibold mb-2">Cross-Domain BJJ Transfers (Mandatory in Every Artifact)</h2>
        <ul className="text-sm space-y-1.5 text-muted-foreground">
          <li>• <strong>Low HRV / poor sleep</strong> → Prioritize GGP + straw breathing (1-3) + reduced S&amp;S volume before guard retention rounds. Protects frames and hip endurance.</li>
          <li>• <strong>High readiness + good REM</strong> → Schedule heavy pressure guard or competition-sim scrambles. Expect better posture maintenance and decision speed (see 2026-05-24 synthesis).</li>
          <li>• <strong>Post-S&amp;S with solid HRV</strong> → Breath control under pressure transfers directly to bottom side control composure and economical movement when gassed.</li>
          <li>• <strong>AGT + stable physiology</strong> → Builds power endurance without aerobic interference — ideal for long rounds and tournament days.</li>
        </ul>
        <div className="mt-3 text-xs">
          Full matrix: <Link href="/techniques" className="underline">see vault Cross-Domain Connections - BJJ.md</Link> and individual Physiology cards.
        </div>
      </div>

      {/* Status + Next (transparency per "a. Yes continuously update") */}
      <div className="text-xs text-muted-foreground border-t pt-4">
        Phase 1 UI live • Data from real vault (00 Meta/Systems/Domains/Fitness/) + example HealthExport-2026-05-24 • Real Apple Watch pipeline awaits your Health Auto Export + Shortcuts automation to the Exports folder.
        <br />See: <span className="font-mono">Readwise + X + Health Integration.md</span> • <span className="font-mono">Fitness Domain Definition.md</span> • <span className="font-mono">Domain UI Actionability Plan.md</span>
      </div>
    </div>
  );
}
