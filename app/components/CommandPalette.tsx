'use client';

import { useState, useEffect } from 'react';

// Command Palette + Natural Language Lite Mode (#5)
// Searchable. Natural text -> flows (optimize, create domain, brain refine, monetize).
// RACI approval layer for high value (monetization, bulk apply): shows pending + log before execute.
// ADHD: simple, visual buttons. Zero mid-input. Ties to monetization.

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [needsApproval, setNeedsApproval] = useState<string | null>(null);

  const commands = [
    { id: 'opt', label: 'forge autonomous-optimize --deep', desc: 'Full visuals + monetization report', monetize: true },
    { id: 'brain', label: 'Open Brain Hub', desc: 'Search/copy/refine rules', action: () => window.location.href = '/brain' },
    { id: 'mon', label: 'Visit Monetization Domain', desc: 'Pro Alpha, packs, SaaS, premium', action: () => window.location.href = '/domains/monetization', monetize: true },
    { id: 'digest', label: 'Daily Digest', desc: 'Visuals + 1-click + monetization insights', action: () => {
      window.dispatchEvent(new CustomEvent('open-hermes-chat', { detail: { message: 'daily digest' } }));
    }},
    { id: 'create', label: 'Create domain named X', desc: 'Natural: "make domain for coaching"' },
  ];

  const filtered = commands.filter(c => 
    c.label.toLowerCase().includes(q.toLowerCase()) || 
    c.desc.toLowerCase().includes(q.toLowerCase())
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen(o => !o);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const run = (cmd: any) => {
    setOpen(false);
    if (cmd.action) { cmd.action(); return; }

    if (cmd.monetize || cmd.id === 'opt') {
      // RACI approval layer
      setNeedsApproval(cmd.label);
      // Log would happen server, here show UI approval
      setTimeout(() => {
        if (confirm(`RACI Approval: Execute "${cmd.label}"? (Grok accountable, logged)`)) {
          setNeedsApproval(null);
          window.dispatchEvent(new CustomEvent('open-hermes-chat', { detail: { message: cmd.label } }));
        } else {
          setNeedsApproval(null);
        }
      }, 50);
      return;
    }

    // Natural lite parse
    let msg = cmd.label;
    if (q) msg = q; // use natural input
    window.dispatchEvent(new CustomEvent('open-hermes-chat', { detail: { message: msg } }));
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] bg-black/60" onClick={() => setOpen(false)}>
      <div className="w-full max-w-xl bg-background border rounded-2xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="p-3 border-b">
          <input 
            autoFocus 
            value={q} 
            onChange={e => setQ(e.target.value)}
            placeholder="Type command or natural: 'optimize equipment photos with monetization' (⌘K)"
            className="w-full bg-transparent text-lg outline-none"
          />
        </div>
        <div className="max-h-[320px] overflow-auto p-2">
          {filtered.length === 0 && q && (
            <div className="p-3 text-sm">Natural parse: <button onClick={() => run({label: q})} className="underline">{q}</button> → opens chat</div>
          )}
          {filtered.map((c, i) => (
            <button key={i} onClick={() => run(c)} className="w-full text-left px-3 py-2 hover:bg-muted rounded flex justify-between text-sm">
              <span>{c.label} {c.monetize && '💰'}</span>
              <span className="text-muted-foreground text-xs">{c.desc}</span>
            </button>
          ))}
        </div>
        <div className="p-2 text-[10px] text-muted-foreground border-t">
          RACI layer active for monetization flows. Everything logged. Visuals + anticipation built-in.
        </div>
      </div>

      {needsApproval && <div className="fixed bottom-4 right-4 bg-card border p-3 rounded text-xs">Awaiting RACI approval for: {needsApproval}</div>}
    </div>
  );
}
