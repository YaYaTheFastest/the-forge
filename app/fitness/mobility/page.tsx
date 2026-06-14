import Link from 'next/link';
import { DomainCard } from '@/app/components/DomainCard';

export const metadata = {
  title: 'Mobility • Fitness • The Forge',
  description: 'Time-efficient mobility protocols (5 / 10 / 15 min) designed for BJJ performance and recovery. Sub-domain of Fitness.',
};

export default function MobilityPage() {
  const workouts = [
    {
      title: '5-Minute Daily Mobility Reset',
      duration: '5 min',
      description: 'Quick full-body reset focused on hips, thoracic spine, and shoulders. Ideal for daily use.',
      link: '/fitness/mobility/5-minute',
      color: 'bg-emerald-100 text-emerald-700',
    },
    {
      title: '10-Minute BJJ-Focused Mobility',
      duration: '10 min',
      description: 'Targeted work for hip rotation, thoracic mobility, and shoulder function with direct BJJ transfer.',
      link: '/fitness/mobility/10-minute',
      color: 'bg-blue-100 text-blue-700',
    },
    {
      title: '15-Minute Comprehensive Mobility Flow',
      duration: '15 min',
      description: 'Deeper full-body session for recovery days or when you want more thorough work.',
      link: '/fitness/mobility/15-minute',
      color: 'bg-violet-100 text-violet-700',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto p-6 md:p-8">
      <div className="mb-8">
        <Link href="/fitness" className="text-sm text-muted-foreground hover:text-foreground">← Back to Fitness</Link>
        <h1 className="text-4xl font-semibold tracking-tighter mt-2">Mobility</h1>
        <p className="text-lg text-muted-foreground mt-2 max-w-2xl">
          Time-efficient mobility protocols designed as a sub-domain of Fitness. Built for BJJ athletes who want high return on limited time.
        </p>
      </div>

      <div className="mb-8">
        <Link 
          href="/fitness/mobility/overview" 
          className="inline-flex items-center gap-2 text-sm px-4 py-2 rounded-full border hover:bg-muted"
        >
          View Full Mobility Overview in Vault →
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {workouts.map((w, index) => (
          <DomainCard
            key={w.title}
            href={w.link}
            title={w.title}
            badges={[{ label: w.duration, variant: 'info' }]}
            description={w.description}
            thumbnail={`https://picsum.photos/id/${1005 + index}/600/300`}
          />
        ))}
      </div>

      <div className="mt-12 text-sm text-muted-foreground">
        All mobility protocols live in the vault under <span className="font-mono">Fitness/Mobility/</span>. 
        Choose based on available time and training demands.
      </div>
    </div>
  );
}
