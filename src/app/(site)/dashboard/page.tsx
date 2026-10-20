"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { ArrowRight, ArrowUpRight, Sparkles } from "lucide-react";
import { useInvestor } from "@/components/dashboard/investor-context";
import { AllocationDonut, HistoryChart, IncomeChart, Legend, PerformanceBars, PROJECTED, REALISED } from "@/components/dashboard/charts";
import { Card, buttonVariants } from "@/components/ui";
import { StageBadge } from "@/components/site/stage-badge";
import { useHydrated } from "@/components/site/hydrator";
import { TX_LABEL } from "@/lib/chain/raya";
import { propertyColor, monthLabel } from "@/lib/portfolio";
import { cn, eur, shortDate, shortHash } from "@/lib/utils";

function Kpi({ label, value, sub, accent }: { label: string; value: string; sub: string; accent?: boolean }) {
  return (
    <div className={cn("rounded-2xl border p-5", accent ? "border-emerald bg-emerald text-white" : "border-line bg-card")}>
      <p className={cn("font-sans text-[11px] font-semibold uppercase tracking-[0.1em]", accent ? "text-gold" : "text-muted")}>{label}</p>
      <p className={cn("tabular mt-2 font-serif text-[32px] leading-none", accent ? "text-white" : "text-ink")}>{value}</p>
      <p className={cn("mt-2 text-xs", accent ? "text-white/60" : "text-muted")}>{sub}</p>
    </div>
  );
}

function Welcome() {
  const q = useSearchParams();
  if (!q.get("welcome")) return null;
  return (
    <p className="mb-8 flex items-center gap-3 rounded-2xl bg-mint p-4 text-sm text-emerald">
      <Sparkles className="h-5 w-5 shrink-0" /> Your demo profile is ready. Everything here is fictional — try simulating an investment, then follow it onto Raya Chain.
    </p>
  );
}

