"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight, Download } from "lucide-react";
import type { ChainTxType } from "@/lib/types";
import { useInvestor } from "@/components/dashboard/investor-context";
import { useDemo } from "@/lib/store";
import { TX_LABEL } from "@/lib/chain/raya";
import { cn, dateTime, eur, shortHash } from "@/lib/utils";
import { Button, Card, Table, Td, Th } from "@/components/ui";

const FILTERS: { id: string; label: string; types: ChainTxType[] }[] = [
  { id: "all", label: "All", types: [] },
  { id: "holdings", label: "Holdings", types: ["ISSUE", "WITHDRAWAL", "TRANSFER", "CORRECTION"] },
  { id: "payouts", label: "Payouts", types: ["REPAYMENT", "DISTRIBUTION"] },
  { id: "controls", label: "Controls", types: ["FREEZE", "REJECTED"] },
];

export default function TransactionsPage() {
  const d = useInvestor();
  const properties = useDemo((s) => s.properties);
  const [f, setF] = useState("all");
  const filter = FILTERS.find((x) => x.id === f)!;
  const rows = d.ledger.filter((t) => !filter.types.length || filter.types.includes(t.type));
  const name = (spvId?: string) => properties.find((p) => p.spvId === spvId)?.location ?? "—";
  const sign = (t: (typeof rows)[0]) => (t.to === d.holder ? 1 : -1);

  const exportCsv = () => {
    const head = "date,type,home,direction,units,amount_eur,tx_id,block\n";
    const body = rows.map((t) => [t.at, t.type, name(t.spvId), sign(t) > 0 ? "in" : "out", t.units ?? "", t.amount ?? "", t.txId, t.block].join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([head + body], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "meithera-demo-ledger.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-serif text-3xl text-ink">Transactions</h2>
          <p className="mt-1 text-sm text-muted">Your ledger is the set of Raya Chain transactions to or from your pseudonym <span className="font-mono text-xs">{d.holder}</span>.</p>
        </div>
        <Button variant="secondary" size="sm" onClick={exportCsv}><Download className="h-4 w-4" /> Export CSV</Button>
      </div>
      <div role="tablist" className="inline-flex flex-wrap gap-1 rounded-xl border border-line bg-card p-1">
        {FILTERS.map((x) => (
          <button key={x.id} role="tab" aria-selected={f === x.id} onClick={() => setF(x.id)} className={cn("min-h-9 rounded-lg px-3 font-sans text-sm font-semibold", f === x.id ? "bg-emerald text-white" : "text-muted hover:bg-mint hover:text-emerald")}>{x.label}</button>
        ))}
      </div>
      <Card className="p-2 sm:p-4">
        <Table>
          <thead><tr><Th>Date</Th><Th>Type</Th><Th>Home</Th><Th className="text-right">Units</Th><Th className="text-right">Amount</Th><Th>Block</Th><Th>Transaction</Th></tr></thead>
          <tbody>
            {rows.map((t) => (
              <tr key={t.txId} className="hover:bg-surface">
                <Td className="tabular whitespace-nowrap text-xs">{dateTime(t.at)}</Td>
                <Td><span className={cn("rounded-full px-2 py-0.5 font-sans text-[11px] font-semibold", t.type === "REJECTED" || t.type === "FREEZE" ? "bg-risk text-risk-ink" : t.type === "WITHDRAWAL" ? "bg-demo text-demo-ink" : "bg-mint text-emerald")}>{TX_LABEL[t.type]}</span></Td>
                <Td>{name(t.spvId)}</Td>
                <Td className="tabular text-right">{t.units != null ? `${sign(t) > 0 ? "+" : "−"}${t.units.toLocaleString("en-IE")}` : "—"}</Td>
                <Td className="tabular text-right font-semibold">{t.amount != null ? eur(t.amount, 2) : "—"}</Td>
                <Td className="tabular">#{t.block}</Td>
                <Td><Link href={`/chain?tx=${t.txId}`} className="inline-flex min-h-8 items-center gap-1 font-mono text-xs text-forest hover:underline">{shortHash(t.txId, 8, 6)} <ArrowUpRight className="h-3 w-3" /></Link></Td>
              </tr>
            ))}
          </tbody>
        </Table>
        {!rows.length ? <p className="p-6 text-center text-sm text-muted">No transactions of this type.</p> : null}
      </Card>
      <p className="text-xs text-muted">Simulated ledger. Units: 1 unit = €1 of net invested or lent capital. No money has moved.</p>
    </div>
  );
}
