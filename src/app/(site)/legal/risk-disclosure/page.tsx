import type { Metadata } from "next";
import { PageHeader, RiskNotice } from "@/components/site/notices";
import { RISK_FACTORS, LOAN_RISK_FACTORS } from "@/components/invest/kiis-card";
import { StageBadge } from "@/components/site/stage-badge";
import { Card } from "@/components/ui";

export const metadata: Metadata = { title: "Risk disclosure" };

export default function RiskDisclosurePage() {
  return (
    <>
      <PageHeader eyebrow="Legal" title="Risk disclosure" intro="A demonstration version of the risk disclosure a live service would publish. Not a real disclosure; no offer is being made.">
        <div className="mt-6"><StageBadge stage={0} /></div>
      </PageHeader>
      <div className="mx-auto max-w-4xl space-y-6 px-4 py-12 sm:px-6">
        <RiskNotice />
        <Card className="p-6 text-sm leading-relaxed">
          <h2 className="font-sans text-lg font-semibold">Status of this platform</h2>
          <p className="mt-2 text-muted">Meithera is a demonstration operated by Raya Software Limited. It is not authorised or regulated by the Central Bank of Ireland. No real investments are available, no money can be transferred and no securities or tokens are issued. All homes, people and figures are fictional.</p>
          <h2 className="mt-6 font-sans text-lg font-semibold">What you would and would not own</h2>
          <p className="mt-2 text-muted">Under the proposed structure you would hold a participation in a secured loan (Stage 1) or notes issued by the company that owns a home (Stage 2). You would not own the home or any part of its legal title. A Raya Chain token is a record of the holding, not ownership of property.</p>
          <h2 className="mt-6 font-sans text-lg font-semibold">Principal risks — rent share</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-muted">{RISK_FACTORS.map((r) => <li key={r}>{r}</li>)}</ul>
          <h2 className="mt-6 font-sans text-lg font-semibold">Principal risks — loans</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-muted">{LOAN_RISK_FACTORS.map((r) => <li key={r}>{r}</li>)}</ul>
          <h2 className="mt-6 font-sans text-lg font-semibold">Returns and figures</h2>
          <p className="mt-2 text-muted">Every yield or income figure is illustrative, computed from stated assumptions, shown gross to net, and before investor-level taxes. Property-level net operating yield is not an investor return. Nothing is guaranteed. Past or simulated figures are not a guide to the future.</p>
          <h2 className="mt-6 font-sans text-lg font-semibold">Liquidity</h2>
          <p className="mt-2 text-muted">You should assume you cannot sell before the planned exit. Transfers are restricted to verified holders. A bulletin board is not a market and offers no guaranteed buyer.</p>
          <h2 className="mt-6 font-sans text-lg font-semibold">Regulatory</h2>
          <p className="mt-2 text-muted">The proposed structure is subject to regulatory assessment. Whether ECSPR, MiFID II or AIFMD applies has not been determined. The Innovation Hub provides guidance, not approval. See <a className="text-forest underline" href="/compliance">Regulatory readiness</a>.</p>
        </Card>
      </div>
    </>
  );
}
