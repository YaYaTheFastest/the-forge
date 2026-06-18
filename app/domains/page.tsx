import Link from 'next/link';

const domains = [
  { slug: 'mat', name: 'The Mat (BJJ)', desc: 'Techniques & curriculum' },
  { slug: 'fitness', name: 'Fitness & Recovery', desc: 'Physiology, protocols, mobility' },
  { slug: 'equipment', name: 'Equipment & Ranch', desc: 'Maintenance & Daily Wins' },
  { slug: 'insights', name: 'Cross-Domain Insights', desc: 'Hermes patterns & synthesis' },
];

export default function DomainsIndex() {
  return (
    <div className="max-w-5xl mx-auto p-8">
      <h1 className="text-4xl font-semibold tracking-tighter mb-8">Forge Domains</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {domains.map(d => (
          <Link key={d.slug} href={`/domains/${d.slug}`} className="block p-6 rounded-2xl border hover:border-foreground/50 bg-card">
            <div className="font-semibold text-2xl">{d.name}</div>
            <div className="text-muted-foreground mt-1">{d.desc}</div>
            <div className="text-xs mt-4 text-emerald-600">Open live vault content →</div>
          </Link>
        ))}
      </div>
      <div className="mt-8 text-xs text-muted-foreground">
        Or go to the beautiful <Link href="/forge" className="underline">Forge homepage with orbs</Link>.
      </div>
    </div>
  );
}
