import { getAllTechniques } from '@/lib/vault';
import Link from 'next/link';
import { CategoryBadge } from '@/app/components/CategoryBadge';

interface WeekData {
  week: number;
  techniques: any[];
}

export default async function CurriculumPage() {
  const techniques = await getAllTechniques();

  // Group techniques by GB1 week
  const weeksMap = new Map<number, any[]>();

  techniques.forEach(tech => {
    if (tech.gb_curriculum) {
      tech.gb_curriculum.forEach((g: string) => {
        const match = g.match(/Week (\d+)/);
        if (match) {
          const weekNum = parseInt(match[1]);
          if (!weeksMap.has(weekNum)) weeksMap.set(weekNum, []);
          weeksMap.get(weekNum)!.push(tech);
        }
      });
    }
  });

  const weeks: WeekData[] = Array.from(weeksMap.entries())
    .map(([week, techs]) => ({ week, techniques: techs }))
    .sort((a, b) => a.week - b.week);

  return (
    <div className="max-w-7xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight">GB1 Curriculum</h1>
        <p className="text-muted-foreground mt-2">15 weeks • 90 core techniques • Gracie Barra foundation</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {weeks.map(({ week, techniques }) => (
          <div key={week} className="rounded-2xl border bg-card p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-sm font-medium text-muted-foreground">WEEK {week}</div>
                <div className="text-xl font-semibold tracking-tight">Week {week}</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-semibold tabular-nums">{techniques.length}</div>
                <div className="text-xs text-muted-foreground">techniques</div>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5 mb-6 min-h-[60px]">
              {techniques.slice(0, 6).map((t, i) => (
                <CategoryBadge key={i} category={t.category} className="text-[10px] px-2 py-0.5" />
              ))}
              {techniques.length > 6 && (
                <span className="text-xs text-muted-foreground self-center">+{techniques.length - 6} more</span>
              )}
            </div>

            <div className="flex gap-3">
              <Link
                href={`/routines?focus=Week ${week}`}
                className="flex-1 text-center rounded-xl border px-4 py-2 text-sm font-medium hover:bg-muted transition"
              >
                Generate Routine
              </Link>
              <Link
                href={`/techniques?search=Week ${week}`}
                className="flex-1 text-center rounded-xl bg-black text-white px-4 py-2 text-sm font-medium hover:bg-zinc-900 transition"
              >
                View All
              </Link>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 text-center text-sm text-muted-foreground">
        Full 15-week structure from Gracie Barra Fundamentals. Routines can be generated from any week.
      </div>
    </div>
  );
}
