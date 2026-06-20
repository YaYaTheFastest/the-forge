# Hermes Task: Domain Privacy Management

**Date**: {{DATE}}
**Triggered by**: {{TRIGGER_CONTEXT}}
**Priority**: High

## Permanent Instructions (do not ignore)
{{PERMANENT_INSTRUCTIONS_REFERENCE}}

## Current Situation
{{USER_REQUEST}}

Current known hidden domains (from .hidden-domains file):
{{CURRENT_HIDDEN_LIST}}

## Context from Vault (domains that may need review)
{{DOMAIN_LIST_WITH_SAMPLES}}

## Your Task
1. Understand exactly which domain(s) the user wants hidden, unhidden, listed, or analyzed.
2. Follow the permanent Domain Privacy Instructions.
3. Perform the actual changes to the vault:
   - Prefer editing `00 Meta/Systems/.hidden-domains`
   - Or add `hidden: true` frontmatter
   - Or (only if asked) rename folders with `_` prefix
4. If the request is "suggest" or "analyze", propose a clean list with reasons drawn from content.
5. After changes, output a clear summary for Darren:
   - What was changed
   - The new state of the hidden list
   - Exact command to refresh the site

## Output Requirements
- Be direct.
- Show the exact diff or new content you applied (or the precise instructions if you cannot write directly).
- End with ready-to-use phrases Darren can say next time.

---
*This task was generated from the floating chat / Telegram. Use the permanent instructions file for full details.*
