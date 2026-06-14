import { cn } from '@/lib/utils';

const categoryConfig: Record<string, { label: string; className: string }> = {
  submission: { label: 'Submission', className: 'bg-red-100 text-red-700 border-red-200' },
  sweep: { label: 'Sweep', className: 'bg-blue-100 text-blue-700 border-blue-200' },
  'guard-pass': { label: 'Guard Pass', className: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  pass: { label: 'Pass', className: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  defense: { label: 'Defense', className: 'bg-slate-100 text-slate-700 border-slate-200' },
  escape: { label: 'Escape', className: 'bg-amber-100 text-amber-700 border-amber-200' },
  takedown: { label: 'Takedown', className: 'bg-orange-100 text-orange-700 border-orange-200' },
  transition: { label: 'Transition', className: 'bg-violet-100 text-violet-700 border-violet-200' },
  'guard-recovery': { label: 'Guard Recovery', className: 'bg-cyan-100 text-cyan-700 border-cyan-200' },
  'self-defense': { label: 'Self Defense', className: 'bg-rose-100 text-rose-700 border-rose-200' },
};

interface CategoryBadgeProps {
  category?: string;
  className?: string;
}

export function CategoryBadge({ category, className }: CategoryBadgeProps) {
  const key = (category || '').toLowerCase();
  const config = categoryConfig[key] || { label: category || 'Technique', className: 'bg-gray-100 text-gray-700 border-gray-200' };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-wide',
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}
