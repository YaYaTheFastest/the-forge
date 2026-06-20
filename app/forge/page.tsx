import Link from 'next/link';
import { getAllCustomDomains } from '@/lib/vault';
import DomainsOrbsClient from './DomainsOrbsClient';

// Force dynamic so newly-created domains (runtime vault writes from chat)
// appear as bubbles immediately on page load/refresh, without needing another build.
export const dynamic = 'force-dynamic';

interface Domain {
  slug: string;
  name: string;
  icon: string;
  short: string;
  color: string;
  href: string;
}

const mainDomains: Domain[] = [
  { slug: 'mat', name: 'The Mat', short: 'BJJ techniques, GB1 curriculum, captures & personal mastery.', color: 'emerald', href: '/domains/mat', icon: '🥋' },
  { slug: 'fitness', name: 'Fitness & Recovery', short: 'Physiology, protocols, mobility & health data with BJJ transfer.', color: 'blue', href: '/domains/fitness', icon: '💪' },
  { slug: 'equipment', name: 'Equipment & Ranch', short: 'Maintenance schedules, hours, Daily Wins & standardization.', color: 'amber', href: '/domains/equipment', icon: '🔧' },
  { slug: 'insights', name: 'Cross-Domain Insights', short: 'Patterns, Hermes syntheses & intelligence across all areas.', color: 'violet', href: '/domains/insights', icon: '🔄' },
  { slug: 'andres', name: 'Andres', short: 'Flexible space for any content, notes, and future sharing.', color: 'fuchsia', href: '/domains/andres', icon: '📓' },
];

export default async function ForgeHomepage() {
  // Server-render the full live list from the vault at request time.
  // This guarantees custom domains (e.g. Tennis) appear as gray bubbles immediately,
  // without depending on a client fetch that may be affected by auth.
  let customs: Awaited<ReturnType<typeof getAllCustomDomains>> = [];
  try {
    customs = await getAllCustomDomains();
  } catch {}

  const customDomains: Domain[] = customs.map(c => ({
    slug: c.slug,
    name: c.name,
    short: `${c.count} items • ${c.sample.slice(0, 2).join(', ')}`,
    color: 'gray',
    href: `/domains/${c.slug}`,
    icon: '📁',
  }));

  const domains = [...mainDomains, ...customDomains];

  return (
    <div className="max-w-7xl mx-auto p-8">
      <div className="mb-12 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border px-4 py-1 text-xs font-medium tracking-[2px] text-muted-foreground mb-4">
          THE FORGE
        </div>
        <h1 className="text-6xl font-semibold tracking-tighter mb-4">Domains</h1>
        <button
          onClick={() => {
            if (typeof window !== 'undefined') {
              const evt = new CustomEvent('open-hermes-chat', {
                detail: {
                  message: 'forge autonomous-optimize',
                },
              });
              window.dispatchEvent(evt);
            }
          }}
          className="mt-4 px-6 py-2 rounded-full bg-emerald-600 text-white text-sm hover:bg-emerald-700 transition"
        >
          Autonomous Optimize (zero-input, full cycle)
        </button>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Your vault, organized as beautiful, actionable hubs. Everything is live.
        </p>
      </div>

      {/* Client component handles only the animated orbs + hover + New button interactivity.
          Initial data comes from the server (always fresh customs). */}
      <DomainsOrbsClient initialDomains={domains} />

      <div className="text-center text-xs text-muted-foreground">
        Click any domain to explore live vault content. New domains are created and polished automatically via Hermes.
      </div>

      <div className="mt-12 p-6 border rounded-2xl bg-card/50 max-w-2xl mx-auto">
        <div className="text-sm font-medium mb-2">Hermes Suggested Domains</div>
        <div className="text-xs text-muted-foreground">
          Ask in the floating chat (while here): "Suggest new domains based on my vault content" — Hermes will analyze and list them. They will appear in the list above once created.
        </div>
      </div>

      <div className="mt-4 text-[10px] text-muted-foreground max-w-2xl mx-auto text-center">
        Hide private domains: prefix folder with <code>_</code> (e.g. <code>_Family</code>), list in <code>00 Meta/Systems/.hidden-domains</code>, or set <code>hidden: true</code> in Overview.md frontmatter.
      </div>

      {/* Custom domains from vault will appear here once created via chat */}
      <div className="mt-8 text-center">
        <p className="text-xs text-muted-foreground">Custom domains you create (e.g. Tennis) automatically appear in the full list at <Link href="/domains" className="underline">/domains</Link>.</p>
      </div>

      <div className="mt-8 text-xs text-muted-foreground text-center">
        Hermes can suggest more based on your vault — ask in the chat while on this page.
      </div>
    </div>
  );
}
