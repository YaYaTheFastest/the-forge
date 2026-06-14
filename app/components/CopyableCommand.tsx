'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface CopyableCommandProps {
  command: string;
  className?: string;
}

export function CopyableCommand({ command, className = '' }: CopyableCommandProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard API failed (rare in modern browsers). Fall back to a simple alert
      // so the user can still manually copy if needed.
      window.alert('Copy failed. Please select and copy the command manually:\n\n' + command);
    }
  };

  return (
    <div className={`relative group ${className}`}>
      <div className="font-mono text-xs bg-background p-3 pr-9 rounded-lg border overflow-x-auto whitespace-pre">
        {command}
      </div>

      <button
        onClick={handleCopy}
        className="absolute top-1.5 right-1.5 flex items-center justify-center rounded-md border bg-background/90 backdrop-blur px-1.5 py-1 text-muted-foreground hover:text-foreground hover:bg-muted active:bg-zinc-100 transition-all active:scale-[0.985]"
        aria-label={copied ? 'Copied to clipboard' : 'Copy command to clipboard'}
        title={copied ? 'Copied!' : 'Copy to clipboard'}
      >
        {copied ? (
          <Check size={14} className="text-emerald-600" />
        ) : (
          <Copy size={14} />
        )}
      </button>
    </div>
  );
}
