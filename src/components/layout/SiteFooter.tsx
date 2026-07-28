export function SiteFooter() {
  return (
    <footer className="w-full py-20 px-margin-desktop bg-background border-t border-white/10">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
        <div className="col-span-1 md:col-span-1 space-y-6">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-2xl">visibility</span>
            <span className="font-label-caps text-label-caps text-primary text-xl">πX</span>
          </div>
          <p className="font-body-md text-on-surface-variant opacity-60 max-w-xs">
            Enterprise intelligence infrastructure for modern companies that need trusted decisions at scale.
          </p>
        </div>
        <div className="space-y-6">
          <h5 className="font-label-caps text-label-caps text-primary uppercase tracking-widest">Platform</h5>
          <ul className="space-y-4 font-mono-data text-mono-data text-on-surface-variant">
            <li><a className="hover:text-secondary-fixed-dim underline decoration-transparent hover:decoration-secondary-fixed-dim transition-all" href="/analytics">Insights</a></li>
            <li><a className="hover:text-secondary-fixed-dim underline decoration-transparent hover:decoration-secondary-fixed-dim transition-all" href="/data-sources">Data Sources</a></li>
            <li><a className="hover:text-secondary-fixed-dim underline decoration-transparent hover:decoration-secondary-fixed-dim transition-all" href="/ai-copilot">AI Copilot</a></li>
            <li><a className="hover:text-secondary-fixed-dim underline decoration-transparent hover:decoration-secondary-fixed-dim transition-all" href="/reports">Reports</a></li>
          </ul>
        </div>
        <div className="space-y-6">
          <h5 className="font-label-caps text-label-caps text-primary uppercase tracking-widest">Company</h5>
          <ul className="space-y-4 font-mono-data text-mono-data text-on-surface-variant">
            <li><a className="hover:text-secondary-fixed-dim underline decoration-transparent hover:decoration-secondary-fixed-dim transition-all" href="/about">About πX</a></li>
            <li><a className="hover:text-secondary-fixed-dim underline decoration-transparent hover:decoration-secondary-fixed-dim transition-all" href="/contact">Contact</a></li>
            <li><a className="hover:text-secondary-fixed-dim underline decoration-transparent hover:decoration-secondary-fixed-dim transition-all" href="/login">Secure Access</a></li>
          </ul>
        </div>
        <div className="space-y-6">
          <h5 className="font-label-caps text-label-caps text-primary uppercase tracking-widest">Status</h5>
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm text-on-surface-variant">
            Production rollout in progress with governance, memory, and audit modules active.
          </div>
        </div>
      </div>
      <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-white/5">
        <span className="font-mono-data text-mono-data text-on-surface-variant/40">© 2026 πX TECHNOLOGIES. ALL RIGHTS RESERVED.</span>
        <div className="flex gap-8 mt-4 md:mt-0 font-mono-data text-mono-data text-on-surface-variant/40">
          <span>V4.0.2</span>
          <span>STATUS: ACTIVE</span>
        </div>
      </div>
    </footer>
  );
}
