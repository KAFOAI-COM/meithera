"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight, Megaphone, Undo2, Vote, Zap } from "lucide-react";
import type { OfferType, VoteChoice } from "@/lib/types";
import { useInvestor } from "@/components/dashboard/investor-context";
import { inReflection, REFLECTION_DAYS, useDemo } from "@/lib/store";
import { offerLabel, offerStage } from "@/lib/stages";
import { monthLabel } from "@/lib/portfolio";
import { cn, eur, pct, shortDate, shortHash } from "@/lib/utils";
import { Button, Card, Input, Label } from "@/components/ui";
import { StageBadge } from "@/components/site/stage-badge";

function VoteBox({ investorId, propertyId, years }: { investorId: string; propertyId: string; years: number }) {
  const votes = useDemo((s) => s.votes);
  const cast = useDemo((s) => s.castVote);
  const mine = votes[`${investorId}:${propertyId}`];
  return (
    <div className="rounded-xl border border-line bg-surface p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="flex items-center gap-2 font-sans text-sm font-semibold text-ink"><Vote className="h-4 w-4 text-forest" /> Exit-window vote</p>
        <StageBadge stage={2} />
      </div>
      <p className="mt-1.5 text-xs leading-relaxed text-muted">Should the company sell the home at the end of the {years}-year holding period? Proposed: one note, one vote; a majority decides. Simulated.</p>
      <div className="mt-3 flex flex-wrap gap-2" role="radiogroup" aria-label="Exit vote">
        {(["for", "against", "abstain"] as VoteChoice[]).map((c) => (
          <button key={c} type="button" role="radio" aria-checked={mine === c} onClick={() => cast(investorId, propertyId, c)} className={cn("min-h-9 rounded-full border px-3.5 font-sans text-xs font-semibold capitalize", mine === c ? "border-emerald bg-emerald text-white" : "border-line-strong/50 text-muted hover:border-emerald hover:text-emerald")}>
            {c === "for" ? "Sell" : c === "against" ? "Keep" : "Abstain"}
          </button>
        ))}
      </div>
      {mine ? <p className="mt-2 text-xs font-medium text-forest">Your vote is recorded in the audit log (simulated).</p> : null}
    </div>
  );
}

