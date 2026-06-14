import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { FitnessEntity } from '@/lib/types';
import { BaseCard } from '../BaseCard';
import { Badge } from '../Badge';

interface FitnessEntityCardProps {
  entity: FitnessEntity;
  className?: string;
  compact?: boolean;
}

const typeMeta: Record<FitnessEntity['entity_type'], { label: string; bg: string; text: string; border: string }> = {
  physiology: { label: 'PHYSIOLOGY', bg: 'bg-sky-100', text: 'text-sky-700', border: 'border-sky-200' },
  protocol: { label: 'PROTOCOL', bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200' },
  principle: { label: 'PRINCIPLE', bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200' },
  session: { label: 'SESSION', bg: 'bg-violet-100', text: 'text-violet-700', border: 'border-violet-200' },
};

export function FitnessEntityCard({ entity, className, compact = false }: FitnessEntityCardProps) {
  const meta = typeMeta[entity.entity_type] || typeMeta.principle;
  const hasBjj = entity.connected_to_bjj || (entity.bjj_transfers && entity.bjj_transfers.length > 0);

  // Short excerpt from content (first non-empty para after frontmatter)
  const excerpt = entity.content
    ? entity.content
        .replace(/^---[\s\S]*?---\s*/, '') // strip frontmatter
        .split('\n\n')
        .map(p => p.trim())
        .find(p => p && !p.startsWith('#') && p.length > 20)
        ?.slice(0, 160) + (entity.content.length > 160 ? '…' : '')
    : '';

  return (
    <Link
      href={`/fitness`}
      className={cn('group block', className)}
    >
      <BaseCard className="group-hover:shadow-md group-hover:-translate-y-px">
        <div className="p-4 sm:p-5">
          {/* Header row: type badge + name */}
          <div className="flex items-start justify-between gap-3 mb-2">
            <Badge variant={entity.entity_type === 'physiology' ? 'fitness' : entity.entity_type === 'protocol' ? 'success' : 'equipment'}>
              {meta.label}
            </Badge>
            {entity.readiness && (
              <Badge variant={entity.readiness === 'High' ? 'success' : entity.readiness === 'Low' ? 'warning' : 'default'}>
                {entity.readiness} Readiness
              </Badge>
            )}
          </div>

        <div className="font-semibold text-[15px] leading-tight tracking-[-0.015em] mb-1 text-foreground pr-2">
          {entity.name}
        </div>

        {/* Physiology metrics row */}
        {(entity.hrv || entity.resting_hr || entity.rem_min) && (
          <div className="flex flex-wrap gap-2 text-[11px] text-muted-foreground mb-2 tabular-nums">
            {entity.hrv && <span>HRV {entity.hrv}ms</span>}
            {entity.resting_hr && <span>RHR {entity.resting_hr}bpm</span>}
            {entity.rem_min && <span>REM {entity.rem_min}m</span>}
            {entity.sleep_efficiency && <span>{entity.sleep_efficiency}% eff</span>}
          </div>
        )}

        {/* Principle tags (reuse existing token) */}
        {entity.principle_tags && entity.principle_tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {entity.principle_tags.slice(0, 5).map((tag, i) => (
              <span key={i} className="card-learn-principle text-[11px] px-3 py-1 rounded-full font-medium min-h-[32px] flex items-center">
                {tag}
              </span>
            ))}
            {entity.principle_tags.length > 5 && (
              <span className="text-[10px] text-muted-foreground self-center">+{entity.principle_tags.length - 5}</span>
            )}
          </div>
        )}

        {/* Excerpt */}
        {!compact && excerpt && (
          <div className="text-[12px] text-muted-foreground line-clamp-3 mb-2 pr-1">
            {excerpt}
          </div>
        )}

        {/* BJJ Cross-Domain explicit callout (mandatory per Hermes rules) */}
        {hasBjj && (
          <div className="mt-2 pt-2 border-t border-border/50 text-[11px] text-emerald-700 font-medium">
            ↗ BJJ Transfer: {entity.bjj_transfers?.[0] ? entity.bjj_transfers[0].slice(0, 90) + (entity.bjj_transfers[0].length > 90 ? '…' : '') : 'Guard retention • composure • round endurance'}
          </div>
        )}

        {/* Footer meta */}
        <div className="mt-3 pt-2 border-t border-border/40 flex items-center justify-between text-[10px] text-muted-foreground">
          <span>
            {typeof entity.last_reviewed === 'string'
              ? entity.last_reviewed
              : entity.last_reviewed instanceof Date
                ? entity.last_reviewed.toISOString().slice(0, 10)
                : '—'}
          </span>
          <span className="font-mono text-[9px] opacity-60">vault • {entity.entity_type}</span>
        </div>
      </div>

      {/* Future: detail link or "View in Obsidian" */}
      <div className="px-4 pb-3 text-[10px] text-muted-foreground/70 group-hover:text-muted-foreground">
        See full card in vault: 00 Meta/Systems/Domains/Fitness/{entity.entity_type === 'physiology' ? 'Physiology' : entity.entity_type === 'protocol' ? 'Protocols' : 'Principles'}/{entity.name}.md
        </div>
      </BaseCard>
    </Link>
  );
}
