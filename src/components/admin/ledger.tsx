"use client";

import { useState } from "react";
import { Snowflake, Wrench, Sun, ArrowRightLeft } from "lucide-react";
import { useDemo } from "@/lib/store";
import { useHydrated } from "@/components/site/hydrator";
import { REASON_CODES, holdings, type ChainTx } from "@/lib/chain/raya";
import { Button, Card, Input, Label, Select, Badge } from "@/components/ui";
import { StageBadge } from "@/components/site/stage-badge";
import { TxTypeBadge } from "@/components/chain/tx-bits";
import { cn } from "@/lib/utils";

export function AdminLedger() {
  const hydrated = useHydrated();
  const { chain, properties, freezeHolding, unfreezeHolding, correctHolding, attemptTransfer } = useDemo();
  const [holder, setHolder] = useState("");
  const [pid, setPid] = useState("prop-d8");
  const [reason, setReason] = useState("AML_REVIEW");
  const [to, setTo] = useState("");
  const [units, setUnits] = useState(100);
  const [orderRef, setOrderRef] = useState("ORDER-2026-001");
  const [last, setLast] = useState<ChainTx | null>(null);
  if (!hydrated) return <div className="h-96 animate-pulse rounded-2xl bg-mint/50" />;
  const investorWallets = chain.wallets.filter((w) => w.kind === "investor" || w.kind === "tenant");
  const from = holder || investorWallets[0]?.id;
  const target = to || investorWallets.find((w) => w.id !== from)?.id || "";
  const held = holdings(chain).filter((h) => h.holder === from);
  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <div className="flex items-center justify-between"><p className="flex items-center gap-2 font-sans text-base font-semibold"><Snowflake className="h-5 w-5 text-forest" /> Freeze a holding</p><StageBadge stage={2} compact /></div>
          <p className="mt-1 text-sm text-muted">Freezing requires a reason code and an authorised operator. A FREEZE transaction is written; payouts and transfers for the holder are blocked until lifted.</p>
          <div className="mt-4 grid gap-3">
            <div className="space-y-1"><Label htmlFor="fz-holder">Holder</Label><Select id="fz-holder" value={from} onChange={(e) => setHolder(e.target.value)}>{investorWallets.map((w) => <option key={w.id} value={w.id}>{w.id} — {w.label}{w.frozen ? " (frozen)" : ""}</option>)}</Select></div>
            <div className="space-y-1"><Label htmlFor="fz-prop">Home</Label><Select id="fz-prop" value={pid} onChange={(e) => setPid(e.target.value)}>{properties.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}</Select></div>
            <div className="space-y-1"><Label htmlFor="fz-reason">Reason code</Label><Select id="fz-reason" value={reason} onChange={(e) => setReason(e.target.value)}>{["AML_REVIEW", "COURT_ORDER", "LOST_KEY", "SANCTIONS_HIT"].map((r) => <option key={r} value={r}>{r} — {REASON_CODES[r]}</option>)}</Select></div>
            <div className="flex gap-2">
              <Button onClick={() => setLast(freezeHolding(from, pid, reason))}><Snowflake className="h-4 w-4" /> Freeze</Button>
              <Button variant="secondary" onClick={() => { unfreezeHolding(from); setLast(null); }}><Sun className="h-4 w-4" /> Lift freeze</Button>
            </div>
          </div>
          <p className="mt-3 text-xs text-muted">Holdings of {from}: {held.length ? held.map((h) => `${properties.find((p) => p.id === h.propertyId)?.location} ${h.units}`).join(" · ") : "none"}</p>
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between"><p className="flex items-center gap-2 font-sans text-base font-semibold"><Wrench className="h-5 w-5 text-forest" /> Court-ordered correction</p><StageBadge stage={2} compact /></div>
          <p className="mt-1 text-sm text-muted">Moves units between holders under an order reference. Requires a reason code and dual approval (simulated). The original transactions remain; the correction is a new one.</p>
          <div className="mt-4 grid gap-3">
            <div className="space-y-1"><Label htmlFor="cr-to">To holder</Label><Select id="cr-to" value={target} onChange={(e) => setTo(e.target.value)}>{chain.wallets.filter((w) => w.id !== from).map((w) => <option key={w.id} value={w.id}>{w.id} — {w.label}</option>)}</Select></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><Label htmlFor="cr-units">Units</Label><Input id="cr-units" type="number" min={1} value={units} onChange={(e) => setUnits(Math.max(1, Number(e.target.value) || 1))} /></div>
              <div className="space-y-1"><Label htmlFor="cr-ref">Order reference</Label><Input id="cr-ref" value={orderRef} onChange={(e) => setOrderRef(e.target.value)} /></div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => setLast(correctHolding(from, target, pid, units, "COURT_ORDER_CORRECTION", orderRef))}><Wrench className="h-4 w-4" /> Apply correction</Button>
              <Button variant="secondary" onClick={() => setLast(attemptTransfer(from, target, pid, units))}><ArrowRightLeft className="h-4 w-4" /> Try as ordinary transfer</Button>
            </div>
          </div>
        </Card>
      </div>
      {last ? (
        <Card className={cn("p-5", last.status === "rejected" ? "border-risk-ink/40" : "border-forest/40")}>
          <p className="flex flex-wrap items-center gap-2 font-sans text-sm font-semibold"><TxTypeBadge type={last.type} status={last.status} /> {last.id} <Badge tone="neutral">{last.reasonCode ?? "—"}</Badge></p>
          <p className="mt-1 text-sm">{last.memo}</p>
          <p className="mt-1 text-xs text-muted">Rule: {last.rule}</p>
        </Card>
      ) : null}
      <Card className="p-5">
        <p className="font-sans text-sm font-semibold">Wallet allowlist</p>
        <ul className="mt-2 divide-y divide-line text-sm">{chain.wallets.map((w) => <li key={w.id} className="flex flex-wrap items-center justify-between gap-2 py-2"><span><code className="font-mono text-xs">{w.id}</code> <span className="text-xs text-muted">{w.label}</span></span><span className="flex gap-1">{w.verified ? <Badge tone="mint">verified</Badge> : <Badge tone="risk">not verified</Badge>}{w.frozen ? <Badge tone="gold">frozen · {w.frozenReason}</Badge> : null}</span></li>)}</ul>
      </Card>
    </div>
  );
}
