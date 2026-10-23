'use client';

import { useState } from 'react';
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

export function StarRating({
  value = 0,
  size = 'md',
  showNumber = true,
  className,
  editable = false,
  onChange
}: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  const displayValue = hoverValue ?? value;
  const filled = Math.max(0, Math.min(5, Math.round(displayValue || 0)));

  const sizeClasses = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const handleStarClick = (newValue: number) => {
    if (onChange) {
      const result = onChange(newValue);
      if (result instanceof Promise) {
        void result;
      }
    }
  };

  return (
    <div className={cn('flex items-center gap-0.5', className)}>
      {Array.from({ length: 5 }).map((_, i) => {
        const starValue = i + 1;
        const isFilled = i < filled;

        const star = (
          <Star
            className={cn(
              sizeClasses[size],
              isFilled ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 dark:text-gray-600',
              editable && 'transition-transform hover:scale-110'
            )}
          />
        );

        if (editable) {
          return (
            <button
              key={i}
              type="button"
              onClick={() => handleStarClick(starValue)}
              onMouseEnter={() => setHoverValue(starValue)}
              onMouseLeave={() => setHoverValue(null)}
              className="p-0.5 -m-0.5 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 cursor-pointer"
              aria-label={`Rate ${starValue} out of 5`}
            >
              {star}
            </button>
          );
        }

        return <span key={i}>{star}</span>;
      })}

      {showNumber && (
        <span className="ml-1.5 text-xs font-medium text-muted-foreground tabular-nums">
          {value}/5
        </span>
      )}
    </div>
  );
}
