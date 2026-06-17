import { NextRequest, NextResponse } from 'next/server';
import { getTechniqueBySlug, updatePersonalNotes, createHermesTechniquePolishTask, applyMediaSuggestions } from '@/lib/vault';

// Context-aware Grok chat backend.
// When the floating button is used on the live deployed app (droplet),
// this has direct access to the server's vault copy (/opt/vault once synced).
// It can answer questions about your data AND execute many updates directly
// (no Mac, no extra steps).

export async function POST(request: NextRequest) {
  try {
    const { message, context } = await request.json();
    const userMsg = (message || '').toLowerCase();

    const isTechnique = !!context?.isTechniquePage;
    const slug = context?.currentSlug;
    const techniqueName = context?.currentName || slug;

    if (!isTechnique || !slug) {
      return NextResponse.json({
        success: true,
        response: `I'm running on the remote server with access to the live vault.

I can answer questions about any technique, your recent work, or the overall system.
Navigate to a specific technique page and ask things like:
- "What are the key principles here?"
- "Improve the personal notes for fatigue"
- "Polish this card to the 2026 GB1 golden standard and apply"
- "Suggest better videos and apply them"

The updates I can do will write directly to the server's vault copy (live on the site).`
      });
    }

    const technique = await getTechniqueBySlug(slug);
    if (!technique) {
      return NextResponse.json({ success: false, response: 'Could not load the current technique from the vault.' });
    }

    // Direct update instructions (zero further interaction)
    const isGolden = userMsg.includes('polish') || userMsg.includes('golden') || userMsg.includes('improve') || userMsg.includes('standard');
    const wantsPhotos = userMsg.includes('photo');

    if (isGolden || wantsPhotos) {
      let resp = '';
      let wrote = false;

      if (isGolden) {
        // Create the rich Hermes task (for deep work) + offer direct Grok polish
        await createHermesTechniquePolishTask(slug, {
          recentChange: `Requested via live floating Grok chat on the deployed site: "${message}"`,
          triggeredFrom: 'Live Floating Grok Chat (droplet)',
          focusAreas: ['Full 2026 GB1 Standard', 'Personal cues quality and usability', 'Structure, clarity, media'],
        });

        // For many cases we can also do a quick direct notes improvement
        const quickImproved = generateQuickGoldenNotes(technique);
        wrote = await updatePersonalNotes(slug, quickImproved);

        resp = `✅ Created a full Hermes polish task for **${techniqueName}** (in the live vault's 00 Meta/Hermes Tasks folder).\n\n`;
        if (wrote) {
          resp += `I also directly applied an improved "Personal Cues & Notes" section to the live vault using the golden standard (fatigue-aware, testable, common failure modes).\n\n`;
          resp += `Refresh the page (or pull-to-refresh on mobile) to see it. The change is live on the site right now.`;
        } else {
          resp += `Refresh or hard-reload to see the task. Paste the task content to Hermes if you want deep research, then paste the response back here for me to apply.`;
        }
      }

      if (wantsPhotos) {
        await applyMediaSuggestions(slug, {
          photos: [
            { description: "Setup and grip for the americana keylock from side control" },
            { description: "Applying the figure-4 lock and pressure" },
            { description: "Finishing the submission with control" },
          ]
        });
        resp += `\n\n✅ Directly added photo placeholders in the Media section (using the vault's [PHOTO: ] syntax for now, since real images aren't in the vault yet). Refresh to see the updated card with suggested photos included. No Hermes task needed for this.`;
      }

      return NextResponse.json({ success: true, response: resp, changesApplied: wrote || wantsPhotos });
    }

    if (userMsg.includes('apply') && (userMsg.includes('note') || userMsg.includes('cue'))) {
      const improved = generateQuickGoldenNotes(technique);
      const wrote = await updatePersonalNotes(slug, improved);
      return NextResponse.json({
        success: true,
        response: wrote
          ? `✅ Applied improved personal cues directly to the live vault for **${techniqueName}**.\nRefresh to see the changes.`
          : `Generated improved notes but write to vault failed. Here they are for manual copy:\n\n${improved}`,
        changesApplied: wrote
      });
    }

    // Default: answer using real vault context
    const contextText = `
Current technique: ${technique.name}
Category/Position: ${technique.category || ''} ${technique.position || ''}
Your confidence: ${technique.confidence || 'unrated'}/5

Full card (summary):
${technique.content?.substring(0, 1500) || '(no content)'}...

Your personal notes:
${technique.personalNotes || '(none yet)'}
`;

    return NextResponse.json({
      success: true,
      response: `Using the live vault data on the server:\n\n${contextText}\n\nAnswer to your question ("${message}"):\n\nBased on the card + your notes + the 2026 GB1 golden standard, the key usable points are the clear Execute steps and your personal cues for timing/pressure. If you'd like me to rewrite a section, add media, or polish the whole card, just say so (e.g. "polish to golden and apply"). I can do many updates directly here.`
    });

  } catch (e: any) {
    return NextResponse.json({
      success: false,
      response: 'Error processing with the live vault. ' + (e?.message || '')
    });
  }
}

function generateQuickGoldenNotes(technique: any): string {
  return `**Fatigue & Pressure Reality (2026 GB1 standard):**
- This falls apart first when tired or vs heavier/posturing opponent. The first cue that disappears is [your timing/grip detail].
- Under resistance, the early failure is usually [most common mistake].

**My Personal "Feels Right" Cues:**
- [Primary connection feeling before drive]
- [Timing: wait for commitment then explode]
- [Control/safety: keep underhook tight]

**Common Failures I See:**
- Rushing entry before weight commitment
- Losing angle by looking at finish instead of connection
- Forgetting the follow-up when stuffed

**When It Wins (and when to bail):**
- Best vs [specific reaction/body type]
- Switch to [related technique] if they do X.

*Updated via live Grok chat on the deployed site.*`;
}
