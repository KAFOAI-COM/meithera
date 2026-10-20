import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2, CircleDashed, AlertTriangle, Clock, Scale, Handshake, Target, Package } from "lucide-react";
import { ROADMAP } from "@/lib/roadmap";
import { STAGES } from "@/lib/stages";
import { Card, buttonVariants } from "@/components/ui";
import { PageHeader } from "@/components/site/notices";
import { StageBadge, StageStrip } from "@/components/site/stage-badge";

export const metadata: Metadata = { title: "Roadmap — the five stages" };

export default function RoadmapPage() {
  return (
    <>
      <PageHeader eyebrow="Roadmap" title="Full vision first. Then what can launch first." intro="Five stages, each with its goal, product, legal basis, partner, what we already have, what we still need, the key risks and indicative timing. Nothing beyond Stage 0 exists today.">
        <StageStrip className="mt-6" />
      </PageHeader>

      <div className="mx-auto max-w-7xl space-y-8 px-4 py-10 sm:px-6">
        {ROADMAP.map((r) => {
          const s = STAGES[r.stage];
          return (
            <Card key={r.stage} className="overflow-hidden" id={`stage-${r.stage}`}>
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-surface p-5">
                <div>
                  <StageBadge stage={r.stage} />
                  <h2 className="mt-2 font-serif text-2xl font-medium">{s.name}</h2>
                </div>
                <p className="flex items-center gap-2 text-sm text-muted"><Clock className="h-4 w-4" /> {r.timing}</p>
              </div>
              <div className="grid gap-6 p-5 lg:grid-cols-2">
                <dl className="space-y-4 text-sm">
                  {[
                    [Target, "Goal", r.goal],
                    [Package, "Product", r.product],
                    [Scale, "Legal basis", r.legalBasis],
                    [Handshake, "Partner", r.partner],
                  ].map(([Icon, k, v]) => {
                    const I = Icon as typeof Target;
                    return (
                      <div key={k as string} className="grid grid-cols-[28px_1fr] gap-2">
                        <I className="mt-0.5 h-4 w-4 text-forest" />
                        <div><dt className="font-sans font-semibold">{k as string}</dt><dd className="mt-0.5 text-muted">{v as string}</dd></div>
                      </div>
                    );
                  })}
                </dl>
                <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                  <div className="rounded-xl bg-mint/60 p-4">
                    <p className="flex items-center gap-1.5 font-sans text-xs font-semibold uppercase tracking-wide text-emerald"><CheckCircle2 className="h-4 w-4" /> What we have</p>
                    <ul className="mt-2 space-y-1.5 text-sm text-ink">{r.have.map((h) => <li key={h}>· {h}</li>)}</ul>
                  </div>
                  <div className="rounded-xl bg-surface p-4">
                    <p className="flex items-center gap-1.5 font-sans text-xs font-semibold uppercase tracking-wide text-muted"><CircleDashed className="h-4 w-4" /> What we need</p>
                    <ul className="mt-2 space-y-1.5 text-sm text-ink">{r.need.map((h) => <li key={h}>· {h}</li>)}</ul>
                  </div>
                  <div className="rounded-xl bg-risk/60 p-4">
                    <p className="flex items-center gap-1.5 font-sans text-xs font-semibold uppercase tracking-wide text-risk-ink"><AlertTriangle className="h-4 w-4" /> Key risks</p>
                    <ul className="mt-2 space-y-1.5 text-sm text-ink">{r.risks.map((h) => <li key={h}>· {h}</li>)}</ul>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}

        <div className="flex flex-wrap gap-3">
          <Link href="/regulatory-demo" className={buttonVariants()}>Regulatory demonstration <ArrowRight className="h-4 w-4" /></Link>
          <Link href="/compliance" className={buttonVariants({ variant: "secondary" })}>Regulatory readiness</Link>
          <Link href="/invest" className={buttonVariants({ variant: "ghost" })}>Try a Stage 1 loan simulation</Link>
        </div>
        <p className="text-xs text-muted">Timing is indicative and depends on partner agreements and regulatory engagement. The Innovation Hub provides guidance; it does not authorise or approve. Meithera is not authorised or regulated by the Central Bank of Ireland.</p>
      </div>
    </>
  );
}
