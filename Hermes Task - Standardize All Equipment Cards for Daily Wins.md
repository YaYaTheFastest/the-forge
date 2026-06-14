# Hermes Task: Standardize All Equipment Cards for Daily Wins + Maintenance Intelligence

**Priority**: High (for existing cards)  
**Owner**: Hermes (with human review)  
**Grok Role**: Structure + UI wiring  
**Note**: For all *new* Equipment Cards and future photo-based intake, the primary governing document is:  
**"Hermes Instructions - Equipment Card Creation from Photos.md"** (Grok maintains this as the single source of truth for how Hermes handles Equipment work).

This older document is now focused specifically on bringing the existing fleet up to the new standard for Daily Wins.

---

## Context (Read First)

We are evolving The Forge from a knowledge surface into a true daily execution system.

The user now uses **Daily Wins** as the primary operating layer:
- Three low-noise suggestion columns (Fitness | Equipment | Chores)
- A committed "Today's Plan" on the right
- When logging Equipment maintenance, the user enters new hours → this must update the source Equipment Card
- When the user adds an Equipment task, they want to immediately see the **exact service instructions** for that machine without leaving Daily Wins

For this to work reliably and stay low-noise, every Equipment Card must have **structured, consistent data** that the Forge can read.

---

## Primary Objective

Update **every** Equipment Card in the vault to the new standard defined in:

**"Forge Systems - Daily Wins & Equipment Maintenance Standardization.md"**

Pay special attention to the two new required sections:

1. **Maintenance Schedule** (structured, parsable)
2. **Service Instructions** (actionable, field-usable)

---

## Detailed Instructions

> **For new equipment or future photo intake work**, please use the more general and up-to-date instructions in:  
> **Hermes Instructions - Equipment Card Creation from Photos.md**

### 1. For Every Equipment Card (Existing Fleet Standardization)

Add or rewrite these two sections exactly as specified in the Standardization document.

#### Maintenance Schedule

- Create one bullet per major recurring maintenance task.
- Fill in all fields: Task, Interval, Last Completed (with hours), Current Hours at last service, Next Due At, 10% Window Starts At.
- Be realistic and conservative on intervals.
- For machines with multiple important tasks (e.g. KTM), list the top 3–4.

Example for the KTM:

```markdown
## Maintenance Schedule

- **Task**: Basic Service (Oil, filter, valves, chain, bearings)
  - Interval: Every 50 hours or 6 months (whichever comes first)
  - Last Completed: [date] at [hours]h
  - Current Hours (at last service): [number]h
  - Next Due At: [calculate]
  - 10% Window Starts At: [calculate — 90% of interval before due]
  - Notes: Use full synthetic 10W-50 or per manual. Always check valve clearances on this model.
```

#### Service Instructions

For each task listed in the Maintenance Schedule, write clear, step-by-step instructions under `## Service Instructions`.

- Write for a tired operator at 7pm.
- Include specific part numbers, tools, quantities, and quirks of *this exact machine*.
- Put any safety-critical warnings at the very top of the relevant task.
- Keep it actionable — the user will read this while doing the work.

### 2. Priority Order for Updates (Do in This Sequence)

1. **KTM / TTR110** (currently due for basic service — highest immediate value)
2. Both John Deere 2150 tractors (the core ranch machines)
3. Husqvarna 460
4. Stihl 261
5. Generator
6. Pressure washer
7. Litter-Robot 4 (Household — adapt the format appropriately)
8. All remaining Equipment Cards

### 3. Additional Requirements While You Are In Each Card

- Review and improve the existing maintenance-related content in the main body.
- Make sure `Current Hours` and `Next Service Due` frontmatter fields are present and reasonably accurate (we can refine later).
- Add or strengthen any "Known Issues / Common Problems" and "Safety Critical" sections.
- If the card does not yet have a good "Service History" log under Notes & Log, add a basic one.
- For Ranch machines: emphasize field-usable clarity.
- For Household machines: focus on practical, repeatable home routines.

### 4. Chores Registry (New File)

After you finish the Equipment Cards, create this file in the vault:

**Recommended location**: `00 Meta/Operations/Chores Registry.md`

Populate it with two sections only at first:

- **Daily / High Frequency**
- **Weekly**

Start extremely minimal (user's current request):
- Straighten Office
- Put tools away

Add anything else you and the human agree belongs in the high-frequency list. Do **not** add a huge list. Quality and restraint matter more than quantity.

### 5. Output Requirements

For each Equipment Card you update, return:
- The full updated markdown for that card (or clear diff of the new sections)
- A short note on any assumptions or data you were missing (e.g. "I need the exact last service hours for the KTM")

---

## What Success Looks Like

- Every critical ranch machine has a clean `## Maintenance Schedule` that the Forge can use to compute the 10% window.
- Every task in that schedule has corresponding high-quality `## Service Instructions`.
- When the user is in Daily Wins and clicks "View notes" on the KTM or a John Deere, they see exactly what they need to do.
- The Chores column in Daily Wins stays small and intentional.

---

## Companion Files

You must read and follow the structure exactly as defined in:

- `Forge Systems - Daily Wins & Equipment Maintenance Standardization.md`

This task is a prerequisite for the real Daily Wins page going live.

---

**Human note to Hermes**:  
Please work through the Equipment Cards in priority order. When you finish the first 3–4 (especially KTM + the two John Deeres), send them back for review before doing the full set. This is important for consistency.

Thank you — this work directly enables the execution system we've been building.
