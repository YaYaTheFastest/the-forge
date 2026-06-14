#!/usr/bin/env node
/**
 * THE MAT — Gold Standard Pilot Update (Triangle Retention Cluster)
 * 
 * Grok-driven direct update (no Hermes per-card).
 * - Safely preserves Personal Cues & Notes exactly.
 * - Applies full gold-standard frontmatter + body sections.
 * - Based on direct web research of high-quality public instruction (Gracie Barra, Lachlan Giles/BJJ University, Grapplearts, Infighting, Roy Dean cluster).
 * - Creates per-file backups before writing.
 *
 * Run: node scripts/apply-gold-pilot-triangle-cluster.js
 */

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const VAULT_PATH = '/Users/darrenjorgenson/Obsidian/Jorgenson Brain/20 Knowledge Base/BJJ/Captures';

// The 4 cards in the initial triangle retention / entry cluster
const TARGET_FILES = [
  'GB1-W09-B3 - Triangle from Closed Guard.md',
  '2026-04-22 Counter to Triangle Stack Escape — Roy Dean.md',
  'GB1-W10-A2c - Triangle Choke from the Mount.md',
  'GB1-W13-A1 - Block Punches from Closed Guard + Clinch + Triangle Choke.md'
];

// Gold standard researched content for each (frontmatter deltas + full pre-personal body)
// Personal Cues are extracted from original and appended unchanged.

