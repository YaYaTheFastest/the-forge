# Forge — Operational Model Redesign (May 2026)

**Status**: Proposed — Awaiting approval  
**Context**: User rule change — "I do not want to be inside Obsidian" for daily operations.  
**Date**: 2026-05-29

---

## Core Requirements (From User Answers)

1. **Visualization Priority**: Red / Yellow / Green (RAG) status indicator focused on big / important equipment.
2. **Proactive**: Yes — the system should surface items approaching due on home / Daily Wins.
3. **Hermes / Improvement**: User wants improvements to happen in a timely manner when they leave a comment. No desire to review task files.
4. **Data Layer**: Open to a clean operational data layer owned by the app (as long as visualization is strong).

**Primary Daily Action**: Mark complete + log hours (very lightweight).

---

## The Problem With Current Model

The original Forge design assumed:
- Equipment Cards in Obsidian are the live source of truth.
- Daily Wins reads and writes directly into .md files.
- Hermes works via generated review task .md files that the user opens.

This model requires the user to live in Obsidian for operations and review. It also causes the iOS performance issues (repeated full recursive vault scans).

---

## Two Concrete Options

### Option A — Lightweight App-Owned Operational State (Recommended)

**Philosophy**: Split concerns cleanly.

- **Operational State** (hours, due dates, RAG status, service history, 10% windows) lives in a clean, fast, app-controlled data file.
- **Rich Knowledge & Instructions** (detailed how-to, photos, manuals, cross-domain notes) can stay in high-quality markdown (in Obsidian or migrated into the app over time). These become reference material.
- Daily Wins and home screen are built against the fast operational layer.
- Hermes improves things by reading the operational state + rich instructions, then proposing updates (user comments when something feels wrong).

**Data Shape (Proposed)**

```json
{
  "version": "2026-05",
  "lastUpdated": "2026-05-29T14:22:00Z",
  "equipment": [
    {
      "slug": "1987-john-deere-2150",
      "name": "1987 John Deere 2150",
      "fleet": "Ranch Operations",
      "type": "Tractor",
      "importance": "high",           // high | medium | low
      "currentHours": 1842,
      "lastService": {
        "date": "2026-04-12",
        "hours": 1742,
        "task": "Oil & Filter"
      },
      "maintenanceItems": [
        {
          "task": "Oil & Filter Change",
          "intervalHours": 100,
          "lastCompletedHours": 1742,
          "nextDueAt": 1842,
          "tenPercentWindowStartsAt": 1832,
          "status": "red"             // red | yellow | green
        }
      ],
      "serviceHistory": [
        {
          "date": "2026-04-12",
          "hours": 1742,
          "task": "Oil & Filter",
          "notes": "Used 5W-30 synthetic"
        }
      ]
    }
  ]
}
```

**Visualization (RAG for Big Equipment)**

- Home screen and a dedicated Forge dashboard show a clear RAG grid or list for the top 6–8 most important machines.
- Red = overdue or inside 10% window and critical.
- Yellow = approaching window.
- Green = healthy buffer.
- Tap an item → quick view of instructions + "Mark Complete + Log Hours" flow.

**Daily Wins Behavior**
- Pulls the top due items (respecting low-noise rules) from the operational state.
- "Mark complete" immediately updates `currentHours` and recalculates all RAG statuses.
- Very fast because it doesn't parse dozens of markdown files.

**Hermes Model**
- User can leave a comment directly on an equipment item in the app ("The interval on the hydraulic service feels too long").
- System/Hermes picks this up in a timely way and proposes an update to the maintenance item or instructions.
- No mandatory review files the user must open.

**Pros**
- Fast on iOS (critical).
- Matches user's desire for lightweight daily use.
- Clean separation.
- Easy to visualize RAG status.
- Hermes can be more automated.

**Cons**
- One more data file to manage (we keep it simple and versioned).
- Rich cards in Obsidian become slightly secondary for operations.

**Implementation Effort**: Medium. We can deliver a working RAG view + basic logging in 1–2 focused waves.

---

### Option B — Stronger App-Native Model (More Robust Long-Term)

**Philosophy**: The Forge becomes a first-class domain inside The Mat, similar to how BJJ techniques are handled but with operational data as the primary entity.

