import { cn } from '@/lib/utils';
import { LinkedCard } from './LinkedCard';
import { BaseCard } from './BaseCard';
import { Badge } from './Badge';

interface DomainCardProps {
  href: string;
  title: string;
  subtitle?: string;
  badges?: Array<{ label: string; variant?: 'default' | 'equipment' | 'fitness' | 'bjj' | 'success' | 'warning' | 'info' }>;
  metadata?: string;
  description?: string;
  thumbnail?: string;
  className?: string;
  children?: React.ReactNode;
}

export function DomainCard({
  href,
  title,
  subtitle,
  badges = [],
  metadata,
  description,
  thumbnail,
  className,
  children,
}: DomainCardProps) {
  return (
    <LinkedCard href={href} className={className}>
      {/* Optional Media Header */}
      {thumbnail && (
        <div className="relative h-32 bg-muted overflow-hidden">
          <img 
            src={thumbnail} 
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent h-12" />
        </div>
      )}

      <div className="p-4 sm:p-5">
        {/* Badges + Subtitle */}
        {(badges.length > 0 || subtitle) && (
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            {badges.map((badge, i) => (
              <Badge key={i} variant={badge.variant || 'default'}>
                {badge.label}
              </Badge>
            ))}
            {subtitle && (
              <span className="text-[11px] text-muted-foreground">{subtitle}</span>
            )}
          </div>
        )}

        {/* Title */}
        <div className="font-semibold text-[15px] leading-tight tracking-[-0.015em] mb-1 text-foreground group-hover:text-black pr-2">
          {title}
        </div>

        {/* Metadata */}
        {metadata && (
          <div className="text-xs text-muted-foreground mb-2">{metadata}</div>
        )}

        {/* Description */}
        {description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
        )}

        {children}
      </div>
    </LinkedCard>
  );
}
