/** Decorative CSS-only Presoku-kun silhouette; never intercepts links. */
export default function PresokuBackground() {
  return <div aria-hidden="true" data-presoku-background className="pointer-events-none absolute inset-0 overflow-hidden">
    <div className="absolute -right-24 top-28 h-[520px] w-[390px] rotate-[-8deg] rounded-[45%] bg-[radial-gradient(circle_at_45%_32%,rgba(96,165,250,.12),rgba(37,99,235,.05)_42%,transparent_70%)] blur-sm" />
    <div className="absolute -right-7 top-48 h-64 w-48 rotate-[-7deg] rounded-[46%_46%_38%_38%] border-[14px] border-blue-300/[.045] bg-blue-500/[.025]">
      <div className="absolute left-1/2 top-7 h-20 w-28 -translate-x-1/2 rounded-[50%] border-[10px] border-blue-300/[.045]" />
      <div className="absolute left-1/2 top-20 h-4 w-20 -translate-x-1/2 rounded-full bg-blue-300/[.045]" />
      <div className="absolute left-1/2 top-28 h-3 w-12 -translate-x-1/2 rounded-full bg-blue-300/[.045]" />
    </div>
    <div className="absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-blue-600/[.04] blur-3xl" />
  </div>;
}
