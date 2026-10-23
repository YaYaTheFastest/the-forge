import { getAllShopEquipment } from '@/lib/vault';
import ShopClient from './ShopClient';

export const metadata = {
  title: 'Equipment • The Forge',
  description: 'Equipment cards and Job Cards for ROCKIN’ J RANCH operations inside The Forge. Visual, operational, hours-based maintenance. Open full profiles inside the Forge like BJJ technique cards.',
};

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ fleet?: string; type?: string; search?: string; status?: string }>;
}) {
  const params = await searchParams;
  const allEquipment = await getAllShopEquipment();

  return (
    <div className="max-w-7xl mx-auto p-8">
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium tracking-widest text-muted-foreground mb-3">
          THE FORGE — SHOP DOMAIN
        </div>
        <h1 className="text-4xl font-semibold tracking-tighter">Equipment</h1>
        <p className="text-lg text-muted-foreground mt-2 max-w-2xl">
          <strong>Ranch Operations</strong> (tractors, chainsaws, UTVs, mowers, generators, pole pruners, etc.) and <strong>Household</strong> (vacuums, Litter-Robots, fridges, fitness machines) are deliberately distinguished. 
          Hierarchy: <strong>Equipment → Ranch / Household → Category → Specific Item → Job Cards</strong>. 
          Pure operational checklists designed for the field. <strong>All content lives in the vault; this is the action surface.</strong>
        </p>
      </div>

      <div className="mb-8">
        <h2 className="font-semibold mb-3">Equipment Hierarchy (The Forge Standard)</h2>
        <div className="text-sm text-muted-foreground mb-4">
          Equipment Type → Specific Equipment Card (Current Hours + Next Service Due, specs, manuals, photos) → Multiple Job Cards (operational checklists).
        </div>
      </div>

      {/* Interactive filter layout similar to techniques */}
      <ShopClient 
        initialEquipment={allEquipment} 
        initialFleet={params.fleet || 'all'}
        initialType={params.type || ''}
        initialSearch={params.search || ''}
        initialStatus={params.status || ''}
      />

      <div className="mt-12 text-center text-xs text-muted-foreground">
        All equipment loaded from vault. Use Grok chat for gold standard updates.
      </div>
    </div>
  );
}
