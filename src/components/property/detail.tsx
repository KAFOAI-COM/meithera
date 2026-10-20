"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, MapPin, BedDouble, Calendar, Shield, FileText, ScrollText, Link2, CheckCircle2, Circle, Home, Hammer, Zap, Users, Coins, KeyRound, Banknote, Landmark } from "lucide-react";
import { useDemo } from "@/lib/store";
import { useHydrated } from "@/components/site/hydrator";
import { FEES, grossYield, illustrate, loanToValue, netOperatingYield, noi, raiseTarget, totalCost } from "@/lib/finance";
import { seedSpvs } from "@/lib/data/seed";
import type { PassportKind } from "@/lib/types";
import { cn, eur, pct, shortDate } from "@/lib/utils";
import { Badge, Card, Input, Label, Progress, buttonVariants } from "@/components/ui";
import { Tabs } from "@/components/ui/tabs";
import { PropertyArt } from "@/components/site/property-art";
import { IrelandMap } from "@/components/site/ireland-map";
import { StageBadge } from "@/components/site/stage-badge";
import { IllustrativeNotice, RiskNotice } from "@/components/site/notices";
import { statusMeta } from "@/components/site/property-card";
import { IllustrationPanel } from "@/components/invest/illustration-panel";
import { KiisCard, LOAN_RISK_FACTORS, RISK_FACTORS } from "@/components/invest/kiis-card";
import { TxLink } from "@/components/chain/tx-bits";

type Tab = "overview" | "financials" | "investment" | "risks" | "passport";
const TABS: { id: Tab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "financials", label: "Financials" },
  { id: "investment", label: "Investment" },
  { id: "risks", label: "Risks" },
  { id: "passport", label: "Home passport" },
];
const VARIANTS = ["facade", "street", "interior", "plan"] as const;
const PASSPORT_ICON: Record<PassportKind, typeof Home> = { vacancy: Home, acquisition: KeyRound, works: Hammer, ber: Zap, tenancy: Users, funding: Coins, payout: Banknote, loan: Landmark };

