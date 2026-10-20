"use client";

import Link from "next/link";
import { useState } from "react";
import { CheckCircle2, Eye, Presentation, RotateCcw } from "lucide-react";
import { useDemo } from "@/lib/store";
import { verifyChain } from "@/lib/chain/raya";
import { verifyAudit } from "@/lib/audit";
import { offerSize } from "@/lib/finance";
import { dateTime, eur } from "@/lib/utils";
import { Button, Card, buttonVariants } from "@/components/ui";

export default function AdminOverview() {
  const properties = useDemo((s) => s.properties);
  const investors = useDemo((s) => s.investors);
  const investments = useDemo((s) => s.investments);
  const distributions = useDemo((s) => s.distributions);
  const audit = useDemo((s) => s.audit);
  const chain = useDemo((s) => s.chain);
  const reset = useDemo((s) => s.reset);
  const [didReset, setDidReset] = useState(false);
  const raised = properties.reduce((s, p) => s + p.fundedPct * offerSize(p), 0);
  const paid = distributions.reduce((s, d) => s + d.distributable, 0);
  const pending = investors.filter((i) => i.onboarding.kyc !== "Simulated — passed").length;
  const ok = verifyChain(chain).ok && verifyAudit(audit).ok;

  return (
    <div className="space-y-6">
      <Card className="flex flex-wrap items-center justify-between gap-5 bg-emerald p-6 text-white">
        <div>
          <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-gold">Central Bank Innovation Hub · 27 Oct 2026</p>
          <p className="mt-1 font-serif text-2xl">Launch the regulatory presentation</p>
          <p className="mt-1 text-sm text-white/60">Full screen, 12 slides, ←/→ to move, N for speaker notes.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/presentation" className={buttonVariants({ variant: "gold", size: "lg" })}><Presentation className="h-4 w-4" /> Launch Regulatory Presentation</Link>
          <Link href="/supervisor" className={buttonVariants({ variant: "inverse", size: "lg" })}><Eye className="h-4 w-4" /> Supervisor view</Link>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {[
          ["Homes", String(properties.length), `${properties.filter((p) => p.status === "open").length} open (simulated)`],
          ["Raised (simulated)", eur(raised), `${investments.filter((i) => i.status !== "Withdrawn").length} itemised holdings`],
          ["Paid out (simulated)", eur(paid, 2), `${distributions.length} distribution runs`],
          ["Onboarding to review", String(pending), `${investors.length} fictional investors`],
        ].map(([k, v, s]) => (
          <div key={k} className="rounded-2xl border border-line bg-card p-5">
            <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.1em] text-muted">{k}</p>
            <p className="tabular mt-2 font-serif text-3xl leading-none text-ink">{v}</p>
            <p className="mt-2 text-xs text-muted">{s}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <Card className="p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-sans text-base font-semibold text-ink">Recent audit events</h2>
            <Link href="/admin/audit-log" className="font-sans text-sm font-semibold text-forest hover:underline">Full log</Link>
          </div>
          <ul className="mt-3 divide-y divide-line">
            {[...audit].reverse().slice(0, 7).map((e) => (
              <li key={e.id} className="py-2.5 text-sm">
                <p className="flex flex-wrap items-baseline justify-between gap-2"><span className="font-sans text-xs font-semibold text-ink">{e.type.replace(/_/g, " ").toLowerCase()}</span><span className="tabular text-[11px] text-muted">{dateTime(e.at)}</span></p>
                <p className="mt-0.5 text-xs text-muted">{e.detail}</p>
              </li>
            ))}
          </ul>
        </Card>
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="font-sans text-base font-semibold text-ink">Integrity</h2>
            <p className={`mt-3 flex items-center gap-2 text-sm font-semibold ${ok ? "text-forest" : "text-risk-ink"}`}><CheckCircle2 className="h-4 w-4" /> {ok ? "Raya Chain and audit log verified" : "Integrity check failed"}</p>
            <p className="mt-1 text-xs text-muted">{chain.blocks.length} blocks · {audit.length} audit events</p>
          </Card>
          <Card className="p-6">
            <h2 className="font-sans text-base font-semibold text-ink">Reset demo</h2>
            <p className="mt-2 text-sm text-muted">Restore every property, holding, payout and block to the starting state before a walkthrough.</p>
            <Button variant="danger" className="mt-4" onClick={() => { reset(); setDidReset(true); }}><RotateCcw className="h-4 w-4" /> Reset demo</Button>
            {didReset ? <p className="mt-2 text-sm font-medium text-forest">Demo reset.</p> : null}
          </Card>
        </div>
      </div>
    </div>
  );
}
