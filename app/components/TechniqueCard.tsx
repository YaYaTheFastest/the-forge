'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Video, Image as ImageIcon } from 'lucide-react';
import { CategoryBadge } from './CategoryBadge';
import { StarRating } from './StarRating';
import { cn } from '@/lib/utils';
import type { TechniqueCard as TechniqueCardType } from '@/lib/vault';

interface TechniqueCardProps {
  tech: TechniqueCardType;
  className?: string;
}

export function TechniqueCard({ tech, className }: TechniqueCardProps) {
  const router = useRouter();
  const hasVideos = tech.videos && tech.videos.length > 0;
  const hasPhotos = tech.photos && tech.photos.length > 0;
  const hasGB = tech.gb_curriculum && tech.gb_curriculum.length > 0;
  const hasMedia = hasVideos || hasPhotos;
  const mediaCount = (tech.videos?.length || 0) + (tech.photos?.length || 0);

  // Simple thumbnail logic: prefer first photo if available
  const thumbnail = hasPhotos ? tech.photos![0] : null;

  return (
    <Link
      href={`/techniques/${encodeURIComponent(tech.slug)}`}
      className={cn(
        'group block rounded-2xl border bg-card overflow-hidden transition-all hover:shadow-xl hover:-translate-y-0.5 border-border/60 hover:border-border',
        className
      )}
      suppressHydrationWarning
    >
      {/* Visual header with thumbnail or media indicator */}
      {thumbnail ? (
        <div className="relative h-32 bg-muted overflow-hidden">
          <img 
            src={thumbnail} 
            alt={tech.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent h-12" />
        </div>
      ) : hasMedia ? (
        <div className="h-12 bg-muted/50 flex items-center px-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            {hasVideos && <><Video className="h-3.5 w-3.5" /> {tech.videos!.length} video{tech.videos!.length > 1 ? 's' : ''}</>}
            {hasPhotos && <><ImageIcon className="h-3.5 w-3.5" /> {tech.photos!.length} photo{tech.photos!.length > 1 ? 's' : ''}</>}
          </div>
        </div>
      ) : null}

      <div className="p-4 sm:p-5 card-section" suppressHydrationWarning>
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <CategoryBadge category={tech.category} />
          {hasVideos && !thumbnail && (
            <div className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 font-medium">
              <Video className="h-3 w-3" /> {tech.videos!.length}
            </div>
          )}
        </div>

        <div className="font-semibold text-[15px] leading-tight tracking-[-0.015em] mb-1 text-foreground group-hover:text-black pr-2">
          {tech.name}
        </div>

        {tech.position && (
          <div className="text-[11px] text-muted-foreground mb-2 capitalize">
            {tech.position.replace(/-/g, ' ')}
          </div>
        )}

        <div className="mb-2.5 flex items-center justify-between">
          <StarRating value={tech.confidence} size="md" />
          <div className={`text-[10px] px-2.5 py-0.5 rounded-full font-medium min-h-[20px] flex items-center ${
            mediaCount >= 3 ? 'bg-emerald-100 text-emerald-700' :
            mediaCount >= 1 ? 'bg-amber-100 text-amber-700' :
            'bg-gray-100 text-gray-600'
          }`}>
            {mediaCount} media
          </div>
        </div>

        {hasGB && (
          <div className="flex flex-wrap gap-1.5 mt-auto pt-3 border-t border-border/50">
            {tech.gb_curriculum!.slice(0, 2).map((g, idx) => (
              <span key={idx} className="text-[10px] px-2 py-0.5 rounded-md bg-muted text-muted-foreground font-medium">
                {g}
              </span>
            ))}
            {tech.gb_curriculum!.length > 2 && (
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-muted text-muted-foreground">
                +{tech.gb_curriculum!.length - 2}
              </span>
            )}
          </div>
        )}

        {/* 6-Section Preview Structure (enhanced for 2026 Standard visual hierarchy + mobile/PWA) */}
        <div className="mt-2 space-y-2 border-t border-border/50 pt-2.5 text-[11px]">
          {/* Observe (light teaser for full card context) */}
          {tech.position && (
            <div className="text-[10px] text-muted-foreground mb-1 line-clamp-1">
              {tech.position.replace(/-/g, ' ')} — {tech.category ? tech.category.replace(/-/g, ' ') : 'technique'}
            </div>
          )}

          {/* Learn (most prominent, stronger hierarchy) */}
          {tech.principle_tags && tech.principle_tags.length > 0 && (
            <div>
              <div className="section-label mb-1 font-medium">Learn</div>
              <div className="flex flex-wrap gap-1">
                {tech.principle_tags.slice(0, 4).map((tag: string, i: number) => {
                  const handleTagClick = (e: React.MouseEvent) => {
                    e.preventDefault();
                    e.stopPropagation();
                    router.push(`/techniques?search=${encodeURIComponent(tag)}`);
                  };
                  return (
                    <button
                      key={i}
                      onClick={handleTagClick}
                      className="card-learn-principle text-[11px] px-3 py-1 rounded-full font-medium hover:opacity-90 active:scale-[0.985] transition-all cursor-pointer min-h-[32px] touch-manipulation"
                      title={`Filter by ${tag}`}
                    >
                      {tag}
                    </button>
                  );
                })}
                {tech.principle_tags.length > 4 && (
                  <span className="text-muted-foreground self-center text-[10px]">+{tech.principle_tags.length - 4}</span>
                )}
              </div>
            </div>
          )}

          {/* Where It Leads (high visibility teaser) */}
          {tech.related_techniques && tech.related_techniques.length > 0 && (
            <div>
              <div className="section-label mb-0.5 font-medium">Where It Leads</div>
              <div className="card-where-it-leads text-[10px] px-2 py-1 rounded text-muted-foreground line-clamp-1">
                {tech.related_techniques.slice(0, 2).join(' • ')}
                {tech.related_techniques.length > 2 && ' …'}
              </div>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
