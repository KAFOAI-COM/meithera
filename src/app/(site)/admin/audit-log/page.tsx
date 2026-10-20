"use client";

import Link from "next/link";
import { useState } from "react";
import { AlertOctagon, CheckCircle2, Gavel, Snowflake } from "lucide-react";
import type { ChainTx } from "@/lib/types";
import { useDemo } from "@/lib/store";
import { verifyAudit } from "@/lib/audit";
import { capTable } from "@/lib/chain/raya";
import { pseudonym } from "@/lib/ledger";
import { cn, dateTime, shortHash } from "@/lib/utils";
import { Button, Card, Input, Label, Select, Table, Td, Th } from "@/components/ui";

const FREEZE_REASONS = ["AML_REVIEW", "SANCTIONS_HIT", "COURT_ORDER", "DECEASED_HOLDER"];
const CORRECTION_REASONS = ["COURT_ORDER", "PROBATE", "ERROR_CORRECTION"];

function ControlResult({ tx }: { tx: ChainTx | null }) {
  if (!tx) return null;
  return (
    <p className="mt-3 rounded-lg bg-mint/50 px-3 py-2 text-xs text-emerald" role="status">
      Recorded on Raya Chain: {tx.type} · {tx.reason} · <Link href={`/chain?tx=${tx.txId}`} className="font-mono underline">{shortHash(tx.txId)}</Link> in block #{tx.block}
    </p>
  );
}

