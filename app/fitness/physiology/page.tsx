import Link from 'next/link';

export const metadata = {
  title: 'Physiology Trends • Fitness • The Forge',
  description: 'Objective recovery and readiness data from Apple Health exports, synthesized with Hermes.',
};

export default function PhysiologyTrendsPage() {
  return (
    <div className="max-w-5xl mx-auto p-6 md:p-8">
      <Link href="/fitness" className="text-sm text-muted-foreground hover:text-foreground">← Back to Fitness</Link>
      
      <h1 className="text-4xl font-semibold tracking-tighter mt-4">Physiology Trends</h1>
      <p className="text-lg text-muted-foreground mt-2 max-w-2xl">
        Objective recovery and readiness data pulled from Apple Health exports and synthesized in the vault.
      </p>

      <div className="mt-8 rounded-2xl border bg-card p-6">
        <h2 className="font-semibold mb-4">Recent Trends (as of 2026-05-24)</h2>
        
        <div className="space-y-6 text-sm">
          <div>
            <div className="font-medium">HRV (SDNN)</div>
            <div className="text-muted-foreground">Typical range: 42–55 ms. Latest reading: 47 ms (solid for baseline).</div>
          </div>
          <div>
            <div className="font-medium">Resting Heart Rate</div>
            <div className="text-muted-foreground">Consistently excellent (50–55 bpm range). Latest: 52 bpm.</div>
          </div>
          <div>
            <div className="font-medium">Sleep Architecture</div>
            <div className="text-muted-foreground">Strong REM on training days is a recurring positive signal (e.g. 92 min REM on 2026-05-24).</div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t text-xs text-muted-foreground">
          Full historical exports and Hermes syntheses live in the vault at:<br />
          <span className="font-mono">Fitness/Workouts/Health Exports/</span>
        </div>
      </div>

      <div className="mt-6 text-sm">
        <Link href="/fitness" className="text-muted-foreground hover:text-foreground underline">Back to Fitness Domain</Link>
      </div>
    </div>
  );
}
