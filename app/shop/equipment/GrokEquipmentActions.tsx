'use client';

import { useState } from 'react';

interface GrokEquipmentActionsProps {
  equipment: {
    slug: string;
    name: string;
    fullName?: string;
    content: string;
    personalNotes?: string;
  };
}

export function GrokEquipmentActions({ equipment }: GrokEquipmentActionsProps) {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const callGrok = async (message: string) => {
    setLoading(true);
    setResponse('');

    try {
      const res = await fetch('/api/forge/grok-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          context: {
            currentSlug: equipment.slug,
            currentName: equipment.name,
            pageType: 'equipment',
          },
        }),
      });

      const data = await res.json();
      setResponse(data.response || 'Done. Refresh the page to see updates.');
    } catch (e) {
      setResponse('Action failed. Try the floating chat instead.');
    } finally {
      setLoading(false);
    }
  };

  const standardizeFull = () => callGrok('standardize this equipment card to the full 2026 template and apply directly');
  const improveSchedule = () => callGrok('improve the maintenance schedule and service instructions and apply directly');
  const enhanceMedia = () => callGrok('add better media and resource suggestions and apply directly');

  return (
    <div className="border-t pt-8">
      <div className="mb-4">
        <h2 className="text-lg font-semibold tracking-tight flex items-center gap-2">
          Grok Actions (direct to live vault)
          <span className="text-xs font-normal px-2 py-0.5 rounded bg-blue-100 text-blue-700">Recommended</span>
        </h2>
        <p className="text-sm text-muted-foreground">
          One-click standardization or improvements. Powered by Grok (delegates to Hermes for depth). Writes straight to the vault.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-4">
        <button
          onClick={standardizeFull}
          disabled={loading}
          className="px-4 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold disabled:opacity-60"
        >
          {loading ? 'Working...' : '✨ Standardize to 2026 template + apply'}
        </button>
        <button
          onClick={improveSchedule}
          disabled={loading}
          className="px-4 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold disabled:opacity-60"
        >
          {loading ? 'Working...' : 'Improve Schedule & Instructions + apply'}
        </button>
        <button
          onClick={enhanceMedia}
          disabled={loading}
          className="px-4 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold disabled:opacity-60"
        >
          {loading ? 'Working...' : 'Add Media & Resources + apply'}
        </button>
      </div>

      <div className="text-[10px] text-muted-foreground -mt-2 mb-3">
        Uses the live vault. Refresh after to see changes.
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <button onClick={() => callGrok('review this equipment card and suggest 3 improvements to the maintenance schedule')} disabled={loading} className="text-left text-xs px-3 py-1.5 rounded-full border hover:bg-muted disabled:opacity-50 transition">
          Suggest maintenance improvements
        </button>
        <button onClick={() => callGrok('recommend the best videos or resources for this exact model')} disabled={loading} className="text-left text-xs px-3 py-1.5 rounded-full border hover:bg-muted disabled:opacity-50 transition">
          Recommend videos/resources
        </button>
        <button onClick={() => callGrok('suggest high-quality photos or diagrams for this Equipment Card')} disabled={loading} className="text-left text-xs px-3 py-1.5 rounded-full border hover:bg-muted disabled:opacity-50 transition">
          Suggest photos/diagrams
        </button>
      </div>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Custom request for this equipment (e.g. improve safety section)..."
          className="flex-1 min-h-[40px] border border-border/70 rounded-xl px-3 py-2 text-sm"
          disabled={loading}
          onKeyDown={(e) => { if (e.key === 'Enter' && prompt.trim()) callGrok(prompt); }}
        />
        <button
          onClick={() => callGrok(prompt)}
          disabled={loading || !prompt.trim()}
          className="px-5 py-2 bg-black text-white rounded-xl text-sm font-medium disabled:opacity-50 hover:bg-zinc-900"
        >
          {loading ? 'Working...' : 'Ask Grok'}
        </button>
      </div>

      {response && (
        <div className="p-5 rounded-2xl bg-muted/50 border text-sm whitespace-pre-wrap">
          {response}
        </div>
      )}
    </div>
  );
}
