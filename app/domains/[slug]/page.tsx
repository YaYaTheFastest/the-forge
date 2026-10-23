import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getDomainSummary, getAllTechniques, getFitnessSummary, getAllShopEquipment, getDomainFiles, isDomainHidden } from '@/lib/vault';
import DomainClient from './DomainClient';

export default async function DomainPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  if (await isDomainHidden(slug)) {
    notFound();
  }

  const summary = await getDomainSummary(slug);

  let extraData: any = {};
  if (slug === 'mat' || slug === 'bjj') {
    const techs = await getAllTechniques();
    extraData.techniqueNames = techs.slice(0, 20).map((t: any) => t.name); // sample names only for serialization
  } else if (slug === 'fitness') {
    extraData.fitness = await getFitnessSummary();
  } else if (slug === 'equipment') {
    const eq = await getAllShopEquipment();
    extraData.equipmentNames = eq.slice(0, 20).map((e: any) => e.name);  // show more so 25 count matches visible items better
  }
  // Always try custom domain files for new domains like andres (case variants handled in getDomainFiles)
  // This ensures content created via chat is listed
  const files = await getDomainFiles(slug);
  if (files && files.length > 0) {
    extraData.domainFiles = files;  // pass full {name, file, content} so clicking can show content
  }

  return (
    <div className="max-w-5xl mx-auto p-8">
      <Link href="/forge" className="text-sm text-muted-foreground hover:underline mb-4 block">← Back to Forge Domains</Link>
      
      <h1 className="text-5xl font-semibold tracking-tighter mb-2">{summary.name}</h1>
      <p className="text-muted-foreground mb-8">{summary.count} items • Live from your Obsidian vault</p>

      <DomainClient 
        slug={slug} 
        title={summary.name} 
        initialSummary={summary} 
        extraData={extraData} 
      />
    </div>
  );
}
