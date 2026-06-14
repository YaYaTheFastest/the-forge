import { getAllTechniques, getAllMindMaps } from '@/lib/vault';
import MindMapsClient from './MindMapsClient';

export default async function MindMapsPage() {
  const [techniques, mindMaps] = await Promise.all([
    getAllTechniques(),
    getAllMindMaps(),
  ]);

  return (
    <div className="max-w-7xl mx-auto p-8">
      <MindMapsClient techniques={techniques} mindMaps={mindMaps} />
    </div>
  );
}
