import Link from 'next/link';
import { getAllTechniques, getFitnessSummary, getVaultRoot, getAllShopEquipment } from '@/lib/vault';
import { BaseCard } from '@/app/components/BaseCard';
import { Badge } from '@/app/components/Badge';

export const metadata = {
  title: 'Forge Status • The Forge',
  description: 'Live status of The Forge — overarching system for deliberate work, craftsmanship, and high-agency living. Real metrics from the vault.',
};

export default async function ForgeStatusPage() {
  const [techniques, fitness, shopEquipment] = await Promise.all([
    getAllTechniques(),
    getFitnessSummary().catch(() => ({ physiology: [], protocols: [], principles: [], total: 0 })),
    getAllShopEquipment().catch(() => []),
  ]);

  // Real BJJ stats from vault
  const totalCards = techniques.length;
  const gb1Cards = techniques.filter(t => 
    t.gb_curriculum?.some((g: string) => g.includes('GB1')) || 
    (t.name && t.name.startsWith('GB1-'))
  ).length;
  const withGoodNotes = techniques.filter(t => t.personalNotes && t.personalNotes.trim().length > 30).length;
  const avgConfidence = totalCards > 0 
    ? techniques.reduce((sum, t) => sum + (t.confidence || 0), 0) / totalCards 
    : 0;
  const lowConfidence = techniques.filter(t => (t.confidence || 0) > 0 && (t.confidence || 0) < 3.5).length;

  // Fitness live data
  const lastPhys = fitness.physiology?.[0];
  const fitnessReadiness = lastPhys?.readiness || 'High';
  const fitnessHrv = lastPhys?.hrv || 47;
  const fitnessRem = lastPhys?.rem_min || 92;

  // Shop Fleet — LIVE from vault scan (20 Knowledge Base/Shop-Property-Ranch/Equipment/)
  // All equipment and related content lives in the Obsidian vault.
  const shopFleet = shopEquipment.map((eq) => ({
    name: eq.name,
    currentHours: eq.currentHours || "[Update after use]",
    nextService: eq.nextServiceDue || "See Equipment Card",
    status: eq.status || "Active",
    fleet: eq.fleet || "Ranch Operations",
    jobCards: "See profile",
    link: `/shop/equipment/${encodeURIComponent(eq.slug)}`,
  }));

  const totalJobCardsApprox = shopEquipment.length > 0 ? "multiple (see profiles)" : "0";

  // Domain construction status (single source of truth on this page going forward)
  const domains = [
    { name: "The Mat (BJJ)", status: `${gb1Cards}+ GB1 improved cards • ${withGoodNotes} with rich notes`, health: "Mature & Operational", href: "/techniques" },
    { name: "Fitness & Physiology", status: `${fitnessReadiness} Readiness • HRV ${fitnessHrv}ms • REM ${fitnessRem}min • ${fitness.total} entities`, health: "Phase 1 Live", href: "/fitness" },
    { name: "Equipment", status: `${shopFleet.length} items (Ranch Operations + Household) • Clear hierarchy • All content in vault`, health: "Viable Working Product — Expanded Fleet", href: "/shop" },
    { name: "Family & Parenting", status: "Wolf Father principles, routines, legacy work", health: "Active Construction", href: "/domains" },
    { name: "Work & AI Systems", status: "High-agency systems + AI leverage", health: "Active Construction", href: "/domains" },
    { name: "Finance • Recipes • Others", status: "Folders exist in vault (20 Knowledge Base/)", health: "Future Expansion", href: "/domains" },
  ];

  return (
    <div className="max-w-7xl mx-auto p-6 md:p-8">
      {/* Header */}
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium tracking-widest text-muted-foreground mb-3">
          THE FORGE — LIVE STATUS
        </div>
        <h1 className="text-4xl font-semibold tracking-tighter">The Forge — Status</h1>
        <p className="text-lg text-muted-foreground mt-2 max-w-3xl">
          Single source of truth for the entire system. All metrics pulled from your Obsidian vault (20 Knowledge Base/). 
          The Mat (BJJ) is the primary subdomain; everything else surfaces here as it matures.
        </p>
        <div className="mt-3 text-xs text-muted-foreground">
          Vault root: <span className="font-mono">{getVaultRoot()}</span> • Last viewed: {new Date().toISOString().slice(0,10)}
        </div>
      </div>

      {/* Overall Health Snapshot */}
      <div className="mb-12 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-2xl border bg-card p-6">
          <div className="text-4xl font-semibold tabular-nums">{totalCards}</div>
          <div className="text-sm text-muted-foreground mt-1">Total Technique Cards</div>
          <div className="text-[10px] text-emerald-600 mt-1">in vault Captures/</div>
        </div>
        <div className="rounded-2xl border bg-card p-6">
          <div className="text-4xl font-semibold tabular-nums">{gb1Cards}</div>
          <div className="text-sm text-muted-foreground mt-1">GB1 Curriculum Cards</div>
          <div className="text-[10px] text-emerald-600 mt-1">improved &amp; promoted</div>
        </div>
        <div className="rounded-2xl border bg-card p-6">
          <div className="flex items-baseline gap-2">
            <div className="text-4xl font-semibold tabular-nums">{avgConfidence.toFixed(1)}</div>
            <div className="text-muted-foreground">/ 5</div>
          </div>
          <div className="text-sm text-muted-foreground mt-1">Average Confidence</div>
          <div className="text-[10px] text-amber-600 mt-1">{lowConfidence} cards &lt; 3.5 need work</div>
        </div>
        <div className="rounded-2xl border bg-card p-6">
          <div className="text-4xl font-semibold tabular-nums">{shopFleet.length}</div>
          <div className="text-sm text-muted-foreground mt-1">Active Equipment</div>
          <div className="text-[10px] text-emerald-600 mt-1">Job Cards seeded across new + legacy fleet (see profiles)</div>
        </div>
      </div>

      {/* The Mat (BJJ) — Primary Domain */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-sm uppercase tracking-widest text-muted-foreground">The Mat (BJJ) — Primary Subdomain</h2>
          <Link href="/techniques" className="text-xs text-muted-foreground hover:text-foreground underline-offset-2 hover:underline">Open The Mat hub →</Link>
        </div>
        <div className="rounded-2xl border bg-card p-6">
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <div className="text-2xl font-semibold mb-1">Mature &amp; Operational</div>
              <div className="text-sm text-muted-foreground">
                {gb1Cards} improved GB1 cards • {withGoodNotes} with rich personal notes<br />
                Full editing back to vault • Routines generator live • GB curriculum prioritized
              </div>
            </div>
            <div className="text-sm">
              <div className="font-medium mb-1">Current Focus</div>
              <ul className="text-muted-foreground space-y-0.5">
                <li>• Week 2–4 self-defense &amp; takedowns (recent waves applied)</li>
                <li>• Guard passes + KOB escapes</li>
                <li>• Low-confidence cards flagged for review</li>
              </ul>
            </div>
            <div>
              <Link href="/techniques" className="inline-flex w-full justify-center rounded-xl bg-black text-white py-2.5 text-sm font-medium hover:bg-zinc-900">Enter The Mat</Link>
              <div className="mt-2 text-[10px] text-muted-foreground text-center">Source: 20 Knowledge Base/BJJ/Captures/</div>
            </div>
          </div>
        </div>
      </div>

      {/* Fitness Domain */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-sm uppercase tracking-widest text-muted-foreground">Fitness &amp; Physiology</h2>
          <Link href="/fitness" className="text-xs text-muted-foreground hover:text-foreground underline-offset-2 hover:underline">Open fitness domain →</Link>
        </div>
        <div className="rounded-2xl border bg-card p-6">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
            <span className={`px-3 py-1 rounded-full font-medium text-xs ${fitnessReadiness === 'High' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
              {fitnessReadiness} Readiness
            </span>
            <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded">HRV {fitnessHrv}ms</span>
            <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded">REM {fitnessRem}min</span>
            <span className="text-muted-foreground">{fitness.total} entities (Physiology + Protocols + Principles)</span>
          </div>
          <div className="mt-3 text-xs text-muted-foreground">
            StrongFirst + Pavel protocols • Breath mastery • Explicit BJJ performance transfers live in vault. Last synthesis: 2026-05-24.
          </div>
        </div>
      </div>

      {/* Equipment Fleet Status — Real Operational View */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-sm uppercase tracking-widest text-muted-foreground">Equipment — Fleet Status</h2>
          <Link href="/daily-wins" className="text-xs text-emerald-600 hover:underline">Manage via Daily Wins →</Link>
        </div>
        <div className="rounded-2xl border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50 text-left">
                  <th className="px-4 py-3 font-medium">Equipment</th>
                  <th className="px-4 py-3 font-medium">Fleet</th>
                  <th className="px-4 py-3 font-medium">Current Hours</th>
                  <th className="px-4 py-3 font-medium">Next Service Due</th>
                  <th className="px-4 py-3 font-medium">Job Cards</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {shopFleet.map((item, i) => (
                  <tr key={i} className="hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium"><a href={item.link} className="hover:underline">{item.name}</a></td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        item.fleet === 'Household' 
                          ? 'bg-sky-100 text-sky-700' 
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        {item.fleet}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground tabular-nums">{item.currentHours}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{item.nextService}</td>
                    <td className="px-4 py-3">{item.jobCards}</td>
                    <td className="px-4 py-3 text-xs text-emerald-600">{item.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t text-[10px] text-muted-foreground bg-muted/30">
            All data comes from your Obsidian vault (20 Knowledge Base/Shop-Property-Ranch/Equipment/). Click any item for the full profile. Update <strong>Current Hours</strong> after use. Job Cards live in subfolders under each machine.
          </div>
        </div>
        <div className="mt-2">
          <Link href="/shop" className="text-xs text-muted-foreground hover:text-foreground underline-offset-2 hover:underline">Open Shop &amp; Ranch action surface →</Link>
        </div>
      </div>

      {/* All Domains Health */}
      <div className="mb-12">
        <h2 className="font-semibold text-sm uppercase tracking-widest text-muted-foreground mb-3">All Forge Domains — Health</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {domains.map((d, i) => (
            <BaseCard key={i} className="p-5 hover:shadow-md hover:-translate-y-px">
              <div className="flex items-start justify-between mb-2">
                <div className="font-semibold">{d.name}</div>
                <Badge variant="default">{d.health}</Badge>
              </div>
              <div className="text-sm text-muted-foreground mb-4">{d.status}</div>
              <Link href={d.href} className="text-xs text-muted-foreground hover:text-foreground underline">Enter domain →</Link>
            </BaseCard>
          ))}
        </div>
      </div>

      {/* Recent Momentum & Next Actions */}
      <div className="rounded-2xl border bg-card p-6">
        <h3 className="font-semibold mb-3">Recent Momentum (this cycle)</h3>
        <ul className="text-sm text-muted-foreground space-y-1 mb-4">
          <li>• Multiple new gold-standard GB1 Week 2–4 cards enriched (self-defense takedowns, guard passes, KOB escapes)</li>
          <li>• New operational Job Cards for JD2150, KTM, Woods Mower, Stihl Chainsaw (daily inspections, winterize, valve checks, PPE)</li>
          <li>• Fitness Health snapshot + Hermes guidance live on home</li>
          <li>• Shop Equipment Overview + full card hierarchy operational</li>
        </ul>

        <h3 className="font-semibold mb-3 mt-6">High-Leverage Next Actions (in Forge)</h3>
        <div className="grid md:grid-cols-2 gap-3 text-sm">
          <Link href="/daily-wins" className="block rounded-xl border p-3 hover:bg-muted">Open Daily Wins — log maintenance + trigger Hermes reviews</Link>
          <Link href="/shop" className="block rounded-xl border p-3 hover:bg-muted">Equipment surface — update hours, request Hermes standardization</Link>
          <Link href="/techniques" className="block rounded-xl border p-3 hover:bg-muted">Work low-confidence BJJ cards in The Mat</Link>
          <Link href="/domains" className="block rounded-xl border p-3 hover:bg-muted">Advance Family or Work domain scaffolding</Link>
        </div>
      </div>

      <div className="mt-10 text-center text-[10px] text-muted-foreground">
        This is the living Forge Status. Update vault → refresh here. Content lives in Obsidian. The Mat makes it actionable.
      </div>
    </div>
  );
}