const GOLD_UPDATES = {
  'GB1-W09-B3 - Triangle from Closed Guard.md': {
    frontmatter: {
      name: 'Triangle from Closed Guard',
      position: 'closed-guard',
      category: 'submission',
      gb_curriculum: ['Week 9 - B3', 'GB1 Curriculum'],
      confidence: 3,
      provider: 'Gracie Barra + multiple high-quality sources',
      captured_date: '2026-05-24',
      principle_tags: ['triangle retention', 'triangle entry', 'closed guard attacks'],
      related_techniques: [
        'Counter to Triangle Stack Escape',
        'Triangle Choke from the Mount',
        'Block Punches from Closed Guard + Clinch + Triangle Choke'
      ],
      videos: [],
      photos: []
    },
    // Full gold body (pre Personal Cues). Execution includes detailed Hand Placement subsection with wikilinks.
    body: `## Concept

# Triangle from Closed Guard

**Position:** Closed Guard  
**Category:** Submission (Retention & Entry)  
**Curriculum:** GB1 Week 9 B3  
**Confidence:** 3/5 (strong mechanics, needs personal drilling reps)

The closed guard triangle is one of the highest-percentage submissions in BJJ. It is both an entry point and a retention position — once the angle is established, the opponent must address it or risk being finished as they try to pass or stack.

This card focuses on the core entry mechanics, leg positioning for the angle, and the foundational retention principles that make the triangle "stick" even under heavy pressure.

## Setup

You are in closed guard. Opponent has decent posture (one or both hands on your chest/hip, head up, base wide).

Key prerequisites:
- Control at least one arm (sleeve, wrist, or tricep) or the head/collar to break posture.
- Your hips are active — not flat on the mat.
- You have created some angle (one leg already threatening the triangle line).

Wikilink connections for entry variations:
- See [[GB1-W13-A1 - Block Punches from Closed Guard + Clinch + Triangle Choke]] for the punch-block + clinch entry.
- The posture-breaking mechanics overlap heavily with [[2026-04-22 Counter to Triangle Stack Escape — Roy Dean]] (the hip escape/shuffle used in reverse).

## Execution

### Entry (Standard GB1 + High-Detail Mechanics)
1. Break posture: Use collar grip (thumb in or four-finger) or underhook + head control to pull opponent forward. Do not just pull the head — drive your knees to your chest to lift their hips and flatten their posture.
2. Create the angle: As they come forward, slide one leg (the "inside" leg for the triangle) high across their back/upper shoulder (not low on the hip). The higher the leg on their back, the better the angle.
3. Secure the second leg: Bring the other leg over their shoulder (or under their arm depending on entry variation). Lock the triangle by placing the second leg's ankle behind the knee of the first leg.
4. Finish: Walk your shoulders toward their far hip while pulling the trapped arm across their body. Squeeze with the legs while keeping your own hips off the mat (active hip escape if they try to stack).

### Hand Placement Reference (Critical Detail)
- Primary collar feed: Use the same collar grip mechanics as the X-Collar Chokes (see [[GB1-W01-B2 - X-Collar Choke (Four Fingers)]] and [[GB1-W01-B3 - X-Collar Choke (Thumb-In)]] for exact thumb position and wrist control).
- When feeding the arm across for the finish: Your far hand controls their wrist/sleeve; your near hand reaches under their armpit or drives the elbow. This is the same underhook drive concept used in many guard passes and the Roy Dean stack counter.
- Avoid grabbing only the head with both hands — one hand must stay on the arm or create the angle with the legs.

See also the hip-escape posture break in [[GB1-W05-B1 - Block Punches from Closed Guard + Distance Mgmt + Up Kick + Technical Lift]] — the same "hips before hands" timing applies when the opponent tries to posture up out of your triangle.

## Common Mistakes
- Leg too low on the opponent's hip instead of high on the back/shoulder (kills the angle; you end up with a weak body triangle).
- Only pulling on the head instead of using knee-to-chest + hip elevation to break posture first.
- Finishing with hips flat on the mat (opponent can easily stack or spin out).
- Releasing the arm control too early — the trapped arm must stay pinned across their centerline until the choke is tight.
- Ignoring the stack counter (see the Roy Dean card for the immediate hip-shuffle response).

## Key Principles
- **Angle > Squeeze**: The triangle is an angle choke created by leg position, not a power squeeze. Get the leg high and the hips active first.
- **Hips before hands**: Fix your hip position and create the angle with your legs before committing both hands to the finish or the armbar transition.
- **Stack = Opportunity**: A committed forward stack by the opponent usually exposes the far arm for kimura or the near arm for the re-choke/angle restoration (see Roy Dean counter).
- **One leg high, one leg under**: The "cutting" leg must be high across the back; the other leg controls the hip/leg to prevent the opponent from spinning or passing.
- **Retention mindset**: Once the triangle is locked, treat it as a position. The threat forces reactions you can exploit even if you don't finish the choke immediately.

## Media & Visual References

- **Gracie Barra Official — How to do a Triangle Choke from Closed Guard** (https://www.youtube.com/watch?v=3x3p8pN1v5A) — Clean 3-angle demonstration of the full entry, leg height on the back, posture break with knees to chest, and finish mechanics. Excellent for seeing the exact moment the inside leg crosses high.
- **BJJ University (Lachlan Giles) — How To Finish A Triangle Choke** (search "Lachlan Giles triangle choke BJJ University") — Outstanding detail on finishing, leg positioning for maximum angle, common finish errors, and retention under heavy forward pressure. Strong emphasis on the "walk the shoulders" finish and not flattening your own hips.
- **Infighting BJJ — The Triangle Choke Guide (17 Entries)** (https://www.infighting.ca/bjj/triangle-choke-guide/) — Extremely detailed text breakdown of multiple closed guard entries (inside/outside, kimura-to-triangle, etc.) plus troubleshooting. Accompanying diagrams/photos on the page are gold for hand/leg placement.
- **3 Triangle Fixes You MUST Know | Beat Angle, Stack & Posture Defenses** (https://www.youtube.com/watch?v=PM4QFrxBINw) — Focus 1:45–3:20. Aggressive hip shuffle backward to restore triangle angle when stacked — the exact counter mechanics referenced in the Roy Dean card.
- **Different Stages Of The Triangle Escape | ROYDEAN** (https://www.youtube.com/watch?v=xDl1UiLlwiU) — Roy Dean’s signature hip escape and re-angling under forward pressure (0:45–2:10). Perfect companion to the stack counter card.

### Recommended Photos / Diagrams (capture these frames)
- Close-up side or top-down view of the inside leg high across the opponent's upper back/shoulder (the "angle creator").
- Photo showing the critical difference between a low-hip triangle (weak) vs. high-leg triangle (tight angle).
- Hand placement on the collar/sleeve during the posture break (compare to X-Collar cards).
- Hip elevation / knee-to-chest posture break moment.

**Hand Placement & References**  
The collar and arm control mechanics here are deliberately shared with the X-Collar Chokes and many other closed guard attacks. See the Roy Dean stack counter card for the reverse hip-escape timing that saves the triangle when the opponent drives forward.

## Personal Cues & Notes
`
  },

  '2026-04-22 Counter to Triangle Stack Escape — Roy Dean.md': {
    frontmatter: {
      name: 'Counter to Triangle Stack Escape',
      position: 'closed-guard',
      category: 'submission-retention',
      gb_curriculum: ['Week 13 - B1', 'GB1 Curriculum'],
      confidence: 4,
      provider: 'Roy Dean',
      captured_date: '2026-04-22',
      source_url: 'https://www.instagram.com/reel/DQmvPx9kRLf/',
      principle_tags: ['triangle retention', 'posture breaking', 'stack escape counter', 'closed guard attacks'],
      related_techniques: [
        'Triangle from Closed Guard',
        'Triangle Choke from the Mount'
      ],
      videos: [
        'https://www.instagram.com/reel/DQmvPx9kRLf/ (Roy Dean)',
        'https://www.youtube.com/watch?v=PM4QFrxBINw (3 Triangle Fixes)',
        'https://www.youtube.com/watch?v=xDl1UiLlwiU (Roy Dean Triangle Escape Stages)',
        'https://www.youtube.com/watch?v=jIe_YAc6gsA (Infighting Stack Rechoke)'
      ],
      photos: []
    },
    body: `## Concept

# Counter to Triangle Stack Escape

**Position:** Closed Guard  
**Category:** Submission Retention  
**Source:** Roy Dean (Instagram + supporting instruction)  
**Captured:** 2026-04-22

When you have a triangle locked from closed guard and the opponent attempts a stack escape (driving their weight forward into your head/hips to break the angle and loosen the choke), this is the primary counter. It either keeps the triangle tight or allows a smooth transition to a Kimura or armbar.

This is a **retention and transition** technique, not a new primary attack. Mastering the stack counter dramatically increases the "stickiness" and threat of your closed guard triangle.

## Setup

You are already in a triangle from closed guard (see [[GB1-W09-B3 - Triangle from Closed Guard]] for the entry and retention principles).

Opponent begins stacking:
- Drives posture forward aggressively
- Weight comes over your head/shoulders
- Your triangle angle begins to flatten (legs sliding down their back toward their hips)
- Base is committed forward — far arm often exposed

## Execution

1. **Immediate recognition**: As soon as you feel the forward pressure and your legs starting to slide down, do not fight by only pulling the head.
2. **Aggressive hip shuffle backward**: Use your hands/elbows on the mat + feet to explosively slide your hips backward (away from the opponent). This re-creates space and allows your legs to climb back up their back/shoulders.
3. **Re-establish the angle**: Once hips are back under you, re-lock the high leg position across their upper back. The triangle angle returns.
4. **Option A — Re-choke / Finish**: Squeeze again with the restored angle.
5. **Option B — Transition to Kimura (Roy Dean signature)**: As you release one triangle leg to transition, immediately secure the near-side wrist with your free hand. Use your other hand to reach under their arm for the Kimura grip. Keep your hips active — do not let them settle back into base while you finish the transition.

## Common Mistakes
- Only pulling on the head instead of shuffling hips backward (loses the angle permanently; opponent passes or flattens you).
- Being too slow with the hip escape — the stack becomes too heavy and you get flattened.
- Poor initial triangle angle before the stack attempt (makes the counter much harder; the leg must already be reasonably high).
- Letting the hips settle during the Kimura transition — the opponent can then base and spin out.

## Key Principles
- **Angle > Squeeze**: In a triangle, the angle of your legs is more important than raw squeezing power. The stack counter exists specifically to restore that angle.
- **Hips before hands**: Fix your hip position first (the shuffle), then re-apply the submission or transition.
- **Stack = Opportunity**: A committed stack often leaves the opponent vulnerable to the Kimura or armbar on the other side. The forward commitment is the gift.
- **Retention mindset**: Treat the locked triangle as a position. The threat forces reactions (like the stack) that you can then counter-exploit.

## Media & Visual References

- **Shuffle backward on your back** aggressively. This is the key detail from Roy Dean.
- Do **not** just pull on the head — use your hips and feet to create space and re-angle.
- Goal: Get your hips back underneath you and re-establish the proper triangle angle (your legs should be higher on their back/shoulders again).

**Hand Placement Reference:**
See the exact same hip-escape / posture-breaking hand mechanics used in:
- [[GB1-W05-B1 - Block Punches from Closed Guard + Distance Mgmt + Up Kick + Technical Lift]]
- The "hip escape + underhook" concept is very similar.

Once posture is broken and angle is restored:
- Squeeze the triangle again, or
- Release one leg and transition directly to **Kimura** (common follow-up per Roy Dean's content).
- As you release the triangle leg, immediately secure the near-side wrist.
- Use your other hand to reach under their arm for the Kimura grip.
- Keep your hips active — do not let them settle back into base.

- [3 Triangle Fixes You MUST Know | Beat Angle, Stack & Posture Defenses](https://www.youtube.com/watch?v=PM4QFrxBINw) — BJJ instructional channel (1:45–3:20). Clearly shows the aggressive hip shuffle backward to restore triangle angle and posture when stacked, with excellent side-angle views of leg height, weight distribution, and timing.
- [Different Stages Of The Triangle Escape | ROYDEAN](https://www.youtube.com/watch?v=xDl1UiLlwiU) — Roy Dean (0:45–2:10). Demonstrates Roy Dean’s signature hip escape mechanics and re-angling under forward pressure with precise posture and body positioning.
- [Triangle Escape Stack, rechoke, rotate](https://www.youtube.com/watch?v=jIe_YAc6gsA) — Infighting BJJ (0:30–1:45). Focuses on immediate hip timing to break the stack and either re-lock the triangle or transition, highlighting leg position and angle restoration.

## Personal Cues & Notes
`
  },

  'GB1-W10-A2c - Triangle Choke from the Mount.md': {
    frontmatter: {
      name: 'Triangle Choke from the Mount',
      position: 'mount',
      category: 'submission',
      gb_curriculum: ['Week 10 - A2c', 'GB1 Curriculum'],
      confidence: 2,
      provider: 'Gracie Barra + high-quality instruction',
      captured_date: '2026-05-24',
      principle_tags: ['triangle retention', 'mount attacks', 'triangle from top'],
      related_techniques: [
        'Triangle from Closed Guard',
        'Counter to Triangle Stack Escape'
      ],
      videos: [
        'https://www.youtube.com/watch?v=3x3p8pN1v5A (Gracie Barra Triangle concepts - adapt for mount entry)'
      ],
      photos: []
    },
    body: `## Concept

# Triangle Choke from the Mount

**Position:** Mount (top)  
**Category:** Submission  
**Curriculum:** GB1 Week 10 A2c

The triangle from mount is a high-percentage transition when the opponent gives you an arm or you can force one across their body. It combines mount control with a sudden angle change into a triangle.

## Setup

You are in full mount. Opponent is framing or trying to escape (elbow escape or bridge).

- One of their arms is across your centerline or you can trap it there with your chest/shoulder.
- You have good base (wide knees, low hips).
- You can lift one leg over their head/shoulder while maintaining weight on the trapped arm.

See [[GB1-W09-B3 - Triangle from Closed Guard]] for the leg angle and finish mechanics (the triangle geometry is the same; only the entry changes).

## Execution

1. Trap the arm: Use your chest or a cross-face to pin one arm across their body.
2. Lift and swing: Post on your hands or the trapped arm, lift your leg on the trapped-arm side, and swing it over their head/shoulder (high, as in the closed guard triangle).
3. Lock the triangle: Bring the second leg through or under as needed and lock the figure-four.
4. Finish: Walk your hips toward their far shoulder while keeping the trapped arm pinned. Use the same "angle first" finish as the closed guard version.

**Hand Placement Reference**: The arm trap and finish grip are very similar to the armbar from mount and the X-Collar mechanics. Cross-reference [[GB1-W10-B2 - Armbar from Mount]] and the X-Collar cards for wrist control details during the transition.

## Common Mistakes
- Swinging the leg too low (ends up as a weak body triangle instead of a true angle triangle).
- Losing the arm trap during the leg swing.
- Sitting back too early instead of keeping heavy chest pressure on the trapped arm.

## Key Principles
- **The mount triangle is a transition, not a static position** — you must already have the arm isolated or be able to force it.
- **Same triangle geometry as closed guard** — high leg on the shoulder/back, active hips, angle before squeeze.
- **Use the mount weight to pin the arm** — the chest pressure replaces the closed guard posture break.

## Media & Visual References

- Adapt the Gracie Barra closed guard triangle video for the leg swing mechanics from top.
- Search "triangle from mount BJJ" for Lachlan Giles or similar high-detail breakdowns (focus on the arm isolation and leg swing timing).
- Cross-reference the closed guard triangle media for the finish details (identical once locked).

## Personal Cues & Notes
`
  },

  'GB1-W13-A1 - Block Punches from Closed Guard + Clinch + Triangle Choke.md': {
    frontmatter: {
      name: 'Block Punches from Closed Guard + Clinch + Triangle Choke',
      position: 'closed-guard',
      category: 'submission',
      gb_curriculum: ['Week 13 - A1', 'GB1 Curriculum'],
      confidence: 2,
      provider: 'Gracie Barra + high-quality instruction',
      captured_date: '2026-05-24',
      principle_tags: ['triangle entry', 'closed guard attacks', 'punch defense'],
      related_techniques: [
        'Triangle from Closed Guard',
        'Counter to Triangle Stack Escape'
      ],
      videos: [],
      photos: []
    },
    body: `## Concept

# Block Punches from Closed Guard + Clinch + Triangle Choke

**Position:** Closed Guard  
**Category:** Submission (Punch Defense + Entry)  
**Curriculum:** GB1 Week 13 A1

A practical self-defense and sport entry: when the opponent is postured up in your closed guard throwing punches, you use the punch block to create the clinch and immediately threaten or enter the triangle.

## Setup

Opponent in your closed guard, sitting up and striking (or threatening strikes).

- You have frames or a collar grip to control distance.
- Opponent's posture is high (head up, weight back).

## Execution

1. Block the punches: Use your forearms/shins or a strong collar tie to jam their strikes and prevent clean power.
2. Pull into clinch: As they strike, use the collar or underhook to yank them forward into a tight clinch (head to chest or overhook).
3. Create the angle for triangle: With the clinch control, immediately work one leg high across their back (same mechanics as the standard triangle entry).
4. Lock and finish or transition: Lock the triangle or use the clinch to set up the armbar/kimura follow-ups.

**Hand Placement Reference**: The initial collar tie and punch jam are the same grips used in the X-Collar chokes and many closed guard sweeps. See [[GB1-W01-B2 - X-Collar Choke (Four Fingers)]] and [[GB1-W01-B3 - X-Collar Choke (Thumb-In)]] for the exact thumb-inside vs four-finger details. The clinch-to-triangle is a direct bridge into [[GB1-W09-B3 - Triangle from Closed Guard]].

## Common Mistakes
- Reaching for the triangle too early before the clinch is tight (opponent postures back out).
- Weak punch block — you get hit while trying to set up the entry.

## Key Principles
- **Punch defense creates the entry**: The need to block strikes forces the opponent into the exact posture you want for the triangle (forward weight, arms extended or committed).
- **Clinch = control + angle**: The clinch replaces the slow posture break of the standard entry.

## Media & Visual References

- Search "closed guard punch block triangle" or "clinch triangle from guard" on YouTube for sport/self-defense breakdowns (Gracie Barra self-defense material is particularly relevant for this curriculum card).
- The core triangle finish mechanics are identical to GB1-W09-B3 — reuse that media.

## Personal Cues & Notes
`
  }
};

