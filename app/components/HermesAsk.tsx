'use client';

import { useState } from 'react';
import { HermesSuggestionReview } from '@/app/components/hermes/HermesSuggestionReview';
import { copyToClipboard } from '@/lib/utils';

interface HermesAskProps {
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
  "Suggest the 2-3 best existing videos (with links if known) that clearly show the key hand placement or timing for this move.",
];

export function HermesAsk({ technique }: HermesAskProps) {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [usedHermes, setUsedHermes] = useState(false);
  const [mediaSuggestions, setMediaSuggestions] = useState<any[]>([]);
  const [pastedHermesAnswer, setPastedHermesAnswer] = useState('');
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

  const askHermes = async (customPrompt?: string) => {
    const finalPrompt = customPrompt || prompt;
    if (!finalPrompt.trim()) return;

    setLoading(true);
    setResponse('');
    setMediaSuggestions([]);

    try {
      const res = await fetch('/api/hermes/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          technique,
          prompt: finalPrompt,
          mode: finalPrompt.toLowerCase().includes('media') || finalPrompt.toLowerCase().includes('video') ? 'media' : 'general'
        }),
      });

      const data = await res.json();

      if (data.success) {
        setResponse(data.response);
        setUsedHermes(data.usedHermes);

        // Simple parsing for media suggestions (we can make this much smarter later)
        if (data.response.includes('http')) {
          const suggestions = parseMediaFromHermesResponse(data.response);
          setMediaSuggestions(suggestions);
        }
      } else {
        setResponse('Something went wrong. Please try again.');
      }
    } catch (error) {
      setResponse('Failed to reach Hermes. Make sure the server is running and Hermes is installed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border-t pt-8">
      <div className="mb-4">
        <h2 className="text-lg font-semibold tracking-tight flex items-center gap-2">
          Ask Hermes
          <span className="text-xs font-normal px-2 py-0.5 rounded bg-violet-100 text-violet-700">AI</span>
        </h2>
        <p className="text-sm text-muted-foreground">
          Get intelligent analysis, principle extraction, or suggestions for this technique.
        </p>
      </div>

      {/* Suggested Prompts */}
      <div className="flex flex-wrap gap-2 mb-4">
        {suggestedPrompts.map((p, index) => (
          <button
            key={index}
            onClick={() => askHermes(p)}
            disabled={loading}
            className="text-left text-xs px-3 py-1.5 rounded-full border hover:bg-muted disabled:opacity-50 transition"
          >
            {p}
          </button>
        ))}
        <button
          onClick={() => askHermes("Suggest the best 2-3 videos or photos that would dramatically improve the visual explanation of this technique, especially hand placement and timing. Include why each one is valuable.")}
          disabled={loading}
          className="text-left text-xs px-3 py-1.5 rounded-full border bg-violet-50 hover:bg-violet-100 text-violet-700 disabled:opacity-50 transition"
        >
          Suggest Media
        </button>
      </div>

      {/* Custom Prompt */}
      <div className="flex gap-2 mb-4">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ask anything about this technique..."
          className="flex-1 min-h-[60px] border border-border/70 rounded-xl p-3 text-sm resize-y"
          disabled={loading}
        />
        <button
          onClick={() => askHermes()}
          disabled={loading || !prompt.trim()}
          className="px-5 py-2 bg-black text-white rounded-xl text-sm font-medium disabled:opacity-50 hover:bg-zinc-900 self-end"
        >
          {loading ? 'Thinking...' : 'Ask'}
        </button>
      </div>

      {/* Response / Hermes Fallback Handling */}
      {response && (
        <div className="mt-4 space-y-4">
          {!usedHermes && response.includes('Copy the prompt below') ? (
            // Guided manual flow (Telegram / local Hermes CLI) - clean and low-noise
            <div className="border rounded-2xl p-5 bg-card">
              <div className="font-semibold mb-2 text-violet-700">Send to Hermes (via Telegram or CLI)</div>
              
              <div className="text-sm text-muted-foreground mb-4 space-y-1">
                <div>1. Click the button below to copy a clean prompt</div>
                <div>2. Paste it into Hermes in Telegram (or run locally)</div>
                <div>3. Copy Hermes’ reply and paste it in the box below</div>
                <div>4. Click “Process Response” — we’ll turn it into reviewable suggestions</div>
              </div>

              <button
                onClick={async () => {
                  const promptText = response.split('---')[1]?.trim() || response;
                  try {
                    if (navigator.clipboard?.writeText) {
                      await navigator.clipboard.writeText(promptText);
                    } else {
                      // iOS Safari fallback
                      const textArea = document.createElement('textarea');
                      textArea.value = promptText;
                      document.body.appendChild(textArea);
                      textArea.select();
                      document.execCommand('copy');
                      document.body.removeChild(textArea);
                    }
                    alert('Clean prompt copied! Paste it into Hermes in Telegram now.');
                  } catch (err) {
                    alert('Copy failed. Please manually select and copy the prompt text from the box below.');
                  }
                }}
                className="w-full mb-3 px-4 py-2.5 bg-black text-white rounded-xl text-sm font-medium hover:bg-zinc-900"
              >
                Copy Clean Prompt for Hermes
              </button>

              <textarea
                value={pastedHermesAnswer}
                onChange={(e) => setPastedHermesAnswer(e.target.value)}
                placeholder="Paste the full answer you got back from Hermes here..."
                className="w-full h-40 border rounded-xl p-3 text-sm font-mono mb-3"
              />

              <button
                onClick={() => {
                  const processed = pastedHermesAnswer.trim();
                  if (!processed) return;

                  setResponse(processed);

                  // Use rich structured parser
                  const suggestions = parseMediaFromHermesResponse(processed);
                  setMediaSuggestions(suggestions);
                  setPastedHermesAnswer('');
                }}
                disabled={!pastedHermesAnswer.trim()}
                className="w-full px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 disabled:opacity-50"
              >
                Process Hermes Response &amp; Show Suggestions
              </button>
            </div>
          ) : (
            // Normal response display
            <div className="p-5 rounded-2xl bg-muted/50 border text-sm whitespace-pre-wrap">
              {response}
            </div>
          )}
        </div>
      )}

      {/* Media Suggestions Review Panel - High Quality Review Experience */}
      {mediaSuggestions.length > 0 && (
        <div className="mt-6 border-t pt-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold">Review Media Suggestions</h4>
            <span className="text-xs text-muted-foreground">{mediaSuggestions.length} suggestions</span>
          </div>

          <div className="space-y-4">
            {mediaSuggestions.map((suggestion, index) => (
              <div 
                key={index} 
                className={`border rounded-2xl p-5 bg-card transition-all ${suggestion.added ? 'border-emerald-300 bg-emerald-50/30' : 'border-border'}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium px-2 py-0.5 rounded bg-blue-100 text-blue-700">
                        {suggestion.url.includes('youtube') || suggestion.url.includes('youtu.be') ? 'YouTube' : 'Video'}
                      </span>
                      {suggestion.added && <span className="text-xs text-emerald-600">✓ Added to review</span>}
                    </div>

                    <a 
                      href={suggestion.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="font-medium text-blue-600 hover:underline break-all"
                    >
                      {suggestion.url}
                    </a>

                    <div className="mt-1.5">
                      <div className="font-medium text-sm">{suggestion.title}</div>
                      {suggestion.instructor && (
                        <div className="text-xs text-muted-foreground">Instructor: {suggestion.instructor}</div>
                      )}
                      {suggestion.timestamp && (
                        <div className="text-xs text-emerald-600">Recommended timestamp: {suggestion.timestamp}</div>
                      )}
                      {suggestion.why && (
                        <div className="text-xs text-muted-foreground mt-1 italic">“{suggestion.why}”</div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => {
                        const updated = [...mediaSuggestions];
                        updated[index].added = !updated[index].added;   // toggle for review tracking
                        setMediaSuggestions(updated);
                      }}
                      className="text-xs px-3 py-1.5 rounded-xl border hover:bg-muted font-medium whitespace-nowrap"
                    >
                      {suggestion.added ? '✓ Reviewed (click to unmark)' : 'Mark reviewed'}
                    </button>

                    { (suggestion.url.includes('youtube') || suggestion.url.includes('youtu.be')) && (
                      <span className="text-[10px] text-center text-emerald-600">Embeds well</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 text-xs text-muted-foreground bg-muted/50 p-3 rounded-xl">
            <strong>Current best practice:</strong> YouTube videos are prioritized because they embed cleanly and reliably in The Mat.
            Use "Mark reviewed" on items you like, then use the big violet button below to write the remaining ones straight into your Obsidian card (or use the green copy buttons for manual paste).
          </div>

          {/* One-click copy helpers — highest quality, lowest friction output */}
          {mediaSuggestions.length > 0 && (
            <div className="mt-4 space-y-3">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    const active = mediaSuggestions.filter(s => !s.added);
                    const videoLines = active.map(s => {
                      const credit = s.instructor || 'Hermes research';
                      const tsLine = s.timestamp ? `\n    timestamp: "${s.timestamp}"` : '';
                      const whyLine = s.why ? `\n    why: "${s.why.replace(/"/g, "'")}"` : '';
                      return `  - url: "${s.url}"\n    title: "${s.title}"\n    credit: "${credit}"${tsLine}${whyLine}`;
                    }).join('\n');
                    const snippet = `videos:\n${videoLines || '  # Paste videos here'}`;
                    safeCopy(snippet, 'Rich videos: frontmatter copied. Replace the videos: block in the card frontmatter.');
                  }}
                  className="text-xs px-3 py-1.5 rounded-xl border hover:bg-muted"
                >
                  Copy videos: Frontmatter (rich)
                </button>

                <button
                  onClick={() => {
                    const active = mediaSuggestions.filter(s => !s.added);
                    const lines = active.map(s => {
                      const credit = s.instructor ? ` — ${s.instructor}` : '';
                      const ts = s.timestamp ? ` (${s.timestamp})` : '';
                      const why = s.why ? ` Why: ${s.why}` : '';
                      return `- [${s.title}](${s.url})${credit}${ts}.${why}`;
                    }).join('\n');
                    const snippet = `## Media & Visual References\n\n### Videos\n\n${lines || 'Add videos here'}\n\n### Recommended Photos / Diagrams\n\n- [Describe ideal hand-placement photo 1]\n- [Describe ideal angle/timing photo 2]`;
                    safeCopy(snippet, 'Full Media section copied. Paste/replace the ## Media & Visual References section in the card body.');
                  }}
                  className="text-xs px-3 py-1.5 rounded-xl border hover:bg-muted"
                >
                  Copy Complete Media Section
                </button>
              </div>

              <button
                onClick={() => {
                  const active = mediaSuggestions.filter(s => !s.added);
                  const videoFm = active.map(s => {
                    const credit = s.instructor || 'Hermes research';
                    const tsLine = s.timestamp ? `\n    timestamp: "${s.timestamp}"` : '';
                    const whyLine = s.why ? `\n    why: "${s.why.replace(/"/g, "'")}"` : '';
                    return `  - url: "${s.url}"\n    title: "${s.title}"\n    credit: "${credit}"${tsLine}${whyLine}`;
                  }).join('\n');

                  const mediaBodyLines = active.map(s => {
                    const credit = s.instructor ? ` — ${s.instructor}` : '';
                    const ts = s.timestamp ? ` (${s.timestamp})` : '';
                    const why = s.why ? ` ${s.why}` : '';
                    return `- [${s.title}](${s.url})${credit}${ts}.${why}`;
                  }).join('\n');

                  const full = `videos:\n${videoFm || '  # videos here'}\n\n## Media & Visual References\n\n### Videos\n\n${mediaBodyLines || 'Add video links here'}\n\n### Recommended Photos / Diagrams\n\n- Close-up photo of the critical hand placement or hip position (side or top-down angle preferred).\n- Photo showing the key posture/angle difference this technique creates.`;

                  safeCopy(full, '✅ Perfect blocks copied. In Obsidian: 1) Replace the entire videos: [...] block in frontmatter. 2) Replace or insert the ## Media & Visual References section. Personal Cues untouched.');
                }}
                className="w-full text-sm px-4 py-2.5 rounded-xl border bg-emerald-600 hover:bg-emerald-700 text-white font-medium flex items-center justify-center gap-2"
              >
                ✨ Generate Complete Updated Media Blocks (one-click copy for Obsidian)
              </button>

              <div className="text-[10px] text-muted-foreground px-1">
                This produces ready-to-paste YAML + markdown matching the 2026+ gold standard format. Hermes can also be asked directly to output the full card.
              </div>

              {/* Real apply - executes the backend file management for the user (the main low-friction action) */}
              {(() => {
                const remaining = mediaSuggestions.filter((s: any) => !s.added).length;
                const total = mediaSuggestions.length;
                return (
                  <>
                    <button
                      onClick={applySuggestionsToVault}
                      disabled={applyStatus === 'applying' || remaining === 0}
                      className="w-full mt-2 text-sm px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:bg-violet-300 text-white font-medium flex items-center justify-center gap-2"
                    >
                      {applyStatus === 'applying'
                        ? 'Writing to Obsidian vault...'
                        : remaining > 0
                          ? `🚀 Apply ${remaining} of ${total} to the Card (writes directly to vault)`
                          : 'All marked reviewed — use green buttons above or unmark to apply'}
                    </button>

                    {applyStatus !== 'idle' && (
                      <div className={`text-xs p-3 rounded-xl border ${applyStatus === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : applyStatus === 'error' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-muted'}`}>
                        {applyMessage}
                        {applyStatus === 'success' && (
                          <div className="mt-1 text-[10px]">Vault updated. Re-open or hard-refresh the technique page to see the new Media section live.</div>
                        )}
                      </div>
                    )}

                    {remaining === 0 && total > 0 && applyStatus === 'idle' && (
                      <div className="text-[10px] text-center text-muted-foreground mt-1">
                        All items marked reviewed. Unmark any above or use the copy buttons for manual paste.
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          )}
        </div>
      )}

      {/* Advanced structured review tool (new - lower friction for complex updates) */}
      <div className="mt-8 border-t pt-6">
        <details>
          <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground mb-2">
            Advanced: Structured Hermes Response Reviewer (best for big updates)
          </summary>
          <HermesSuggestionReview 
            techniqueSlug={technique.slug} 
            techniqueName={technique.name} 
          />
        </details>
      </div>
    </div>
  );
}
