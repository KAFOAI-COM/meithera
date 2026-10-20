"use client";

import Link from "next/link";
import { ArrowUpRight, CheckCircle2 } from "lucide-react";
import { useInvestor } from "@/components/dashboard/investor-context";
import { IncomeChart, Legend, PROJECTED, REALISED } from "@/components/dashboard/charts";
import { useDemo } from "@/lib/store";
import { monthLabel, propertyColor } from "@/lib/portfolio";
import { cn, eur, shortDate, shortHash } from "@/lib/utils";
import { Card, Table, Td, Th } from "@/components/ui";

export default function IncomePage() {
  const d = useInvestor();
  const properties = useDemo((s) => s.properties);
  const name = (spvId?: string) => properties.find((p) => p.spvId === spvId)?.location ?? "—";
  const totalProjected = d.series.reduce((s, m) => s + m.projected, 0);
  const totalRealised = d.series.reduce((s, m) => s + m.realised, 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-3xl text-ink">Income calendar</h2>
        <p className="mt-1 text-sm text-muted">Twelve months, July 2026 – June 2027. Realised payouts come from Raya Chain; projections from the finance engine. After fees, before investor-level taxes.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {d.series.map((m) => {
          const paid = m.realised > 0;
          return (
            <div key={m.month} className={cn("flex min-h-36 flex-col rounded-2xl border p-4", paid ? "border-forest/30 bg-mint/50" : m.isPast ? "border-line bg-surface" : "border-line bg-card")}>
              <div className="flex items-center justify-between">
                <p className="font-sans text-sm font-semibold text-ink">{monthLabel(m.month, true)}</p>
                {paid ? <CheckCircle2 className="h-4 w-4 text-forest" aria-label="Paid" /> : null}
              </div>
              <p className="tabular mt-3 font-serif text-2xl leading-none text-ink">{eur(paid ? m.realised : m.projected, 2)}</p>
              <p className="mt-1 text-[11px] text-muted">{paid ? "paid (simulated)" : m.projected > 0 ? (m.isPast ? "not paid" : "projected") : "no income yet"}</p>
              <div className="mt-auto flex gap-1 pt-3" aria-hidden>
                {Object.keys(m.byProperty).map((id) => <span key={id} className="h-1.5 flex-1 rounded-full" style={{ background: propertyColor(id) }} />)}
              </div>
            </div>
          );
        })}
      </div>
      <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
        {[...new Set(d.holdings.map((h) => h.property.id))].map((id) => (
          <li key={id} className="flex items-center gap-2"><span className="h-1.5 w-4 rounded-full" style={{ background: propertyColor(id) }} />{properties.find((p) => p.id === id)?.location}</li>
        ))}
      </ul>

      <Card className="p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="font-sans text-base font-semibold text-ink">Projected vs realised</h3>
            <p className="tabular text-xs text-muted">{eur(totalRealised, 2)} realised · {eur(totalProjected, 2)} projected over the 12 months</p>
          </div>
          <Legend items={[{ label: "Realised", color: REALISED }, { label: "Projected", color: PROJECTED, dashed: true }]} />
        </div>
        <div className="mt-6"><IncomeChart data={d.series} height={280} /></div>
      </Card>

      <Card className="p-6">
        <h3 className="font-sans text-base font-semibold text-ink">Payments received</h3>
        <p className="text-xs text-muted">Each payment is a Raya Chain transaction to your pseudonym, net of the 0.5% administration fee.</p>
        {d.payouts.length ? (
          <Table className="mt-4">
            <thead><tr><Th>Date</Th><Th>Home</Th><Th>Type</Th><Th className="text-right">Amount</Th><Th>Transaction</Th></tr></thead>
            <tbody>
              {[...d.payouts].reverse().map((t) => (
                <tr key={t.txId}>
                  <Td className="tabular">{shortDate(t.at)}</Td>
                  <Td>{name(t.spvId)}</Td>
                  <Td>{t.type === "REPAYMENT" ? "Loan interest" : "Rent distribution"}</Td>
                  <Td className="tabular text-right font-semibold">{eur(t.amount ?? 0, 2)}</Td>
                  <Td><Link href={`/chain?tx=${t.txId}`} className="inline-flex items-center gap-1 font-mono text-xs text-forest hover:underline">{shortHash(t.txId)} <ArrowUpRight className="h-3 w-3" /></Link></Td>
                </tr>
              ))}
            </tbody>
          </Table>
        ) : (
          <p className="mt-4 rounded-xl bg-surface p-4 text-sm text-muted">No payments yet. Loan interest starts the month after funding; rent distributions start after the tenancy begins.</p>
        )}
      </Card>
    </div>
  );
}
