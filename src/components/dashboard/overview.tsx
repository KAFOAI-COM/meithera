"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useHydrated } from "@/components/site/hydrator";
import { Card, Stat, buttonVariants } from "@/components/ui";
import { eur, pct } from "@/lib/utils";
import { StageBadge } from "@/components/site/stage-badge";
import { usePortfolio } from "./use-portfolio";
import { AllocationDonut, HistoryChart, IncomeChart, PerformanceChart } from "./charts";

function ChartCard({ title, sub, children, stage }: { title: string; sub: string; children: React.ReactNode; stage: 0 | 1 | 2 }) {
  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div><p className="font-sans text-sm font-semibold">{title}</p><p className="text-xs text-muted">{sub}</p></div>
        <StageBadge stage={stage} compact />
      </div>
      <div className="mt-3">{children}</div>
    </Card>
  );
}

export function DashboardOverview({ userId }: { userId: string }) {
  const hydrated = useHydrated();
  const pf = usePortfolio(userId);
  if (!hydrated) return <div className="h-96 animate-pulse rounded-2xl bg-mint/50" />;
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Stat label="Simulated capital at work" value={eur(pf.netInvested)} sub={`${eur(pf.totalInvested)} entered · fees ${eur(pf.totalInvested - pf.netInvested, 2)}`} />
        <Stat label="Illustrative annual income*" value={eur(pf.annualIncome, 2)} sub={`${eur(pf.monthlyIncome, 2)} a month · ${pf.totalInvested ? pct(pf.annualIncome / pf.totalInvested) : "—"} on amount entered`} />
        <Stat label="Realised so far (simulated)" value={eur(pf.realised, 2)} sub={`${pf.payoutTxs.length} payout transactions on Raya Chain`} />
        <Stat label="Homes" value={pf.homes} sub={`${pf.holdings.length} holdings · ${pf.withdrawn.length} withdrawn in reflection`} />
        <Stat label="Loans (Stage 1)" value={pf.holdings.filter((h) => h.p.offerType === "loan").length} sub="Secured, fixed interest" />
        <Stat label="Rent share (Stage 2)" value={pf.holdings.filter((h) => h.p.offerType === "rent-share").length} sub="Notes in the home's company" />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard title="Portfolio allocation" sub="Net invested by home (simulated)" stage={0}><AllocationDonut holdings={pf.holdings} /></ChartCard>
        <ChartCard title="Illustrative income, next 12 months" sub="Projected vs realised, before investor-level taxes" stage={2}><IncomeChart calendar={pf.calendar} /></ChartCard>
        <ChartCard title="Property performance" sub="Property-level yield or loan rate vs your illustrative yield after fees" stage={1}><PerformanceChart holdings={pf.holdings} /></ChartCard>
        <ChartCard title="Investment history" sub="Cumulative simulated amount entered" stage={0}><HistoryChart holdings={pf.holdings} /></ChartCard>
      </div>
      <div className="flex flex-wrap gap-3">
        <Link href="/invest" className={buttonVariants()}>Simulate another investment <ArrowRight className="h-4 w-4" /></Link>
        <Link href="/dashboard/portfolio" className={buttonVariants({ variant: "secondary" })}>Portfolio details</Link>
      </div>
      <p className="text-xs text-muted">*Illustrative, before investor-level taxes, not guaranteed. Property-level yields are not investor returns. Nothing here is a real investment.</p>
    </div>
  );
}
