# The Forge - Complete Context (JUNE 2026+)

**Purpose of this file:** This is the single, always-up-to-date context document for the The-Mat / Forge project. Use it when chatting with Grok (or other LLMs) to strategize, ideate variations, plan features, debug, or extend the system. Copy-paste relevant sections + this intro for best results. The goal is a "brain" of the entire system so ideation stays consistent with your tastes, preferences, and desires.

**Project Overview**
- **Name**: The Forge (the-mat)
- **Repo**: Available on GitHub (this file is in root for easy reference in chats)
- **Core Idea**: A personal "operating system" / knowledge forge that turns your Obsidian vault (Jorgenson Brain) into interactive, actionable domains with orbs, cards, orbs, daily wins, etc. Live from vault, powered by Hermes + Grok for creation/polish/research.
- **Key Values** (from your brain/preferences):
  - ADHD-friendly: Thorough yet concise, key summaries first + progressive disclosure ("easy to learn more"), visual-first (real photos/diagrams with `![[name.jpg|500]]` embeds), "tired user at end of day" language, reflection prompts.
  - Visual technique: Prioritize real, visible photos and diagrams everywhere possible.
  - Categorized content: Nouns (info/context like Equipment) vs Verbs/Actions (instruction like Job Cards/Techniques/Maintenance).
  - Intelligence & Anticipation: System should infer type and proactively add unstated elements (photos, cross-domain, maintenance 10% rule, summaries, validated sources).
  - Simplicity for user: Simple commands via chat/Telegram. Keep instructions minimal.
  - Tracking & No Dropped Tasks: Full RACI + memory/log. Grok maintains central rules/memory; Hermes executes deep work. Every task logged with proof/status.
  - Continuous Improvement: Optimize interface for clear commands. Hybrid apply (direct chat/backend + Hermes tasks).
  - Scope: All informal card-like content (BJJ, Equipment, Job Cards, Fitness, References, Work, Personal, Recipes, etc.).
  - True/Validated: Content must be accurate; note sources.

**Architecture**
- **Vault (Source of Truth)**: Obsidian "Jorgenson Brain" at local path + synced to `/opt/vault` on droplet (via sync-vault-to-droplet.sh --pull/push). 
  - 00 Meta/Systems/ for instructions, templates, Hermes Tasks, brain files.
  - 20 Knowledge Base/ for main content (BJJ/Captures, Shop-Property-Ranch/Equipment, Fitness, etc.).
  - Domains in 00 Meta/Systems/Domains/ or 20 KB/.
- **Forge App** (Next.js 16, deployed on droplet via pm2/nginx):
  - Serves live vault content as beautiful interactive UI.
  - /forge: Dynamic orbs (mains + gray customs from vault scan).
  - /domains: Grid + individual pages with live cards.
  - /shop/equipment: Equipment management, Daily Wins.
  - Techniques, Fitness, Mindmaps, Daily-Wins, Status, etc.
  - Floating Grok chat + Telegram bot for creation/polish/research.
  - Direct vault writes on droplet (for chat actions).
- **Hermes Integration**:
  - Hermes Desktop (on Mac) for deep research/creation.
  - Tasks auto-created in `00 Meta/Hermes Tasks/` (by chat or scripts).
  - Permanent instructions loaded into tasks/prompts.
  - Watcher (mac-hermes-watcher.sh, plist) can auto-open tasks.
- **Grok/Chat Layer**:
  - Floating chat on site + Telegram bot -> /api/forge/grok-chat.
  - Intent detection (create domain, polish, bulk, hide, research, etc.).
  - Research via Grok tools (web_search, open_page) when triggered.
  - Calls Hermes via SSH (`callHermesDeep`) for deep work.
  - Direct applies via apply functions or "apply Hermes outputs".
  - Domain creation, content polish, suggestions.
- **Sync & Deploy**:
  - sync-vault-to-droplet.sh (push/pull vault).
  - deploy-to-droplet.sh (build + scp specific files + pm2 restart).
  - magic-update.sh, update-forge.sh.
  - Env: THE_MAT_VAULT_PATH=/opt/vault, HERMES_MAC_SSH.