export default function AdminAuditLog() {
  const audit = useDemo((s) => s.audit);
  const properties = useDemo((s) => s.properties);
  const investors = useDemo((s) => s.investors);
  const txs = useDemo((s) => s.chain.txs);
  const freeze = useDemo((s) => s.freezeHolding);
  const correct = useDemo((s) => s.correctHolding);
  const [check, setCheck] = useState<ReturnType<typeof verifyAudit> | null>(null);
  const [spv, setSpv] = useState(properties[0].spvId);
  const holders = capTable(txs, spv);
  const holderInvestors = investors.filter((i) => holders.some((h) => h.holder === pseudonym(i.id)));
  const [fHolder, setFHolder] = useState("");
  const [fReason, setFReason] = useState(FREEZE_REASONS[0]);
  const [cFrom, setCFrom] = useState("");
  const [cTo, setCTo] = useState(investors[0].id);
  const [cUnits, setCUnits] = useState("100");
  const [cReason, setCReason] = useState(CORRECTION_REASONS[0]);
  const [last, setLast] = useState<ChainTx | null>(null);
  const fId = holderInvestors.some((i) => i.id === fHolder) ? fHolder : holderInvestors[0]?.id;
  const cId = holderInvestors.some((i) => i.id === cFrom) ? cFrom : holderInvestors[0]?.id;
  const toId = cTo !== cId ? cTo : investors.find((i) => i.id !== cId)!.id;
  const maxUnits = holders.find((h) => h.holder === (cId ? pseudonym(cId) : ""))?.units ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-serif text-3xl text-ink">Audit log</h2>
          <p className="mt-1 text-sm text-muted">Every material action, hash-chained: each event’s hash covers the one before, so any edit breaks the chain.</p>
        </div>
        <Button variant="secondary" onClick={() => setCheck(verifyAudit(audit))}>Verify audit chain</Button>
      </div>
      {check ? (
        <p className={cn("flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium", check.ok ? "bg-mint text-emerald" : "bg-risk text-risk-ink")} role="status">
          {check.ok ? <CheckCircle2 className="h-4 w-4" /> : <AlertOctagon className="h-4 w-4" />} {check.ok ? `All ${check.checked} events verified — the log is intact.` : `Broken at event ${check.brokenAt}.`}
        </p>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h3 className="flex items-center gap-2 font-sans text-base font-semibold text-ink"><Snowflake className="h-4 w-4 text-forest" /> Freeze a holding</h3>
          <p className="mt-1 text-xs text-muted">Blocks transfers and payouts for a holder pending review. Recorded with a reason code.</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="space-y-1"><Label htmlFor="a-spv" className="text-xs">Company</Label><Select id="a-spv" className="h-10" value={spv} onChange={(e) => setSpv(e.target.value)}>{properties.map((p) => <option key={p.spvId} value={p.spvId}>{p.location}</option>)}</Select></div>
            <div className="space-y-1"><Label htmlFor="a-fh" className="text-xs">Holder</Label><Select id="a-fh" className="h-10 font-mono text-xs" value={fId ?? ""} onChange={(e) => setFHolder(e.target.value)}>{holderInvestors.map((i) => <option key={i.id} value={i.id}>{pseudonym(i.id)}</option>)}</Select></div>
            <div className="space-y-1"><Label htmlFor="a-fr" className="text-xs">Reason</Label><Select id="a-fr" className="h-10 text-xs" value={fReason} onChange={(e) => setFReason(e.target.value)}>{FREEZE_REASONS.map((r) => <option key={r}>{r}</option>)}</Select></div>
          </div>
          <Button className="mt-4" size="sm" disabled={!fId} onClick={() => fId && setLast(freeze(spv, fId, fReason))}>Freeze holding</Button>
        </Card>
        <Card className="p-6">
          <h3 className="flex items-center gap-2 font-sans text-base font-semibold text-ink"><Gavel className="h-4 w-4 text-forest" /> Court-ordered correction</h3>
          <p className="mt-1 text-xs text-muted">Moves units by order (e.g. probate or a court ruling) without the holder’s key — the record of why stays on the chain.</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="space-y-1"><Label htmlFor="a-cf" className="text-xs">From (in {properties.find((p) => p.spvId === spv)?.location})</Label><Select id="a-cf" className="h-10 font-mono text-xs" value={cId ?? ""} onChange={(e) => setCFrom(e.target.value)}>{holderInvestors.map((i) => <option key={i.id} value={i.id}>{pseudonym(i.id)}</option>)}</Select></div>
            <div className="space-y-1"><Label htmlFor="a-ct" className="text-xs">To</Label><Select id="a-ct" className="h-10 font-mono text-xs" value={toId} onChange={(e) => setCTo(e.target.value)}>{investors.filter((i) => i.id !== cId).map((i) => <option key={i.id} value={i.id}>{pseudonym(i.id)}</option>)}</Select></div>
            <div className="space-y-1"><Label htmlFor="a-cu" className="text-xs">Units (max {maxUnits})</Label><Input id="a-cu" inputMode="numeric" className="h-10" value={cUnits} onChange={(e) => setCUnits(e.target.value.replace(/[^\d]/g, ""))} /></div>
            <div className="space-y-1"><Label htmlFor="a-cr" className="text-xs">Reason</Label><Select id="a-cr" className="h-10 text-xs" value={cReason} onChange={(e) => setCReason(e.target.value)}>{CORRECTION_REASONS.map((r) => <option key={r}>{r}</option>)}</Select></div>
          </div>
          <Button className="mt-4" size="sm" disabled={!cId || !Number(cUnits) || Number(cUnits) > maxUnits} onClick={() => cId && setLast(correct(spv, cId, toId, Number(cUnits), cReason))}>Record correction</Button>
        </Card>
      </div>
      <ControlResult tx={last} />

      <Card className="p-2 sm:p-4">
        <Table>
          <thead><tr><Th>Event</Th><Th>Type</Th><Th>Actor</Th><Th>Detail</Th><Th>Prev hash → hash</Th></tr></thead>
          <tbody>
            {[...audit].reverse().map((e) => (
              <tr key={e.id}>
                <Td className="text-xs"><span className="font-mono">{e.id}</span><span className="block whitespace-nowrap text-muted">{dateTime(e.at)}</span></Td>
                <Td className="text-[11px] font-semibold">{e.type}</Td>
                <Td className="whitespace-nowrap font-mono text-xs">{e.actor}</Td>
                <Td className="text-xs text-muted">{e.detail}</Td>
                <Td className="whitespace-nowrap font-mono text-[11px] text-muted">{e.prevHash} → <span className="text-ink">{e.hash}</span></Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
    </div>
  );
}
