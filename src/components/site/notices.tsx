import { AlertTriangle, FlaskConical, Info } from "lucide-react";
import Image from "next/image";
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

export function PageHeader({ eyebrow, title, intro, children, image }: { eyebrow?: string; title: string; intro?: string; children?: React.ReactNode; image?: string }) {
  if (image)
    return (
      <section className="relative overflow-hidden bg-emerald text-white">
        <div className="absolute inset-0 md:left-auto md:w-[55%]">
          <Image src={image} alt="" fill priority sizes="(min-width: 768px) 55vw, 100vw" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-emerald/80 to-emerald/95 md:bg-gradient-to-r md:from-emerald md:via-emerald/60 md:to-emerald/10" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
          {eyebrow ? (
            <div className="flex items-center gap-3">
              <span className="h-px w-10 bg-gold" aria-hidden />
              <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-gold">{eyebrow}</p>
            </div>
          ) : null}
          <h1 className="mt-4 max-w-3xl font-serif text-4xl leading-[1.05] tracking-tight sm:text-6xl">{title}</h1>
          {intro ? <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/75">{intro}</p> : null}
          {children}
        </div>
      </section>
    );
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