- Full TypeScript data model + dedicated `lib/forge/` module.
- Equipment operational records are proper entities.
- Rich instructional content lives inside the app (or is referenced).
- Excellent visualization components (RAG dashboard, timeline, due-soon calendar-ish view, fleet health).
- Daily Wins is just one surface on top of the Forge domain.

**Key Differences from A**
- More structured types and validation.
- Better support for future features (photos of work, attachments, recurring job templates, analytics).
- Stronger visualization and interaction patterns built as reusable components.
- Operational data is the clear source of truth for the app.

**Visualization Strengths**
- Could have a beautiful "Fleet Status" page with big RAG cards for the important machines.
- Heatmap or timeline of recent maintenance.
- Proactive banners on the home screen ("JD2150 hydraulic service entering 10% window").

**Hermes Model**
- Same comment-driven approach as Option A, but with richer context available to Hermes because the data model is more complete.

**Pros**
- Scales better as the Forge grows.
- Excellent visualization potential (user's stated need).
- Feels like a real product, not "app reading some files".

**Cons**
- Higher upfront effort.
- More code to maintain.
- Risk of over-engineering if we move too fast.

**Implementation Effort**: Higher. Better as a Phase 2 after validating the basic loop with Option A.

---

## Recommendation

**Start with Option A (Lightweight App-Owned State)**, with a clear migration path toward Option B if visualization and feature needs grow.

Reasons:
- Directly solves the iOS slowness problem (no more repeated heavy vault scans for daily use).
- Matches the user's explicit desire for lightweight "mark + log hours" + RAG visibility.
- Allows us to deliver real value quickly (RAG dashboard + proactive surfacing + simple logging).
- Keeps the door open for rich content wherever it works best.
- Supports the "comment and let it improve in a timely manner" Hermes model the user wants.

We can build the operational state file + a clean RAG visualization component + update Daily Wins to use it in the near term.

---

## Implementation Progress (as of 2026-05-29)

**Completed — Full 1-4 + Mat Integration:**

1. **Wired real logging**: Daily Wins now calls the Forge state via `/api/forge/log-completion`. Hours updates + RAG recalculation work.
2. **Dedicated `/forge` page**: New central hub at `/forge` with full RAG dashboard, all equipment list, The Mat cross-domain suggestions, and improvement comment form.
3. **Proactive surfacing**: Equipment suggestions in Daily Wins are now dynamic and pulled from current RAG status (red/yellow prioritized).
4. **Comment / Hermes flow**: Users can leave feedback directly from Daily Wins or the Forge page. This writes to `pendingImprovements` for timely processing.

**Full The Mat Functionality Preserved & Integrated (Domain Factory alignment):**
- All BJJ activities (Techniques, Routines, Curriculum, Mind Maps) are now grouped under a top-level "The Mat" domain in navigation and have a dedicated `/mat` hub page.
- Techniques, Routines, Curriculum, and Mind Maps no longer appear as flat top-banner items — they live under The Mat domain.
- All original 6-section technique cards, BJJ library, and related features remain fully functional and visually appealing.
- Fitness domain is surfaced across Forge views.
- Equipment cards now have stronger visual treatment (photo placeholders + instructions to add real machine images). The Equipment Card Template has been updated with clear guidance for adding actual photos of the machines.
- Cross-domain notes are carried through.
- Rich Equipment/Job Cards in the vault serve as the high-quality reference layer.

The RAG indicators on the home screen are now live and driven by the new lightweight operational layer.

## Next Steps (Immediate)

1. Wire the "Mark Complete + Log Hours" action in Daily Wins to `logMaintenanceCompletion()`.
2. Add a proper Forge dashboard page (`/forge` or enhance `/shop`).
3. Build proactive surfacing logic (items entering yellow/red appear automatically in Daily Wins).
4. Add a simple "Leave comment / improvement" UI that writes to `pendingImprovements`.
5. Decide on rich content strategy (keep most in Obsidian as reference, or gradually bring key instructions into the app).

---

## Open Questions for Visualization

- How many machines should show in the primary RAG view? (e.g. top 6–8 "big" ones)
- Do you want a single "Forge" tab / section in the app, or should RAG status bleed into the main home screen?
- Any specific machines that must always be visible in the RAG view?

---

*Document created as part of the 2026-05-29 Forge model reset.*
