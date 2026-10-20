"use client";

import { useState } from "react";
import { Coins, Play } from "lucide-react";
import { useDemo } from "@/lib/store";
import { useHydrated } from "@/components/site/hydrator";
import { FEES } from "@/lib/finance";
import { eur, dateTime } from "@/lib/utils";
import { Button, Card, Label, Select, Input, Table, Th, Td, Badge } from "@/components/ui";
import { StageBadge } from "@/components/site/stage-badge";
import { TxLink } from "@/components/chain/tx-bits";

export function AdminDistributions() {
  const hydrated = useHydrated();
  const { properties, distributions, runDistribution, investors } = useDemo();
  const [pid, setPid] = useState("prop-d8");
  const now = new Date();
  const [period, setPeriod] = useState(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`);
  const [lastId, setLastId] = useState<string | null>(null);
  if (!hydrated) return <div className="h-96 animate-pulse rounded-2xl bg-mint/50" />;
  const p = properties.find((x) => x.id === pid)!;
  const last = distributions.find((d) => d.id === lastId);
  const name = (id: string) => investors.find((i) => i.id === id)?.name ?? id;
  return (
    <div className="space-y-6">
      <Card className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-2"><p className="flex items-center gap-2 font-sans text-base font-semibold"><Coins className="h-5 w-5 text-forest" /> Run a monthly distribution (simulated)</p><StageBadge stage={p.offerType === "loan" ? 1 : 2} compact /></div>
        <p className="mt-1 text-sm text-muted">{p.offerType === "loan" ? "Interest for the month at the fixed rate, paid to each lender of record. Frozen holders are skipped." : `Collected rent less operating costs, allocated by participation, less the ${(FEES.annualAdminPct * 100).toFixed(1)}% p.a. administration fee ÷ 12. Frozen holders are skipped.`} Each allocation becomes a {p.offerType === "loan" ? "REPAYMENT" : "DISTRIBUTION"} transaction on Raya Chain.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_180px_auto] sm:items-end">
          <div className="space-y-1"><Label htmlFor="d-prop">Home</Label><Select id="d-prop" value={pid} onChange={(e) => setPid(e.target.value)}>{properties.map((x) => <option key={x.id} value={x.id}>{x.title}</option>)}</Select></div>
          <div className="space-y-1"><Label htmlFor="d-period">Period (YYYY-MM)</Label><Input id="d-period" value={period} onChange={(e) => setPeriod(e.target.value)} pattern="\d{4}-\d{2}" /></div>
          <Button onClick={() => { const r = runDistribution(pid, period); setLastId(r?.id ?? null); }}><Play className="h-4 w-4" /> Run</Button>
        </div>
        {last ? (
          <div className="mt-5 rounded-xl border border-line bg-surface p-4">
            <p className="font-sans text-sm font-semibold">Statement — {last.period} · {properties.find((x) => x.id === last.propertyId)?.location}</p>
            <dl className="tabular mt-2 grid gap-y-1 text-sm sm:grid-cols-[220px_1fr]">
              <dt className="text-muted">{last.kind === "interest" ? "Interest due" : "Rental income (after vacancy)"}</dt><dd>{eur(last.rentalIncome, 2)}</dd>
              <dt className="text-muted">Expenses</dt><dd>−{eur(last.expenses, 2)}</dd>
              <dt className="text-muted">Administration fee</dt><dd>−{eur(last.adminFee, 2)}</dd>
              <dt className="text-muted font-semibold">Distributable to investors</dt><dd className="font-semibold">{eur(last.distributable, 2)}</dd>
            </dl>
            <Table className="mt-3">
              <thead><tr><Th>Investor</Th><Th className="text-right">Amount</Th><Th>Raya Chain</Th></tr></thead>
              <tbody>{last.allocations.map((a) => <tr key={a.investorId}><Td>{name(a.investorId)}</Td><Td className="tabular text-right">{a.amount > 0 ? eur(a.amount, 2) : <Badge tone="gold">skipped (frozen)</Badge>}</Td><Td>{a.txId ? <TxLink id={a.txId} /> : "—"}</Td></tr>)}</tbody>
            </Table>
            <p className="mt-2 text-xs text-muted">Simulated — no payments made. Before investor-level taxes.</p>
          </div>
        ) : null}
      </Card>
      <Card className="overflow-hidden">
        <div className="p-5 pb-2"><p className="font-sans text-sm font-semibold">Distribution history</p></div>
        <Table>
          <thead><tr><Th>Run</Th><Th>Period</Th><Th>Home</Th><Th>Kind</Th><Th className="text-right">Distributable</Th><Th className="text-right">Allocations</Th><Th>Created</Th></tr></thead>
          <tbody>{distributions.map((d) => <tr key={d.id}><Td className="font-mono text-xs">{d.id}</Td><Td className="tabular">{d.period}</Td><Td>{properties.find((x) => x.id === d.propertyId)?.location}</Td><Td className="text-xs">{d.kind}</Td><Td className="tabular text-right">{eur(d.distributable, 2)}</Td><Td className="tabular text-right">{d.allocations.length}</Td><Td className="text-xs text-muted">{dateTime(d.createdAt)}</Td></tr>)}</tbody>
        </Table>
      </Card>
    </div>
  );
}
