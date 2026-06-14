import { getAllTechniques } from '@/lib/vault';
import { RoutineGenerator } from './RoutineGenerator';

export default async function RoutinesPage() {
  const techniques = await getAllTechniques();

  return (
    <div className="max-w-7xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight">Routines &amp; Mind Maps</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">
          Generate intelligent training flows from your vault. Visualize them as connected mind maps for better retention and mat application.
        </p>
      </div>

      <RoutineGenerator techniques={techniques} />
    </div>
  );
}
