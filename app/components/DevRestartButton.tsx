'use client';

import { useState } from 'react';
import { RefreshCw } from 'lucide-react';

interface DevRestartButtonProps {
  variant?: 'header' | 'card' | 'floating';
  className?: string;
}

export function DevRestartButton({ variant = 'header', className = '' }: DevRestartButtonProps) {
  const [phase, setPhase] = useState<'idle' | 'restarting' | 'done'>('idle');

  const handleClick = async () => {
    const confirmed = window.confirm(
      'Restart the Next.js dev server?\n\n' +
      'This will kill the current server and launch a fresh one.\n' +
      'You will need to HARD REFRESH the browser (⌘⇧R) in a few seconds.'
    );

    if (!confirmed) return;

    setPhase('restarting');

    // Fire the restart request.
    // We deliberately don't await success because the server process will die shortly.
    fetch('/api/restart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }).catch(() => {
      // This is expected — the connection often drops when the server restarts.
      // We still proceed to show the user the "hard refresh" instruction.
    });

    // Give the user clear next-step instructions even if the network call "fails".
    setTimeout(() => {
      setPhase('done');
    }, 1200);
  };

  if (phase === 'restarting' || phase === 'done') {
    const isFloating = variant === 'floating';
    return (
      <div
        className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium shadow-sm ${
          isFloating
            ? 'bg-amber-500 text-white'
            : variant === 'header'
            ? 'bg-amber-100 text-amber-800 border border-amber-200'
            : 'bg-amber-50 text-amber-700 border border-amber-200'
        } ${className}`}
      >
        <RefreshCw size={14} className="animate-spin" />
        <span>
          {phase === 'restarting' ? 'Restarting…' : 'New server launching'}
        </span>
        {isFloating && <span className="text-[10px] opacity-90">hard refresh</span>}
      </div>
    );
  }

  const baseClasses =
    variant === 'header'
      ? 'flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground active:bg-zinc-100 transition-colors'
      : variant === 'floating'
      ? 'flex items-center gap-2 rounded-full bg-black text-white px-4 py-2 text-sm font-medium shadow-lg hover:bg-zinc-900 active:bg-black transition'
      : 'flex items-center justify-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-medium hover:bg-muted active:bg-zinc-100 transition w-full sm:w-auto';

  const iconSize = variant === 'header' ? 13 : 16;

  return (
    <button
      onClick={handleClick}
      className={`${baseClasses} ${className}`}
      title="Kill current dev server and launch a fresh one (development only)"
    >
      <RefreshCw size={iconSize} />
      <span>{variant === 'floating' ? 'Restart Server' : 'Restart Server'}</span>
    </button>
  );
}
