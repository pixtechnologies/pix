import { Link } from "@tanstack/react-router";

const pillars = [
  {
    title: "Universal Data Intelligence",
    description:
      "Ingest Excel, CSV, SQL, SAP, Salesforce, Kafka, and REST APIs in one governed pipeline.",
    icon: "dataset",
  },
  {
    title: "Semantic Intelligence",
    description:
      "Automatically reconcile revenue, sales amount, and invoice value into a single business concept.",
    icon: "hub",
  },
  {
    title: "Decision Support",
    description:
      "Ask natural-language questions and receive evidence-backed explanations and recommended actions.",
    icon: "psychology",
  },
];

const modules = [
  "Enterprise Profile",
  "Knowledge Graph",
  "Dynamic Dashboards",
  "Memory & Audit",
  "Governance",
  "AI Copilot",
];

export function HomePage() {
  return (
    <div className="pt-20">
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center px-margin-mobile md:px-margin-desktop overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-white/5 rounded-full animate-[pulse_8s_infinite]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-white/10 rounded-full animate-[pulse_6s_infinite]" />
        </div>

        <div className="relative z-10 grid gap-12 max-w-6xl items-center lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-8 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full">
              <span className="w-1.5 h-1.5 bg-secondary-fixed-dim rounded-full animate-pulse" />
              <span className="font-mono-data text-[10px] tracking-widest uppercase">Enterprise Intelligence Platform</span>
            </div>
            <div className="space-y-5">
              <h1 className="font-display-lg text-[48px] md:text-[72px] leading-[1.05] tracking-tighter text-primary">
                Transform enterprise data into <span className="text-secondary-fixed-dim">decisions</span>.
              </h1>
              <p className="font-body-lg text-on-surface-variant max-w-2xl opacity-80">
                πX unifies profiling, semantic understanding, knowledge graphs, and decision support so teams can move from raw data to trusted action in minutes.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/dashboard"
                className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-background uppercase tracking-widest transition hover:bg-secondary-fixed-dim"
              >
                Explore Platform
              </Link>
              <Link
                to="/analytics"
                className="inline-flex items-center justify-center rounded-lg border border-white/20 px-6 py-3 text-sm font-semibold text-primary uppercase tracking-widest transition hover:border-white"
              >
                View Insights
              </Link>
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-on-surface-variant">
              <span className="rounded-full border border-white/10 px-3 py-1">FastAPI + React 19</span>
              <span className="rounded-full border border-white/10 px-3 py-1">PostgreSQL + Supabase</span>
              <span className="rounded-full border border-white/10 px-3 py-1">Cloudflare deployment</span>
            </div>
          </div>

          <div className="glass-panel rounded-2xl p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-label-caps text-label-caps uppercase tracking-widest text-secondary-fixed-dim">Live intelligence profile</p>
                <h2 className="mt-2 text-2xl font-semibold text-primary">Northwind Global</h2>
              </div>
              <div className="rounded-full border border-secondary-fixed-dim/30 bg-secondary-fixed-dim/10 px-3 py-1 text-xs uppercase tracking-widest text-secondary-fixed-dim">
                Online
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-sm text-on-surface-variant">KPIs detected</p>
                <p className="mt-2 text-3xl font-semibold text-primary">128</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-sm text-on-surface-variant">Data connections</p>
                <p className="mt-2 text-3xl font-semibold text-primary">24</p>
              </div>
            </div>
            <div className="rounded-xl border border-white/10 p-4">
              <p className="text-sm text-on-surface-variant">Current insight</p>
              <p className="mt-2 text-lg text-primary">Revenue variance in Northern Italy is being traced to supply constraints and delayed fulfillment.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-margin-mobile md:px-margin-desktop py-24 bg-surface-container-lowest">
        <div className="grid gap-6 lg:grid-cols-3">
          {pillars.map((pillar) => (
            <div key={pillar.title} className="group rounded-2xl border border-white/10 bg-white/[0.03] p-8 transition hover:border-secondary-fixed-dim/40 hover:bg-white/[0.05]">
              <span className="material-symbols-outlined text-secondary-fixed-dim text-3xl">{pillar.icon}</span>
              <h3 className="mt-5 text-xl font-semibold text-primary">{pillar.title}</h3>
              <p className="mt-3 text-sm leading-7 text-on-surface-variant">{pillar.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-margin-mobile md:px-margin-desktop py-24">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-4">
            <p className="font-label-caps text-label-caps uppercase tracking-widest text-secondary-fixed-dim">Platform architecture</p>
            <h2 className="text-3xl font-semibold tracking-tight text-primary">From source systems to executive decisions.</h2>
            <p className="max-w-xl text-base leading-8 text-on-surface-variant">
              πX combines universal ingestion, semantic mapping, knowledge graph construction, dynamic dashboards, and governance into a single operating layer for data-driven organizations.
            </p>
          </div>
          <div className="glass-panel rounded-2xl p-8">
            <div className="grid gap-4 md:grid-cols-2">
              {modules.map((module) => (
                <div key={module} className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm text-primary">
                  {module}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
