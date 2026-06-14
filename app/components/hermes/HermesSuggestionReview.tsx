'use client';

import { useState } from 'react';
import { copyToClipboard } from '@/lib/utils';

interface Suggestion {
  type: 'video' | 'photo' | 'reference' | 'principle' | 'other';
  content: string;
  reason?: string;
  url?: string;
  approved?: boolean;
}

// Helper to safely get approved state (prevents uncontrolled → controlled warnings)
function isApproved(s: Suggestion): boolean {
  return !!s.approved;
}

interface HermesSuggestionReviewProps {
  techniqueSlug: string;
  techniqueName: string;
  initialSuggestions?: Suggestion[];
}

export function HermesSuggestionReview({ techniqueSlug, techniqueName, initialSuggestions = [] }: HermesSuggestionReviewProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>(initialSuggestions);
  const [rawInput, setRawInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Apply status (for direct vault write)
  const [applyStatus, setApplyStatus] = useState<'idle' | 'applying' | 'success' | 'error'>('idle');
  const [applyMessage, setApplyMessage] = useState('');

  // Very basic parser for Hermes-style output. Can be improved later.
  const parseHermesResponse = (text: string): Suggestion[] => {
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    const parsed: Suggestion[] = [];

    let current: Partial<Suggestion> = {};

    for (const line of lines) {
      if (line.toLowerCase().startsWith('video') || line.toLowerCase().includes('http')) {
        if (current.content) parsed.push(current as Suggestion);
        current = { type: 'video', content: line };
        const urlMatch = line.match(/https?:\/\/\S+/);
        if (urlMatch) current.url = urlMatch[0];
      } else if (line.toLowerCase().startsWith('photo') || line.toLowerCase().startsWith('image')) {
        if (current.content) parsed.push(current as Suggestion);
        current = { type: 'photo', content: line };
      } else if (line.toLowerCase().includes('principle') || line.toLowerCase().includes('tag')) {
        if (current.content) parsed.push(current as Suggestion);
        current = { type: 'principle', content: line };
      } else if (line.toLowerCase().includes('see') || line.toLowerCase().includes('[[')) {
        if (current.content) parsed.push(current as Suggestion);
        current = { type: 'reference', content: line };
      } else if (current.content) {
        current.reason = (current.reason || '') + ' ' + line;
      } else {
        current.content = line;
      }
    }
    if (current.content) parsed.push(current as Suggestion);

    return parsed;
  };

  const processInput = () => {
    if (!rawInput.trim()) return;
    setIsProcessing(true);

    const parsed = parseHermesResponse(rawInput);
    setSuggestions(parsed);
    setRawInput('');
    setIsProcessing(false);
  };

  const toggleApproved = (index: number) => {
    const updated = [...suggestions];
    updated[index].approved = !isApproved(updated[index]);
    setSuggestions(updated);
  };

  const copyApprovedForObsidian = async () => {
    const approved = suggestions.filter(s => isApproved(s));
    if (approved.length === 0) {
      alert('No suggestions approved yet.');
      return;
    }

    let output = `**Suggested updates for ${techniqueName}** (from Hermes)\n\n`;

    const videos = approved.filter(s => s.type === 'video');
    if (videos.length > 0) {
      output += '### Videos\n';
      videos.forEach(v => {
        output += `- [${v.content}](${v.url || ''})\n`;
        if (v.reason) output += `  - ${v.reason.trim()}\n`;
      });
      output += '\n';
    }

    const photos = approved.filter(s => s.type === 'photo');
    if (photos.length > 0) {
      output += '### Photos / Diagrams\n';
      photos.forEach(p => output += `- ${p.content}\n`);
      output += '\n';
    }

    const refs = approved.filter(s => s.type === 'reference');
    if (refs.length > 0) {
      output += '### Related Techniques\n';
      refs.forEach(r => output += `- ${r.content}\n`);
      output += '\n';
    }

    const ok = await copyToClipboard(output.trim());
    if (ok) {
      alert('Approved suggestions copied. Paste into the Obsidian card under the appropriate section.');
    } else {
      alert('Copy failed on this device. Please select the text manually from the next alert.');
      setTimeout(() => alert(output.trim()), 30);
    }
  };

  // New: Direct apply to vault (same backend as the main media panel)
  const applyApprovedToVault = async () => {
    const approved = suggestions.filter(s => isApproved(s));
    const videoSuggestions = approved.filter(s => s.type === 'video' && s.url);

    if (videoSuggestions.length === 0) {
      alert('No approved video suggestions to apply. The current direct-apply supports videos (the main "Suggest Media" flow is more powerful for rich media updates).');
      return;
    }

    setApplyStatus('applying');
    setApplyMessage('');

    const videosForApi = videoSuggestions.map(s => ({
      url: s.url,
      title: s.content,
      credit: 'From Hermes (Advanced Reviewer)',
    }));

    const mediaBodyLines = videoSuggestions.map(s => {
      const reason = s.reason ? ` ${s.reason.trim()}` : '';
      return `- [${s.content}](${s.url})${reason}`;
    }).join('\n');

    const mediaSection = `## Media & Visual References\n\n### Videos\n\n${mediaBodyLines}\n\n### Recommended Photos / Diagrams\n\n- [Add photo descriptions from Hermes here if any]`;

    try {
      const res = await fetch('/api/techniques/apply-media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: techniqueSlug,
          videos: videosForApi,
          mediaSectionMarkdown: mediaSection,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setApplyStatus('success');
        setApplyMessage(data.message || 'Videos applied to the vault.');
      } else {
        setApplyStatus('error');
        setApplyMessage(data.error || 'Apply failed.');
      }
    } catch (e: any) {
      setApplyStatus('error');
      setApplyMessage('Network error: ' + (e?.message || ''));
    }
  };

  return (
    <div className="border rounded-2xl p-5 bg-card">
      <h4 className="font-semibold mb-2">Hermes Suggestions Review</h4>
      <p className="text-sm text-muted-foreground mb-4">
        Paste Hermes' response below. We'll parse it into reviewable items. Approve what you like, then copy a clean block for Obsidian.
      </p>

      <textarea
        value={rawInput}
        onChange={(e) => setRawInput(e.target.value)}
        placeholder="Paste full Hermes response here..."
        className="w-full h-32 border rounded-xl p-3 text-sm font-mono mb-3"
      />

      <button
        onClick={processInput}
        disabled={isProcessing || !rawInput.trim()}
        className="px-4 py-2 bg-black text-white rounded-xl text-sm font-medium hover:bg-zinc-900 disabled:opacity-50 mb-4"
      >
        {isProcessing ? 'Processing...' : 'Parse & Show Suggestions'}
      </button>

      {suggestions.length > 0 && (
        <>
          <div className="space-y-3 mb-4">
            {suggestions.map((s, i) => (
              <div key={i} className={`p-3 border rounded-xl flex gap-3 ${s.approved ? 'bg-emerald-50 border-emerald-200' : 'bg-white'}`}>
                <input 
                  type="checkbox" 
                  checked={isApproved(s)} 
                  onChange={() => toggleApproved(i)}
                  className="mt-1"
                />
                <div className="flex-1 text-sm">
                  <div><strong>{s.type}:</strong> {s.content}</div>
                  {s.reason && <div className="text-muted-foreground text-xs mt-1">{s.reason}</div>}
                  {s.url && <a href={s.url} target="_blank" className="text-blue-600 text-xs break-all">{s.url}</a>}
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <button
              onClick={copyApprovedForObsidian}
              className="w-full px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700"
            >
              Copy Approved Suggestions (ready for Obsidian)
            </button>

            {/* Direct vault write — matches the main low-friction violet button */}
            <button
              onClick={applyApprovedToVault}
              disabled={applyStatus === 'applying'}
              className="w-full px-4 py-2.5 bg-violet-600 hover:bg-violet-700 disabled:bg-violet-300 text-white rounded-xl text-sm font-medium"
            >
              {applyStatus === 'applying' ? 'Writing to vault...' : '🚀 Apply Approved Videos to Card (writes directly)'}
            </button>

            {applyStatus !== 'idle' && (
              <div className={`text-xs p-2 rounded border ${applyStatus === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
                {applyMessage}
                {applyStatus === 'success' && <div className="mt-1 text-[10px]">Re-open the technique page to see updates.</div>}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
