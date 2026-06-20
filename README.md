# The Forge (the-mat) - Context & Overview

**For Grok Chat / Ideation**: Always start by reading `CONTEXT.md` (in this repo root) for complete, up-to-date system context. It encodes the full architecture, your tastes/preferences (ADHD-optimized, visual-first, categorized noun/verb, anticipation, RACI tracking, simple commands, continuous improvement), and all standards so ideation/variations stay consistent.

See `CONTEXT.md` for the full brain of the project.

Updated: Add `bash update-forge.sh` for one-command magic update.

## Hermes Research Capabilities (New 2026)

Hermes now supports full internet research powered by Grok's native tools (web_search, open_page, etc.).

### How to Use
- In floating chat or domain pages: Use prompts like:
  - "Research latest BJJ recovery methods and synthesize with vault"
  - "Use internet research tools. Research [topic]. Synthesize with vault data if available. Output as polished Forge card in JUNE 2026 GOLD STANDARD format (visual photos, ADHD structure)."
  - "Search web for [topic] and update the card"

- The system detects "research", "search web", "browse page", "internet", etc. and wires Grok tools.

- For domain context (e.g. /domains/fitness/ or /domains/andres/): The chat automatically includes domain context and prioritizes vault + web synthesis.

### Example Prompts
- "polish this card and include key takeaways from each book using web research"
- "research latest BJJ recovery methods 2026 and create a new card"
- "browse recent studies on kettlebell training and integrate into this equipment card"

Research results are synthesized with vault data and output as clean Forge-formatted markdown. Hermes writes directly to vault where possible.

See 00 Meta/Hermes Tasks/Research-Template.md for reusable task template.

## Central Content Brain
All content creation references the persistent brain of tastes/preferences:
- `00 Meta/Systems/Forge - My Content Brain Preferences.md`
- `00 Meta/Systems/Forge Intelligent Card Rules & Anticipation Engine.md`
- `00 Meta/Systems/Forge Hermes-Grok RACI, Context & Memory System.md`

This encodes noun/verb categorization, anticipation of unstated needs, ADHD optimizations (visuals, summaries + details, validated), tracking (no dropped tasks), RACI (Grok maintains memory/rules; Hermes executes deep), hybrid apply, and continuous improvement.

**Simple Commands** (use in floating chat or Telegram for easy updates):
- "Create/update [noun/verb] card for [name] with photos"
- "Polish this to JUNE 2026 standard, anticipate missing [photos/maintenance/cross-domain]"
- "Apply Hermes outputs for [task]"
- "Show status of card updates" or "Validate no dropped tasks"

Non-BJJ cards (Equipment, Job Cards, Fitness Protocols/Principles, References, Work, Personal, etc.) now follow JUNE 2026 GOLD STANDARD templates: visual-first with real photo embeds `![[photo|500]]`, emojis, callouts, key cues, 5 principles, drills, ADHD-optimized for smart but visual learners. Hermes tasks enforce this for consistency across the Forge. All informal card-like content is in scope.