function BulletinBox({ investorId, propertyId, maxUnits }: { investorId: string; propertyId: string; maxUnits: number }) {
  const posts = useDemo((s) => s.bulletin).filter((b) => b.propertyId === propertyId);
  const post = useDemo((s) => s.postToBulletin);
  const [units, setUnits] = useState(String(Math.min(250, maxUnits)));
  const [ask, setAsk] = useState("1.00");
  const u = Math.min(maxUnits, Math.max(1, Math.round(Number(units) || 0)));
  const a = Math.max(0.5, Math.min(1.5, Number(ask) || 1));
  return (
    <div className="rounded-xl border border-line bg-surface p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="flex items-center gap-2 font-sans text-sm font-semibold text-ink"><Megaphone className="h-4 w-4 text-forest" /> ECSPR bulletin board</p>
        <StageBadge stage={2} />
      </div>
      <p className="mt-1.5 text-xs leading-relaxed text-muted">Post interest to sell. Other investors can see it; there is <strong>no order matching</strong> and no guarantee of a buyer.</p>
      <div className="mt-3 flex flex-wrap items-end gap-2">
        <div><Label htmlFor={`u-${propertyId}`} className="text-xs">Units</Label><Input id={`u-${propertyId}`} inputMode="numeric" value={units} onChange={(e) => setUnits(e.target.value.replace(/[^\d]/g, ""))} className="mt-1 h-10 w-24" /></div>
        <div><Label htmlFor={`a-${propertyId}`} className="text-xs">Ask € / unit</Label><Input id={`a-${propertyId}`} inputMode="decimal" value={ask} onChange={(e) => setAsk(e.target.value.replace(/[^\d.]/g, ""))} className="mt-1 h-10 w-24" /></div>
        <Button size="sm" className="h-10" onClick={() => post(investorId, propertyId, u, a)}>Post interest</Button>
      </div>
      {posts.length ? (
        <ul className="mt-3 space-y-1.5 border-t border-line pt-3 text-xs">
          {posts.slice(0, 3).map((p) => (
            <li key={p.id} className="flex justify-between gap-3"><span className="text-muted">{p.investorId === investorId ? "You" : "An investor"} · {shortDate(p.at)}</span><span className="tabular font-semibold text-ink">{p.units} units @ {eur(p.askPerUnit, 2)}</span></li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function AutoInvest() {
  const rules = useDemo((s) => s.autoInvest);
  const save = useDemo((s) => s.setAutoInvest);
  const [draft, setDraft] = useState(rules);
  const toggleType = (t: OfferType) => setDraft({ ...draft, offerTypes: draft.offerTypes.includes(t) ? draft.offerTypes.filter((x) => x !== t) : [...draft.offerTypes, t] });
  const dirty = JSON.stringify(draft) !== JSON.stringify(rules);
  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 font-sans text-base font-semibold text-ink"><Zap className="h-4 w-4 text-gold-ink" /> AutoInvest rules</h2>
          <p className="mt-1 text-xs text-muted">Simulated. Rules are saved for the demo only; nothing executes automatically, and each offer would still need your confirmation.</p>
        </div>
        <label className="inline-flex cursor-pointer items-center gap-3 font-sans text-sm font-semibold">
          <span>{draft.enabled ? "On" : "Off"}</span>
          <button type="button" role="switch" aria-checked={draft.enabled} onClick={() => setDraft({ ...draft, enabled: !draft.enabled })} className={cn("relative h-7 w-12 rounded-full transition-colors", draft.enabled ? "bg-forest" : "bg-line-strong/50")}>
            <span className={cn("absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-transform", draft.enabled ? "translate-x-6" : "translate-x-1")} />
          </button>
        </label>
      </div>
      <div className={cn("mt-5 grid gap-5 sm:grid-cols-3", !draft.enabled && "opacity-60")}>
        <fieldset>
          <legend className="font-sans text-xs font-semibold text-ink">Offer types</legend>
          <div className="mt-2 space-y-2">
            {(["loan", "rent-share"] as OfferType[]).map((t) => (
              <label key={t} className="flex items-center gap-2 text-sm"><input type="checkbox" checked={draft.offerTypes.includes(t)} onChange={() => toggleType(t)} className="h-4 w-4 accent-[#063f36]" disabled={!draft.enabled} /> {offerLabel({ offerType: t })}</label>
            ))}
          </div>
        </fieldset>
        <div>
          <Label htmlFor="ai-max" className="text-xs">Max per offer: <span className="tabular">{eur(draft.maxPerOffer)}</span></Label>
          <input id="ai-max" type="range" min={100} max={2500} step={50} value={draft.maxPerOffer} disabled={!draft.enabled} onChange={(e) => setDraft({ ...draft, maxPerOffer: Number(e.target.value) })} className="mt-3 w-full accent-[#063f36]" />
        </div>
        <div>
          <Label htmlFor="ai-budget" className="text-xs">Monthly budget: <span className="tabular">{eur(draft.monthlyBudget)}</span></Label>
          <input id="ai-budget" type="range" min={100} max={5000} step={100} value={draft.monthlyBudget} disabled={!draft.enabled} onChange={(e) => setDraft({ ...draft, monthlyBudget: Number(e.target.value) })} className="mt-3 w-full accent-[#063f36]" />
        </div>
      </div>
      <div className="mt-5 flex items-center gap-3">
        <Button size="sm" disabled={!dirty} onClick={() => save(draft)}>Save rules</Button>
        {!dirty && rules.enabled ? <span className="text-xs font-medium text-forest">Saved — would suggest up to {Math.floor(rules.monthlyBudget / rules.maxPerOffer)} offers a month.</span> : null}
      </div>
    </Card>
  );
}

export default function PortfolioPage() {
  const d = useInvestor();
  const withdraw = useDemo((s) => s.withdrawInvestment);
  const withdrawn = d.allInvestments.filter((i) => i.status === "Withdrawn");
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-serif text-3xl text-ink">Your holdings</h2>
          <p className="mt-1 text-sm text-muted">{d.holdings.length} simulated holding{d.holdings.length === 1 ? "" : "s"} · {eur(d.committed)} committed · {eur(d.monthlyNow, 2)} projected per month after fees</p>
        </div>
      </div>
      {d.holdings.map((h) => {
        const isLoan = h.property.offerType === "loan";
        const reflecting = inReflection(h.sim);
        return (
          <Card key={h.sim.id} className="overflow-hidden">
            <div className="grid md:grid-cols-[220px_1fr]">
              <div className="relative min-h-40">
                <Image src={h.property.images[0]} alt="" fill sizes="220px" className="object-cover" />
                <span className={cn("absolute left-3 top-3 rounded-full px-2.5 py-1 font-sans text-[11px] font-semibold backdrop-blur", isLoan ? "bg-white/90 text-emerald" : "bg-emerald/80 text-white")}>{offerLabel(h.property)}</span>
              </div>
              <div className="p-5 sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <Link href={`/properties/${h.property.slug}`} className="font-serif text-2xl text-ink hover:text-forest">{h.property.title}</Link>
                    <p className="mt-1 text-xs text-muted">{h.sim.id} · since {shortDate(h.sim.createdAt)} · {h.sim.status === "Seed" ? "seed holding" : "simulated by you"}</p>
                  </div>
                  <StageBadge stage={offerStage(h.property)} />
                </div>
                <dl className="tabular mt-5 grid grid-cols-2 gap-4 text-sm sm:grid-cols-5">
                  {[["Amount", eur(h.sim.amount)], ["Net", eur(h.sim.netInvested, 2)], [isLoan ? "Facility share" : "Participation", pct(h.sim.participation, 4)], ["Net / month", eur(h.monthlyNet, 2)], ["Received", eur(h.received, 2)]].map(([k, v]) => (
                    <div key={k}><dt className="text-[11px] uppercase tracking-wide text-muted">{k}</dt><dd className="mt-0.5 font-sans font-semibold text-ink">{v}</dd></div>
                  ))}
                </dl>
                <p className="mt-3 text-xs text-muted">
                  {isLoan ? `Interest from ${monthLabel(h.incomeStarts, true)} for ${h.property.loan?.months} months; principal at maturity.` : `Rent distributions modelled from ${monthLabel(h.incomeStarts, true)}, after the tenancy begins.`}
                  {h.sim.txId ? <> · <Link href={`/chain?tx=${h.sim.txId}`} className="inline-flex items-center gap-0.5 font-mono text-forest hover:underline">{shortHash(h.sim.txId)}<ArrowUpRight className="h-3 w-3" /></Link></> : null}
                </p>
                {reflecting ? (
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-mint/60 p-4 text-sm text-emerald">
                    <span>Within the {REFLECTION_DAYS}-day reflection period — you can withdraw without penalty.</span>
                    <Button size="sm" variant="secondary" onClick={() => withdraw(h.sim.id)}><Undo2 className="h-4 w-4" /> Withdraw</Button>
                  </div>
                ) : null}
                {!isLoan ? (
                  <div className="mt-4 grid gap-3 lg:grid-cols-2">
                    <VoteBox investorId={d.investorId} propertyId={h.property.id} years={h.property.holdingYears} />
                    <BulletinBox investorId={d.investorId} propertyId={h.property.id} maxUnits={Math.round(h.sim.netInvested)} />
                  </div>
                ) : null}
              </div>
            </div>
          </Card>
        );
      })}
      {withdrawn.length ? (
        <p className="text-xs text-muted">Withdrawn in the reflection period: {withdrawn.map((w) => `${w.id} (${eur(w.amount)})`).join(", ")} — recorded on Raya Chain as WITHDRAWAL.</p>
      ) : null}
      <AutoInvest />
    </div>
  );
}
