import { cn } from '@/lib/utils';
import { forwardRef } from 'react';

interface BaseCardProps extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
}

export const BaseCard = forwardRef<HTMLDivElement, BaseCardProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'rounded-2xl border bg-card overflow-hidden transition-all',
          'border-border/60 hover:border-border',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

BaseCard.displayName = 'BaseCard';
