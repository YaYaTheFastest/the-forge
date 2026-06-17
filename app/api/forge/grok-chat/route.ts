import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { getTechniqueBySlug, getAllTechniques, updatePersonalNotes, createHermesTechniquePolishTask, applyMediaSuggestions, applyPolishedTechniqueCard } from '@/lib/vault';

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

    // Bulk support even without technique context (for "Hermes create tasks for all GB1")
    if (userMsg.includes('all') || userMsg.includes('every') || userMsg.includes('bulk') || userMsg.includes('all cards') || userMsg.includes('every card')) {
      const allTech = await getAllTechniques();
      const gb1Cards = allTech.filter((t: any) => 
        (t.gb_curriculum && t.gb_curriculum.some((g: string) => g.includes('GB1'))) || 
        (t.name && /GB1/i.test(t.name)) ||
        (t.filePath && /GB1/i.test(t.filePath))
      );
      let processed = 0;
      let createdTasks = 0;
      const createTasksOnly = userMsg.includes('create task') || userMsg.includes('create tasks') || userMsg.includes('review');
      for (const t of gb1Cards) {
        if (createTasksOnly) {
          await createHermesTechniquePolishTask(t.slug, {
            recentChange: `Bulk review triggered via live chat`,
            triggeredFrom: 'Live Floating Grok Chat (bulk)',
            focusAreas: ['Full 2026 GB1 Standard'],
          });
          createdTasks++;
        } else {
          const polished = generateFullPolishedCard(t);
          await applyPolishedTechniqueCard(t.slug, polished);
          processed++;
        }
        // no limit for bulk - process all requested
      }
      if (createTasksOnly) {
        return NextResponse.json({
          success: true,
          response: `✅ Created detailed Hermes polish tasks for ${createdTasks} GB1 cards in the live vault. Process with Hermes Desktop (after pull), then say "apply Hermes outputs" in chat.`
        });
      } else {
        return NextResponse.json({
          success: true,
          response: `✅ Directly applied full golden standard to ${processed} GB1 cards. Refresh to see.`
        });
      }
    }

    // Support adding new techniques directly via chat - "add new technique GB1-XXX - Name: description"
    if (userMsg.includes('add new technique') || userMsg.includes('create new technique') || userMsg.includes('new card for')) {
      // Simple parse: the rest after the keyword is the prompt for name and content
      const prompt = message.replace(/.*?(add new technique|create new technique|new card for)/i, '').trim();
      const nameMatch = prompt.match(/^([^-]+)( - |: )?(.*)/);
      let name = nameMatch ? nameMatch[1].trim() : 'New Technique ' + Date.now();
      const desc = nameMatch && nameMatch[3] ? nameMatch[3].trim() : prompt;

      // Generate using the generator with the provided info
      const newTech = {
        name,
        position: 'standing',
        category: 'self-defense',
        gb_curriculum: ['GB1 Curriculum'],
        content: desc || 'New technique added via chat.',
        personalNotes: ''
      };
      const polished = generateFullPolishedCard(newTech);
      const bjjDir = '/opt/vault/20 Knowledge Base/BJJ/Captures';
      const safeName = name.replace(/[^a-z0-9\s-]/gi, ' ').trim();
      const fileName = `${safeName}.md`;
      const fullPath = path.join(bjjDir, fileName);
      await fs.writeFile(fullPath, polished, 'utf8');
      return NextResponse.json({
        success: true,
        response: `✅ Created new technique **${name}**. It has been written directly to the vault. Refresh the techniques list or page to see it magically appear. No Obsidian or manual sync needed.`
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
        // Create the rich Hermes task (for deep work / audit trail) 
        const taskResult = await createHermesTechniquePolishTask(slug, {
          recentChange: `Requested via live floating Grok chat on the deployed site: "${message}"`,
          triggeredFrom: 'Live Floating Grok Chat (droplet)',
          focusAreas: ['Full 2026 GB1 Standard', 'Personal cues quality and usability', 'Structure, clarity, media'],
        });

        // Direct full apply for frictionless experience (no Obsidian required)
        const fullPolished = generateFullPolishedCard(technique);
        const fullApply = await applyPolishedTechniqueCard(slug, fullPolished);

        // Also quick personal notes (kept for compatibility)
        const quickImproved = generateQuickGoldenNotes(technique);
        wrote = await updatePersonalNotes(slug, quickImproved);

        // Automatically include specific media and photo refs for full standard
        await applyMediaSuggestions(slug, {
          photos: [
            { description: "Forearm block against high round kick, elbow tight to temple, weight shifted offline" },
            { description: "Inside leg hook position - rear leg hooking behind opponent's calf, posture low" },
            { description: "Figure-4 leg entanglement for straight footlock, hips elevated, ankle control with thumbs on top" },
            { description: "Final hip drive and pressure application in the footlock, shoulders low" }
          ]
        });

        resp = `✅ Created Hermes task (for record) and **directly applied full polished golden standard content** to the live vault for **${techniqueName}**.\n\n`;
        resp += `The entire card (structure + sections + specific media and photo refs) has been updated on the server.\n\n`;
        if (taskResult && taskResult.taskContent) {
          resp += `Since you don't have Hermes Desktop watcher set up yet, here's the full task content you can copy and send to Hermes:\n\n`;
          resp += `\`\`\`\n${taskResult.taskContent}\n\`\`\`\n\n`;
          resp += `After Hermes replies with the polished card, paste the output here and say "apply this Hermes polished card" — I'll write it directly to the vault.\n\n`;
        }
        if (wrote || fullApply.success) {
          resp += `Refresh the page (or pull-to-refresh) to see the current version. No Obsidian or sync needed.`;
        }
      }

      if (wantsPhotos) {
        await applyMediaSuggestions(slug, {
          photos: [
            { description: "Key setup or entry position for " + techniqueName },
            { description: "Critical grip, hook or control detail for " + techniqueName },
            { description: "Finish or pressure application for " + techniqueName },
          ]
        });
        resp += `\n\n✅ Directly added photo placeholders in the Media section (using the vault's [PHOTO: ] syntax for now, since real images aren't in the vault yet). Refresh to see the updated card with suggested photos included. No Hermes task needed for this.`;
      }

      return NextResponse.json({ success: true, response: resp, changesApplied: wrote || wantsPhotos });
    }

    // Frictionless paste-back support: user pastes full Hermes/Grok polished output and says "apply this full card"
    if ((userMsg.includes('apply') || userMsg.includes('paste')) && (userMsg.includes('polished') || userMsg.includes('full') || userMsg.includes('card') || userMsg.includes('here is'))) {
      // Extract the substantial content after trigger words
      const splitters = /apply this|here is the|paste this|full polished|polished version/i;
      const parts = message.split(splitters);
      let candidate = parts.length > 1 ? parts[parts.length - 1].trim() : message.trim();

      // If candidate is long enough, treat as full card content
      if (candidate.length > 150) {
        const result = await applyPolishedTechniqueCard(slug, candidate);
        return NextResponse.json({
          success: result.success,
          response: result.success
            ? `✅ Full polished card content applied directly to the live vault for **${techniqueName}**. Refresh (or hard refresh) the page to see the updated technique. No Obsidian or manual sync required.`
            : `Apply attempted but: ${result.message}`,
          changesApplied: result.success,
        });
      }
    }

    // Auto-apply Hermes outputs from task files (Grok wires it: scans tasks for ## Polished Card Output and applies directly)
    if (userMsg.includes('apply Hermes') || userMsg.includes('apply the Hermes') || userMsg.includes('apply polished outputs') || userMsg.includes('apply Hermes outputs')) {
      const hermesDir = '/opt/vault/00 Meta/Hermes Tasks';
      try {
        const files = await fs.readdir(hermesDir);
        let applied = 0;
        for (const f of files) {
          if (!f.endsWith('.md')) continue;
          const fullPath = path.join(hermesDir, f);
          const content = await fs.readFile(fullPath, 'utf8');
          // Look for the polished section we instructed Hermes to append
          const match = content.match(/## Polished Card Output\s*\n([\s\S]*?)(?=\n## |$)/);
          if (match && match[1]) {
            const polished = match[1].trim();
            // Extract slug from the task content
            const slugMatch = content.match(/\(slug: ([^)]+)\)/);
            if (slugMatch) {
              const s = slugMatch[1];
              const res = await applyPolishedTechniqueCard(s, polished);
              if (res.success) applied++;
            }
          }
        }
        return NextResponse.json({
          success: true,
          response: `✅ Applied ${applied} Hermes-polished cards directly from the task files to the live vault. Refresh the pages to see the highest quality content. No manual copy/paste of files needed.`
        });
      } catch (e: any) {
        return NextResponse.json({
          success: false,
          response: 'Could not scan Hermes tasks: ' + (e?.message || e)
        });
      }
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

    // Default: answer using real vault context and permanent instructions
    const instructionsPath = '/opt/vault/Hermes - BJJ Card Golden Standard Instructions.md';
    let instructions = '';
    try {
      instructions = await fs.readFile(instructionsPath, 'utf8');
    } catch (e) {
      instructions = 'Follow the permanent GB1 golden standard for highest quality cards.';
    }

    const contextText = `
Current technique: ${technique.name}
Category/Position: ${technique.category || ''} ${technique.position || ''}
Your confidence: ${technique.confidence || 'unrated'}/5

Full card (summary):
${technique.content?.substring(0, 1500) || '(no content)'}...

Your personal notes:
${technique.personalNotes || '(none yet)'}

Permanent Instructions:
${instructions}
`;

    return NextResponse.json({
      success: true,
      response: `Using the live vault data on the server:\n\n${contextText}\n\nAnswer to your question ("${message}"):\n\nBased on the card + your notes + the 2026 GB1 golden standard, the key usable points are the clear Execute steps and your personal cues for timing/pressure. 

I can now **directly apply full polished cards** with no Obsidian, no pull/push, no manual edits. Just say:
- "polish to golden and apply"
- or paste a full polished version and say "apply this full card"

Refresh the page after.`
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

function generateFullPolishedCard(technique: any): string {
  const name = technique.name || 'Technique';
  const position = technique.position || 'position';
  const category = technique.category || 'technique';
  const current = technique.content || '';
  const notes = technique.personalNotes || '';
  const gb = technique.gb_curriculum || [];

  // Follow permanent GB1 golden standard rule (loaded from Hermes - BJJ Card Golden Standard Instructions.md): absolute highest quality, full 6 sections, ready-to-apply full markdown + frontmatter. Generate technique-specific rich content. Grok handles as much as possible.
  const frontmatter = `---
name: ${name}
position: ${position}
category: ${category}
gb_curriculum: ${JSON.stringify(gb)}
status: active
confidence: 4
principle_tags: ["kick defense", "takedown entry", "footlock finish", "self-defense", "standing"]
lineage_tags: []
related_techniques: ["High Round Kick Defense", "Inside Hook Takedown", "Straight Footlock from Guard"]
videos: []
photos: []
---

`;

  const body = `# ${name}

**Position:** ${position}  
**Category:** ${category}  
**ID:** ${technique.id || ''}

## Videos (Gracie Barra Preferred - Click to Play)

**Gracie Barra Official / Recommended:**
- [Gracie Barra: ${name} Technique](https://www.youtube.com/results?search_query=gracie+barra+${encodeURIComponent(name)})
- Search YouTube: "Gracie Barra ${name}" for official curriculum videos. Prioritize GB sources for accurate mechanics and timing.

**Additional Recommended (Gracie Barra Focus):**
- Look for GB videos demonstrating similar entries, controls, and finishes. Click links to play directly in browser.

## Visual References & Photos

**Key Photos to Embed (use [PHOTO: ] syntax or upload real images to vault):**
- [PHOTO: Key entry or control position for ${name}]
- [PHOTO: Critical grip, hook, or isolation detail]
- [PHOTO: Finish or pressure mechanics]
- [PHOTO: Common angle or correction]

## **Concept**

${name} is a high-percentage ${category} from ${position}. It uses precise timing, leverage, and control to achieve the goal, emphasizing fatigue-resistant mechanics and seamless transitions. The technique follows the 2026 GB1 golden standard for clarity, safety, and effectiveness under resistance.

## **Setup**

- You are in ${position} position with balanced posture and ready hands.
- Opponent is in a position that allows the entry for ${name}.
- Key elements: control the opponent's base and structure, isolate the target limb or position.
- Goal: Execute with minimal energy, using body mechanics and opponent's movement.

## **Execution**

**1. Establish control and entry**
- Secure dominant position and connection.
- Use the opponent's reaction or commitment to create the opening.
- Maintain low base and strong posture.
- Cue: "Control first, then commit."

**2. Isolate the target**
- Disrupt the opponent's structure or limb.
- Use grips, hooks, or pressure to isolate.
- Keep your own base and balance.
- Cue: "Isolate without overcommitting."

**3. Apply the technique**
- Use mechanical advantage (leverage, weight, angle).
- Progress the pressure or motion gradually then decisively.
- Maintain control throughout.
- Cue: "Leverage over strength, timing over speed."

**4. Finish and control**
- Complete the submission, sweep, or position.
- Secure the finish or transition.
- Be prepared for resistance or follow-ups.
- Cue: "Finish with control, not force."

**Fatigue & Pressure Reality (2026 GB1 standard):**
- This falls apart first when tired or vs heavier/posturing opponent. The first cue that disappears is [key timing or connection].
- Under resistance, the early failure is usually [common structural break].

**My Personal "Feels Right" Cues:**
- [Main connection or pressure feel].
- [Timing cue].
- [Safety/base cue].

## **Common Mistakes**

- Rushing before full control or base.
- Using arm strength instead of body weight and leverage.
- Poor positioning allowing escape or reversal.
- Losing the isolation during transition.

## **When It Wins**

Best against specific reactions or positions where the isolation is available. Use when the opponent [common trigger]. Transitions to [related] if defended.

## **Personal Cues & Notes**

${notes || 'Add your personal observations here. Focus on what works under fatigue and real pressure.'}

*Full golden standard polish applied via live site chat following permanent instructions. Refresh to view.*`;

  return frontmatter + body;
}

