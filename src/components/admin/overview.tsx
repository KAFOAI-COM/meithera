"use client";

import Link from "next/link";
import { useState } from "react";
import { Presentation, RotateCcw, Anchor, CheckCircle2, XCircle, ShieldCheck, ArrowRight } from "lucide-react";
import { useDemo } from "@/lib/store";
import { useHydrated } from "@/components/site/hydrator";
import { verifyAudit } from "@/lib/data/seed";
import { verifyChain } from "@/lib/chain/raya";
import { raiseTarget, ECSPR } from "@/lib/finance";
import { eur, pct, dateTime } from "@/lib/utils";
import { Button, Card, Stat, buttonVariants } from "@/components/ui";
import { StageBadge } from "@/components/site/stage-badge";

export function AdminOverview() {
  const hydrated = useHydrated();
  const { properties, investors, investments, chain, audit, complaints, reset, anchor } = useDemo();
  const [arm, setArm] = useState(false);
  if (!hydrated) return <div className="h-96 animate-pulse rounded-2xl bg-mint/50" />;
  const live = investments.filter((i) => i.status !== "Withdrawn (reflection period)");
  const raised = live.reduce((s, i) => s + i.netInvested, 0);
  const target = properties.reduce((s, p) => s + raiseTarget(p), 0);
  const a = verifyAudit(audit);
  const c = verifyChain(chain);
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Raised (simulated)" value={eur(raised)} sub={`${pct(raised / target, 0)} of ${eur(target)} across ${properties.length} offers`} />
        <Stat label="Investors" value={investors.length} sub={`${investors.filter((i) => i.onboarding.kyc !== "Simulated — passed").length} pending onboarding`} />
        <Stat label="Raya Chain" value={`#${chain.blocks.length}`} sub={`${chain.txs.length} tx · ${chain.anchors.length} anchors`} />
        <Stat label="Open complaints" value={complaints.filter((x) => x.status !== "Resolved").length} sub={`${complaints.length} total`} />
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <Card className="p-5">
          <p className="flex items-center gap-2 font-sans text-sm font-semibold"><Presentation className="h-4 w-4 text-forest" /> Innovation Hub meeting</p>
          <p className="mt-1 text-sm text-muted">Full-vision deck, 12 slides, with deep links to the live journey, the explorer and the supervisor view. Keys: ← → · N notes · Esc exit.</p>
          <Link href="/presentation" className={buttonVariants({ size: "lg", className: "mt-4 w-full" })}><Presentation className="h-5 w-5" /> Launch Regulatory Presentation</Link>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Link href="/regulatory-demo" className={buttonVariants({ variant: "secondary" })}>Regulatory demo</Link>
            <Link href="/supervisor" className={buttonVariants({ variant: "secondary" })}>Supervisor view</Link>
          </div>
        </Card>
        <Card className="p-5">
          <p className="flex items-center gap-2 font-sans text-sm font-semibold"><ShieldCheck className="h-4 w-4 text-forest" /> Integrity</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li className="flex items-center gap-2">{a.ok ? <CheckCircle2 className="h-5 w-5 text-forest" /> : <XCircle className="h-5 w-5 text-risk-ink" />} Audit hash chain {a.ok ? `intact (${audit.length} events)` : `broken at ${a.brokenAt}`}</li>
            <li className="flex items-center gap-2">{c.ok ? <CheckCircle2 className="h-5 w-5 text-forest" /> : <XCircle className="h-5 w-5 text-risk-ink" />} Raya Chain {c.ok ? `verified (${c.blocksChecked} blocks)` : `${c.issues.length} issue(s)`}</li>
            <li className="flex items-center gap-2 text-muted">ECSPR cap usage: {pct(raised / ECSPR.offerCapEur, 2)} of €5m</li>
          </ul>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button variant="secondary" size="sm" onClick={anchor}><Anchor className="h-4 w-4" /> Anchor latest block</Button>
            {!arm ? <Button variant="secondary" size="sm" onClick={() => setArm(true)}><RotateCcw className="h-4 w-4" /> Reset demo…</Button> : <><Button variant="danger" size="sm" onClick={() => { reset(); setArm(false); }}>Confirm reset</Button><Button variant="ghost" size="sm" onClick={() => setArm(false)}>Cancel</Button></>}
          </div>
        </Card>
      </div>
      <Card className="p-5">
        <div className="flex items-center justify-between"><p className="font-sans text-sm font-semibold">Offers</p><Link href="/admin/properties" className="font-sans text-sm font-semibold text-forest">Manage <ArrowRight className="inline h-4 w-4" /></Link></div>
        <ul className="mt-3 divide-y divide-line text-sm">
          {properties.map((p) => (
            <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
              <span className="flex items-center gap-2"><StageBadge stage={p.offerType === "loan" ? 1 : 2} compact /> <span className="font-medium">{p.title}</span></span>
              <span className="tabular text-xs text-muted">{eur(raiseTarget(p) * p.fundedPct)} of {eur(raiseTarget(p))} · {Math.round(p.fundedPct * 100)}% · {p.status}</span>
            </li>
          ))}
        </ul>
      </Card>
      <Card className="p-5">
        <p className="font-sans text-sm font-semibold">Recent audit events</p>
        <ul className="mt-2 space-y-1 text-xs">
          {[...audit].reverse().slice(0, 8).map((e) => <li key={e.id} className="grid grid-cols-[90px_1fr] gap-2 border-b border-line py-1.5"><span className="font-mono text-muted">{e.id}</span><span><strong className="font-sans">{e.type}</strong> <span className="text-muted">· {dateTime(e.at)}</span><span className="block">{e.detail}</span></span></li>)}
        </ul>
      </Card>
    </div>
  );
}