- **Key Tech**:
  - lib/vault.ts: Scanners (getAllTechniques, getAllShopEquipment, getFitness*, getAllCustomDomains), applyPolished*, createHermes*Task, getDomainSummary.
  - api/forge/grok-chat/route.ts: Main logic, loadPermanentInstructions (now includes brain), bulk processing, research prepend.
  - Components: Orbs (DomainsOrbsClient), cards, actions (GrokTechniqueActions, etc.).
  - Brain files (in vault): Preferences, Rules, RACI, Log, Commands.

**Content Types & Standards (JUNE 2026 GOLD STANDARD)**
- **Categorization** (enforced in rules/brain):
  - Nouns (Equipment, References, Specs, Books): Info/context. Visuals of the item, specs, why matters, anticipated maintenance/related actions.
  - Verbs/Actions (BJJ Techniques, Job Cards, Maintenance, Protocols, Drills): Instruction-focused. Steps, cues, safety, execution, drills, post-check, parent links.
  - Hybrids: Blend + bidirectional links.
- **BJJ Techniques** (20 KB/BJJ/Captures/, GB1 + others):
  - Exact JUNE 2026 structure (see JUNE 2026 GOLD STANDARD BJJ CARD TEMPLATE.md).
  - Frontmatter: name, position, category, gb_curriculum, principle_tags, videos[], confidence, related_techniques, card_layout_version: "2026-06".
  - Sections: Emoji title + KEY CUE, Quick Reference, Observe (visible photo embeds + videos with why, GB priority), Why This Matters, 5 Sharp Principles (callouts + why), Common Mistakes, Execute (steps + cues), Drills (4 specific), Where It Leads, Personal Notes + reflection prompts.
  - Mandatory: Real visible photos (`![[]]`), validated, ADHD-optimized.
- **Equipment Cards** (20 KB/Shop-Property-Ranch/Equipment/...):
  - JUNE 2026 GOLD STANDARD EQUIPMENT CARD (see template).
  - Noun-focused: Photos of *exact* machine, specs, why matters, maintenance schedule (hours + 10% Daily Wins), service instructions, execute/procedures, cross-domain.
  - Fleet: Ranch Operations vs Household.
  - Always anticipate related Job Cards, visuals, Daily Wins integration.
- **Job Cards** (under equipment subdirs):
  - JUNE 2026 GOLD STANDARD JOB CARD.
  - Verb-focused: Tools (with photos), safety, step-by-step, post-check, time/frequency, links to parent, drills.
- **Fitness** (00 Meta/Systems/Domains/Fitness/ + 20 KB):
  - JUNE 2026 GOLD STANDARD for Principles, Protocols, Training Sessions.
  - Visuals, execution, BJJ transfers, ADHD structure.
- **Other Informal** (Work, Personal, Recipes, Coaching, Motorcycling, Family, References, Book Shelf, etc.):
  - Use JUNE 2026 GOLD STANDARD REFERENCE CARD or categorized templates.
  - All informal card-like content in scope. Ensure "content created in the card is always available".
- **General**:
  - Frontmatter standardization where possible.
  - Cross-domain only where naturally relevant.
  - Visuals: Real embeds prioritized; Hermes researches.
  - Validation: Always note sources.

**Hermes & Grok "Brain" System (Preferences, Rules, RACI, Tracking)**
- **Central Brain Files** (00 Meta/Systems/ - always load first):
  - Forge - My Content Brain Preferences.md: Your tastes (ADHD, visuals, categorization, simplicity, hybrid, tracking, continuous improvement).
  - Forge Intelligent Card Rules & Anticipation Engine.md: Noun/verb rules + explicit anticipation logic (e.g., for noun: add photos + related verbs + cross + maintenance + summaries).
  - Forge Hermes-Grok RACI, Context & Memory System.md: Clear ownership + no dropped tasks.
  - Forge Content Update Log.md + Simple Commands Reference.md.
- **RACI (Enforced)**:
  - Grok (chat/backend): Maintains memory/rules/logs, code, site, direct applies, simple commands, audits (no drops).
  - Hermes: Deep research (photos), complex generation, executes tasks, updates logs/status.
  - Hybrid: Grok decides path. Every trigger -> logged entry with proof (file, embeds, summary). Grok verifies.
- **Tracking**: Central log. No task without entry. Hermes must report completion with evidence. Grok re-triggers if needed.
- **Anticipation**: System infers type from input and fills gaps intelligently.
- **Simple User Commands** (documented, accessible via chat/site): See Simple Commands Reference.

