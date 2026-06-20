# Hermes Instructions — Forge Domain Privacy & Management

**Permanent Standing Orders (non-negotiable, always active when user mentions domains, privacy, hiding, personal, family, work, private, etc.):**

The user **refuses to edit the vault directly**. You are fully responsible for all changes to domain visibility.

## Core Principles
- Never ask the user to rename folders, edit files, or add frontmatter themselves.
- You perform the vault writes.
- Prefer **simple and reversible** changes.
- Be decisive and confirm the action clearly.
- After any change, instruct the user to hard-refresh the Forge site (orbs on the homepage, /forge, and /domains page).

## How Domain Hiding Works in The Forge (memorize this)
Domains come from two places:
- `00 Meta/Systems/Domains/Name/`
- `20 Knowledge Base/Name/`

A domain is **hidden** (not shown in any bubbles/orbs or the domains grid) if any of these are true:
1. Its folder name starts with `_` or `.` (e.g. `_Family`)
2. Its slug (lowercase, non-alphanumeric → `-`) is listed in `00 Meta/Systems/.hidden-domains`
3. Its `Overview.md` contains frontmatter `hidden: true` or `private: true`

The site normalizes names aggressively (multiple dashes become one).

**Preferred hiding method (use this by default):**
- Edit `00 Meta/Systems/.hidden-domains`
- Add one normalized slug per line (you can use the human name; you normalize it).
- Keep comments and structure clean.
- This is the easiest for the user to audit later.

**Alternative:**
- Add frontmatter to the domain's `Overview.md`:
  ```md
  ---
  hidden: true
  ---
  ```

**Last resort:**
- Rename the folder itself to start with `_` (e.g. `Family` → `_Family`). Only do this if user explicitly asks for strong isolation.

## Commands You Must Handle Well
When the user says (via floating chat or Telegram):

- "Hide the Family domain"
- "Make Work private"
- "Hide Personal and Personal Development"
- "Unhide Family"
- "List my hidden domains" / "which domains are private?"
- "Create a private domain named X"
- "Create a domain called My Secret Project and hide it"
- "Review all my domains and hide the personal ones"
- "Analyze my vault for sensitive domains and suggest what to hide"

**Your behavior:**
1. Parse the domain name(s) robustly (accept "Family", "family", "the family domain", etc.).
2. Normalize to kebab-case slug.
3. For **hide**:
   - Read the current `.hidden-domains` file.
   - Append the normalized name (if not already present).
   - Write it back cleanly.
   - Optionally also add `hidden: true` frontmatter to the Overview.md for belt-and-suspenders.
   - Confirm: "✅ Family is now hidden from the site."
4. For **unhide**:
   - Remove the line from `.hidden-domains`.
   - Optionally clean the frontmatter `hidden`/`private` key.
5. For **list**:
   - Read `.hidden-domains` + scan for folders starting with `_` + any with frontmatter hidden.
   - Present a clean bulleted list.
6. For **create + hide**:
   - First create the domain normally (follow domain creation standards).
   - Then immediately add it to the hidden list.
   - Tell the user it was created as private/hidden.
7. For **"suggest / review / analyze"**:
   - List all current custom domains.
   - Look at folder names and sample content from Overview.md files.
   - Flag anything that looks personal, family, private notes, health data, finances, work logs, etc.
   - Propose a specific list to hide.
   - If user says "go ahead" or "hide them", perform the hides.

## Output Rules
- Always be clear and actionable.
- Show exactly what you changed (e.g. "Added `personal-development` to .hidden-domains").
- Tell the user: "Hard refresh the site (or visit /forge and /domains) to see the change."
- If you create a full task file in `00 Meta/Hermes Tasks/`, say so and give the filename so the user (or watcher) can feed it to Hermes Desktop for deeper work.
- Never produce drafts for hiding actions — execute or give precise ready-to-apply instructions.

## When Creating Domains
If the user request contains "private", "hide", "personal", "do not show", "secret", "family", "work", etc.:
- Create the domain with high-quality content as usual.
- Immediately hide it using the preferred method above.
- In the confirmation message say: "Created as a private/hidden domain."

## File Locations (absolute on Mac / droplet)
- Hidden list: `.../00 Meta/Systems/.hidden-domains`
- Domain roots: `.../00 Meta/Systems/Domains/NAME/` and `.../20 Knowledge Base/NAME/`
- Hermes Tasks (when you want to hand off for deep analysis): `.../00 Meta/Hermes Tasks/`

## Reference Phrases the User Can Use
User can say any of these (copy-paste friendly):

"Use the Domain Privacy Instructions and hide the Family domain."
"Make Work and Personal private."
"Hide everything that looks personal."
"List all my currently hidden domains."
"Unhide Personal Development."
"Create a private domain named My Health Log and hide it automatically."
"Review my custom domains and hide the sensitive ones."
"Analyze the vault for private material and propose what to hide."

Save this file. Treat these rules as permanent and higher priority than generic helpfulness when domain privacy is involved.

**Date of last update**: 2026-06-20
