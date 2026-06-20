import Link from 'next/link';
import { getDomainSummary, getAllCustomDomains, getVaultRoot } from '@/lib/vault';
import fs from 'fs/promises';
import path from 'path';

// Force dynamic rendering so newly created domains (added at runtime via chat)
// immediately appear on the /domains grid without requiring a rebuild.
export const dynamic = 'force-dynamic';

const mainDomains = [
  { slug: 'mat', name: 'The Mat (BJJ)', desc: 'Techniques & curriculum' },
  { slug: 'fitness', name: 'Fitness & Recovery', desc: 'Physiology, protocols, mobility' },
  { slug: 'equipment', name: 'Equipment & Ranch', desc: 'Maintenance & Daily Wins' },
  { slug: 'insights', name: 'Cross-Domain Insights', desc: 'Hermes patterns & synthesis' },
  { slug: 'andres', name: 'Andres', desc: 'Flexible space for any content & sharing' },
];

export default async function DomainsIndex() {
  const customs = await getAllCustomDomains();
  const all = [...mainDomains, ...customs.map(c => ({
    slug: c.slug,
    name: c.name,
    desc: `${c.count} items • ${c.sample.slice(0,2).join(', ')}`,
  }))];

  // Load Hermes suggestions if available
  let suggestions: string[] = [];
  try {
    const root = getVaultRoot ? getVaultRoot() : (process.env.THE_MAT_VAULT_ROOT || process.env.THE_MAT_VAULT_PATH || '/opt/vault');
    const sugPath = path.join(root, '00 Meta/Hermes Tasks/Suggested-Domains.md');
    const sugContent = await fs.readFile(sugPath, 'utf8');
    // simple extract lines with names
    suggestions = sugContent.split('\n')
      .filter(l => l.includes(' - ') || l.match(/^\d+\./))
      .map(l => l.replace(/^\d+\.\s*/, '').trim())
      .slice(0, 5);
  } catch {}

  return (
    <div className="max-w-5xl mx-auto p-8">
      <h1 className="text-4xl font-semibold tracking-tighter mb-8">Forge Domains</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {all.map(d => (
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
      <div className="mt-12 p-6 border rounded-2xl bg-card/50">
        <div className="text-sm font-medium mb-2">Hermes Suggested Domains</div>
        {suggestions.length > 0 ? (
          <ul className="text-xs space-y-1">
            {suggestions.map((s, i) => (
              <li key={i}>• {s} <span className="text-muted-foreground">(say "Create a domain named ...")</span></li>
            ))}
          </ul>
        ) : (
          <div className="text-xs text-muted-foreground">Ask in the floating chat: "Suggest new domains based on my vault content" — Hermes will analyze and propose. New domains you create will appear here automatically.</div>
        )}
      </div>

      <div className="mt-6 text-[10px] text-muted-foreground">
        Hide private domains from the site:<br />
        • Prefix folder with <code>_</code> (e.g. <code>_Family</code>) — easiest.<br />
        • Or list in <code>00 Meta/Systems/.hidden-domains</code> (one per line).<br />
        • Or add to the domain&apos;s <code>Overview.md</code> frontmatter: <code>hidden: true</code> or <code>private: true</code>.
      </div>
    </div>
  );
}
