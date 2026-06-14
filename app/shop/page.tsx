import { getAllShopEquipment } from '@/lib/vault';
import Link from 'next/link';
import { DomainCard } from '@/app/components/DomainCard';

export const metadata = {
  title: 'Equipment • The Forge',
  description: 'Equipment cards and Job Cards for ROCKIN’ J RANCH operations inside The Forge. Visual, operational, hours-based maintenance. Open full profiles inside the Forge like BJJ technique cards.',
};

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ fleet?: string }>;
}) {
  const params = await searchParams;
  const fleetFilter = params.fleet || 'all';

  const allEquipment = await getAllShopEquipment();

  const filteredEquipment = allEquipment.filter((eq) => {
    if (fleetFilter === 'all') return true;
    if (fleetFilter === 'ranch') return eq.fleet !== 'Household';
    if (fleetFilter === 'household') return eq.fleet === 'Household';
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto p-8">
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium tracking-widest text-muted-foreground mb-3">
          THE FORGE — SHOP DOMAIN
        </div>
        <h1 className="text-4xl font-semibold tracking-tighter">Equipment</h1>
        <p className="text-lg text-muted-foreground mt-2 max-w-2xl">
          <strong>Ranch Operations</strong> (tractors, chainsaws, UTVs, mowers, generators, pole pruners, etc.) and <strong>Household</strong> (vacuums, Litter-Robots, fridges, fitness machines) are deliberately distinguished. 
          Hierarchy: <strong>Equipment → Ranch / Household → Category (Tractors, Chainsaws, etc.) → Specific Item → Job Cards</strong>. 
          Pure operational checklists designed for the field. <strong>All content lives in the vault; this is the action surface.</strong> Equipment profiles now open inside The Forge (just like BJJ technique cards).
        </p>
      </div>

      <div className="mb-8">
        <h2 className="font-semibold mb-3">Equipment Hierarchy (The Forge Standard)</h2>
        <div className="text-sm text-muted-foreground mb-4">
          Equipment Type → Specific Equipment Card (Current Hours + Next Service Due, specs, manuals, photos) → Multiple Job Cards (operational checklists).
        </div>
      </div>

      {/* Live Equipment from Vault - with stable URL filtering */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Live Equipment — Click to Open Full Profile in the Forge</h2>
          
          {/* Simple stable filters via URL params */}
          <div className="flex items-center gap-2 text-sm">
            <Link 
              href="/shop" 
              className={`px-3 py-1 rounded-full border ${fleetFilter === 'all' ? 'bg-black text-white' : 'hover:bg-muted'}`}
            >
              All
            </Link>
            <Link 
              href="/shop?fleet=ranch" 
              className={`px-3 py-1 rounded-full border ${fleetFilter === 'ranch' ? 'bg-amber-100 text-amber-800 border-amber-200' : 'hover:bg-muted'}`}
            >
              Ranch Operations
            </Link>
            <Link 
              href="/shop?fleet=household" 
              className={`px-3 py-1 rounded-full border ${fleetFilter === 'household' ? 'bg-sky-100 text-sky-700 border-sky-200' : 'hover:bg-muted'}`}
            >
              Household
            </Link>
          </div>
        </div>

        {filteredEquipment.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredEquipment.map((eq, index) => (
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
          All information lives in your Obsidian vault (20 Knowledge Base/Shop-Property-Ranch/Equipment/). The Forge is the action surface.
        </div>
      </div>

      {/* Legacy / Static Job Card highlights (will be replaced with live links from equipment detail pages) */}
      <div className="mb-12">
        <h2 className="font-semibold mb-4">Example Job Cards (will link from equipment profiles)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          {[
            { equipment: '1987 John Deere 2150', jobs: ['Daily Pre-Use Inspection', 'Hydraulic Fluid Service', 'Change Engine Oil and Filter', 'Winterize Tractor'] },
            { equipment: 'KTM 350 EXCF', jobs: ['Pre-Ride Checklist', 'Oil & Filter Change', 'Tire Change', 'Front and Rear Sprocket Change'] },
          ].map((item, idx) => (
            <div key={idx} className="rounded-2xl border bg-card p-5">
              <h3 className="font-semibold mb-2">{item.equipment}</h3>
              <ul className="text-muted-foreground space-y-0.5">
                {item.jobs.map((job, j) => <li key={j}>• {job}</li>)}
              </ul>
              <div className="mt-3 text-[10px] text-muted-foreground">Full checklists open from the Equipment Profile page</div>
            </div>
          ))}
        </div>
      </div>

      <div className="text-center text-xs text-muted-foreground">
        Working viable product. More equipment (John Deere 4044M, Chicken Coop, Infrastructure...) + full Job Card browser coming next.
      </div>
    </div>
  );
}
