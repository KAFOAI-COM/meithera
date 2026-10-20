import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { CONTROLS, DECISION_POINTS } from "@/lib/regulatory";
import { Badge, Card, Table, Th, Td, buttonVariants } from "@/components/ui";
import { PageHeader, SectionHeading, RiskNotice } from "@/components/site/notices";
import { StageBadge, StageStrip } from "@/components/site/stage-badge";

export const metadata: Metadata = { title: "Regulatory readiness" };

export default function CompliancePage() {
  const implemented = CONTROLS.filter((c) => c.status === "Implemented (demo)").length;
  return (
    <>
      <PageHeader eyebrow="Regulatory readiness" title="Proposed, subject to regulatory assessment" intro="Meithera is not authorised or regulated by the Central Bank of Ireland, and the Central Bank has not approved or endorsed this platform. This page sets out the regulatory route we propose to explore, the questions we are not answering ourselves, and the controls the demonstration already carries.">
        <StageStrip className="mt-6" />
      </PageHeader>
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <SectionHeading eyebrow="Proposed route" title="ECSPR first, through a licensed partner" intro="Stage 1 (secured lending) and Stage 2 (rent share) are both within the kinds of activity the EU Crowdfunding Regulation covers. We propose to launch Stage 1 with a licensed European Crowdfunding Service Provider and a payment institution for client money, and to seek our own ECSP authorisation afterwards. Stages 3 and 4 need further permissions or EU reform." />
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {DECISION_POINTS.map((d, i) => (
            <Card key={d.id} className="p-5">
              <div className="flex items-start justify-between gap-2"><p className="font-sans font-semibold">{i + 1}. {d.question}</p><StageBadge stage={d.stage} compact /></div>
              <p className="mt-2 text-sm text-muted">{d.why}</p>
              <p className="mt-2 text-xs text-demo-ink">Open question — not pre-judged. Demo assumption: {d.demoAssumption}</p>
            </Card>
          ))}
        </div>
      </section>
      <section className="border-y border-line bg-card">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <SectionHeading eyebrow="Controls" title={`${implemented} of ${CONTROLS.length} controls demonstrated`} intro="Implemented in the demonstration means the control is visible and working in simulation. Proposed means designed, not built. Partner-dependent means the authorised partner would perform it." />
          <Card className="mt-8 overflow-hidden">
            <Table>
              <thead><tr><Th>Control</Th><Th>Purpose</Th><Th>Status</Th><Th>Responsible</Th></tr></thead>
              <tbody>{CONTROLS.map((c) => <tr key={c.control}><Td className="font-medium">{c.control}</Td><Td className="text-xs text-muted">{c.purpose}</Td><Td><Badge tone={c.status === "Implemented (demo)" ? "mint" : c.status === "Proposed" ? "neutral" : "gold"}>{c.status}</Badge></Td><Td className="text-xs">{c.responsible}</Td></tr>)}</tbody>
            </Table>
          </Card>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/regulatory-demo" className={buttonVariants()}><ShieldCheck className="h-4 w-4" /> Full regulatory demonstration <ArrowRight className="h-4 w-4" /></Link>
            <Link href="/legal/risk-disclosure" className={buttonVariants({ variant: "secondary" })}>Risk disclosure</Link>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6"><RiskNotice /></section>
    </>
  );
}
