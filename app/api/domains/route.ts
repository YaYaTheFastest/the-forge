import { NextResponse } from 'next/server';
import { getAllCustomDomains } from '@/lib/vault';

const mainDomains = [
  { slug: 'mat', name: 'The Mat', short: 'BJJ techniques, GB1 curriculum, captures & personal mastery.', color: 'emerald', href: '/domains/mat', icon: '🥋' },
  { slug: 'fitness', name: 'Fitness & Recovery', short: 'Physiology, protocols, mobility & health data with BJJ transfer.', color: 'blue', href: '/domains/fitness', icon: '💪' },
  { slug: 'equipment', name: 'Equipment & Ranch', short: 'Maintenance schedules, hours, Daily Wins & standardization.', color: 'amber', href: '/domains/equipment', icon: '🔧' },
  { slug: 'insights', name: 'Cross-Domain Insights', short: 'Patterns, Hermes syntheses & intelligence across all areas.', color: 'violet', href: '/domains/insights', icon: '🔄' },
  { slug: 'andres', name: 'Andres', short: 'Flexible space for any content, notes, and future sharing.', color: 'fuchsia', href: '/domains/andres', icon: '📓' },
];

export async function GET() {
  const customs = await getAllCustomDomains();
  const customDomains = customs.map(c => ({
    slug: c.slug,
    name: c.name,
    short: `${c.count} items • ${c.sample.slice(0,2).join(', ')}`,
    color: 'gray',
    href: `/domains/${c.slug}`,
    icon: '📁',
  }));
  return NextResponse.json({ domains: [...mainDomains, ...customDomains] });
}
