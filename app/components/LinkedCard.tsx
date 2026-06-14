import Link from 'next/link';
import { cn } from '@/lib/utils';
import { BaseCard } from './BaseCard';

interface LinkedCardProps {
  href: string;
  className?: string;
  children: React.ReactNode;
}

export function LinkedCard({ href, className, children }: LinkedCardProps) {
  return (
    <Link href={href} className={cn('group block', className)}>
      <BaseCard className="transition-all group-hover:shadow-md group-hover:-translate-y-px">
        {children}
      </BaseCard>
    </Link>
  );
}
