import { getHighImportanceRAG, loadForgeState, addForgeImprovementComment } from '@/lib/forge/state';
import Link from 'next/link';
import { getFitnessSummary } from '@/lib/vault';

export const metadata = {
  title: 'Forge • The Mat',
  description: 'Central operational hub for The Forge — Equipment, Daily Wins, and cross-domain execution across The Mat (BJJ), Fitness, and Ranch operations.',
};

export default async function ForgePage() {
  const [ragData, state, fitness] = await Promise.all([
    getHighImportanceRAG().catch(() => ({ equipment: [], summary: { red: 0, yellow: 0, green: 0 } })),
    loadForgeState().catch(() => ({ equipment: [], pendingImprovements: [] })),
    getFitnessSummary().catch(() => ({ physiology: [], protocols: [], principles: [], total: 0 })),
  ]);

  const highEquipment = ragData.equipment;
  const allEquipment = state.equipment || [];
  const pending = state.pendingImprovements || [];

  // Simple Mat cross-domain suggestion based on current readiness + high physical equipment
  const lastPhys = fitness.physiology?.[0];
  const readiness = lastPhys?.readiness || 'High';
  const hasHeavyWork = highEquipment.some(e => e.maintenanceItems.some(i => i.status !== 'green'));

  const matSuggestion = hasHeavyWork 
    ? (readiness === 'High' 
        ? "High readiness + heavy ranch work today → Consider quality S&S or heavy guard pressure BJJ rounds." 
        : "Physical demand day detected → Prioritize GGP + straw breathing + mobility before or after equipment work.")
    : "Good day for deliberate practice — BJJ technique focus or steady-state conditioning.";

  return (
    <div className="max-w-7xl mx-auto p-6 md:p-8">
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium tracking-widest text-muted-foreground mb-3">
          THE FORGE — CENTRAL OPERATIONS
        </div>
        <h1 className="text-4xl font-semibold tracking-tighter">The Forge</h1>
        <p className="text-lg text-muted-foreground mt-2 max-w-3xl">
          Fast operational layer for Equipment + Daily Wins. Rich knowledge lives in cards. 
          The Mat (BJJ) and Fitness remain fully available as core subdomains.
        </p>
      </div>

      {/* RAG Dashboard */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-xl tracking-tight">Big Equipment Status (RAG)</h2>
          <Link href="/daily-wins" className="text-sm text-emerald-600 hover:underline">Daily Wins →</Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {highEquipment.length > 0 ? (
            highEquipment.map((eq) => {
              const redItems = eq.maintenanceItems.filter(i => i.status === 'red');
              const yellowItems = eq.maintenanceItems.filter(i => i.status === 'yellow');
              const rag = redItems.length > 0 ? 'red' : yellowItems.length > 0 ? 'yellow' : 'green';
              const ragBg = rag === 'red' ? 'bg-red-500' : rag === 'yellow' ? 'bg-amber-500' : 'bg-emerald-500';

              return (
                <div key={eq.slug} className="rounded-3xl border bg-card p-5 flex flex-col">
                  {/* Visual placeholder for real machine photo */}
                  <div className="mb-4 aspect-video bg-zinc-900 rounded-2xl flex items-center justify-center text-center text-xs text-muted-foreground border border-dashed">
                    📷 Add real photo of this machine<br />
                    <span className="text-[10px]">(see Equipment Card Template)</span>
                  </div>

                  <div className="flex justify-between items-start flex-1">
                    <div>
                      <div className="font-semibold text-xl tracking-tight">{eq.name}</div>
                      <div className="text-xs text-muted-foreground">{eq.currentHours ? `${eq.currentHours}h` : '—'} • {eq.type}</div>
                    </div>
                    <div className={`px-3 py-1 rounded-2xl text-xs font-bold text-white ${ragBg} self-start`}>
                      {rag.toUpperCase()}
                    </div>
                  </div>

                  <div className="mt-4 space-y-1 text-sm flex-1">
                    {[...redItems, ...yellowItems].slice(0, 3).map((item, idx) => (
                      <div key={idx} className="flex justify-between text-xs">
                        <span>{item.task}</span>
                        <span className={item.status === 'red' ? 'text-red-500' : 'text-amber-500'}>
                          {item.status}
                        </span>
                      </div>
                    ))}
                    {redItems.length === 0 && yellowItems.length === 0 && (
                      <div className="text-emerald-500 text-xs">All maintenance in healthy range</div>
                    )}
                  </div>

                  <div className="mt-4 flex gap-2">
                    <Link href="/daily-wins" className="text-xs px-3 py-1.5 rounded-2xl border hover:bg-muted flex-1 text-center">Log work</Link>
                    {eq.richCardPath && (
                      <Link href="/shop" className="text-xs px-3 py-1.5 text-muted-foreground hover:text-foreground">Details →</Link>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full text-muted-foreground">No high-importance equipment loaded yet.</div>
          )}
        </div>
      </div>

      {/* Full Equipment List + Standardization Status (Management View) */}
      <div className="mb-10">
        <h2 className="font-semibold text-xl tracking-tight mb-4">All Equipment — Management Dashboard</h2>
        <p className="text-xs text-muted-foreground mb-3">Status badges show operational RAG (from live hours) and content completeness for Forge standards. This is the single place to see what needs work.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {allEquipment.map((eq) => {
            const hasRed = eq.maintenanceItems?.some(i => i.status === 'red');
            const hasYellow = eq.maintenanceItems?.some(i => i.status === 'yellow');
            const rag = hasRed ? 'red' : hasYellow ? 'yellow' : 'green';
            const ragColor = rag === 'red' ? 'bg-red-500' : rag === 'yellow' ? 'bg-amber-500' : 'bg-emerald-500';

            // Rough content status (in real use this would be parsed from richCardPath)
            const content = (eq as any).content || '';
            const hasSchedule = content.includes("## Maintenance Schedule") ? "MS ✓" : "MS ✗";
            const hasInstructions = content.includes("## Service Instructions") ? "SI ✓" : "SI ✗";
            const photoCount = (content.match(/\[PHOTO:/g) || []).length;
            const contentStatus = `${hasSchedule} ${hasInstructions} 📷${photoCount}`;

            return (
              <div key={eq.slug} className="rounded-2xl border p-4 bg-card">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium">{eq.name}</div>
                    <div className="text-xs text-muted-foreground">{eq.type} • {eq.fleet}</div>
                    <div className="text-[10px] mt-1 text-muted-foreground">Hours: {eq.currentHours || "—"}</div>
                  </div>
                  <div className="text-right">
                    <div className={`text-xs font-bold px-2 py-0.5 rounded-xl text-white ${ragColor} inline-block`}>
                      {rag.toUpperCase()}
                    </div>
                    <div className="text-[10px] mt-1 font-mono">{contentStatus}</div>
                  </div>
                </div>
                <div className="mt-2 flex gap-2 text-xs">
                  <Link href="/daily-wins" className="underline">Log / Daily Wins</Link>
                  <Link href={`/shop/equipment/${encodeURIComponent(eq.slug)}`} className="underline">Details</Link>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-2 text-[10px] text-muted-foreground">
          MS = Maintenance Schedule | SI = Service Instructions | 📷 = photo placeholders in card. Use Hermes tasks or direct edits to fill gaps.
        </div>
      </div>

      {/* The Mat + Fitness Cross-Domain */}
      <div className="mb-10 rounded-3xl border bg-card p-6">
        <div className="font-semibold mb-2">The Mat Today</div>
        <div className="text-sm text-muted-foreground mb-4">
          {matSuggestion}
        </div>
        <div className="flex flex-wrap gap-3 text-sm">
          <Link href="/routines" className="px-4 py-2 rounded-2xl border hover:bg-muted">Generate Routine</Link>
          <Link href="/fitness" className="px-4 py-2 rounded-2xl border hover:bg-muted">Fitness Status</Link>
          <Link href="/techniques" className="px-4 py-2 rounded-2xl border hover:bg-muted">Technique Library</Link>
        </div>
        <div className="mt-3 text-[10px] text-muted-foreground">
          Full Mat (BJJ) and Fitness capabilities remain fully available alongside Forge operations.
        </div>
      </div>

      {/* Hermes Send (No Copy/Paste) */}
      <div className="mb-10 rounded-3xl border border-emerald-500/30 bg-emerald-950/10 p-6">
        <div className="font-semibold text-emerald-400 mb-2">Send to Hermes (Zero Friction)</div>
        <p className="text-sm text-muted-foreground mb-4">
          When a Hermes review task is created, run this Shortcut. It automatically grabs the latest task file and sends it — no opening Obsidian, no copy/paste.
        </p>
        <a 
          href="shortcuts://run-shortcut?name=Send%20Latest%20Hermes%20Task"
          className="inline-flex items-center rounded-2xl bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white active:bg-emerald-700"
        >
          Run “Send Latest Hermes Task” Shortcut →
        </a>
        <p className="mt-3 text-xs text-muted-foreground">
          Full instructions: <code>00 Meta/Systems/Forge - Hermes Auto-Send Shortcut.md</code>
        </p>
      </div>

      {/* Improvement Comments (Hermes feed) */}
      <div>
        <h2 className="font-semibold text-xl tracking-tight mb-3">Improvements &amp; Feedback</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Leave a note about any equipment, intervals, or instructions. These feed Hermes for timely updates (no manual review required from you).
        </p>

        <form action={async (formData) => {
          'use server';
          const message = formData.get('message') as string;
          const slug = formData.get('equipmentSlug') as string || undefined;
          if (message) {
            await addForgeImprovementComment(message, slug);
          }
        }} className="space-y-3">
          <select name="equipmentSlug" className="w-full rounded-2xl border bg-background p-3 text-sm">
            <option value="">General / System-wide</option>
            {allEquipment.map(e => (
              <option key={e.slug} value={e.slug}>{e.name}</option>
            ))}
          </select>
          <textarea 
            name="message" 
            required 
            placeholder="e.g. The hydraulic interval on the JD2150 feels aggressive for our soil conditions..."
            className="w-full min-h-[90px] rounded-2xl border bg-background p-3 text-sm"
          />
          <button type="submit" className="px-5 py-2.5 rounded-2xl bg-black text-white text-sm font-medium">
            Send Comment for Hermes
          </button>
        </form>

        {pending.length > 0 && (
          <div className="mt-6 text-xs text-muted-foreground">
            {pending.length} open improvement{pending.length > 1 ? 's' : ''} logged.
          </div>
        )}
      </div>

      <div className="mt-10 text-xs text-muted-foreground border-t pt-6">
        This is the new Forge operational hub (Option A). Existing rich Equipment Cards and Job Cards in the vault remain the source for detailed instructions.
        All original The Mat (BJJ), Fitness, and domain capabilities are preserved and accessible.
      </div>
    </div>
  );
}