export default function DashboardOverview() {
  const d = useInvestor();
  const hydrated = useHydrated();
  const nextPayout = d.series.find((m) => !m.isPast && m.projected > 0);
  const byProperty = new Map<string, { id: string; name: string; value: number; color: string }>();
  for (const h of d.holdings) {
    const cur = byProperty.get(h.property.id) ?? { id: h.property.id, name: h.property.location, value: 0, color: propertyColor(h.property.id) };
    cur.value += h.sim.amount;
    byProperty.set(h.property.id, cur);
  }
  const alloc = [...byProperty.values()];
  const perf = alloc.map((a) => {
    const hs = d.holdings.filter((h) => h.property.id === a.id);
    return { ...a, value: (hs.reduce((s, h) => s + h.monthlyNet, 0) * 12) / Math.max(1, hs.reduce((s, h) => s + h.sim.amount, 0)) };
  });
  let run = 0;
  const history = [...d.holdings].sort((a, b) => a.sim.createdAt.localeCompare(b.sim.createdAt)).map((h) => ({ at: h.sim.createdAt, label: shortDate(h.sim.createdAt), total: (run += h.sim.amount) }));
  if (history.length) history.push({ at: new Date().toISOString(), label: "Today", total: run });

  if (!d.holdings.length && hydrated)
    return (
      <div className="rounded-3xl border border-dashed border-line-strong/60 bg-card p-12 text-center">
        <h2 className="font-serif text-3xl text-ink">No holdings yet</h2>
        <p className="mt-2 text-muted">Simulate your first investment to see it here and on Raya Chain.</p>
        <Link href="/invest" className={buttonVariants({ className: "mt-6" })}>Choose an offer <ArrowRight className="h-4 w-4" /></Link>
      </div>
    );

  return (
    <>
      <Suspense fallback={null}><Welcome /></Suspense>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi accent label="Committed (simulated)" value={eur(d.committed)} sub={`${d.holdings.length} holding${d.holdings.length === 1 ? "" : "s"} · ${eur(d.net)} net of fees`} />
        <Kpi label="Projected monthly income" value={eur(d.monthlyNow, 2)} sub="once every holding pays · after fees" />
        <Kpi label="Received to date" value={eur(d.received, 2)} sub={`${d.payouts.length} payouts recorded on Raya Chain`} />
        <Kpi label="Next payout" value={nextPayout ? eur(nextPayout.projected, 2) : "—"} sub={nextPayout ? `projected for ${monthLabel(nextPayout.month, true)}` : "no payout scheduled"} />
      </div>
      <p className="mt-3 text-xs text-muted">Illustrative, before investor-level taxes. Not guaranteed.</p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <Card className="p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="font-sans text-base font-semibold text-ink">Monthly income</h2>
              <p className="text-xs text-muted">Jul 2026 – Jun 2027 · realised from Raya Chain payouts vs projected</p>
            </div>
            <Legend items={[{ label: "Realised", color: REALISED }, { label: "Projected", color: PROJECTED, dashed: true }]} />
          </div>
          <div className="mt-6"><IncomeChart data={d.series} /></div>
          <Link href="/dashboard/income" className="mt-3 inline-flex min-h-10 items-center gap-1 font-sans text-sm font-semibold text-forest hover:underline">Income calendar <ArrowRight className="h-4 w-4" /></Link>
        </Card>
        <Card className="p-6">
          <h2 className="font-sans text-base font-semibold text-ink">Allocation by home</h2>
          <p className="text-xs text-muted">Amount committed</p>
          <div className="mt-6"><AllocationDonut data={alloc} total={d.committed} /></div>
          <ul className="mt-6 space-y-2.5">
            {alloc.map((a) => (
              <li key={a.id} className="flex items-center justify-between gap-3 text-sm">
                <span className="flex items-center gap-2 text-ink"><span className="h-2.5 w-2.5 rounded-sm" style={{ background: a.color }} />{a.name}</span>
                <span className="tabular text-muted">{eur(a.value)} · {Math.round((a.value / Math.max(1, d.committed)) * 100)}%</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h2 className="font-sans text-base font-semibold text-ink">Property performance</h2>
          <p className="text-xs text-muted">Illustrative net yield on amount entered, after both fees</p>
          <div className="mt-6"><PerformanceBars data={perf} /></div>
        </Card>
        <Card className="p-6">
          <h2 className="font-sans text-base font-semibold text-ink">Investment history</h2>
          <p className="text-xs text-muted">Cumulative amount committed</p>
          <div className="mt-6"><HistoryChart data={history} /></div>
        </Card>
      </div>

      <Card className="mt-6 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-sans text-base font-semibold text-ink">Recent activity on Raya Chain</h2>
          <StageBadge stage={0} detail />
        </div>
        <ul className="mt-4 divide-y divide-line">
          {d.ledger.slice(0, 6).map((t) => (
            <li key={t.txId} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
              <span className="min-w-0">
                <span className="font-sans font-semibold text-ink">{TX_LABEL[t.type]}</span>
                <span className="ml-2 text-muted">{t.memo.split(" · ").slice(0, 2).join(" · ")}</span>
              </span>
              <span className="flex items-center gap-4">
                {t.amount != null ? <span className="tabular font-semibold text-ink">{eur(t.amount, 2)}</span> : null}
                <span className="tabular text-xs text-muted">{shortDate(t.at)}</span>
                <Link href={`/chain?tx=${t.txId}`} className="inline-flex min-h-8 items-center gap-1 font-mono text-[11px] text-forest hover:underline">{shortHash(t.txId)} <ArrowUpRight className="h-3 w-3" /></Link>
              </span>
            </li>
          ))}
        </ul>
        <Link href="/dashboard/transactions" className="mt-2 inline-flex min-h-10 items-center gap-1 font-sans text-sm font-semibold text-forest hover:underline">Full ledger <ArrowRight className="h-4 w-4" /></Link>
      </Card>
    </>
  );
}
