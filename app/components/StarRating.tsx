'use client';

import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  value?: number;
  size?: 'sm' | 'md' | 'lg';
  showNumber?: boolean;
  className?: string;
  editable?: boolean;
  onChange?: (newValue: number) => void | Promise<void>;
}

export function StarRating({ value = 0, size = 'md', showNumber = true, className, editable = false, onChange }: StarRatingProps) {
  const clamped = Math.max(0, Math.min(5, Math.round(value || 0)));
  const filled = clamped;
  const sizeClasses = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const handleClick = (i: number) => {
    if (editable && onChange) {
      onChange(i + 1);
    }
  };

  return (
    <div className={cn('flex items-center gap-0.5', className)}>
      {Array.from({ length: 5 }).map((_, i) => {
        const isFilled = i < filled;
        const starClass = cn(
          sizeClasses[size],
          isFilled ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 dark:text-gray-600',
          editable && 'cursor-pointer hover:scale-110 transition-transform'
        );

        if (editable) {
          return (
            <button
              key={i}
              type="button"
              onClick={() => handleClick(i)}
              className="p-0 bg-transparent border-0"
            >
              <Star className={starClass} />
            </button>
          );
        }

        return <Star key={i} className={starClass} />;
      })}
      {showNumber && (
        <span className="ml-1.5 text-xs font-medium text-muted-foreground tabular-nums">
          {clamped}/5
        </span>
      )}
    </div>
  );
}