export function PropertyDetail({ slug, initialTab }: { slug: string; initialTab?: string }) {
  const hydrated = useHydrated();
  const { properties, investments, chain } = useDemo();
  const p = properties.find((x) => x.slug === slug);
  const [tab, setTab] = useState<Tab>(TABS.some((t) => t.id === initialTab) ? (initialTab as Tab) : "overview");
  const [variant, setVariant] = useState<(typeof VARIANTS)[number]>("facade");
  const [amount, setAmount] = useState(1000);
  const funders = useMemo(() => (p ? new Set(investments.filter((i) => i.propertyId === p.id && i.status !== "Withdrawn (reflection period)").map((i) => i.investorId)).size : 0), [p, investments]);
  const payouts = useMemo(() => (p ? chain.txs.filter((t) => t.propertyId === p.id && (t.type === "DISTRIBUTION" || t.type === "REPAYMENT") && t.status === "confirmed") : []), [p, chain.txs]);

  if (!hydrated) return <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6"><div className="h-[480px] animate-pulse rounded-2xl bg-mint/50" /></div>;
  if (!p)
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
        <h1 className="font-serif text-4xl">Home not found</h1>
        <p className="mt-3 text-muted">This illustrative property does not exist in the demonstration.</p>
        <Link href="/properties" className={buttonVariants({ className: "mt-6" })}>Back to homes</Link>
      </div>
    );

  const isLoan = p.offerType === "loan" && !!p.loan;
  const spv = seedSpvs.find((s) => s.propertyId === p.id);
  const stage = isLoan ? 1 : 2;
  const kind = p.type.includes("apartment") ? "apartment" : "terrace";
  const s = statusMeta[p.status];

  return (
    <>
      <section className="border-b border-line bg-card">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <div className="overflow-hidden rounded-3xl shadow-raised"><div className="aspect-[16/10]"><PropertyArt palette={p.palette} kind={kind} variant={variant} label={`Illustration of ${p.title} — ${variant}`} /></div></div>
            <div className="mt-3 grid grid-cols-4 gap-2" role="tablist" aria-label="Gallery">
              {VARIANTS.map((v) => (
                <button key={v} type="button" role="tab" aria-selected={variant === v} onClick={() => setVariant(v)} className={cn("overflow-hidden rounded-xl border-2", variant === v ? "border-emerald" : "border-transparent")}>
                  <div className="aspect-[16/10]"><PropertyArt palette={p.palette} kind={kind} variant={v} label={`${v} view`} /></div>
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-muted">Illustrations only. The demonstration homes are fictional, so no photographs or addresses are shown.</p>
          </div>
          <div>
            <div className="flex flex-wrap gap-2"><Badge tone={s.tone}>{s.label}</Badge><StageBadge stage={stage} /></div>
            <p className="mt-4 flex items-center gap-1 text-sm text-muted"><MapPin className="h-4 w-4" /> {p.location}, Co. {p.county} · area only</p>
            <h1 className="mt-2 font-serif text-4xl font-medium tracking-tight sm:text-5xl">{p.title}</h1>
            <p className="mt-3 text-base leading-relaxed text-muted">{p.description}</p>
            <dl className="tabular mt-6 grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
              {isLoan ? (
                <>
                  <div><dt className="text-muted">Loan amount</dt><dd className="font-sans text-xl font-bold">{eur(p.loan!.amount)}</dd></div>
                  <div><dt className="text-muted">Fixed rate*</dt><dd className="font-sans text-xl font-bold text-forest">{p.loan!.ratePct}% p.a.</dd></div>
                  <div><dt className="text-muted">Term</dt><dd className="font-sans text-xl font-bold">{p.loan!.termMonths} mo</dd></div>
                </>
              ) : (
                <>
                  <div><dt className="text-muted">Total project cost</dt><dd className="font-sans text-xl font-bold">{eur(totalCost(p))}</dd></div>
                  <div><dt className="text-muted">NOI yield*</dt><dd className="font-sans text-xl font-bold text-forest">{pct(netOperatingYield(p))}</dd></div>
                  <div><dt className="text-muted">Distributions</dt><dd className="font-sans text-xl font-bold">{p.distribution}</dd></div>
                </>
              )}
              <div><dt className="text-muted">Bedrooms</dt><dd className="flex items-center gap-1 font-sans text-xl font-bold"><BedDouble className="h-4 w-4 text-muted" /> {p.bedrooms}</dd></div>
              <div><dt className="text-muted">BER</dt><dd className="font-sans text-xl font-bold">{p.berBefore.split(" ")[0]} → {p.ber.replace("Target ", "")}</dd></div>
              <div><dt className="text-muted">Vacant since</dt><dd className="font-sans text-xl font-bold">{p.vacantSince}</dd></div>
            </dl>
            <div className="mt-6">
              <div className="mb-1 flex justify-between text-xs text-muted"><span>Simulated funding of {eur(raiseTarget(p))}</span><span className="tabular">{Math.round(p.fundedPct * 100)}% · {funders} funders</span></div>
              <Progress value={p.fundedPct} label="Simulated funding" />
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              {p.status === "open" ? <Link href={`/invest/${p.id}`} className={buttonVariants({ size: "lg" })}>Simulate {isLoan ? "a loan" : "an investment"} <ArrowRight className="h-4 w-4" /></Link> : <span className={buttonVariants({ size: "lg", variant: "secondary", className: "opacity-70" })}>{p.status === "funded" ? "Fully subscribed (simulated)" : "Not yet open"}</span>}
              <button type="button" onClick={() => setTab("passport")} className={buttonVariants({ size: "lg", variant: "secondary" })}><ScrollText className="h-4 w-4" /> Home passport</button>
            </div>
            <p className="mt-3 text-xs text-muted">{isLoan ? "*Before investor-level taxes; assumes no default." : "*Property-level, before platform fees and investor-level taxes. Not an investor return."}</p>
            <IllustrativeNotice className="mt-4" />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <Tabs tabs={TABS} value={tab} onChange={setTab} />

        {tab === "overview" ? (
          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
            <div className="space-y-8">
              <Card className="p-6">
                <h2 className="font-sans text-lg font-semibold">Refurbishment objectives</h2>
                <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                  {p.objectives.map((o) => <li key={o} className="flex items-start gap-2 text-sm"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-forest" /> {o}</li>)}
                </ul>
              </Card>
              <Card className="p-6">
                <h2 className="flex items-center gap-2 font-sans text-lg font-semibold"><Calendar className="h-5 w-5 text-forest" /> Project timeline (indicative)</h2>
                <ol className="mt-4 space-y-3">
                  {p.milestones.map((m) => (
                    <li key={m.label} className="flex items-center gap-3 text-sm">
                      {m.done ? <CheckCircle2 className="h-5 w-5 text-forest" /> : <Circle className="h-5 w-5 text-line-strong" />}
                      <span className={cn("flex-1", m.done && "font-medium")}>{m.label}</span>
                      <span className="tabular text-muted">{m.date}</span>
                    </li>
                  ))}
                </ol>
              </Card>
            </div>
            <div className="space-y-4">
              <Card className="p-4">
                <p className="mb-2 font-sans text-xs font-semibold uppercase tracking-wide text-muted">Area centroid (not a building location)</p>
                <IrelandMap points={[{ id: p.id, label: p.location, lat: p.geo.lat, lng: p.geo.lng }]} />
                <p className="tabular mt-2 text-xs text-muted">geography(Point,4326) · {p.geo.lat.toFixed(4)}, {p.geo.lng.toFixed(4)}</p>
              </Card>
              <Card className="p-5 text-sm">
                <p className="font-sans font-semibold">{spv?.name}</p>
                <p className="mt-1 text-muted">{spv?.instrument}</p>
                <p className="mt-2 text-xs text-muted">{spv?.status} · {spv?.jurisdiction}</p>
              </Card>
            </div>
          </div>
        ) : null}

        {tab === "financials" ? (
          <div className="mt-8 grid gap-8 lg:grid-cols-2">
            <Card className="tabular p-6 text-sm">
              <h2 className="font-sans text-lg font-semibold">Project cost</h2>
              {[["Acquisition", p.acquisition], ["Refurbishment", p.refurbishment], ["Legal and transaction", p.legal], ["Contingency", p.contingency]].map(([k, v]) => (
                <div key={k as string} className="flex justify-between border-b border-line py-2"><span className="text-muted">{k}</span><span className="font-medium">{eur(v as number)}</span></div>
              ))}
              <div className="flex justify-between py-3 font-sans text-base font-bold"><span>Total project cost</span><span>{eur(totalCost(p))}</span></div>
              <div className="mt-2 flex justify-between border-t border-line pt-3"><span className="text-muted">Illustrative post-works valuation</span><span className="font-medium">{eur(p.valuation)}</span></div>
              <p className="mt-1 text-xs text-muted">Not a professional valuation. Shown to size the loan-to-value and the Stage 3 buy-out illustration.</p>
              {isLoan ? <div className="mt-2 flex justify-between"><span className="text-muted">Loan-to-value</span><span className="font-medium">{pct(loanToValue(p), 1)} (limit {pct(FEES.maxLtv, 0)})</span></div> : null}
            </Card>
            <Card className="tabular p-6 text-sm">
              <h2 className="font-sans text-lg font-semibold">Operating model (annual)</h2>
              <div className="flex justify-between border-b border-line py-2"><span className="text-muted">Estimated gross rent</span><span className="font-medium">{eur(p.annualRent)}</span></div>
              <div className="flex justify-between border-b border-line py-2 text-xs"><span className="text-muted">Assumed vacancy</span><span>{pct(p.vacancyPct, 0)}</span></div>
              {[["Maintenance", p.opex.maintenance], ["Property management", p.opex.management], ["Insurance", p.opex.insurance], ["Other (LPT, compliance, charges)", p.opex.other]].map(([k, v]) => (
                <div key={k as string} className="flex justify-between border-b border-line py-2"><span className="text-muted">Less {String(k).toLowerCase()}</span><span className="font-medium">−{eur(v as number)}</span></div>
              ))}
              <div className="flex justify-between py-3 font-sans text-base font-bold"><span>Net operating income</span><span>{eur(noi(p))}</span></div>
              <div className="flex justify-between text-xs"><span className="text-muted">Gross yield</span><span>{pct(grossYield(p))}</span></div>
              <div className="flex justify-between text-xs"><span className="text-muted">Net operating yield (property level)</span><span className="font-semibold text-forest">{pct(netOperatingYield(p))}</span></div>
              <p className="mt-3 text-xs text-muted">Property-level figures. {isLoan ? "Lenders receive fixed interest, not the operating income; the model shows the borrower's capacity to service and repay the loan." : "Investors receive their share after the administration fee, before investor-level taxes — see the Investment tab."}</p>
            </Card>
          </div>
        ) : null}

        {tab === "investment" ? (
          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_1fr]">
            <div className="space-y-6">
              <Card className="p-6">
                <h2 className="font-sans text-lg font-semibold">Investment information</h2>
                <dl className="mt-4 grid gap-y-2 text-sm sm:grid-cols-[200px_1fr]">
                  {[
                    ["Proposed vehicle", spv?.name ?? "—"],
                    ["Proposed instrument", spv?.instrument ?? "—"],
                    ["What you would hold", isLoan ? "A participation in a secured loan — not property, not shares." : "Notes in the company that owns the home — not the home itself. A Raya Chain token records the holding; it is not title."],
                    ["Illustrative participation", `${eur(100)} buys ${pct(100 / raiseTarget(p), 4)} of the raise`],
                    ["Income", isLoan ? `Fixed ${p.loan!.ratePct}% p.a., paid monthly; principal at month ${p.loan!.termMonths}` : "Monthly share of net rental income after the administration fee"],
                    ["Fees", isLoan ? `None for lenders; borrower pays ${pct(FEES.loanArrangementPct, 1)} arrangement` : `${pct(FEES.entryFeePct, 1)} acquisition (one-off) · ${pct(FEES.annualAdminPct, 1)} p.a. administration`],
                    ["Holding period", isLoan ? `${p.loan!.termMonths} months` : `${p.holdingYears} years indicative`],
                    ["Exit limitations", isLoan ? "No early exit in this demonstration." : "Investor vote on sale; ECSPR bulletin board for early exit (no guaranteed buyer). Transfers only to verified wallets."],
                  ].map(([k, v]) => (
                    <div key={k} className="contents"><dt className="text-muted">{k}</dt><dd className="font-medium">{v}</dd></div>
                  ))}
                </dl>
              </Card>
              <KiisCard p={p} spv={spv} />
            </div>
            <Card className="p-6">
              <h2 className="font-sans text-lg font-semibold">Calculator</h2>
              <p className="mt-1 text-sm text-muted">Enter {eur(100)} to {eur(10000)}. Gross and net are shown separately.</p>
              <div className="mt-4 space-y-1.5">
                <Label htmlFor="calc">Amount (€)</Label>
                <Input id="calc" type="number" inputMode="numeric" min={100} max={10000} step={50} value={amount} onChange={(e) => setAmount(Number(e.target.value) || 100)} onBlur={() => setAmount(Math.min(10000, Math.max(100, Math.round(amount))))} className="text-lg font-semibold" />
                <input aria-label="Amount slider" type="range" min={100} max={10000} step={50} value={amount} onChange={(e) => setAmount(Number(e.target.value))} className="w-full accent-[#063f36]" />
              </div>
              <div className="mt-4 rounded-xl border border-line bg-surface p-4"><IllustrationPanel p={p} amount={Math.min(10000, Math.max(100, amount))} /></div>
              {!isLoan ? <p className="tabular mt-3 text-xs text-muted">Indicative property-level return {pct(illustrate(p, amount).propertyYield)} vs illustrative investor-level yield {pct(illustrate(p, amount).investorYield)} — the difference is the fee stack.</p> : null}
              {p.status === "open" ? <Link href={`/invest/${p.id}`} className={buttonVariants({ className: "mt-4 w-full" })}>Simulate with {eur(Math.min(10000, Math.max(100, amount)))} <ArrowRight className="h-4 w-4" /></Link> : null}
            </Card>
          </div>
        ) : null}

        {tab === "risks" ? (
          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
            <Card className="p-6">
              <h2 className="flex items-center gap-2 font-sans text-lg font-semibold"><Shield className="h-5 w-5 text-forest" /> Principal risks</h2>
              <ul className="mt-4 space-y-3">
                {(isLoan ? LOAN_RISK_FACTORS : RISK_FACTORS).map((r) => {
                  const [title, rest] = r.split(" — ");
                  return <li key={r} className="rounded-xl border border-line bg-surface p-4 text-sm"><p className="font-sans font-semibold">{title}</p><p className="mt-1 text-muted">{rest}</p></li>;
                })}
              </ul>
              <RiskNotice className="mt-6" />
            </Card>
            <Card className="p-6 text-sm">
              <h3 className="font-sans font-semibold">Risk level</h3>
              <Badge tone={p.riskLevel === "High" ? "risk" : p.riskLevel === "Elevated" ? "gold" : "mint"} className="mt-2">{p.riskLevel}</Badge>
              <p className="mt-3 text-muted">Platform assessment, illustrative. {p.riskLevel === "High" ? "Highest refurbishment share and structural works." : p.riskLevel === "Elevated" ? "Significant envelope works and a long vacancy." : "Lighter works, strong rental demand assumed."}</p>
              <h3 className="mt-5 font-sans font-semibold">Regulatory status</h3>
              <p className="mt-1 text-muted">Proposed structure, subject to regulatory assessment. Meithera is not authorised or regulated by the Central Bank of Ireland.</p>
            </Card>
          </div>
        ) : null}

        {tab === "passport" ? (
          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
            <Card className="p-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="flex items-center gap-2 font-sans text-lg font-semibold"><ScrollText className="h-5 w-5 text-forest" /> Home Digital Passport</h2>
                <StageBadge stage={2} compact />
              </div>
              <p className="mt-1 text-sm text-muted">The life of the home, from vacancy to payouts. Each completed entry is attested by a Raya Chain transaction; future entries are planned.</p>
              <ol className="mt-6 space-y-0">
                {p.passport.map((e, i) => {
                  const Icon = PASSPORT_ICON[e.kind];
                  return (
                    <li key={e.id} className="relative flex gap-4 pb-6">
                      {i < p.passport.length - 1 ? <span className={cn("absolute left-[19px] top-10 h-[calc(100%-24px)] w-0.5", e.done ? "bg-forest" : "bg-line")} aria-hidden /> : null}
                      <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-full", e.done ? "bg-emerald text-white" : "border-2 border-line bg-card text-muted")}><Icon className="h-5 w-5" /></span>
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className={cn("font-sans font-semibold", !e.done && "text-muted")}>{e.label}</p>
                          <span className="tabular text-xs text-muted">{e.date.length === 7 ? e.date : shortDate(e.date)}</span>
                        </div>
                        <p className="mt-1 text-sm text-muted">{e.detail}</p>
                        <p className="mt-1 text-xs">{e.txId ? <span className="inline-flex items-center gap-1"><Link2 className="h-3.5 w-3.5 text-forest" /> Attested on Raya Chain: <TxLink id={e.txId} /></span> : <span className="text-muted">Planned — no attestation yet</span>}</p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </Card>
            <div className="space-y-4">
              <Card className="tabular p-5 text-sm">
                <p className="font-sans text-xs font-semibold uppercase tracking-wide text-muted">Passport summary</p>
                <dl className="mt-3 grid grid-cols-2 gap-3">
                  <div><dt className="text-muted">Vacant since</dt><dd className="font-sans text-lg font-bold">{p.vacantSince}</dd></div>
                  <div><dt className="text-muted">BER</dt><dd className="font-sans text-lg font-bold">{p.berBefore.split(" ")[0]} → {p.ber.replace("Target ", "")}</dd></div>
                  <div><dt className="text-muted">Funders (simulated)</dt><dd className="font-sans text-lg font-bold">{funders}</dd></div>
                  <div><dt className="text-muted">Payout txs</dt><dd className="font-sans text-lg font-bold">{payouts.length}</dd></div>
                </dl>
                <p className="mt-3 text-xs text-muted">Payouts total {eur(payouts.reduce((s, t) => s + (t.amountEur ?? 0), 0), 2)} across {payouts.length} Raya Chain transactions (simulated).</p>
              </Card>
              <Card className="p-5 text-sm">
                <p className="flex items-center gap-2 font-sans font-semibold"><FileText className="h-4 w-4 text-forest" /> Why a passport?</p>
                <p className="mt-2 text-muted">Investors, tenants and the supervisor see the same record: what the home was, what was done to it, who funded it and what it has paid. In Stage 4 the passport could travel with the notes across chains.</p>
                <Link href={`/chain?tx=${p.passport.find((e) => e.txId)?.txId ?? ""}`} className="mt-3 inline-flex items-center gap-1 font-sans font-semibold text-forest">Open in the explorer <ArrowRight className="h-4 w-4" /></Link>
              </Card>
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
}
