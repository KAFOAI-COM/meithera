"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, ShieldCheck, Download } from "lucide-react";
import { useDemo } from "@/lib/store";
import { useHydrated } from "@/components/site/hydrator";
import { verifyAudit } from "@/lib/data/seed";
import { verifyChain, type VerifyReport } from "@/lib/chain/raya";
import { downloadCsv } from "@/lib/export";
import { cn, dateTime } from "@/lib/utils";
import { Button, Card, Table, Th, Td } from "@/components/ui";
import { Hash } from "@/components/chain/tx-bits";
import { StageBadge } from "@/components/site/stage-badge";

export function AdminAudit() {
  const hydrated = useHydrated();
  const { audit, chain } = useDemo();
  const [a, setA] = useState<{ ok: boolean; brokenAt?: string } | null>(null);
  const [c, setC] = useState<VerifyReport | null>(null);
  const [filter, setFilter] = useState("all");
  if (!hydrated) return <div className="h-96 animate-pulse rounded-2xl bg-mint/50" />;
  const types = Array.from(new Set(audit.map((e) => e.type)));
  return (
    <div className="space-y-6">
      <Card className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><p className="flex items-center gap-2 font-sans text-base font-semibold"><ShieldCheck className="h-5 w-5 text-forest" /> Audit log</p><p className="text-xs text-muted">Append-only, hash-chained: each event’s hash covers the previous hash. Tampering with any event breaks every later link.</p></div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={() => { setA(verifyAudit(audit)); setC(verifyChain(chain)); }}>Verify audit + chain</Button>
            <Button size="sm" variant="secondary" onClick={() => downloadCsv("meithera-audit-log.csv", audit.map((e) => ({ ...e })))}><Download className="h-4 w-4" /> CSV</Button>
            <StageBadge stage={0} compact />
          </div>
        </div>
        {a ? <div className={cn("mt-3 flex items-center gap-2 rounded-xl p-3 text-sm", a.ok ? "bg-mint text-emerald" : "bg-risk text-risk-ink")}>{a.ok ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />} Audit chain {a.ok ? `intact — ${audit.length} events` : `broken at ${a.brokenAt}`}{c ? ` · Raya Chain ${c.ok ? `verified (${c.blocksChecked} blocks, ${c.txsChecked} tx)` : `${c.issues.length} issue(s)`}` : ""}</div> : null}
      </Card>
      <Card className="overflow-hidden">
        <div className="flex flex-wrap gap-2 p-4">
          {["all", ...types].map((t) => <button key={t} type="button" onClick={() => setFilter(t)} className={cn("min-h-9 rounded-full border px-3 font-sans text-xs font-semibold", filter === t ? "border-emerald bg-emerald text-white" : "border-line bg-card text-muted hover:bg-mint")}>{t === "all" ? "All" : t}</button>)}
        </div>
        <Table>
          <thead><tr><Th>Event</Th><Th>Type</Th><Th>Actor</Th><Th>Detail</Th><Th>When</Th><Th>Prev → hash</Th></tr></thead>
          <tbody>
            {[...audit].reverse().filter((e) => filter === "all" || e.type === filter).map((e) => (
              <tr key={e.id}>
                <Td className="font-mono text-xs">{e.id}</Td>
                <Td className="font-sans text-xs font-semibold">{e.type}</Td>
                <Td className="text-xs">{e.actor}</Td>
                <Td className="text-xs">{e.detail}</Td>
                <Td className="text-xs text-muted">{dateTime(e.at)}</Td>
                <Td className="whitespace-nowrap"><Hash value={e.prevHash} short={8} /> → <Hash value={e.hash} short={8} /></Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
    </div>
  );
}
