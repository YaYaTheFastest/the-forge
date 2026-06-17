import { getTechniqueBySlug, updatePersonalNotes } from '@/lib/vault';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import Link from 'next/link';
import { HermesAsk } from '@/app/components/HermesAsk';
import { MediaSection } from '@/app/components/media/MediaSection';
import { Wikilink } from '@/app/components/Wikilink';
import { cleanTechniqueDisplayName } from '@/lib/utils';
import { ConfidenceEditor } from '@/app/components/ConfidenceEditor';

interface Props {
  params: Promise<{ slug: string }>;
}

// Helper: Convert Obsidian [[Technique Name]] into proper internal app links.
// Link href uses full original (for slug lookup), but visible text is cleaned for readability.
function preprocessWikilinks(content: string): string {
  return content.replace(/\[\[([^\]]+)\]\]/g, (match, name) => {
    const full = name.trim();
    const slug = full;
    const encoded = encodeURIComponent(slug);
    const display = cleanTechniqueDisplayName(full);
    return `[${display}](/techniques/${encoded})`;
  });
}

export default async function TechniquePage({ params }: Props) {
  const { slug } = await params;
  const technique = await getTechniqueBySlug(slug);

  if (!technique) {
    notFound();
  }

  async function saveNotes(formData: FormData) {
    'use server';
    const newNotes = formData.get('personalNotes') as string;
    await updatePersonalNotes(technique!.slug, newNotes);
  }

  const categoryStyle = getCategoryStyleForDetail(technique.category);
  const accentColor = getCategoryHexForDetail(technique.category);

  return (
    <div className="max-w-5xl mx-auto p-6 md:p-8">
      {/* Top accent bar with category color */}
      <div className="h-1.5 w-full rounded-full mb-6" style={{ backgroundColor: accentColor }} />

      <a href="/techniques" className="text-muted-foreground hover:text-foreground mb-6 inline-block text-sm flex items-center gap-1">
        ← Back to all techniques
      </a>

      <div className="flex items-start justify-between gap-6 mb-8">
        <div>
          <div className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold mb-3 ${categoryStyle.bg} ${categoryStyle.text}`}>
            {categoryStyle.label}
          </div>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tighter mb-2">{technique.name}</h1>
          {technique.position && (
            <p className="text-xl text-muted-foreground capitalize">{technique.position.replace(/-/g, ' ')}</p>
          )}
        </div>

        {/* Big confidence in header - uses client component to avoid passing functions from Server Component */}
        {technique.confidence !== undefined && (
          <div className="text-right shrink-0">
            <ConfidenceEditor slug={technique.slug} initialValue={technique.confidence} />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-10 gap-y-10">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-10">
          <section>
            <h2 className="text-lg font-semibold tracking-tight mb-4 flex items-center gap-2">
              Description
            </h2>
            <div className="prose prose-neutral dark:prose-invert max-w-none text-[15px] leading-relaxed">
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{
                  a: ({ href, children }) => <Wikilink href={href}>{children}</Wikilink>
                }}
              >
                {preprocessWikilinks(technique.content.replace(/##{1,3} Personal Cues & Notes[\s\S]*/, '').trim())}
              </ReactMarkdown>
            </div>
          </section>

          {/* Media Section - Improved visual/educational experience */}
          <MediaSection 
            videos={technique.videos?.map(v => typeof v === 'string' ? { url: v } : v) || []} 
            photos={technique.photos?.map(p => typeof p === 'string' ? { url: p } : p) || []} 
          />

          {/* Notes section — much improved */}
          <section className="border-t pt-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold tracking-tight">Your Notes & Cues</h2>
              <span className="text-xs text-muted-foreground">Saved directly to Obsidian</span>
            </div>

            <form action={saveNotes} className="space-y-3">
              <textarea
                name="personalNotes"
                defaultValue={technique.personalNotes || ''}
                className="w-full min-h-[220px] border border-border/70 rounded-xl p-5 text-[14.5px] leading-relaxed font-mono bg-white focus:outline-none focus:ring-2 focus:ring-black/5 resize-y"
                placeholder="Add your personal cues, observations, refinements, and what actually works for you..."
              />
              <button
                type="submit"
                className="px-8 py-2.5 bg-black hover:bg-zinc-900 active:bg-black text-white rounded-full text-sm font-medium transition-colors"
              >
                Save to Vault
              </button>
            </form>
          </section>

          {/* Grok-powered actions + legacy Hermes research tools */}
          <HermesAsk technique={technique} />
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {technique.gb_curriculum && technique.gb_curriculum.length > 0 && (
            <div>
              <div className="text-xs uppercase tracking-[1px] text-muted-foreground mb-2">GB Curriculum</div>
              <div className="flex flex-wrap gap-2">
                {technique.gb_curriculum.map((g, i) => (
                  <span key={i} className="text-sm px-3 py-1 rounded-full bg-muted font-medium">{g}</span>
                ))}
              </div>
            </div>
          )}

          {technique.principle_tags && technique.principle_tags.length > 0 && (
            <div>
              <div className="text-xs uppercase tracking-[1px] text-muted-foreground mb-2">Key Principles</div>
              <div className="flex flex-wrap gap-2">
                {technique.principle_tags.map(tag => (
                  <Link 
                    key={tag} 
                    href={`/techniques?search=${encodeURIComponent(tag)}`}
                    className="text-sm px-3 py-1 rounded-full border border-border/60 hover:bg-muted hover:border-border transition-colors"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Related Techniques - Clickable navigation (shows clean names) */}
          {technique.related_techniques && technique.related_techniques.length > 0 && (
            <div>
              <div className="text-xs uppercase tracking-[1px] text-muted-foreground mb-2">Related Techniques</div>
              <div className="space-y-2">
                {technique.related_techniques.map((relatedSlug, i) => {
                  const displayName = cleanTechniqueDisplayName(relatedSlug);
                  return (
                    <Link 
                      key={i}
                      href={`/techniques/${encodeURIComponent(relatedSlug)}`}
                      className="block text-sm px-3 py-2 rounded-lg border border-border/60 hover:bg-muted hover:border-border transition-colors"
                    >
                      {displayName}
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          <div className="pt-4 text-xs text-muted-foreground">
            Data lives in your Obsidian vault. Edit the markdown file directly for advanced changes.
          </div>
        </div>
      </div>
    </div>
  );
}

// Small helpers duplicated for the detail page (kept simple)
const detailCategoryStyles: Record<string, { bg: string; text: string; label: string }> = {
  submission: { bg: 'bg-red-100', text: 'text-red-700', label: 'Submission' },
  sweep: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Sweep' },
  'guard-pass': { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Guard Pass' },
  pass: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Pass' },
  defense: { bg: 'bg-slate-100', text: 'text-slate-700', label: 'Defense' },
  escape: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Escape' },
  takedown: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Takedown' },
  transition: { bg: 'bg-violet-100', text: 'text-violet-700', label: 'Transition' },
  'guard-recovery': { bg: 'bg-cyan-100', text: 'text-cyan-700', label: 'Guard Recovery' },
  'self-defense': { bg: 'bg-rose-100', text: 'text-rose-700', label: 'Self Defense' },
};

function getCategoryStyleForDetail(cat?: string) {
  const key = (cat || '').toLowerCase();
  return detailCategoryStyles[key] || { bg: 'bg-gray-100', text: 'text-gray-700', label: cat || 'Technique' };
}

function getCategoryHexForDetail(cat?: string): string {
  const key = (cat || '').toLowerCase();
  const map: Record<string, string> = {
    submission: '#e11d48', sweep: '#2563eb', 'guard-pass': '#059669', pass: '#059669',
    defense: '#475569', escape: '#d97706', takedown: '#ea580c', transition: '#7c3aed',
    'guard-recovery': '#0891b2', 'self-defense': '#be123c',
  };
  return map[key] || '#64748b';
}

