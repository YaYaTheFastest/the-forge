import Link from 'next/link';

export const metadata = {
  title: 'The Mat • BJJ Domain',
  description: 'The Mat — Your complete BJJ system: Techniques, Curriculum, Routines, Mind Maps. Part of the Forge Domain Factory.',
};

export default function TheMatDomainPage() {
  const bjjActivities = [
    {
      title: "Techniques",
      href: "/techniques",
      icon: "📚",
      description: "6-section technique library with GB1 curriculum, personal cues, and cross-domain notes.",
      status: "Core • 60+ improved cards"
    },
    {
      title: "Routines",
      href: "/routines",
      icon: "🔄",
      description: "Generate personalized training routines based on your current needs and The Mat data.",
      status: "Active"
    },
    {
      title: "Curriculum",
      href: "/curriculum",
      icon: "📋",
      description: "Structured GB curriculum view and progression tracking.",
      status: "Active"
    },
    {
      title: "Mind Maps",
      href: "/mindmaps",
      icon: "🧠",
      description: "Visual exploration of technique connections and concepts.",
      status: "Active"
    },
  ];

  return (
    <div className="max-w-7xl mx-auto p-6 md:p-8">
      <div className="mb-4">
        <Link href="/" className="text-sm text-muted-foreground hover:text-foreground hover:underline">
          ← Back to The Forge
        </Link>
      </div>
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium tracking-widest text-muted-foreground mb-3">
          DOMAIN • THE MAT
        </div>
        <h1 className="text-5xl font-semibold tracking-tighter">The Mat</h1>
        <p className="text-xl text-muted-foreground mt-3 max-w-2xl">
          Your complete Brazilian Jiu-Jitsu operating system. All technique work, curriculum, routines, and conceptual mapping live here.
        </p>
        <div className="mt-4 text-sm text-muted-foreground">
          Part of the Forge Domain Factory. Rich 6-section cards with BJJ + cross-domain (Fitness, Equipment) connections.
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {bjjActivities.map((activity) => (
          <Link 
            key={activity.href}
            href={activity.href}
            className="group block rounded-3xl border bg-card p-7 hover:shadow-lg hover:-translate-y-0.5 transition-all active:scale-[0.995]"
          >
            <div className="text-4xl mb-4">{activity.icon}</div>
            <div className="font-semibold text-2xl tracking-tight mb-2 group-hover:text-emerald-600 transition-colors">
              {activity.title}
            </div>
            <div className="text-muted-foreground mb-4">
              {activity.description}
            </div>
            <div className="text-xs font-medium text-emerald-600">
              {activity.status}
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-12 rounded-3xl border bg-card p-8">
        <div className="font-semibold mb-3">About The Mat Domain</div>
        <div className="text-sm text-muted-foreground max-w-3xl">
          All BJJ activities are intentionally grouped here under one domain. This is the flagship subdomain inside the Forge.
          Technique cards follow the strict 2026 6-section standard (Observe, Learn, Where It Leads, Execute, Personal Cues, Actions).
          Cross-domain transfers (to Fitness and Equipment work) are explicitly documented.
        </div>
        <div className="mt-6">
          <Link href="/techniques" className="text-sm underline">Browse all techniques →</Link>
        </div>
      </div>

      {/* Class Notes Integration (new from user input) */}
      <div className="mt-8 rounded-3xl border border-emerald-500/30 bg-emerald-950/10 p-8">
        <div className="font-semibold text-emerald-400 mb-2">Class Notes &amp; Live Training Capture</div>
        <p className="text-sm text-muted-foreground mb-4">
          You are actively using Hermes to capture jiu jitsu class notes. This is excellent usage of the system and directly feeds the content improvement pipeline (recent edits visible in Captures as of today).
        </p>
        <div className="text-sm mb-4">
          <strong>Next optimization:</strong> Close the loop so class notes automatically surface in The Mat.
          <ul className="list-disc pl-5 mt-2 space-y-1 text-xs">
            <li>Link specific techniques drilled in class to their cards.</li>
            <li>Surface "Recently drilled / class focus" on the home and /mat.</li>
            <li>Use class notes as input for personalized routines.</li>
            <li>Feed into Daily Wins or review queues (e.g., "revisit X from last class").</li>
          </ul>
        </div>
        <div className="text-xs text-muted-foreground">
          Hermes tasks for BJJ improvements are live. Class notes should be referenced when updating cards for maximum transfer.
          <br />See updated <code>Forge Content Completion Plan</code> for integration priorities.
        </div>
      </div>
    </div>
  );
}
