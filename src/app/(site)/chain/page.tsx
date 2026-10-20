import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/site/notices";
import { StageBadge } from "@/components/site/stage-badge";
import { ChainExplorer } from "@/components/chain/explorer";

export const metadata: Metadata = { title: "Raya Chain explorer" };

export default function ChainPage() {
  return (
    <>
      <PageHeader eyebrow="Raya Chain · simulated" title="One record. Every euro, holder and payout." intro="An audit console, not a trading explorer. Every simulated investment, payout, loan repayment, freeze and correction is a transaction here, under a pseudonymous holder ID, with the compliance rule it passed or failed.">
        <div className="mt-6 flex flex-wrap gap-2">
          <StageBadge stage={0} />
          <StageBadge stage={2} />
          <StageBadge stage={4} />
        </div>
        <p className="mt-3 max-w-2xl text-sm text-muted">Today the off-chain register is authoritative and Raya Chain mirrors it (Stage 2). Raya Chain becoming the official register of notes is Stage 4 and depends on EU reform.</p>
      </PageHeader>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-mint/50" />}>
          <ChainExplorer />
        </Suspense>
      </div>
    </>
  );
}