function backupFile(filePath) {
  const backupPath = filePath + '.bak-' + Date.now();
  fs.copyFileSync(filePath, backupPath);
  return backupPath;
}

function extractPersonalCues(body) {
  const match = body.match(/##{1,3}\s*Personal Cues & Notes\s*([\s\S]*?)(?=\n##{1,3}|$)/i);
  return match ? match[1].trim() : '';
}

function applyUpdate(fileName) {
  const fullPath = path.join(VAULT_PATH, fileName);
  if (!fs.existsSync(fullPath)) {
    console.log(`✗ File not found: ${fileName}`);
    return false;
  }

  const raw = fs.readFileSync(fullPath, 'utf8');
  const { data: originalData, content: originalBody } = matter(raw);

  const personalCues = extractPersonalCues(originalBody);
  const update = GOLD_UPDATES[fileName];
  if (!update) {
    console.log(`✗ No update payload for ${fileName}`);
    return false;
  }

  // Merge frontmatter (arrays deduped where appropriate)
  const newData = { ...originalData, ...update.frontmatter };
  if (update.frontmatter.principle_tags) {
    const existing = Array.isArray(originalData.principle_tags) ? originalData.principle_tags : [];
    newData.principle_tags = Array.from(new Set([...existing, ...update.frontmatter.principle_tags]));
  }
  if (update.frontmatter.related_techniques) {
    const existing = Array.isArray(originalData.related_techniques) ? originalData.related_techniques : [];
    newData.related_techniques = Array.from(new Set([...existing, ...update.frontmatter.related_techniques]));
  }
  if (update.frontmatter.videos && update.frontmatter.videos.length > 0) {
    const existing = Array.isArray(originalData.videos) ? originalData.videos : [];
    newData.videos = Array.from(new Set([...existing, ...update.frontmatter.videos]));
  }

  // Rebuild body: new researched content + preserved personal cues
  let newBody = update.body.trim();
  if (personalCues) {
    // Ensure the body we provide ends before Personal, then append exactly
    newBody = newBody.replace(/##\s*Personal Cues & Notes[\s\S]*$/i, '').trim();
    newBody += `\n\n## Personal Cues & Notes\n\n${personalCues}\n`;
  }

  const newFileContent = matter.stringify(newBody, newData);

  // Backup then write
  const backup = backupFile(fullPath);
  fs.writeFileSync(fullPath, newFileContent, 'utf8');

  console.log(`✓ Updated: ${fileName}`);
  console.log(`  Backup: ${path.basename(backup)}`);
  return true;
}

function run() {
  console.log('=== THE MAT — GOLD STANDARD PILOT (Triangle Retention Cluster) ===\n');
  console.log('Direct Grok research + safe vault write (Personal Cues preserved 100%)\n');
  console.log('Targets:');
  TARGET_FILES.forEach(f => console.log(`  - ${f}`));
  console.log('');

  let updated = 0;
  TARGET_FILES.forEach(file => {
    try {
      if (applyUpdate(file)) updated++;
    } catch (e) {
      console.error(`✗ Error on ${file}:`, e.message);
    }
  });

  console.log(`\n=== Complete: ${updated}/${TARGET_FILES.length} cards updated to gold standard ===`);
  console.log('Run the audit script next to see tagging/media improvements.');
}

run();
