# The Forge — Visual Action Surface (the-mat)

**The Forge** is the overarching system for deliberate work, craftsmanship, and high-agency living across every domain.

**The Mat (BJJ)** is the primary, most mature subdomain. All other domains (Fitness & Physiology, Equipment (Ranch + Household), Family & Parenting, Work & AI Systems, Finance, Recipes, etc.) live in the same Obsidian vault and surface here with zero friction.

This Next.js app (`the-mat`) is the beautiful, mobile-first action layer on top of your `20 Knowledge Base/` vault. Content lives in Obsidian. The Mat makes it usable every day.

## Live Status

The single source of truth for the entire Forge is here:

→ **[/status](/status)** — Real metrics from the vault (GB1 card counts, confidence, Shop fleet hours & service due, Fitness Health snapshot, domain construction status, recent momentum, high-leverage next actions).

## Quick Start (iOS + Mac)

1. Set your vault root (recommended) and/or BJJ captures path in `.env.local`:

   ```env
   THE_MAT_VAULT_ROOT=/Users/darrenjorgenson/Obsidian/Jorgenson Brain
   THE_MAT_VAULT_PATH=/Users/darrenjorgenson/Obsidian/Jorgenson Brain/20 Knowledge Base/BJJ/Captures
   ```

2. On your Mac:

   ```bash
   npm run dev
   ```

3. On iPhone/iPad (same Tailscale network or local Wi-Fi):

   - Open Safari → `http://192.168.4.48:3000` (or your Mac’s IP)
   - Hard refresh (pull down)

Full restart instructions live in the vault: `00 Meta/Systems/The Mat - Restart & iOS Access Instructions.md`

## Current Domain Maturity (see /status for live numbers)

- **The Mat (BJJ)**: Mature & Operational — 220+ captures, 64+ improved GB1 cards with rich notes, videos, principle tags, personal cues editing back to vault, routines generator.
- **Fitness & Physiology**: Phase 1 Live — HRV/REM/readiness from Apple Health synthesis + StrongFirst/Pavel protocols + explicit BJJ transfers.
- **Equipment**: Viable working product — Clear hierarchy (Equipment → Ranch Operations / Household) with full sub-categories (Tractors, Chainsaws, Motorcycles, etc. under Ranch; Vacuums, Litter-Robots, Appliances under Household). All content (cards, Job Cards, manuals links, videos, notes) lives in the Obsidian vault under 20 Knowledge Base/Shop-Property-Ranch/Equipment/. See the Equipment Overview in the vault.
- **Family, Work, Finance, Recipes**: Active construction / future expansion. Vault folders exist; UI surfaces will appear as they mature.

## Key Surfaces

- `/` — Forge Home (dashboard + quick entry)
- `/status` — The authoritative live Forge Status (start here)
- `/domains` — Domain Canvas (the big picture)
- `/techniques` — The Mat (full BJJ library + editing)
- `/fitness` — Physiology, protocols, principles + BJJ transfers
- `/shop` — Equipment domain (Ranch Operations + Household hierarchy, cards, and Job Cards)

## Card Improvement Workflow (How We "Continue Updating")

1. Hermes (or manual research) produces enriched payloads in `scripts/payloads/` (wave-*.json with frontmatter + full 6-section bodies).
2. Apply to the corresponding file in `20 Knowledge Base/BJJ/Captures/` (or Equipment/Job Cards).
3. Use the in-app editor for personal notes / cues.
4. Update the Forge Status page and Equipment Overview when adding new operational cards.

The app already has helpers (`applyMediaSuggestions`, `updatePersonalNotes`) for safe vault writes.

## Architecture Notes

- Everything is powered by the Obsidian vault (gray-matter parsing + direct fs read/write).
- No external DB. The vault *is* the database.
- Next.js 16 + React 19 + Tailwind + React Flow (for future chains/mindmaps).
- Mobile-first, Tailscale-friendly for iOS.

**Important**: This is a non-standard Next.js codebase. Read `node_modules/next/dist/docs/` before making structural changes.

## Project Files

- `lib/vault.ts` — All loaders and safe writers for techniques, fitness entities, and (future) shop cards.
- `app/status/page.tsx` — The living Forge Status dashboard.
- `scripts/payloads/` — Ready-to-apply Hermes research waves for BJJ cards.

## Contributing to The Forge

- Improve a BJJ card → drop enriched content in Captures/ + update Status.
- Add a new Equipment or Job Card → follow the template in `Shop-Property-Ranch/Templates/`, update the Overview, add to Status.
- Advance a new domain → create folder structure in vault + surface it in `/domains` and `/status`.

All roads lead back to the vault. The UI is just the beautiful control surface.

---

**The Forge** — Deliberate work. Craftsmanship. High-agency living. The Mat (BJJ) is the primary subdomain inside it.
