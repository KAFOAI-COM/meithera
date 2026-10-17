import { AlertTriangle, FlaskConical, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export const RISK_WARNING =
  "Property investments involve risk, including possible loss of capital. Returns are not guaranteed and investments may be illiquid.";
export const ILLUSTRATIVE = "Illustrative demonstration property — not an investment offer.";

export function DemoBanner() {
  return (
    <div className="bg-demo text-demo-ink" role="note">
      <div className="mx-auto flex max-w-7xl items-center justify-center gap-2 px-4 py-2 text-center font-sans text-xs font-semibold sm:text-sm">
        <FlaskConical className="h-4 w-4 shrink-0" aria-hidden />
        <span>Demonstration Platform — No Real Investments Available</span>
        <span className="hidden font-normal md:inline">· Not authorised or regulated by the Central Bank of Ireland</span>
      </div>
    </div>
  );
}

export function RiskNotice({ className, children }: { className?: string; children?: React.ReactNode }) {
  return (
    <div className={cn("flex gap-3 rounded-xl bg-risk p-4 text-sm text-risk-ink", className)} role="note">
      <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
      <p>{children ?? RISK_WARNING}</p>
    </div>
  );
}

export function IllustrativeNotice({ className, children }: { className?: string; children?: React.ReactNode }) {
  return (
    <div className={cn("flex gap-2 rounded-lg bg-demo px-3 py-2 text-xs font-medium text-demo-ink", className)} role="note">
      <Info className="mt-px h-4 w-4 shrink-0" aria-hidden />
      <span>{children ?? ILLUSTRATIVE}</span>
    </div>
  );
}

export function SectionHeading({ eyebrow, title, intro, className, center }: { eyebrow?: string; title: string; intro?: string; className?: string; center?: boolean }) {
  return (
    <div className={cn("max-w-3xl", center && "mx-auto text-center", className)}>
      {eyebrow ? <p className="font-sans text-xs font-semibold uppercase tracking-[0.08em] text-gold-ink">{eyebrow}</p> : null}
      <h2 className="mt-2 font-serif text-3xl font-medium tracking-tight text-ink sm:text-4xl">{title}</h2>
      {intro ? <p className="mt-3 text-base leading-relaxed text-muted">{intro}</p> : null}
    </div>
  );
}

export function PageHeader({ eyebrow, title, intro, children }: { eyebrow?: string; title: string; intro?: string; children?: React.ReactNode }) {
  return (
    <section className="border-b border-line bg-card">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
        {eyebrow ? <p className="font-sans text-xs font-semibold uppercase tracking-[0.08em] text-gold-ink">{eyebrow}</p> : null}
        <h1 className="mt-2 max-w-3xl font-serif text-4xl font-medium tracking-tight text-ink sm:text-5xl">{title}</h1>
        {intro ? <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">{intro}</p> : null}
        {children}
      </div>
    </section>
  );
}
