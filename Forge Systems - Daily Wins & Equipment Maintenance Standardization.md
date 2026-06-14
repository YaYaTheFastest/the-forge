# Forge Systems — Daily Wins & Equipment Maintenance Standardization

**Date**: February 2026  
**Status**: Active Specification  
**Owners**: Human + Grok (structure) + Hermes (content population)

## Goals

1. Make Equipment maintenance suggestions in Daily Wins **high-signal and low-noise** by enforcing a strict 10% rule based on structured data.
2. Allow the user to see the exact service instructions for a piece of equipment directly from Daily Wins ("View notes" / in-context instructions).
3. Enable reliable bidirectional flow: Daily Wins → Equipment Card (hours update + service log).
4. Keep the Obsidian vault as the single source of truth.
5. Support Hermes in maintaining high-quality, consistent content across all Equipment Cards.
6. Support a clean, curated Chores registry that the user (with Hermes) controls.

## Core Principles

- **Low noise is non-negotiable** for Equipment and Chores suggestions.
- **Instructions must travel with the suggestion** — the user should never have to leave the Daily Wins surface to know *what* to do.
- Equipment Cards are the source of truth for maintenance schedules and instructions.
- Daily Wins committed plans are archived silently for Hermes intelligence only.

---

## Part 1: New Equipment Card Structure (Mandatory)

Every Equipment Card must include the following two sections. These should appear after the main operational sections and before (or inside) the Notes & Log area.

### 1. Maintenance Schedule (Structured)

This section enables the 10% rule calculation in the Forge.

**Required format** (use exactly this structure so it is reliably parsable):

```markdown
## Maintenance Schedule

- **Task**: Oil & Filter Change
  - Interval: Every 100 hours (or "Annual" / "Every 50 hours" / "Seasonal")
  - Last Completed: 2026-01-15 at 1,742h
  - Current Hours (at last service): 1,742h
  - Next Due At: 1,842h
  - 10% Window Starts At: 1,832h
  - Notes: Use 5W-30 synthetic. Always change filter at the same time.

- **Task**: Basic Service (KTM)
  - Interval: Every 50 hours or 6 months
  - Last Completed: ...
  ...
```

**Rules**:
- Only list tasks that have a meaningful hours-based or time-based trigger.
- The "10% Window Starts At" field is the trigger point for Daily Wins suggestions.
- If a task is overdue, still list it (the Forge will surface it).
- Update `Last Completed`, `Current Hours (at last service)`, and `Next Due At` after every service.

### 2. Service Instructions (Actionable)

This is the content the user sees when they click "View notes" from Daily Wins.

**Required format**:

```markdown
## Service Instructions

### Oil & Filter Change
1. Park machine on level ground and allow engine to cool.
2. Remove drain plug and drain oil completely.
3. Replace oil filter (part #XXXX).
4. Refill with correct oil to the mark on the dipstick.
5. Run engine briefly, recheck level, and inspect for leaks.
6. Record new hours on this card.

**Special notes for this machine**:
- ...

### Chain Sharpening & Tension (Stihl 261)
...
```

**Rules**:
- Write instructions for a tired operator at the end of a long day.
- Be specific to this exact machine (part numbers, quirks, tools needed).
- Keep steps concise but complete.
- Include any safety critical warnings at the top of the relevant task.

---

## Part 2: Daily Wins System

### Chores Registry (New File)

Location (recommended):  
`00 Meta/Operations/Chores Registry.md`

Content example:

```markdown
# Chores Registry (Curated)

This file is the single source of truth for chores that may appear in Daily Wins.

## Daily / High Frequency
- Straighten Office
- Put tools away

## Weekly
- (to be added by Hermes + human)

## Occasional / Seasonal
- (kept here for reference but rarely surfaced unless relevant)
```

Daily Wins will **only** pull from the "Daily / High Frequency" and "Weekly" sections by default (low noise).

### Daily Wins Archive (for Hermes only)

Recommended location:  
`00 Meta/Operations/Daily Wins Archive/`

Each day gets a file like `2026-02-03.md` containing the committed plan + completion notes.

The user never sees these files in normal use. They are for Hermes synthesis only.

---

## Part 3: Daily Wins Suggestion Rules (Low Noise)

**Equipment**:
- Only show items where current hours are within the 10% window (or past Next Due At).
- Maximum 4 items visible by default.
- The top 2–3 should be the most critical ranch machines (tractors, KTM, major tools).

**Chores**:
- Only items explicitly listed in the Chores Registry under Daily/Weekly.
- Start very small (as of Feb 2026: only "Straighten Office" and "Put tools away").

**Fitness**:
- Standing items: BJJ Class, 30 Minute Jog, 5 Minutes Cold Tub + the mobility protocols.

---

## Next Steps for Implementation

1. This document approved.
2. Hermes updates all Equipment Cards using the companion instructions.
3. Grok builds the real `/daily-wins` route with the behaviors defined in the low-noise mock.
4. Hours update flow writes cleanly into the new Service History + updates the structured Maintenance Schedule fields where possible.

---

*This document should live in the vault under `00 Meta/Systems/Forge UI/` or `Operations/`.*
