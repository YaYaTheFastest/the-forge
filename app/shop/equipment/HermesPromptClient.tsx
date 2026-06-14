'use client';

import { useState } from 'react';

interface Props {
  fullPrompt: string;
  quickPrompts: string[];
}

export function HermesPromptClient({ fullPrompt, quickPrompts }: Props) {
  const [copied, setCopied] = useState(false);

  const copyFullPrompt = async () => {
    try {
      await navigator.clipboard.writeText(fullPrompt);
      setCopied(true);
      alert('Full Hermes prompt copied! Paste the current Equipment Card content after the marker, attach the wiring file, and send to Hermes.');
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      alert('Failed to copy. Please copy manually.');
    }
  };

  const copyQuickPrompt = async (prompt: string) => {
    try {
      await navigator.clipboard.writeText(prompt);
      alert('Prompt copied! Paste into Hermes.');
    } catch (e) {
      alert('Failed to copy. Please copy manually.');
    }
  };

  return (
    <div className="rounded-2xl border bg-muted/40 p-5 space-y-4">
      <div className="text-sm font-medium text-muted-foreground">Full Ready-to-Copy Hermes Prompt (Highest Standard)</div>
      <div className="text-xs text-muted-foreground">
        Copy this, then paste the full content of this Equipment Card + attach <strong>For Hermes - Equipment &amp; Job Card System.md</strong>. All final content (videos, manuals, notes) should be saved into the Equipment Card in your vault.
      </div>
      <button
        onClick={copyFullPrompt}
        className="w-full text-left text-sm px-4 py-3 rounded-xl border bg-white hover:bg-amber-50 active:bg-amber-100 transition font-medium"
      >
        📋 Copy Complete Hermes Enrichment Prompt (with full context + Ranch vs Household guidance)
      </button>

      <div className="text-sm font-medium text-muted-foreground pt-2">Quick Targeted Prompts</div>
      <div className="flex flex-wrap gap-2">
        {quickPrompts.map((prompt, i) => (
          <button
            key={i}
            onClick={() => copyQuickPrompt(prompt)}
            className="text-left text-xs px-3 py-1.5 rounded-full border hover:bg-white transition"
          >
            {prompt.length > 70 ? prompt.slice(0, 67) + '...' : prompt}
          </button>
        ))}
      </div>

      <div className="pt-2 text-xs text-muted-foreground border-t">
        After Hermes responds, paste useful parts into the <strong>Ranch Notes &amp; Cues</strong> section above (or directly into the Equipment Card in your vault). 
        The goal is to keep all videos, manuals, specs, and operator notes inside the Forge / vault — not scattered in Notion.
      </div>
    </div>
  );
}
