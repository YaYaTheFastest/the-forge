'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

const domains = [
  {
    slug: 'mat',
    name: 'The Mat',
    icon: '🥋',
    short: 'BJJ techniques, GB1 curriculum, captures & personal mastery.',
    color: 'emerald',
    href: '/domains/mat',
  },
  {
    slug: 'fitness',
    name: 'Fitness & Recovery',
    icon: '💪',
    short: 'Physiology, protocols, mobility & health data with BJJ transfer.',
    color: 'blue',
    href: '/domains/fitness',
  },
  {
    slug: 'equipment',
    name: 'Equipment & Ranch',
    icon: '🔧',
    short: 'Maintenance schedules, hours, Daily Wins & standardization.',
    color: 'amber',
    href: '/domains/equipment',
  },
  {
    slug: 'insights',
    name: 'Cross-Domain Insights',
    icon: '🔄',
    short: 'Patterns, Hermes syntheses & intelligence across all areas.',
    color: 'violet',
    href: '/domains/insights',
  },
  {
    slug: 'andres',
    name: 'Andres',
    icon: '📓',
    short: 'Flexible space for any content, notes, and future sharing.',
    color: 'fuchsia',
    href: '/domains/andres',
  },
];

export default function LandingPage() {
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

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-12">
        {domains.map((d) => (
          <Link key={d.slug} href={d.href} className="group">
            <motion.div
              whileHover={{ scale: 1.04 }}
              className={`
                aspect-square w-full rounded-full border flex flex-col items-center justify-center text-center p-6
                bg-card hover:bg-muted/50 transition-all cursor-pointer
                ${d.color === 'emerald' ? 'border-emerald-500/30 hover:shadow-[0_0_40px_rgba(16,185,129,0.25)]' : ''}
                ${d.color === 'blue' ? 'border-blue-500/30 hover:shadow-[0_0_40px_rgba(59,130,246,0.25)]' : ''}
                ${d.color === 'amber' ? 'border-amber-500/30 hover:shadow-[0_0_40px_rgba(245,158,11,0.25)]' : ''}
                ${d.color === 'violet' ? 'border-violet-500/30 hover:shadow-[0_0_40px_rgba(139,92,246,0.25)]' : ''}
                ${d.color === 'fuchsia' ? 'border-fuchsia-500/30 hover:shadow-[0_0_40px_rgba(217,70,239,0.25)]' : ''}
              `}
            >
              <div className="text-6xl mb-3">{d.icon}</div>
              <div className="font-semibold text-2xl tracking-tight mb-1">{d.name}</div>
              <div className="text-xs text-muted-foreground max-w-[160px] leading-snug px-2">
                {d.short}
              </div>
            </motion.div>
          </Link>
        ))}

        {/* + New Domain - now active and prominent */}
        <button
          type="button"
          onClick={() => {
            const evt = new CustomEvent('open-hermes-chat', {
              detail: {
                message: 'Create a new domain in The Forge. Suggest a good name, where it should live in the vault (00 Meta/Systems/Domains or 20 Knowledge Base), and generate initial high-quality standardized content by searching my existing notes and captures.',
              },
            });
            window.dispatchEvent(evt);
          }}
          className="group aspect-square w-full rounded-full border-2 border-dashed border-emerald-500/40 flex flex-col items-center justify-center text-center p-6 hover:border-emerald-500 hover:bg-emerald-500/5 hover:shadow-[0_0_30px_rgba(16,185,129,0.2)] transition-all cursor-pointer active:scale-[0.985]"
        >
          <div className="text-5xl mb-2 opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-transform">+</div>
          <div className="font-semibold text-lg">+ New Domain</div>
          <div className="text-xs text-muted-foreground mt-1">Hermes will create &amp; structure it</div>
        </button>
      </div>

      <div className="text-center text-xs text-muted-foreground">
        Click any domain to explore live vault content. New domains are created and polished automatically via Hermes.
      </div>
    </div>
  );
}
