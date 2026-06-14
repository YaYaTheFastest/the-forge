import { getAllTechniques, getFitnessSummary } from '@/lib/vault';
import { getHighImportanceRAG } from '@/lib/forge/state';
import Link from 'next/link';
import { StarRating } from './components/StarRating';
import { DevRestartButton } from './components/DevRestartButton';
import { CopyableCommand } from './components/CopyableCommand';

export default async function Dashboard() {
  const [techniques, fitness, forgeRAG] = await Promise.all([
    getAllTechniques(),
    getFitnessSummary().catch(() => ({ physiology: [], protocols: [], principles: [], total: 0 })),
    getHighImportanceRAG().catch(() => ({ equipment: [], summary: { red: 0, yellow: 0, green: 0 } })),
  ]);

  const total = techniques.length;
  const gb1 = techniques.filter(t => t.gb_curriculum?.some((g: string) => g.includes('GB1'))).length;
  const withNotes = techniques.filter(t => t.personalNotes && t.personalNotes.trim().length > 10).length;
  const avgConfidence = techniques.reduce((sum, t) => sum + (t.confidence || 0), 0) / (total || 1);

  // Phase 1 Health teaser from live vault example (2026-05-24 synthesis)
  const lastPhys = fitness.physiology?.[0];
  const readiness = lastPhys?.readiness || 'High';
  const hrv = lastPhys?.hrv || 47;
  const rem = lastPhys?.rem_min || 92;

  return (
    <div className="max-w-7xl mx-auto p-8">
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium tracking-widest text-muted-foreground mb-4">
          THE FORGE
        </div>
        <div className="flex items-center gap-3 mb-2">
          <span className="text-5xl">🔥</span>
          <h1 className="text-5xl font-semibold tracking-tighter">The Forge</h1>
        </div>
        <p className="text-2xl text-muted-foreground tracking-tight">Deliberate work. Craftsmanship. High-agency living across every domain.</p>
        <p className="text-lg mt-2">The Mat (BJJ) is the primary subdomain inside it. All other domains (Fitness, Equipment, Family, Work, Finance, Recipes...) live in the same vault and surface here with zero friction.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        <div className="rounded-2xl border bg-card p-6">
          <div className="text-4xl font-semibold tabular-nums">{total}</div>
          <div className="text-sm text-muted-foreground mt-1">Techniques in vault</div>
        </div>
        <div className="rounded-2xl border bg-card p-6">
          <div className="text-4xl font-semibold tabular-nums">{gb1}</div>
          <div className="text-sm text-muted-foreground mt-1">GB1 Curriculum</div>
        </div>
        <div className="rounded-2xl border bg-card p-6">
          <div className="text-4xl font-semibold tabular-nums">{withNotes}</div>
          <div className="text-sm text-muted-foreground mt-1">With personal notes</div>
        </div>
        <div className="rounded-2xl border bg-card p-6">
          <div className="flex items-baseline gap-2">
            <div className="text-4xl font-semibold tabular-nums">{avgConfidence.toFixed(1)}</div>
            <div className="text-muted-foreground">/ 5</div>
          </div>
          <div className="text-sm text-muted-foreground mt-1">Average confidence</div>
        </div>
      </div>

      {/* Forge Status — Now the Authoritative Live View */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-sm uppercase tracking-widest text-muted-foreground">The Forge — Live Status</h2>
          <Link href="/status" className="text-xs text-muted-foreground hover:text-foreground underline-offset-2 hover:underline">Open full live status →</Link>
        </div>
        <Link href="/status" className="block rounded-2xl border bg-card p-6 hover:shadow-md transition-all active:scale-[0.995]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="font-semibold text-lg tracking-tight">Single source of truth for the entire system</div>
              <div className="text-sm text-muted-foreground mt-1">
                Real-time BJJ metrics (GB1 cards, confidence, notes coverage) • Shop fleet with hours &amp; service due • Fitness Health snapshot • Domain construction status • Recent momentum &amp; high-leverage next actions.
              </div>
              <div className="mt-3 text-xs text-emerald-600 font-medium">All data pulled live from your Obsidian vault → Refresh after edits</div>
            </div>
            <div className="text-4xl">📊</div>
          </div>
        </Link>
      </div>

      {/* Quick Actions + Promoted Content */}
      <div className="mb-12">
        <h2 className="font-semibold mb-4 text-sm uppercase tracking-widest text-muted-foreground">Quick Actions</h2>
        <div className="flex flex-wrap gap-3 mb-6">
          <Link href="/domains" className="rounded-2xl border px-6 py-3 hover:bg-muted font-medium">Browse All Forge Domains</Link>
          <Link href="/shop" className="rounded-2xl border px-6 py-3 hover:bg-muted font-medium">Equipment — Ranch + Household</Link>
          <Link href="/techniques" className="rounded-2xl border px-6 py-3 hover:bg-muted font-medium">The Mat (BJJ)</Link>
          <Link href="/routines" className="rounded-2xl border px-6 py-3 hover:bg-muted font-medium">Generate Training Routine (The Mat)</Link>
        </div>

        <div className="text-xs text-muted-foreground">
          New this cycle: Multiple new gold-standard BJJ cards (Week 2-3) + new Job Cards for JD2150, KTM, Woods, Chainsaw (daily inspections, winterize, valve checks, PPE/safety). All live in vault and promoted in /shop.
        </div>
      </div>

      {/* Fitness Domain Bubble — Phase 1 Teaser (live vault data + Health snapshot) */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-sm uppercase tracking-widest text-muted-foreground">Fitness Domain</h2>
          <Link href="/fitness" className="text-xs text-muted-foreground hover:text-foreground underline-offset-2 hover:underline">Open full domain →</Link>
        </div>
        <Link href="/fitness" className="block rounded-2xl border bg-card p-5 hover:shadow-md transition-all active:scale-[0.995]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">💪</span>
                <div>
                  <div className="font-semibold text-lg tracking-tight">Fitness • StrongFirst + BJJ Transfer</div>
                  <div className="text-xs text-muted-foreground">Pavel / AGT / Breath / Recovery protocols</div>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-sm">
                <span className={`px-3 py-1 rounded-full font-medium text-xs ${readiness === 'High' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                  {readiness} Readiness
                </span>
                <span className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-xs font-medium tabular-nums">HRV {hrv}ms</span>
                <span className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-xs font-medium tabular-nums">REM {rem}min</span>
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                3 Physiology • {fitness.protocols?.length || 0} Protocols • {fitness.principles?.length || 0} Principles • Cross-domain BJJ links live
              </div>
            </div>
            <div className="text-right text-xs">
              <div className="font-mono text-[10px] text-muted-foreground">Last sync</div>
              <div className="font-medium">2026-05-24 S&amp;S</div>
              <div className="mt-1 text-emerald-600">→ Log from Watch</div>
            </div>
          </div>
        </Link>
        <div className="mt-2 text-[10px] text-muted-foreground px-1">
          Hermes: High readiness + good REM → push quality S&amp;S or heavy guard pressure BJJ. Low HRV → prioritize GGP + straw breathing first.
        </div>
      </div>

      {/* Equipment Domain Bubble */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-sm uppercase tracking-widest text-muted-foreground">Equipment</h2>
          <Link href="/daily-wins" className="text-xs text-emerald-600 hover:underline">Daily Wins action surface →</Link>
        </div>
        <Link 
          href="/shop" 
          className="block rounded-2xl border bg-card p-5 hover:shadow-md hover:-translate-y-px transition-all active:scale-[0.995]"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">🔧</span>
                <div>
                  <div className="font-semibold text-lg tracking-tight">Equipment</div>
                  <div className="text-xs text-muted-foreground">Ranch Operations + Household • Full hierarchy</div>
                </div>
              </div>
              <div className="mt-3 text-sm text-muted-foreground">
                Tractors • Chainsaws • UTVs • Vacuums • Litter-Robots
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                26+ Equipment Cards • Maintenance Schedule standard • Daily Wins integration
              </div>
            </div>
            <div className="text-right text-xs text-emerald-600">Enter Forge →</div>
          </div>
        </Link>
      </div>

      {/* Forge RAG Status — Option A (Live operational view) */}
      {forgeRAG.equipment.length > 0 && (
        <div className="mb-12">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-sm uppercase tracking-widest text-muted-foreground">Forge • Big Equipment Status</h2>
            <Link href="/daily-wins" className="text-xs text-emerald-600 hover:underline">Open Daily Wins →</Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {forgeRAG.equipment.slice(0, 4).map((eq) => {
              const hasRed = eq.maintenanceItems.some(i => i.status === 'red');
              const hasYellow = eq.maintenanceItems.some(i => i.status === 'yellow');
              const rag = hasRed ? 'red' : hasYellow ? 'yellow' : 'green';
              const ragColor = rag === 'red' ? 'bg-red-500' : rag === 'yellow' ? 'bg-amber-500' : 'bg-emerald-500';

              return (
                <Link 
                  key={eq.slug} 
                  href="/daily-wins"
                  className="block rounded-2xl border bg-card p-4 hover:shadow-sm active:scale-[0.995] transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-lg tracking-tight">{eq.shortName || eq.name}</div>
                      <div className="text-xs text-muted-foreground">{eq.currentHours ? `${eq.currentHours}h` : '—'} • {eq.type}</div>
                    </div>
                    <div className={`px-3 py-0.5 rounded-2xl text-xs font-bold text-white ${ragColor}`}>
                      {rag.toUpperCase()}
                    </div>
                  </div>
                  <div className="mt-2 text-[11px] text-muted-foreground line-clamp-1">
                    {eq.maintenanceItems.filter(i => i.status !== 'green').map(i => i.task).join(' • ') || 'All green'}
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="mt-2 text-[10px] text-muted-foreground">
            Red/Yellow/Green based on live 10% maintenance windows. Fast operational layer (Option A).
          </div>
        </div>
      )}

      {/* Class Notes / BJJ Activity (updated with user input) */}
      <div className="mb-12 rounded-2xl border bg-card p-5">
        <div className="font-semibold mb-2 flex items-center gap-2">
          <span>🥋 Recent BJJ Activity</span>
        </div>
        <div className="text-sm text-muted-foreground">
          Active use of Hermes for jiu jitsu class notes noted. Multiple GB1 captures edited today (e.g. W03-B1, W04 cards). This is feeding the 6-section improvement pipeline.
        </div>
        <div className="mt-3 text-xs">
          <Link href="/mat" className="underline">View The Mat domain →</Link> for class notes integration and technique updates.
          <span className="ml-2 text-muted-foreground">~28 cards at full 2026-05 standard (more in progress via Hermes).</span>
        </div>
      </div>

      {/* Restart Server — Now with one-click button */}
      <div className="mb-12 rounded-2xl border bg-card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div>
            <h3 className="font-semibold text-lg">Restart Dev Server</h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              Kills the current Next.js process and launches a fresh one. Use after vault edits or when things feel stale.
            </p>
          </div>

          {/* Primary one-click action — only works in development */}
          {process.env.NODE_ENV === 'development' && (
            <DevRestartButton variant="card" />
          )}
        </div>

        <div className="rounded-xl border bg-muted/60 p-4 text-sm">
          <div className="font-medium mb-2">Fallback (manual, works from any terminal):</div>
          <CopyableCommand
            command={`lsof -ti:3000 | xargs kill -9 2>/dev/null || true && cd ~/Projects/the-mat && npm run dev`}
          />
          <div className="mt-3 text-xs text-muted-foreground">
            After you see <span className="font-semibold">✓ Ready</span>, hard refresh this page (⌘⇧R / pull-to-refresh on iOS).
            The button above does exactly the safe version of this for you.
          </div>
        </div>

        <div className="mt-3 text-[10px] text-muted-foreground">
          Also available in the top-right header bar on desktop when running in dev mode.
        </div>
      </div>

      {/* Recent / Suggested */}
      <div>
        <h2 className="font-semibold mb-4">Recent &amp; High-Value Techniques</h2>
        <div className="text-sm text-muted-foreground">
          (Future: Smart suggestions based on your notes and confidence data will appear here)
        </div>
      </div>
    </div>
  );
}
