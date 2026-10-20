"use client";

import { useHydrated } from "@/components/site/hydrator";
import { Card, Table, Th, Td } from "@/components/ui";
import { cn, eur, dateTime } from "@/lib/utils";
import { StageBadge } from "@/components/site/stage-badge";
import { TxLink } from "@/components/chain/tx-bits";
import { useDemo } from "@/lib/store";
import { FEES } from "@/lib/finance";
import { usePortfolio } from "./use-portfolio";
import { IncomeChart } from "./charts";

export function Income({ userId }: { userId: string }) {
  const hydrated = useHydrated();
  const pf = usePortfolio(userId);
  const { properties } = useDemo();
  if (!hydrated) return <div className="h-96 animate-pulse rounded-2xl bg-mint/50" />;
  const max = Math.max(1, ...pf.calendar.map((m) => Math.max(m.projected, m.realised)));
  return (
    <div className="space-y-6">
      <Card className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div><p className="font-sans text-sm font-semibold">12-month income calendar</p><p className="text-xs text-muted">Projected (illustrative, from the finance engine) vs realised (simulated payouts recorded on Raya Chain). Before investor-level taxes.</p></div>
          <StageBadge stage={2} compact />
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
          {pf.calendar.map((m) => (
            <div key={m.ym} className={cn("rounded-xl border p-3", m.realised > 0 ? "border-forest bg-mint/50" : m.projected > 0 ? "border-line bg-card" : "border-dashed border-line bg-surface")} title={m.paying.join(", ")}>
              <p className="font-sans text-xs font-semibold uppercase text-muted">{m.label}</p>
              <p className="tabular mt-1 font-sans text-base font-bold">{eur(m.projected, 2)}</p>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-mint"><div className="h-full bg-forest" style={{ width: `${(m.projected / max) * 100}%` }} /></div>
              <p className="tabular mt-1 text-[11px] text-muted">{m.realised > 0 ? `Realised ${eur(m.realised, 2)}` : m.paying.length ? `${m.paying.length} paying` : "No income yet"}</p>
            </div>
          ))}
        </div>
        <div className="mt-6"><IncomeChart calendar={pf.calendar} /></div>
      </Card>

      <Card className="p-5">
        <p className="font-sans text-sm font-semibold">How a monthly payout is calculated</p>
        <div className="mt-3 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl bg-surface p-4 text-sm">
            <div className="flex items-center justify-between"><p className="font-sans font-semibold">Rent share (Stage 2)</p><StageBadge stage={2} compact /></div>
            <ol className="mt-2 list-decimal space-y-1 pl-5 text-muted">
              <li>Collected rent for the month (gross rent × (1 − vacancy) ÷ 12)</li>
              <li>Less the month’s operating costs (maintenance, management, insurance, other)</li>
              <li>× your participation (net invested ÷ total project cost)</li>
              <li>Less administration fee ({(FEES.annualAdminPct * 100).toFixed(1)}% p.a. ÷ 12 on net invested)</li>
              <li>= your distribution, recorded as a DISTRIBUTION tx. Before investor-level taxes.</li>
            </ol>
          </div>
          <div className="rounded-xl bg-surface p-4 text-sm">
            <div className="flex items-center justify-between"><p className="font-sans font-semibold">Loan interest (Stage 1)</p><StageBadge stage={1} compact /></div>
            <ol className="mt-2 list-decimal space-y-1 pl-5 text-muted">
              <li>Amount lent × fixed rate ÷ 12</li>
              <li>No fee deducted — the borrower pays the arrangement fee</li>
              <li>Principal returned in the final month of the term</li>
              <li>= your interest, recorded as a REPAYMENT tx. Before investor-level taxes.</li>
            </ol>
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="p-5 pb-2"><p className="font-sans text-sm font-semibold">Simulated distributions received</p></div>
        <Table>
          <thead><tr><Th>Period</Th><Th>Home</Th><Th>Kind</Th><Th className="text-right">Amount</Th><Th>Raya Chain</Th><Th>Recorded</Th></tr></thead>
          <tbody>
            {pf.myDistributions.map((d) => {
              const a = d.allocations.find((x) => x.investorId === userId)!;
              return (
                <tr key={d.id}>
                  <Td className="tabular">{d.period}</Td>
                  <Td>{properties.find((p) => p.id === d.propertyId)?.location}</Td>
                  <Td className="text-xs">{d.kind === "interest" ? "Loan interest" : "Rental distribution"}</Td>
                  <Td className="tabular text-right font-medium">{eur(a.amount, 2)}</Td>
                  <Td>{a.txId ? <TxLink id={a.txId} /> : "—"}</Td>
                  <Td className="text-xs text-muted">{dateTime(d.createdAt)}</Td>
                </tr>
              );
            })}
            {!pf.myDistributions.length ? <tr><Td colSpan={6} className="text-center text-muted">No simulated distributions yet. An administrator can run one from the admin console.</Td></tr> : null}
          </tbody>
        </Table>
      </Card>
    </div>
  );
}
