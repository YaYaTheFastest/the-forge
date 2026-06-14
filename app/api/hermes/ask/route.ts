import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface HermesRequest {
  technique: {
    name: string;
    slug: string;
    position?: string;
    category?: string;
    content: string;
    personalNotes?: string;
  };
  prompt: string;
  mode?: 'suggest' | 'update' | 'analyze' | 'media' | 'general';
}

export async function POST(request: NextRequest) {
  try {
    const body: HermesRequest = await request.json();

    if (!body.technique || !body.prompt) {
      return NextResponse.json(
        { error: 'Missing technique or prompt' },
        { status: 400 }
      );
    }

    // Build a rich context for Hermes
    const context = `
Technique: ${body.technique.name}
Position: ${body.technique.position || 'Unknown'}
Category: ${body.technique.category || 'Unknown'}

Description:
${body.technique.content}

Personal Notes:
${body.technique.personalNotes || '(none)'}

User Request:
${body.prompt}
`;

    // For now, we construct what we would send to Hermes.
    // In a more advanced version we will actually call the Hermes CLI.
    let fullPrompt = `You are an expert BJJ coach and principle extractor working inside the user's personal "The Mat" system.

You have access to the user's Obsidian vault containing their technique library.

Respond helpfully and concisely. When appropriate, suggest specific frontmatter updates (principle_tags, gb_curriculum additions, confidence changes, etc.) or new notes the user could add.

${context}`;

    if (body.mode === 'media') {
      fullPrompt = `You are an expert BJJ researcher helping improve the visual quality of technique cards in "The Mat".

For the technique below, find and recommend the 2-4 best publicly available videos. 

**Strong priority order:**
1. YouTube videos (these embed cleanly and are preferred)
2. High-quality Instagram Reels only if no good YouTube options exist

Focus especially on videos that clearly show hand placement, posture, weight distribution, and timing.

${context}

For each recommendation, provide:
- Direct link
- Title / description
- Instructor or channel
- Why this specific video is valuable for learning this technique (be specific about what visual detail it shows well)
- Recommended timestamp if relevant

Also suggest 1-2 ideal photo descriptions that would dramatically help explain critical hand placement or body positioning.

**Output Instructions (Important):**
- Only output the final recommendations.
- Do NOT include your thinking, reasoning, or the original prompt.
- Use this exact clean format for each video (the UI can parse + apply it with one click):

**Video 1**
Title: [Good descriptive title]
Link: [direct url]
Instructor: [Name or channel]
Why valuable: [1-2 sentences focused on hand placement, posture, or timing]
Recommended timestamp: [e.g. 0:42 or "1:15 - 1:40"]

Then do the same for 1-2 photo descriptions if they would help (under a Photos heading).

Keep the entire response concise and easy to scan for review. The user can paste it into The Mat UI and hit "Apply" to write it straight into the Obsidian card.`;
    }

    // Attempt to call Hermes CLI (this may or may not be configured on the user's machine)
    let hermesResponse = '';
    let usedHermes = false;

    try {
      // This is the command we expect to work if Hermes is set up
      const { stdout } = await execAsync(
        `hermes run the-mat --input "${fullPrompt.replace(/"/g, '\\"')}"`,
        { timeout: 45000 }
      );
      hermesResponse = stdout.trim();
      usedHermes = true;
    } catch (error) {
      // Hermes CLI not available or failed — fall back to clean prompt
      hermesResponse = `Hermes CLI is not reachable from the server right now.

**Action:** Copy the prompt below and send it to Hermes (Telegram or CLI). Then paste Hermes' response back here for review.

---

${fullPrompt}

---

After you paste Hermes' answer, we will format it nicely for review and let you add selected items to the card.`;
    }

    return NextResponse.json({
      success: true,
      usedHermes,
      response: hermesResponse,
      promptSent: fullPrompt,
    });

  } catch (error) {
    console.error('Hermes API error:', error);
    return NextResponse.json(
      { error: 'Failed to process Hermes request' },
      { status: 500 }
    );
  }
}