**Code Structure (Key for Variations)**
- **lib/vault.ts**: Core data layer.
  - Scanners for techniques (GB1-focused in BJJ/Captures), shop equipment (recursive under Equipment/), fitness (physiology/protocols/principles), custom domains (00 Meta/Systems/Domains + 20 KB).
  - applyPolishedTechniqueCard, applyMediaSuggestions, update*Notes/Hours.
  - createHermesTechniquePolishTask, createHermesEquipmentReviewTask (now reference brain/rules/RACI + anticipation).
  - getDomainSummary, getAllCustomDomains (dynamic customs like Tennis).
- **app/api/forge/grok-chat/route.ts**: Main intelligence layer.
  - Intent detection (create domain, polish, bulk "all techniques", hide, research, equipment, etc.).
  - Research prepend if keywords.
  - loadPermanentInstructions (now loads brain + rules + RACI + BJJ files).
  - Bulk for all BJJ/non-BJJ.
  - Calls callHermesDeep (SSH base64) or direct.
  - Domain creation (top-level only, in 00 Meta/Systems/Domains).
  - Privacy/hide support.
- **Components**: Orbs (framer-motion, dynamic from /api/domains), cards, actions (polish buttons trigger chat with context), Hermes clients.
- **Other APIs**: hermes/ask, techniques/apply-media, shop, mindmaps, restart.
- **Pages**: /forge (orbs + new domain), /domains/[slug], /shop/equipment, /daily-wins, /techniques, etc.
- **Scripts**: deploy, sync, apply-june-2026-gold-standard (for bulk), telegram-hermes-bot, mac-hermes-watcher, standardize, etc.
- **Env**: THE_MAT_VAULT_PATH, HERMES_MAC_SSH.

**Deployment & Ops**
- Droplet: 161.35.97.99, /opt/the-mat, pm2 the-mat, nginx with basic auth.
- Site: rockinjracing.com (private).
- Sync vault before/after changes.
- Live writes only on droplet for chat.

**Key Preferences for Ideation/Strategy**
- Always ADHD + visual.
- Categorize + anticipate.
- Simple for user, smart behind scenes.
- Track everything (RACI + log).
- Hybrid Grok direct + Hermes deep.
- All content in scope.
- Continuous: Easy commands to refine.
- Content must feel "best product" - thorough, validated, usable.

**How to Use This for Grok Chats / Ideation**
1. Paste this entire CONTEXT.md (or key sections) + current question.
2. Reference specific brain files if needed.
3. Examples of good ideation prompts:
   - "Using the brain preferences and rules, ideate a new domain for [topic] with sample cards."
   - "How would we extend the anticipation engine for [new type]?"
   - "Propose variations on the RACI to include more user control."
   - "Design a new simple command for [use case] and update the wiring."
4. When proposing changes: Always tie back to preferences (ADHD, visuals, tracking, simplicity).

**Current State (as of latest)**
- BJJ fully on JUNE 2026 Gold Standard (applied to 119 cards via tasks).
- Non-BJJ: Templates and instructions updated to categorized JUNE 2026 + brain rules.
- Intelligence: Brain files + anticipation + RACI in place.
- Chat supports research, domain create (top-level), bulk, hide, polish.
- All wiring updated to reference brain.

**Links to Key Files (in this repo or vault)**
- Brain: See above in 00 Meta/Systems/.
- Templates: 20 KB/Shop-Property-Ranch/Templates/, 00 Meta/Systems/Domains/Fitness/Templates/, JUNE 2026 BJJ TEMPLATE.md.
- Code: lib/vault.ts, app/api/forge/grok-chat/route.ts, app/forge/page.tsx, components/*.
- Scripts: scripts/ (deploy, sync, apply-june-2026-gold-standard.js, etc.).
- Docs: README.md, this CONTEXT.md, docs/, various Hermes-*.md at root.
- Vault brain is synced to droplet for runtime.

This file should be kept complete and updated whenever the system evolves. When ideating, treat the brain files + this CONTEXT as the "memory" of your preferences.

Last major update context: June 2026 Gold Standard rollout, non-BJJ categorization, intelligence/anticipation, RACI/tracking, brain preferences for tastes.

(End of CONTEXT. Paste relevant parts + ask your question for ideation.)
