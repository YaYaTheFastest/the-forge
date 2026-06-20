import Link from 'next/link';
import { getDomainFiles, isDomainHidden } from '@/lib/vault';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { notFound } from 'next/navigation';
import DomainItemPolish from '@/app/components/DomainItemPolish';

interface Props {
  params: Promise<{ slug: string; item: string }>;
}

export default async function DomainItemPage({ params }: Props) {
  const { slug, item } = await params;

  if (await isDomainHidden(slug)) {
    notFound();
  }

  const decodedItem = decodeURIComponent(item);

  const files = await getDomainFiles(slug);
  if (!files || files.length === 0) {
    notFound();
  }

  // Find by file name or normalized name
  let fileInfo = files.find((f: any) => 
    f.file === decodedItem || 
    f.file.replace('.md', '') === decodedItem ||
    f.name.toLowerCase().replace(/\s+/g, '-') === decodedItem.toLowerCase() ||
    f.name === decodedItem
  );

  if (!fileInfo) {
    // fallback to first or not found
    fileInfo = files[0];
  }

  const content = fileInfo?.content || '';
  const displayName = fileInfo?.name || decodedItem.replace(/-/g, ' ');

  return (
    <div className="max-w-5xl mx-auto p-6 md:p-8">
      {/* Top accent bar */}
      <div className="h-1.5 w-full rounded-full mb-6 bg-violet-600" />

      <Link href={`/domains/${slug}`} className="text-muted-foreground hover:text-foreground mb-6 inline-block text-sm flex items-center gap-1">
        ← Back to {slug.charAt(0).toUpperCase() + slug.slice(1)}
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tighter mb-2">{displayName}</h1>
        <p className="text-muted-foreground">From the {slug} domain • Live from your Obsidian vault</p>
      </div>

      <div className="prose prose-neutral dark:prose-invert max-w-none text-[15px] leading-relaxed mb-10">
        <ReactMarkdown 
          remarkPlugins={[remarkGfm]}
        >
          {content}
        </ReactMarkdown>
      </div>

      <div className="mt-8 border-t pt-8">
        <DomainItemPolish slug={slug} name={displayName} file={decodedItem} />
        <p className="text-[10px] text-muted-foreground mt-2">Uses the chat to search vault, polish with Forge standards, and write improved version back.</p>
      </div>

      <div className="text-xs text-muted-foreground mt-4">
        Full content lives in your Obsidian vault under 00 Meta/Systems/Domains/{slug}/{decodedItem}.
      </div>
    </div>
  );
}
