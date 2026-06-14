import Link from 'next/link';

export default function HermesHub() {
  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium tracking-widest text-muted-foreground mb-3">
          HERMES INTEGRATION
        </div>
        <h1 className="text-4xl font-semibold tracking-tighter">Hermes Review System</h1>
        <p className="text-lg text-muted-foreground mt-3 max-w-2xl">
          The Forge can now trigger high-quality review tasks for Hermes directly from your daily work. 
          No more manual copy-paste of standards.
        </p>
      </div>

      <div className="space-y-8">
        {/* How it works */}
        <div className="rounded-2xl border p-6">
          <h2 className="font-semibold text-xl mb-3">How the Trigger Works</h2>
          <ol className="list-decimal pl-5 space-y-2 text-sm">
            <li>Make a change in the Forge (log hours on an Equipment card via Daily Wins or the detail page).</li>
            <li>Click <strong>“Create Hermes Standardization Review Task”</strong> (or accept the prompt after completing a maintenance win).</li>
            <li>The Forge writes a ready-to-send task file into your vault at <code>00 Meta/Hermes Tasks/</code>.</li>
            <li>Run the iOS Shortcut <strong>“Send Latest Hermes Task”</strong> (one tap, no copy/paste — full instructions in <code>00 Meta/Systems/Forge - Hermes Auto-Send Shortcut.md</code>).</li>
            <li>Paste Hermes’ improved sections back into the source Equipment Card.</li>
          </ol>
          <p className="mt-4 text-xs text-muted-foreground">
            This is the primary mechanism for keeping cards aligned with the new Maintenance Schedule + Service Instructions standard.
          </p>
        </div>

        {/* Quick Triggers */}
        <div>
          <h2 className="font-semibold text-xl mb-3">Primary Trigger Points</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Link href="/daily-wins" className="block rounded-2xl border p-5 hover:bg-muted transition">
              <div className="font-medium">Daily Wins</div>
              <div className="text-sm text-muted-foreground mt-1">
                Log an Equipment maintenance win → get prompted to generate a Hermes review task with the exact hours change context.
              </div>
            </Link>

            <Link href="/shop" className="block rounded-2xl border p-5 hover:bg-muted transition">
              <div className="font-medium">Equipment Detail Pages</div>
              <div className="text-sm text-muted-foreground mt-1">
                Every Equipment Card has a dedicated “Create Hermes Standardization Review Task” button in the sidebar.
              </div>
            </Link>
          </div>
        </div>

        {/* Philosophy */}
        <div className="rounded-2xl border bg-muted/40 p-6 text-sm">
          <p className="font-medium mb-2">Design Philosophy</p>
          <ul className="space-y-1 text-muted-foreground">
            <li>• The Forge is the action surface. Obsidian is the long-term source of truth.</li>
            <li>• Hermes does deep research and content improvement.</li>
            <li>• Direct deep links that pull you out of the Forge to edit in Obsidian have been removed from the UI.</li>
            <li>• Generated Hermes task files in the vault are the correct bridge for complex review work.</li>
          </ul>
        </div>

        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-5 text-sm">
          <div className="font-semibold text-emerald-400 mb-1">No more copy/paste</div>
          <p>
            Build the iOS Shortcut <strong>“Send Latest Hermes Task”</strong>. It automatically finds the newest file in <code>00 Meta/Hermes Tasks/</code> and sends it to Hermes (Telegram, Mail, or your preferred channel).
          </p>
          <p className="mt-2 text-xs">
            Full build instructions: <code>00 Meta/Systems/Forge - Hermes Auto-Send Shortcut.md</code>
          </p>

          <a 
            href="shortcuts://run-shortcut?name=Send%20Latest%20Hermes%20Task"
            className="mt-3 inline-block rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white active:bg-emerald-700"
          >
            Run “Send Latest Hermes Task” Shortcut →
          </a>
        </div>

        <div className="text-xs text-muted-foreground mt-6">
          The two canonical spec documents live in your vault (or the project root until moved):
          <br />• Forge Systems - Daily Wins &amp; Equipment Maintenance Standardization.md
          <br />• Hermes Task - Standardize All Equipment Cards for Daily Wins.md
        </div>
      </div>
    </div>
  );
}
