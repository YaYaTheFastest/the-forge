'use client';

import { useState } from 'react';

export default function DomainClient({ slug, title, initialSummary, extraData }: any) {
  const [search, setSearch] = useState('');

  // Simple client-side filter for demo. In real, could fetch more or use server actions.
  const sampleItems = extraData.techniqueNames 
    ? extraData.techniqueNames
    : extraData.equipmentNames 
    ? extraData.equipmentNames
    : ['Overview', 'Key Notes', 'Hermes Syntheses', 'Related Captures'];

  const filtered = sampleItems.filter((item: string) => 
    item.toLowerCase().includes(search.toLowerCase())
  );

  const handlePolish = () => {
    const evt = new CustomEvent('open-hermes-chat', {
      detail: { 
        message: `Polish and standardize all content in the ${title} domain. Search the vault for related files, apply the highest quality Forge template (rich structure, principles, cross-references), and write polished versions directly back to the vault.` 
      },
    });
    window.dispatchEvent(evt);
  };

  return (
    <div>
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search this domain's content..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md px-4 py-2 rounded-xl border bg-background focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {filtered.length > 0 ? (
          filtered.map((item: string, i: number) => (
            <div key={i} className="p-5 border rounded-2xl bg-card hover:border-emerald-500/50 transition-colors">
              <div className="font-medium">{item}</div>
              <div className="text-xs text-muted-foreground mt-1">Pulled live from vault • {title}</div>
            </div>
          ))
        ) : (
          <div className="text-sm text-muted-foreground col-span-full">No matches. The full content lives in your Obsidian vault.</div>
        )}
      </div>

      <div className="mt-8 border-t pt-8">
        <button
          onClick={handlePolish}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium"
        >
          Polish this domain with Hermes (auto write to vault)
        </button>
        <p className="text-[10px] text-muted-foreground mt-2">Grok searches your vault, standardizes, and writes improved files automatically. No manual paste needed.</p>
      </div>

      <div className="text-xs text-muted-foreground mt-4">
        This view is a live projection from your vault. Use the Hermes chat for full standardization and creation of new content.
      </div>
    </div>
  );
}
