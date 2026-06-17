'use client';

import { useState } from 'react';
import { HermesSuggestionReview } from '@/app/components/hermes/HermesSuggestionReview';
import { copyToClipboard } from '@/lib/utils';

interface GrokTechniqueActionsProps {
  technique: {
    name: string;
    slug: string;
    position?: string;
    category?: string;
    content: string;
    personalNotes?: string;
  };
}

const suggestedPrompts = [
  "Extract the 3-5 most important principles from this technique and my notes.",
  "Suggest 3 related techniques I should connect this to in a mind map.",
  "Write 4-5 high-quality personal training cues for this technique.",
  "What are the most common mistakes people make with this technique and how do I avoid them?",
];

export function GrokTechniqueActions({ technique }: GrokTechniqueActionsProps) {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [mediaSuggestions, setMediaSuggestions] = useState<any[]>([]);
  const [applyStatus, setApplyStatus] = useState<'idle' | 'applying' | 'success' | 'error'>('idle');
  const [applyMessage, setApplyMessage] = useState('');

  // Local wrapper: uses the cross-device safe util + shows user feedback
  async function safeCopy(text: string, successMsg: string) {
    const ok = await copyToClipboard(text);
    if (ok) {
      alert(successMsg);
    } else {
      alert('Copy failed on this device. The content will be shown so you can copy it manually.');
      setTimeout(() => alert(text), 30);
    }
  }

  // Rich parser for the structured media output Hermes is prompted to produce
  function parseMediaFromHermesResponse(text: string): any[] {
    const suggestions: any[] = [];
    // Match blocks starting with **Video N** or "Video 1" etc.
    const videoBlockRegex = /(?:\*\*Video\s*\d+\*\*|Video\s*\d+)[^\n]*([\s\S]*?)(?=(?:\*\*Video\s*\d+\*\*|Video\s*\d+|\*\*Photo|\n###|$))/gi;
    let match;

    while ((match = videoBlockRegex.exec(text)) !== null) {
      const block = match[1];
      const urlMatch = block.match(/Link:\s*(https?:\/\/\S+)/i) || block.match(/(https?:\/\/[^\s)]+)/);
      if (!urlMatch) continue;

      const url = urlMatch[1].replace(/[)\s]+$/, '');
      const title = (block.match(/Title:\s*(.+)/i) || [])[1]?.trim() || 'Recommended Video';
      const instructor = (block.match(/Instructor:\s*(.+)/i) || [])[1]?.trim() || 'From Hermes research';
      const why = (block.match(/Why valuable:\s*(.+)/i) || block.match(/Why this.*?:?\s*(.+)/i) || [])[1]?.trim() || '';
      const ts = (block.match(/timestamp:\s*(.+)/i) || block.match(/Recommended timestamp:\s*(.+)/i) || [])[1]?.trim() || '';

      suggestions.push({
        id: suggestions.length,
        url,
        title,
        instructor,
        why,
        timestamp: ts,
        added: false,
      });
    }

    // Fallback: if no structured blocks but has links, grab links with surrounding context
    if (suggestions.length === 0) {
      const links = text.match(/https?:\/\/[^\s)]+/g) || [];
      links.forEach((url, i) => {
        // Try to grab a title-ish line before the url
        const idx = text.indexOf(url);
        const before = text.slice(Math.max(0, idx - 120), idx);
        const titleGuess = (before.match(/Title:\s*(.+)|(\*\*[^*]+\*\*)/i) || [])[1]?.trim() || `Resource ${i + 1}`;
        suggestions.push({
          id: i,
          url: url.replace(/[)\s]+$/, ''),
          title: titleGuess,
          instructor: 'From Hermes',
          why: '',
          timestamp: '',
          added: false,
        });
      });
    }

    return suggestions;
  }

  // One-click apply: writes the selected suggestions directly into the Obsidian file via our safe backend
  const applySuggestionsToVault = async () => {
    const active = mediaSuggestions.filter(s => !s.added);
    if (active.length === 0) {
      alert('No new suggestions to apply.');
      return;
    }

    setApplyStatus('applying');
    setApplyMessage('');

    // Build rich-aware media section (matches the copy generator)
    const mediaBodyLines = active.map((s: any) => {
      const credit = s.instructor ? ` — ${s.instructor}` : '';
      const ts = s.timestamp ? ` (${s.timestamp})` : '';
      const why = s.why ? ` ${s.why}` : '';
      return `- [${s.title}](${s.url})${credit}${ts}.${why}`;
    }).join('\n');

    const mediaSection = `## Media & Visual References\n\n### Videos\n\n${mediaBodyLines || 'Add video links here'}\n\n### Recommended Photos / Diagrams\n\n- Close-up photo of the critical hand placement or hip position (side or top-down angle preferred).\n- Photo showing the key posture/angle difference this technique creates.`;

    const videosForApi = active.map((s: any) => ({
      url: s.url,
      title: s.title,
      credit: s.instructor,
      timestamp: s.timestamp,
      why: s.why,
    }));

    try {
      const res = await fetch('/api/techniques/apply-media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: technique.slug,
          videos: videosForApi,
          mediaSectionMarkdown: mediaSection,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setApplyStatus('success');
        setApplyMessage(data.message || 'Updates written to vault.');
        // Mark them added in UI
        const updated = mediaSuggestions.map(s => 
          active.some(a => a.url === s.url) ? { ...s, added: true } : s
        );
        setMediaSuggestions(updated);
      } else {
        setApplyStatus('error');
        setApplyMessage(data.error || 'Apply failed.');
      }
    } catch (e: any) {
      setApplyStatus('error');
      setApplyMessage('Network error applying updates. ' + (e?.message || ''));
    }
  };

  // Core: call the wired Grok endpoint (same as floating chat + Telegram).
  // This provides the "Forge intelligence" (vault context + permanent GB1 rules + direct apply actions).
  // No external LLM call — domain-specific programmed responses + templates that are very strong for this BJJ system.
  const callGrok = async (message: string, options?: { showInline?: boolean }) => {
    setLoading(true);
    setResponse('');
    setMediaSuggestions([]);
    setApplyStatus('idle');

    try {
      const res = await fetch('/api/forge/grok-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          context: {
            currentSlug: technique.slug,
            currentName: technique.name,
            isTechniquePage: true,
          },
        }),
      });

      const data = await res.json();
      const reply = data.response || 'Action completed. Refresh the page to see vault changes.';

      setResponse(reply);

      // If the reply indicates a direct apply happened, surface it nicely.
      if (reply.includes('✅') || reply.includes('applied') || reply.includes('Directly applied')) {
        setApplyStatus('success');
        setApplyMessage('Changes written directly to the live vault.');
      }
    } catch (e) {
      setResponse('Grok action failed. The floating 💬 chat button (bottom right) has the same full context — try it.');
    } finally {
      setLoading(false);
    }
  };

  // Route suggested prompts through Grok for intelligence (targeted structured answers using vault + rules).
  const askGrokPrompt = (customPrompt?: string) => {
    const final = customPrompt || prompt;
    if (!final.trim()) return;
    callGrok(final);
  };

  // Specific one-click Grok actions (direct apply where supported by the backend).
  const polishFull = () => callGrok('polish this to the 2026 GB1 golden standard and apply directly');
  const improveCues = () => callGrok('improve the personal cues and notes for fatigue and apply directly');
  const enhanceMedia = () => callGrok('add better media placeholders and video suggestions and apply directly');

  // (polishFull, improveCues, enhanceMedia defined above using callGrok)

  return (
    <div className="border-t pt-8">
      <div className="mb-4">
        <h2 className="text-lg font-semibold tracking-tight flex items-center gap-2">
          Grok / Forge (direct to live vault)
          <span className="text-xs font-normal px-2 py-0.5 rounded bg-blue-100 text-blue-700">Recommended</span>
        </h2>
        <p className="text-sm text-muted-foreground">
          One-click polish, media, or analysis. Powered by the same Grok chat that works from Telegram and the floating 💬 button. Writes straight to /opt/vault.
        </p>
      </div>

      {/* Primary Grok one-click actions (direct to live vault) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-4">
        <button
          onClick={polishFull}
          disabled={loading}
          className="px-4 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold disabled:opacity-60"
        >
          {loading ? 'Working...' : '✨ Full Polish + Apply (GB1 standard)'}
        </button>
        <button
          onClick={improveCues}
          disabled={loading}
          className="px-4 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold disabled:opacity-60"
        >
          {loading ? 'Working...' : 'Improve Personal Cues + Apply'}
        </button>
        <button
          onClick={enhanceMedia}
          disabled={loading}
          className="px-4 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold disabled:opacity-60"
        >
          {loading ? 'Working...' : 'Add Media Placeholders + Apply'}
        </button>
      </div>
      <div className="text-[10px] text-center text-muted-foreground mb-3 -mt-1">
        All write directly to the live vault on the droplet. Refresh the page (or pull-to-refresh) to see updates.
      </div>

      {/* Suggested Prompts now powered by Grok (structured, vault-aware answers) */}
      <div className="mb-1 text-xs uppercase tracking-widest text-muted-foreground">Quick analysis (Grok)</div>
      <div className="flex flex-wrap gap-2 mb-4">
        {suggestedPrompts.map((p, index) => (
          <button
            key={index}
            onClick={() => askGrokPrompt(p)}
            disabled={loading}
            className="text-left text-xs px-3 py-1.5 rounded-full border hover:bg-muted disabled:opacity-50 transition"
          >
            {p}
          </button>
        ))}
        <button
          onClick={() => askGrokPrompt("Suggest strong video and photo references for clear hand placement, posture and timing.")}
          disabled={loading}
          className="text-left text-xs px-3 py-1.5 rounded-full border bg-indigo-50 hover:bg-indigo-100 text-indigo-700 disabled:opacity-50 transition"
        >
          Suggest Media References
        </button>
      </div>

      {/* Custom free-text prompt (routed to Grok with full card context) */}
      <div className="flex gap-2 mb-4">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ask Grok anything specific about this technique (e.g. timing under fatigue, setup details...)"
          className="flex-1 min-h-[60px] border border-border/70 rounded-xl p-3 text-sm resize-y"
          disabled={loading}
        />
        <button
          onClick={() => askGrokPrompt()}
          disabled={loading || !prompt.trim()}
          className="px-5 py-2 bg-black text-white rounded-xl text-sm font-medium disabled:opacity-50 hover:bg-zinc-900 self-end"
        >
          {loading ? 'Thinking...' : 'Ask Grok'}
        </button>
      </div>

      {/* Grok response + nice result surfacing */}
      {response && (
        <div className="mt-4">
          {applyStatus === 'success' ? (
            <div className="p-4 mb-3 rounded-2xl border border-emerald-300 bg-emerald-50 text-sm">
              <div className="font-semibold text-emerald-800 mb-1">✅ Action applied directly to the live vault</div>
              <div className="text-emerald-700">{applyMessage}</div>
              <div className="mt-2 text-xs">Hard refresh the page (or pull down on mobile) to see the updated card.</div>
              <button
                onClick={() => window.location.reload()}
                className="mt-3 text-xs px-3 py-1.5 rounded-full border border-emerald-700 text-emerald-800 hover:bg-emerald-100"
              >
                Reload this page now
              </button>
            </div>
          ) : null}

          <div className="p-5 rounded-2xl bg-muted/50 border text-sm whitespace-pre-wrap">
            {response}
          </div>

          <div className="text-[10px] text-muted-foreground mt-2">
            Grok responses here use the live vault + permanent GB1 instructions. For the richest conversational experience use the floating 💬 button.
          </div>
        </div>
      )}

      {/* Media suggestions (from Grok or legacy) - kept lightweight */}
      {mediaSuggestions.length > 0 && (
        <details className="mt-6 border-t pt-4">
          <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground">
            Media suggestions from last response (mostly legacy paste flow)
          </summary>
          <div className="mt-3 text-xs text-muted-foreground">
            For best media results, use the one-click “Add Media Placeholders + Apply” button above or the full polish. The floating Grok chat also handles this cleanly.
          </div>
        </details>
      )}

      {/* Advanced / legacy external Hermes reviewer (heavily de-emphasized) */}
      <div className="mt-6 border-t pt-4">
        <details>
          <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground">
            Legacy only: Paste response from external Hermes (if you still use Desktop)
          </summary>
          <div className="mt-3">
            <HermesSuggestionReview 
              techniqueSlug={technique.slug} 
              techniqueName={technique.name} 
            />
          </div>
        </details>
      </div>

      <div className="mt-3 text-[10px] text-muted-foreground">
        Primary interface: floating 💬 Grok button (full context) or the buttons above. Everything writes straight to the live vault.
      </div>
    </div>
  );
}
