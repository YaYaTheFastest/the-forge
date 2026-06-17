import { getShopEquipmentBySlug, updateShopEquipmentNotes, updateShopEquipmentHours, createHermesEquipmentReviewTask } from '@/lib/vault';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Link from 'next/link';
import { MediaSection } from '@/app/components/media/MediaSection';
import { HermesPromptClient } from '../HermesPromptClient';
import { HermesTriggerClient } from '../HermesTriggerClient';

interface Props {
  params: Promise<{ slug: string }>;
}

// Simple wikilink processor for shop (can be expanded)
function preprocessShopWikilinks(content: string): string {
  return content.replace(/\[\[([^\]]+)\]\]/g, (match, name) => {
    const full = name.trim();
    const encoded = encodeURIComponent(full);
    return `[${full}](/shop/equipment/${encoded})`;
  });
}

export default async function EquipmentProfilePage({ params }: Props) {
  const { slug } = await params;

  // Next.js should decode this, but in some navigation / refresh scenarios
  // (especially over Tailscale/IP), the raw encoded value can leak through.
  const decodedSlug = decodeURIComponent(slug);

  const equipment = await getShopEquipmentBySlug(decodedSlug);

  if (!equipment) {
    console.error(`[Equipment 404] Could not find equipment for slug: "${slug}" (tried decoded: "${decodedSlug}")`);
    notFound();
  }

  async function saveNotes(formData: FormData) {
    'use server';
    const newNotes = formData.get('personalNotes') as string;
    await updateShopEquipmentNotes(equipment!.slug, newNotes);
  }

  async function saveHours(formData: FormData) {
    'use server';
    const newHours = formData.get('currentHours') as string;
    const serviceNote = formData.get('serviceNote') as string || undefined;
    if (newHours) {
      await updateShopEquipmentHours(equipment!.slug, newHours, serviceNote);
    }
  }

  // This now calls the API and immediately triggers the iOS Shortcut to send to Hermes (max frictionless)
  async function requestHermesStandardizationReview(formData: FormData) {
    'use server';
    const recentChange = formData.get('recentChange') as string || 'Manual review request from Equipment detail page';
    
    // Call the API so we get the full taskContent back for auto-sending
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || ''}/api/hermes/review-equipment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        slug: equipment!.slug,
        recentChange,
        triggeredFrom: 'Equipment Detail Page',
        focusAreas: ['Maintenance Schedule structure', 'Service Instructions quality', '10% rule readiness for Daily Wins']
      })
    });
    
    const result = await res.json();
    
    // Return the result so the client can auto-trigger the Shortcut with the content
    return result;
  }

  // Enhanced photo support for real machine images
  // The template now strongly recommends real photos. We extract simple [PHOTO: ...] or markdown images for display.
  const contentForPhotos = equipment.content || '';
  const photoMatches = contentForPhotos.match(/\[PHOTO:[^\]]+\]|\!\[[^\]]*\]\([^)]+\)/g) || [];
  const photos = photoMatches.map((match, index) => ({
    url: '', // TODO: real image URLs
    caption: match.replace(/\[PHOTO:\s*|\]|\!\[|\]\(.*\)/g, '').trim() || `Photo ${index + 1}`,
  }));

  const videos: any[] = [];

  return (
    <div className="max-w-5xl mx-auto p-6 md:p-8">
      {/* Top accent bar */}
      <div className="h-1.5 w-full rounded-full mb-6 bg-amber-600" />

      <Link href="/shop" className="text-muted-foreground hover:text-foreground mb-6 inline-block text-sm flex items-center gap-1">
        ← Back to Shop &amp; Ranch
      </Link>

      {/* Visual header with photo support */}
      {photos.length > 0 && (
        <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-3">
          {photos.slice(0, 4).map((photo, idx) => (
            <div key={idx} className="aspect-video bg-muted rounded-2xl flex items-center justify-center text-xs text-muted-foreground border">
              📷 {photo.description || `Photo ${idx + 1}`}
              <div className="text-[10px] mt-1 text-center">Add real image of this machine in the vault card</div>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-start justify-between gap-6 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${
              equipment.fleet === 'Household' 
                ? 'bg-sky-100 text-sky-700' 
                : 'bg-amber-100 text-amber-800'
            }`}>
              {equipment.fleet || 'Ranch Operations'}
            </div>
            {equipment.equipmentType && (
              <div className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-muted text-muted-foreground">
                {equipment.equipmentType}
              </div>
            )}
          </div>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tighter mb-2">{equipment.name}</h1>
          {equipment.fullName && equipment.fullName !== equipment.name && (
            <p className="text-xl text-muted-foreground">{equipment.fullName}</p>
          )}
          {equipment.primaryLocation && (
            <p className="text-sm text-muted-foreground mt-1">Location: {equipment.primaryLocation}</p>
          )}
        </div>

        <div className="shrink-0 text-right">
          {equipment.currentHours && (
            <div className="text-2xl font-semibold tabular-nums text-amber-700">{equipment.currentHours}</div>
          )}
          <div className="text-xs text-muted-foreground">Current Hours</div>
          {equipment.nextServiceDue && (
            <div className="mt-2 text-xs px-2 py-0.5 rounded bg-amber-50 text-amber-700 inline-block">
              {equipment.nextServiceDue}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-10 gap-y-10">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-10">
          <section>
            <h2 className="text-lg font-semibold tracking-tight mb-4">Full Profile</h2>
            <div className="prose prose-neutral dark:prose-invert max-w-none text-[15px] leading-relaxed">
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{
                  a: ({ href, children }) => <a href={href} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">{children}</a>
                }}
              >
                {preprocessShopWikilinks(equipment.content)}
              </ReactMarkdown>
            </div>
          </section>

          {/* Media */}
          <MediaSection videos={videos} photos={photos} />

          {/* Personal / Ranch Notes — editable, saved to vault */}
          <section className="border-t pt-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold tracking-tight">Ranch Notes &amp; Cues</h2>
              <span className="text-xs text-muted-foreground">Saved directly to the Equipment Card in Obsidian</span>
            </div>

            <form action={saveNotes} className="space-y-3">
              <textarea
                name="personalNotes"
                defaultValue={equipment.personalNotes || ''}
                className="w-full min-h-[200px] border border-border/70 rounded-xl p-5 text-[14.5px] leading-relaxed font-mono bg-white focus:outline-none focus:ring-2 focus:ring-black/5 resize-y"
                placeholder="Add your personal operating notes, quirks of this specific machine, seasonal tips, safety reminders, or things that aren't in the manual..."
              />
              <button
                type="submit"
                className="px-8 py-2.5 bg-black hover:bg-zinc-900 active:bg-black text-white rounded-full text-sm font-medium transition-colors"
              >
                Save Notes to Vault
              </button>
            </form>
            <div className="mt-2 text-[10px] text-muted-foreground">
              These notes stay with the card in your Obsidian vault under Shop-Property-Ranch/Equipment/
            </div>
          </section>

          {/* === HERMES PROMPT PLACEHOLDER (as requested) === */}
          <section className="border-t pt-8">
            <div className="mb-4">
              <h2 className="text-lg font-semibold tracking-tight flex items-center gap-2">
                Ask Hermes (Equipment Intelligence)
                <span className="text-xs font-normal px-2 py-0.5 rounded bg-violet-100 text-violet-700">AI</span>
              </h2>
              <p className="text-sm text-muted-foreground">
                Get help enriching this equipment profile — or trigger a structured review against the new Daily Wins Maintenance Schedule + Service Instructions standard.
              </p>
            </div>

            <div className="rounded-2xl border bg-muted/40 p-5 space-y-4">
              <HermesPromptClient 
                fullPrompt={`You are helping maintain Equipment Cards for ROCKIN’ J RANCH inside The Forge system (Equipment domain).

Master context (attach this file):
For Hermes - Equipment & Job Card System.md

Current Equipment Card (paste the full markdown of this card below this line):
---
[PASTE THE FULL EQUIPMENT CARD CONTENT HERE]

Task:
Deeply research and improve this Equipment Card while respecting the existing structure and the user's Personal Cues & Notes section.

Follow the official 2026-05 template exactly. Distinguish Ranch Operations vs Household equipment where relevant.

Priorities:
- Fill or strengthen every section using the official template standards
- Improve the maintenance schedule with specific, realistic intervals for this exact model (hours-based for Ranch items; cycle/seasonal for Household)
- Add high-quality video or resource recommendations with clear "why valuable" notes
- Strengthen Known Issues / Common Problems and Safety Critical with real-world ranch insights
- Add or refine Cross-Domain notes (Fitness, BJJ mindset, Family values) if relevant
- Suggest any high-value new Job Cards that should exist for this machine
- For Household items (Litter-Robots, vacuums, fridges, etc.): focus on practical home use, cycle-based maintenance, and quality-of-life notes
- For Ranch items: emphasize field-usable clarity for a tired operator at the end of a long day

Output the full updated card in clean markdown, clearly marking changed or new sections. Also provide any recommended Job Card filenames and outlines.`}
                quickPrompts={[
                  "Review this equipment card and suggest 3-4 improvements to the maintenance schedule or safety sections.",
                  "Recommend the best 2-3 YouTube videos or resources for pre-use inspection and common failures on this exact model. Include why each is valuable.",
                  "Extract any Fitness or BJJ performance transfer value from operating or maintaining this piece of equipment.",
                  "Suggest 3 high-quality photos or diagrams that would dramatically improve this Equipment Card (describe angle + what it should show).",
                  "Help me write clear, field-usable Personal Cues for this machine that a tired operator at 7pm would actually follow.",
                ]}
              />
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          <div>
            <div className="text-xs uppercase tracking-[1px] text-muted-foreground mb-2">Quick Facts</div>
            <div className="space-y-1 text-sm">
              {equipment.status && <div>Status: <span className="font-medium">{equipment.status}</span></div>}
              {equipment.currentHours && <div>Hours: <span className="font-medium">{equipment.currentHours}</span></div>}
              {equipment.nextServiceDue && <div>Next Service: <span className="font-medium">{equipment.nextServiceDue}</span></div>}
            </div>
          </div>

          {/* Update Current Hours (for maintenance logging) */}
          <div className="pt-4 border-t">
            <div className="text-xs uppercase tracking-[1px] text-muted-foreground mb-2">Log Maintenance Hours</div>
            <form action={saveHours} className="space-y-2">
              <input 
                type="text" 
                name="currentHours" 
                placeholder="New current hours (e.g. 142)" 
                className="w-full rounded border px-3 py-1.5 text-sm" 
                required 
              />
              <textarea 
                name="serviceNote" 
                placeholder="Optional note (e.g. 'Oil & filter change, bar oil top-up')" 
                className="w-full rounded border px-3 py-1.5 text-sm h-16" 
              />
              <button 
                type="submit"
                className="w-full rounded bg-amber-600 hover:bg-amber-700 text-white px-4 py-1.5 text-sm font-medium transition"
              >
                Update Hours on Equipment Card
              </button>
            </form>
            <div className="text-[10px] text-muted-foreground mt-1">
              This updates the source card in the vault.
            </div>
          </div>

          {/* Hermes Trigger — now fully automatic (creates task + sends to Hermes) */}
          <div className="pt-4 border-t">
            <div className="text-xs uppercase tracking-[1px] text-muted-foreground mb-2">Trigger Hermes Review</div>
            <HermesTriggerClient 
              action={requestHermesStandardizationReview} 
              slug={equipment.slug} 
            />
            <div className="text-[10px] text-muted-foreground mt-2 leading-snug">
              One tap: Creates the review task in your vault <strong>and</strong> immediately sends it to Hermes via your Shortcut (no copy/paste, no opening Obsidian).
            </div>
          </div>

          <div className="pt-4 text-xs text-muted-foreground border-t">
            This profile lives in your Obsidian vault. 
            Edit the source file directly for structural changes, photos, or major rewrites. 
            The Forge surface is for daily use and light capture.
          </div>

          <div>
            <Link href="/status" className="text-xs text-muted-foreground hover:text-foreground underline">
              View full Forge Status →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
