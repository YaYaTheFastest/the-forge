import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  value?: number;
  size?: 'sm' | 'md' | 'lg';
  showNumber?: boolean;
  className?: string;
}

export function StarRating({ value = 0, size = 'md', showNumber = true, className }: StarRatingProps) {
  const filled = Math.max(0, Math.min(5, Math.round(value || 0)));
  const sizeClasses = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <div className={cn('flex items-center gap-0.5', className)}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            sizeClasses[size],
            i < filled ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 dark:text-gray-600'
          )}
        />
      ))}
      {showNumber && (
        <span className="ml-1.5 text-xs font-medium text-muted-foreground tabular-nums">
          {value}/5
        </span>
      )}
    </div>
  );
}
