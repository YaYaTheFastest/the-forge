'use client';

import { useState, useMemo } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { DomainCard } from '@/app/components/DomainCard';
import type { ShopEquipment } from '@/lib/types';

export default function ShopClient({ 
  initialEquipment, 
  initialFleet = 'all',
  initialType = '',
  initialSearch = '',
  initialStatus = ''
}: { 
  initialEquipment: ShopEquipment[]; 
  initialFleet?: string;
  initialType?: string;
  initialSearch?: string;
  initialStatus?: string;
}) {
  const [search, setSearch] = useState(initialSearch);
  const [fleet, setFleet] = useState(initialFleet);
  const [selectedTypes, setSelectedTypes] = useState<string[]>(initialType ? [initialType] : []);
  const [status, setStatus] = useState(initialStatus);

  const router = useRouter();
  const pathname = usePathname();
  const urlSearchParams = useSearchParams();

  // Extract unique types and statuses
  const allTypes = useMemo(() => {
    const types = new Set(initialEquipment.map(e => e.equipmentType).filter(Boolean) as string[]);
    return Array.from(types).sort();
  }, [initialEquipment]);

  const allStatuses = useMemo(() => {
    const sts = new Set(initialEquipment.map(e => e.status).filter(Boolean) as string[]);
    return Array.from(sts).sort();
  }, [initialEquipment]);

  const filtered = useMemo(() => {
    return initialEquipment.filter((eq) => {
      const matchesSearch = !search || 
        eq.name.toLowerCase().includes(search.toLowerCase()) ||
        (eq.equipmentType || '').toLowerCase().includes(search.toLowerCase());
      
      let matchesFleet = true;
      if (fleet === 'ranch') matchesFleet = eq.fleet !== 'Household';
      if (fleet === 'household') matchesFleet = eq.fleet === 'Household';

      const matchesType = selectedTypes.length === 0 || 
        (eq.equipmentType && selectedTypes.some(t => eq.equipmentType!.toLowerCase().includes(t.toLowerCase())));

      const matchesStatus = !status || eq.status === status;

      return matchesSearch && matchesFleet && matchesType && matchesStatus;
    });
  }, [initialEquipment, search, fleet, selectedTypes, status]);

  // Simple URL sync for fleet (keep simple like before for shareability)
  const updateFleet = (newFleet: string) => {
    setFleet(newFleet);
    const params = new URLSearchParams(urlSearchParams.toString());
    if (newFleet === 'all') params.delete('fleet');
    else params.set('fleet', newFleet);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const toggleType = (t: string) => {
    const norm = t.toLowerCase();
    setSelectedTypes(prev => 
      prev.some(p => p.toLowerCase() === norm) 
        ? prev.filter(p => p.toLowerCase() !== norm)
        : [...prev, t]
    );
  };

  return (
    <>
      <div className="mb-8">
        <div className="flex flex-col gap-4">
          {/* Search */}
          <div className="flex items-center gap-2">
            <input 
              type="text" 
              placeholder="Search equipment by name or type..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 px-4 py-2 border rounded-xl text-sm focus:outline-none focus:border-blue-500"
            />
            {search && (
              <button onClick={() => setSearch('')} className="px-3 py-1 text-sm border rounded hover:bg-muted">Clear</button>
            )}
          </div>

          {/* Fleet filters */}
          <div className="flex items-center gap-2 text-sm flex-wrap">
            <span className="text-xs uppercase tracking-widest text-muted-foreground mr-2">Fleet:</span>
            {['all', 'ranch', 'household'].map(f => (
              <button 
                key={f}
                onClick={() => updateFleet(f)}
                className={`px-3 py-1 rounded-full border text-sm ${fleet === f ? 'bg-black text-white' : 'hover:bg-muted'}`}
              >
                {f === 'all' ? 'All' : f === 'ranch' ? 'Ranch Operations' : 'Household'}
              </button>
            ))}
          </div>

          {/* Type filters - multi like categories */}
          <div className="flex items-center gap-2 text-sm flex-wrap">
            <span className="text-xs uppercase tracking-widest text-muted-foreground mr-2">Type:</span>
            {allTypes.slice(0, 12).map(t => (
              <button 
                key={t}
                onClick={() => toggleType(t)}
                className={`px-3 py-1 rounded-full border text-xs ${selectedTypes.some(s => s.toLowerCase() === t.toLowerCase()) ? 'bg-amber-100 text-amber-800 border-amber-200' : 'hover:bg-muted'}`}
              >
                {t}
              </button>
            ))}
            {allTypes.length > 12 && <span className="text-xs text-muted-foreground">+ more</span>}
          </div>

          {/* Status quick filters */}
          <div className="flex items-center gap-2 text-sm flex-wrap">
            <span className="text-xs uppercase tracking-widest text-muted-foreground mr-2">Status:</span>
            <button onClick={() => setStatus('')} className={`px-3 py-1 rounded-full border text-xs ${!status ? 'bg-black text-white' : 'hover:bg-muted'}`}>Any</button>
            {allStatuses.map(s => (
              <button 
                key={s}
                onClick={() => setStatus(status === s ? '' : s)}
                className={`px-3 py-1 rounded-full border text-xs ${status === s ? 'bg-emerald-100 text-emerald-800' : 'hover:bg-muted'}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mb-4 text-sm text-muted-foreground">
        Showing {filtered.length} of {initialEquipment.length} equipment cards
        {search && ` matching "${search}"`}
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((eq, index) => (
            <DomainCard
              key={eq.slug}
              href={`/shop/equipment/${encodeURIComponent(eq.slug)}`}
              title={eq.name}
              subtitle={eq.equipmentType}
              badges={[
                ...(eq.fleet ? [{ 
                  label: eq.fleet, 
                  variant: (eq.fleet === 'Household' ? 'fitness' : 'equipment') as 'fitness' | 'equipment'
                }] : []),
                ...(eq.status ? [{ label: eq.status, variant: 'success' as const }] : []),
              ]}
              metadata={
                eq.currentHours 
                  ? `Current Hours: ${eq.currentHours}` 
                  : 'Hours not yet recorded'
              }
              description={eq.nextServiceDue ? `Next service: ${eq.nextServiceDue}` : undefined}
              thumbnail={index % 3 === 0 ? `https://picsum.photos/id/${1011 + index}/600/300` : undefined}
            />
          ))}
        </div>
      ) : (
        <div className="text-sm text-muted-foreground border rounded-2xl p-6">
          No equipment cards found for this filter.
        </div>
      )}

      <div className="mt-6 text-xs text-muted-foreground">
        All information lives in your Obsidian vault (20 Knowledge Base/Shop-Property-Ranch/Equipment/). The Forge is the action surface. Use Grok chat for gold standard updates.
      </div>
    </>
  );
}
