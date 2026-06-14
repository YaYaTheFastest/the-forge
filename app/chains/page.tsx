import { getAllTechniques } from '@/lib/vault';

export default async function ChainsPage() {
  const techniques = await getAllTechniques();

  return (
    <div className="max-w-6xl mx-auto p-8">
      <h1 className="text-4xl font-bold tracking-tight mb-2">Technique Chains</h1>
      <p className="text-muted-foreground mb-8 max-w-2xl">
        Connected sequences of techniques. This area will become one of the most powerful parts of The Mat — visual submission chains, position flows, and counter chains.
      </p>

      <div className="rounded-2xl border bg-card p-12 text-center">
        <div className="mx-auto max-w-md">
          <h3 className="font-semibold mb-3">Coming Soon</h3>
          <p className="text-sm text-muted-foreground">
            We will automatically detect and visualize chains from your technique notes and frontmatter relationships (e.g. “leads to”, “counters”, “common follow-up”).
          </p>
          <p className="mt-6 text-xs text-muted-foreground">
            For now, use the Routines page to build visual flows, or add <code>related_techniques</code> in your Obsidian frontmatter.
          </p>
        </div>
      </div>
    </div>
  );
}
