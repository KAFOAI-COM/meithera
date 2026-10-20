"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight, Coins } from "lucide-react";
import type { DistributionRun } from "@/lib/types";
import { useDemo } from "@/lib/store";
import { pseudonym } from "@/lib/ledger";
import { cn, dateTime, eur, shortHash } from "@/lib/utils";
import { Button, Card, Label, Select, Table, Td, Th } from "@/components/ui";

const PERIODS = ["2026-10", "2026-11", "2026-12", "2027-01"];

export default function AdminDistributions() {
  const properties = useDemo((s) => s.properties);
  const distributions = useDemo((s) => s.distributions);
  const investments = useDemo((s) => s.investments);
  const run = useDemo((s) => s.runDistribution);
  const [pid, setPid] = useState(properties.find((p) => p.id === "prop-limerick")?.id ?? properties[0].id);
  const [period, setPeriod] = useState("2026-11");
  const [last, setLast] = useState<DistributionRun | null>(null);
  const [error, setError] = useState("");
  const p = properties.find((x) => x.id === pid)!;
  const isLoan = p.offerType === "loan";
  const holders = investments.filter((i) => i.propertyId === pid && i.status !== "Withdrawn").length;
  const name = (id: string) => properties.find((x) => x.id === id)?.location ?? id;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-3xl text-ink">Distributions</h2>
        <p className="mt-1 text-sm text-muted">Run a monthly loan-interest payment (Stage 1) or rent distribution (Stage 2). Each allocation is written to Raya Chain and appears on investors’ statements. No payments are made.</p>
      </div>
      <Card className="p-6">
        <div className="flex flex-wrap items-end gap-4">
          <div className="min-w-56 flex-1 space-y-1">
            <Label htmlFor="d-prop" className="text-xs">Property company</Label>
            <Select id="d-prop" value={pid} onChange={(e) => { setPid(e.target.value); setError(""); }} className="h-10">
              {properties.map((x) => <option key={x.id} value={x.id}>{x.location} — {x.offerType === "loan" ? "loan interest" : "rent distribution"}</option>)}
            </Select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="d-period" className="text-xs">Month</Label>
            <Select id="d-period" value={period} onChange={(e) => setPeriod(e.target.value)} className="h-10 w-40">{PERIODS.map((m) => <option key={m}>{m}</option>)}</Select>
          </div>
          <Button
            onClick={() => {
              const r = run(pid, period);
              if (!r) setError("No itemised holdings in this company yet — simulate an investment first.");
              else { setError(""); setLast(r); }
            }}
          >
            <Coins className="h-4 w-4" /> Run {isLoan ? "loan interest" : "rent distribution"}
          </Button>
        </div>
        <p className="mt-3 text-xs text-muted">{holders} itemised holding{holders === 1 ? "" : "s"} · {isLoan ? `${p.loan?.ratePct}% p.a. fixed, net of the 0.5% administration fee` : "monthly net rent after operating costs, vacancy allowance and the 0.5% administration fee"}.</p>
        {!isLoan && p.milestones.some((m) => /tenancy/i.test(m.label) && !m.done) ? <p className="mt-2 rounded-lg bg-demo px-3 py-2 text-xs font-medium text-demo-ink">Note: this home’s tenancy has not begun in the model; a live run would wait for rent to be collected.</p> : null}
        {error ? <p className="mt-3 rounded-lg bg-risk px-3 py-2 text-sm text-risk-ink" role="alert">{error}</p> : null}
        {last ? (
          <div className="mt-5 rounded-xl border border-forest/30 bg-mint/30 p-4" role="status">
            <p className="font-sans text-sm font-semibold text-emerald">{name(last.propertyId)} · {last.period}: {eur(last.distributable, 2)} to {last.allocations.length} holder{last.allocations.length === 1 ? "" : "s"}, recorded on Raya Chain</p>
            <ul className="mt-2 space-y-1 text-xs">
              {last.allocations.map((a) => (
                <li key={a.txId} className="flex flex-wrap justify-between gap-3"><span className="font-mono text-muted">{pseudonym(a.investorId)}</span><span className="tabular font-semibold text-ink">{eur(a.amount, 2)}</span>{a.txId ? <Link href={`/chain?tx=${a.txId}`} className="font-mono text-forest hover:underline">{shortHash(a.txId)}</Link> : null}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </Card>
      <Card className="p-2 sm:p-4">
        <h3 className="px-3 pt-2 font-sans text-base font-semibold text-ink">Run history</h3>
        <Table className="mt-2">
          <thead><tr><Th>Run</Th><Th>Home</Th><Th>Kind</Th><Th>Month</Th><Th className="text-right">Gross</Th><Th className="text-right">Fees</Th><Th className="text-right">Paid</Th><Th>Txs</Th></tr></thead>
          <tbody>
            {distributions.map((d) => (
              <tr key={d.id}>
                <Td className="text-xs"><span className="font-mono">{d.id}</span><span className="block text-muted">{dateTime(d.createdAt)}</span></Td>
                <Td>{name(d.propertyId)}</Td>
                <Td><span className={cn("rounded-full px-2 py-0.5 font-sans text-[11px] font-semibold", d.kind === "interest" ? "bg-[#f4ecdc] text-gold-ink" : "bg-mint text-emerald")}>{d.kind === "interest" ? "Loan interest" : "Rent"}</span></Td>
                <Td className="tabular">{d.period}</Td>
                <Td className="tabular text-right">{eur(d.rentalIncome, 2)}</Td>
                <Td className="tabular text-right text-risk-ink">−{eur(d.mgmtFee, 2)}</Td>
                <Td className="tabular text-right font-semibold">{eur(d.distributable, 2)}</Td>
                <Td>{d.allocations[0]?.txId ? <Link href={`/chain?tx=${d.allocations[0].txId}`} className="inline-flex items-center gap-1 font-mono text-xs text-forest hover:underline">{d.allocations.length} <ArrowUpRight className="h-3 w-3" /></Link> : d.allocations.length}</Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
    </div>
  );
}
