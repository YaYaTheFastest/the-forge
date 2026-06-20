import Link from 'next/link';
import { getAllCustomDomains } from '@/lib/vault';
import DomainsOrbsClient from './forge/DomainsOrbsClient';

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

// Force dynamic rendering so custom domains (Tennis etc.) appear in the main landing "Domains" bubbles immediately.
export const dynamic = 'force-dynamic';

export default async function LandingPage() {
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
          THE FORGE • rockinjracing.com
        </div>
        <h1 className="text-6xl font-semibold tracking-tighter mb-4">Domains</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Your vault, organized as beautiful, actionable hubs. Everything is live from Obsidian.
        </p>
      </div>

      {/* Live orbs including custom domains like Tennis (gray) */}
      <DomainsOrbsClient initialDomains={domains} />

      <div className="text-center text-xs text-muted-foreground">
        Click any domain to explore live vault content. New domains are created and polished automatically via Hermes.
      </div>
    </div>
  );
}
