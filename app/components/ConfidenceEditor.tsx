'use client';

import { useState } from 'react';
import { StarRating } from './StarRating';

interface ConfidenceEditorProps {
  slug: string;
  initialValue: number;
}

export function ConfidenceEditor({ slug, initialValue }: ConfidenceEditorProps) {
  const clampedInitial = Math.max(0, Math.min(5, Math.round(initialValue || 0)));
  const [value, setValue] = useState(clampedInitial);
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const handleChange = async (newValue: number) => {
    const clamped = Math.max(0, Math.min(5, Math.round(newValue || 0)));
    setValue(clamped);
    setStatus('saving');

    try {
      const res = await fetch('/api/techniques/apply-media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug,
          confidence: newValue,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setStatus('saved');
        setTimeout(() => setStatus('idle'), 1500);
      } else {
        setStatus('error');
        setTimeout(() => setStatus('idle'), 2000);
      }
    } catch (err) {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 2000);
    }
  };

  return (
    <div className="flex flex-col items-end">
      <div className="text-xs tracking-widest text-muted-foreground mb-1">YOUR CONFIDENCE</div>
      <div className="flex items-center justify-end gap-1 text-5xl font-semibold tabular-nums">
        {value}
        <span className="text-2xl text-muted-foreground">/5</span>
      </div>
      <div className="mt-1">
        <StarRating 
          value={value} 
          editable 
          onChange={handleChange}
          size="lg"
        />
      </div>
      {status === 'saving' && <div className="text-[10px] text-muted-foreground mt-1">Saving...</div>}
      {status === 'saved' && <div className="text-[10px] text-emerald-600 mt-1">Saved ✓</div>}
      {status === 'error' && <div className="text-[10px] text-red-600 mt-1">Failed to save</div>}
    </div>
  );
}
