"use client";

import Link from "next/link";
import { useHydrated } from "@/components/site/hydrator";
import { useDemo } from "@/lib/store";
import { pseudonym } from "@/lib/ledger";
import { Card, Table, Th, Td, Badge } from "@/components/ui";
import { dateTime, eur } from "@/lib/utils";
import { TxLink, TxTypeBadge } from "@/components/chain/tx-bits";
import { StageBadge } from "@/components/site/stage-badge";

export function Transactions({ userId }: { userId: string }) {
  const hydrated = useHydrated();
  const { chain, properties, investments } = useDemo();
  if (!hydrated) return <div className="h-96 animate-pulse rounded-2xl bg-mint/50" />;
  const me = pseudonym(userId);
  const mine = [...chain.txs].reverse().filter((t) => t.to === me || t.from === me);
  const inv = (ref?: string) => investments.find((i) => i.id === ref);
  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-2 p-5 pb-2">
          <div><p className="font-sans text-sm font-semibold">Ledger</p><p className="text-xs text-muted">Every simulated investment, payout and correction touching your holder ID <code className="font-mono">{me}</code>, linked to Raya Chain.</p></div>
          <StageBadge stage={2} compact />
        </div>
        <Table>
          <thead><tr><Th>When</Th><Th>Type</Th><Th>Home</Th><Th>Detail</Th><Th className="text-right">Units</Th><Th className="text-right">Amount</Th><Th>Raya Chain</Th></tr></thead>
          <tbody>
            {mine.map((t) => (
              <tr key={t.id}>
                <Td className="text-xs text-muted">{dateTime(t.at)}</Td>
                <Td><TxTypeBadge type={t.type} status={t.status} /></Td>
                <Td>{properties.find((p) => p.id === t.propertyId)?.location ?? "—"}</Td>
                <Td className="text-xs">{t.memo}{inv(t.ref) ? <span className="block text-muted">{t.ref} · {inv(t.ref)!.status}</span> : null}</Td>
                <Td className="tabular text-right">{t.units ? (t.to === me ? "+" : "−") + t.units.toLocaleString("en-IE") : "—"}</Td>
                <Td className="tabular text-right font-medium">{t.amountEur ? eur(t.amountEur, 2) : "—"}</Td>
                <Td><TxLink id={t.id} /></Td>
              </tr>
            ))}
            {!mine.length ? <tr><Td colSpan={7} className="text-center text-muted">No transactions yet.</Td></tr> : null}
          </tbody>
        </Table>
      </Card>
      <div className="flex flex-wrap items-center gap-3 text-xs text-muted">
        <Badge tone="neutral">1 unit = €1 net invested or lent</Badge>
        <span>Amounts are simulated; no money moved.</span>
        <Link href="/chain" className="font-semibold text-forest">Open the explorer →</Link>
      </div>
    </div>
  );
}
