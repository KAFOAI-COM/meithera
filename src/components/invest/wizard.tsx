"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { AlertTriangle, ArrowLeft, ArrowRight, Boxes, CalendarClock, Check, FileText, PartyPopper } from "lucide-react";
import type { SimInvestment } from "@/lib/types";
import { useDemo, REFLECTION_DAYS } from "@/lib/store";
import { seedSpvs } from "@/lib/data/seed";
import { FEES, headlineRate, illustrate, illustrateLoan, loanFacility } from "@/lib/finance";
import { incomeStart, monthLabel, addMonths } from "@/lib/portfolio";
import { offerLabel, offerStage } from "@/lib/stages";
import { cn, eur, pct, shortDate, shortHash } from "@/lib/utils";
import { Button, Input, buttonVariants } from "@/components/ui";
import { RISK_WARNING, RiskNotice } from "@/components/site/notices";
import { StageBadge } from "@/components/site/stage-badge";
import { Onboarding, type OnboardingResult } from "./onboarding";

const STEPS = ["Offer", "Amount", "Onboarding", "Risk", "Review", "Confirmation"];
const MIN = 100;
const MAX = 10000;

function Rail({ step }: { step: number }) {
  return (
    <ol className="flex items-center gap-1.5 overflow-x-auto pb-1" aria-label="Progress">
      {STEPS.map((s, i) => {
        const n = i + 1;
        const state = n < step ? "done" : n === step ? "active" : "todo";
        return (
          <li key={s} className="flex shrink-0 items-center gap-1.5" aria-current={state === "active" ? "step" : undefined}>
            <span className={cn("flex h-8 w-8 items-center justify-center rounded-full font-sans text-xs font-bold", state === "done" ? "bg-forest text-white" : state === "active" ? "bg-emerald text-gold ring-4 ring-mint" : "bg-card text-muted ring-1 ring-line")}>
              {state === "done" ? <Check className="h-4 w-4" /> : n}
            </span>
            <span className={cn("font-sans text-xs font-semibold", state === "todo" ? "text-muted" : "text-ink", state !== "active" && "hidden sm:inline")}>{s}</span>
            {i < STEPS.length - 1 ? <span className={cn("mx-1 h-px w-6 sm:w-10", n < step ? "bg-forest" : "bg-line")} aria-hidden /> : null}
          </li>
        );
      })}
    </ol>
  );
}

function Row({ k, v, minus, strong, sub }: { k: string; v: string; minus?: boolean; strong?: boolean; sub?: string }) {
  return (
    <div className={cn("flex items-baseline justify-between gap-4 border-b border-line py-2.5 text-sm", strong && "font-semibold")}>
      <span className={strong ? "text-ink" : "text-muted"}>{k}{sub ? <span className="ml-1.5 text-xs text-muted/80">{sub}</span> : null}</span>
      <span className={cn("tabular", minus && "text-risk-ink")}>{minus ? `−${v}` : v}</span>
    </div>
  );
}

export function InvestWizard({ propertyId, investorId, personaName, actingAsDemo }: { propertyId: string; investorId: string; personaName: string; actingAsDemo: boolean }) {
  const p = useDemo((s) => s.properties.find((x) => x.id === propertyId));
  const chain = useDemo((s) => s.chain);
  const log = useDemo((s) => s.log);
  const simulate = useDemo((s) => s.simulateInvestment);
  const reduce = useReducedMotion();

  const [step, setStep] = useState(2);
  const [amount, setAmount] = useState(1000);
  const [raw, setRaw] = useState("1000");
  const [ob, setOb] = useState<OnboardingResult | null>(null);
  const [ack, setAck] = useState(false);
  const [extraAck, setExtraAck] = useState(false);
  const [result, setResult] = useState<SimInvestment | null>(null);

  if (!p)
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <h1 className="font-serif text-4xl">Offer not found</h1>
        <Link href="/invest" className={buttonVariants({ className: "mt-8" })}>Choose an offer</Link>
      </div>
    );

  const isLoan = p.offerType === "loan" && !!p.loan;
  const spv = seedSpvs.find((x) => x.id === p.spvId);
  const r = illustrate(p, amount);
  const l = isLoan ? illustrateLoan(amount, p.loan!.ratePct, p.loan!.months, loanFacility(p)) : null;
  const monthly = isLoan ? l!.monthlyNet : r.monthlyIncome;
  const participation = isLoan ? l!.participation : r.participation;
  const net = isLoan ? l!.netLent : r.netInvested;
  const threshold = ob ? Math.max(1000, ob.band.mid * 0.05) : 1000;
  const needsExtra = ob?.classification === "retail" && amount > threshold;
  const reflectionEnds = new Date(Date.now() + REFLECTION_DAYS * 86_400_000).toISOString();
  const starts = incomeStart(p, { createdAt: new Date().toISOString() } as SimInvestment);
  const schedule = Array.from({ length: 12 }, (_, i) => addMonths(starts, i));
  const setAmt = (n: number) => {
    const v = Math.min(MAX, Math.max(MIN, Math.round(n)));
    setAmount(v);
    setRaw(String(v));
  };
  const go = (n: number) => {
    setStep(n);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  };

  const tx = result ? chain.txs.find((t) => t.txId === result.txId) : undefined;
  const block = tx ? chain.blocks[tx.block] : undefined;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link href="/invest" className="inline-flex min-h-10 items-center gap-1.5 font-sans text-sm font-semibold text-muted hover:text-emerald"><ArrowLeft className="h-4 w-4" /> Change offer</Link>
        <StageBadge stage={offerStage(p)} detail />
      </div>
      <div className="mt-6"><Rail step={step} /></div>
      {actingAsDemo ? <p className="mt-4 rounded-lg bg-demo px-3 py-2 text-xs font-medium text-demo-ink">You are logged in as {personaName}; this simulation is recorded for the fictional demo investor.</p> : null}

      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0">
          {step === 2 ? (
            <section>
              <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-gold-ink">Step 2 · Amount</p>
              <h1 className="mt-2 font-serif text-4xl tracking-tight text-ink">How much would you {isLoan ? "lend" : "invest"}?</h1>
              <p className="mt-2 text-muted">Between {eur(MIN)} and {eur(MAX)}. The preview updates as you type — after fees, before investor-level taxes.</p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <div className="relative w-48">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-sans text-lg font-semibold text-muted">€</span>
                  <Input
                    aria-label="Amount in euro"
                    inputMode="numeric"
                    className="tabular h-14 pl-8 font-sans text-2xl font-semibold"
                    value={raw}
                    onChange={(e) => {
                      const d = e.target.value.replace(/[^\d]/g, "");
                      setRaw(d);
                      if (d) setAmount(Math.min(MAX, Math.max(MIN, Number(d))));
                    }}
                    onBlur={() => setAmt(Number(raw || MIN))}
                  />
                </div>
                {[250, 500, 1000, 2500, 5000].map((v) => (
                  <button key={v} type="button" onClick={() => setAmt(v)} className={cn("min-h-10 rounded-full border px-3.5 font-sans text-sm font-semibold", amount === v ? "border-emerald bg-emerald text-white" : "border-line-strong/50 text-muted hover:border-emerald hover:text-emerald")}>{eur(v)}</button>
                ))}
              </div>
              <input type="range" min={MIN} max={MAX} step={50} value={amount} onChange={(e) => setAmt(Number(e.target.value))} className="mt-6 w-full accent-[#063f36]" aria-label="Amount slider" />

              <div className="mt-8 grid gap-6 md:grid-cols-[1fr_1fr]">
                <div className="tabular">
                  <Row k="Amount entered" v={eur(amount, 2)} />
                  <Row k="Acquisition fee" sub={`${pct(FEES.entryFeePct, 1)}, one-off`} v={eur(amount * FEES.entryFeePct, 2)} minus />
                  <Row k={isLoan ? "Net lent" : "Net invested"} v={eur(net, 2)} strong />
                  <Row k={isLoan ? "Share of facility" : "Participation"} v={pct(participation, 4)} />
                  <Row k={isLoan ? "Gross interest / month" : "Share of net rent / month"} v={eur(isLoan ? l!.monthlyInterest : r.noiShare / 12, 2)} />
                  <Row k="Administration fee / month" sub={`${pct(FEES.annualAdminPct, 1)} p.a.`} v={eur(isLoan ? l!.adminFeeMonthly : r.adminFee / 12, 2)} minus />
                </div>
                <div className="flex flex-col justify-between rounded-2xl bg-emerald p-6 text-white">
                  <div>
                    <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-gold">Illustrative net, per month</p>
                    <p className="tabular mt-3 font-serif text-5xl leading-none">{eur(monthly, 2)}</p>
                    <p className="mt-2 text-sm text-white/60">{eur(monthly * 12, 2)} a year · {isLoan ? `${eur(l!.totalNet, 2)} over ${l!.months} months` : `from ${monthLabel(starts, true)} (after tenancy)`}</p>
                  </div>
                  <p className="mt-6 text-xs text-white/50">Not guaranteed. You could lose some or all of your money.</p>
                </div>
              </div>
              <div className="mt-8 flex justify-end"><Button size="lg" onClick={() => go(3)}>Continue to onboarding <ArrowRight className="h-4 w-4" /></Button></div>
            </section>
          ) : null}

          {step === 3 ? (
            <section>
              <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-gold-ink">Step 3 · Simulated onboarding</p>
              <h1 className="mt-2 font-serif text-4xl tracking-tight text-ink">A few checks first</h1>
              <p className="mt-2 text-muted">What a regulated onboarding partner would do — simulated, with nothing collected.</p>
              <div className="mt-8">
                <Onboarding
                  amount={amount}
                  personaName={personaName}
                  onLog={(type, detail) => log(type, investorId, detail)}
                  onComplete={(res) => {
                    setOb(res);
                    go(4);
                  }}
                />
              </div>
              <button type="button" onClick={() => go(2)} className="mt-6 inline-flex min-h-10 items-center gap-1.5 font-sans text-sm font-semibold text-muted hover:text-emerald"><ArrowLeft className="h-4 w-4" /> Back to amount</button>
            </section>
          ) : null}

          {step === 4 ? (
            <section>
              <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-gold-ink">Step 4 · Risk acknowledgement</p>
              <h1 className="mt-2 font-serif text-4xl tracking-tight text-ink">Please read this carefully</h1>
              <RiskNotice className="mt-6 text-base" />
              <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-xl border border-line bg-card p-4 text-sm">
                <input type="checkbox" checked={ack} onChange={(e) => setAck(e.target.checked)} className="mt-0.5 h-5 w-5 shrink-0 accent-[#063f36]" />
                <span>I have read and understood the risk warning above.</span>
              </label>
              {needsExtra ? (
                <div className="mt-6 rounded-2xl border-2 border-risk-ink/30 bg-risk p-5">
                  <p className="flex items-center gap-2 font-sans font-semibold text-risk-ink"><AlertTriangle className="h-5 w-5" /> Additional warning</p>
                  <p className="mt-2 text-sm leading-relaxed text-risk-ink">
                    {eur(amount)} is more than the higher of €1,000 or 5% of your stated net worth ({eur(threshold)}). Investing this much in a single home concentrates your risk. You may want to invest less or spread it across several homes.
                  </p>
                  <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-xl bg-card p-4 text-sm">
                    <input type="checkbox" checked={extraAck} onChange={(e) => setExtraAck(e.target.checked)} className="mt-0.5 h-5 w-5 shrink-0 accent-[#8f2f22]" />
                    <span>I understand this amount is above the warning threshold and wish to continue.</span>
                  </label>
                </div>
              ) : null}
              <div className="mt-8 flex flex-wrap justify-between gap-3">
                <Button variant="ghost" onClick={() => go(2)}><ArrowLeft className="h-4 w-4" /> Change amount</Button>
                <Button
                  size="lg"
                  disabled={!ack || (needsExtra && !extraAck)}
                  onClick={() => {
                    log("RISK_ACKNOWLEDGEMENT", investorId, `Risk warning acknowledged for ${p.location} (${eur(amount)} simulated)`);
                    if (needsExtra) log("EXTRA_WARNING", investorId, `Additional warning shown and acknowledged: ${eur(amount)} above ${eur(threshold)} threshold`);
                    go(5);
                  }}
                >
                  Continue to review <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </section>
          ) : null}

          {step === 5 ? (
            <section>
              <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-gold-ink">Step 5 · Review</p>
              <h1 className="mt-2 font-serif text-4xl tracking-tight text-ink">Review your simulated {isLoan ? "loan" : "investment"}</h1>
              <div className="mt-8 grid gap-6 md:grid-cols-2">
                <div className="tabular">
                  <Row k="Amount entered" v={eur(amount, 2)} />
                  <Row k="Acquisition fee" sub="1.5%" v={eur(amount * FEES.entryFeePct, 2)} minus />
                  <Row k={isLoan ? "Net lent" : "Net invested"} v={eur(net, 2)} strong />
                  <Row k="Administration fee" sub="0.5% p.a." v={eur(net * FEES.annualAdminPct, 2) + " / yr"} minus />
                  <Row k={isLoan ? "Share of facility" : "Participation"} v={pct(participation, 4)} />
                  <Row k={isLoan ? "Net interest / month" : "Net income / month"} v={eur(monthly, 2)} strong />
                  <Row k="Classification" v={ob?.classification === "sophisticated" ? "Sophisticated" : "Non-sophisticated"} />
                </div>
                <div className="space-y-3 text-sm">
                  <div className="rounded-xl border border-line bg-card p-4"><p className="text-[11px] uppercase tracking-wide text-muted">Instrument</p><p className="mt-1 text-ink">{spv?.instrument}</p></div>
                  <div className="rounded-xl border border-line bg-card p-4"><p className="text-[11px] uppercase tracking-wide text-muted">{isLoan ? "Borrower" : "Property company"}</p><p className="mt-1 text-ink">{spv?.name}</p></div>
                  <div className="rounded-xl border border-gold/50 bg-[#fbf7ef] p-4">
                    <p className="flex items-center gap-2 font-sans text-sm font-semibold text-gold-ink"><FileText className="h-4 w-4" /> Key investment information sheet</p>
                    <ul className="mt-2 space-y-1 text-xs leading-relaxed text-muted">
                      <li>Offer: {offerLabel(p)} · {p.location}</li>
                      <li>{isLoan ? `${p.loan!.ratePct}% p.a. fixed · ${p.loan!.months} months · first legal charge` : `Monthly net rent · ${p.holdingYears}-year hold · vote on sale`}</li>
                      <li>Fees: 1.5% one-off + 0.5% a year · figures before investor-level taxes</li>
                      <li>Main risks: capital loss, {isLoan ? "borrower default, delay" : "vacancy, valuation, illiquidity"}</li>
                    </ul>
                    <Link href="/dashboard/documents?doc=kiis" className="mt-2 inline-block font-sans text-xs font-semibold text-forest hover:underline">Open the full sheet (demo)</Link>
                  </div>
                </div>
              </div>
              <h2 className="mt-10 font-sans text-sm font-semibold text-ink">{isLoan ? "Interest schedule" : "Projected income"} · first 12 months</h2>
              <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6">
                {schedule.map((m, i) => (
                  <div key={m} className="rounded-lg border border-line bg-card p-2.5 text-center">
                    <p className="text-[11px] text-muted">{monthLabel(m, true)}</p>
                    <p className="tabular mt-0.5 font-sans text-sm font-semibold text-ink">{isLoan && i >= p.loan!.months ? "—" : eur(monthly, 2)}</p>
                  </div>
                ))}
              </div>
              <p className="mt-6 flex items-start gap-3 rounded-xl bg-mint/60 p-4 text-sm text-emerald">
                <CalendarClock className="mt-0.5 h-5 w-5 shrink-0" />
                <span><strong>{REFLECTION_DAYS}-day reflection period.</strong> As a non-sophisticated investor you could withdraw without penalty until {shortDate(reflectionEnds)}. In the demo you can do this from your portfolio.</span>
              </p>
              <div className="mt-8 flex flex-wrap justify-between gap-3">
                <Button variant="ghost" onClick={() => go(4)}><ArrowLeft className="h-4 w-4" /> Back</Button>
                <Button
                  size="lg"
                  onClick={() => {
                    setResult(simulate(investorId, p.id, amount));
                    go(6);
                  }}
                >
                  Confirm simulated {isLoan ? "loan" : "investment"}
                </Button>
              </div>
              <p className="mt-3 text-right text-xs text-muted">No money will move. Nothing is issued.</p>
            </section>
          ) : null}

          {step === 6 && result ? (
            <section>
              <motion.div initial={reduce ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-mint text-emerald"><PartyPopper className="h-6 w-6" /></span>
                <h1 className="mt-5 font-serif text-5xl tracking-tight text-ink">Simulation Completed</h1>
                <p className="mt-4 text-lg font-semibold text-ink">No real money has been transferred.</p>
                <p className="text-lg font-semibold text-ink">No securities or tokens have been issued.</p>
                <p className="mt-3 text-muted">Your simulated {isLoan ? "loan participation" : "holding"} of {eur(result.amount)} in {p.location} is recorded below.</p>
              </motion.div>

              <motion.div
                initial={reduce ? false : { opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.25 }}
                className="relative mt-8 overflow-hidden rounded-2xl bg-[#062a24] p-6 font-mono text-sm text-white shadow-raised"
              >
                <motion.span initial={reduce ? false : { scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.9, delay: 0.4 }} className="absolute inset-x-0 top-0 h-1 origin-left bg-gold" />
                <p className="flex items-center gap-2 font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-[#5fd3a5]"><Boxes className="h-4 w-4" /> Recorded on Raya Chain · simulated</p>
                <dl className="mt-5 grid gap-3 text-[13px] sm:grid-cols-[8rem_1fr]">
                  <dt className="text-white/50">Transaction</dt><dd className="break-all">{result.txId}</dd>
                  <dt className="text-white/50">Type</dt><dd>ISSUE · {Math.round(result.netInvested)} units to {tx?.to}</dd>
                  <dt className="text-white/50">Block</dt><dd>#{tx?.block}</dd>
                  <dt className="text-white/50">Merkle root</dt><dd className="break-all">{block?.merkleRoot}</dd>
                  <dt className="text-white/50">Prev hash</dt><dd>{shortHash(block?.prevHash ?? "", 12, 8)}</dd>
                  <dt className="text-white/50">Anchors</dt><dd>{block?.anchors.length ? block.anchors.map((a) => a.chain.split(" ·")[0]).join(", ") : "next block"}</dd>
                </dl>
                <p className="mt-5 font-sans text-xs text-white/50">Pseudonymous — no personal data on-chain. A token records the holding; it is not legal title.</p>
              </motion.div>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/dashboard" className={buttonVariants({ size: "lg" })}>Go to my dashboard <ArrowRight className="h-4 w-4" /></Link>
                <Link href={`/chain?tx=${result.txId}`} className={buttonVariants({ size: "lg", variant: "secondary" })}><Boxes className="h-4 w-4" /> View on Raya Chain</Link>
                <Link href={`/properties/${p.slug}#passport`} className={buttonVariants({ size: "lg", variant: "ghost" })}>See the home’s passport</Link>
              </div>
            </section>
          ) : null}
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="overflow-hidden rounded-2xl border border-line bg-card shadow-card">
            <div className="relative aspect-[16/10]">
              <Image src={p.images[0]} alt="" fill sizes="360px" className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-emerald/85 to-transparent" />
              <div className="absolute inset-x-4 bottom-3 text-white">
                <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.12em] text-gold">{offerLabel(p)}</p>
                <p className="font-serif text-xl">{p.title}</p>
              </div>
            </div>
            <dl className="tabular grid grid-cols-2 gap-4 p-5 text-sm">
              <div><dt className="text-[11px] uppercase tracking-wide text-muted">{isLoan ? "Fixed interest" : "Property yield*"}</dt><dd className="font-sans font-semibold">{pct(headlineRate(p))}</dd></div>
              <div><dt className="text-[11px] uppercase tracking-wide text-muted">Amount</dt><dd className="font-sans font-semibold">{eur(amount)}</dd></div>
              <div><dt className="text-[11px] uppercase tracking-wide text-muted">Net / month</dt><dd className="font-sans font-semibold text-forest">{eur(monthly, 2)}</dd></div>
              <div><dt className="text-[11px] uppercase tracking-wide text-muted">{isLoan ? "Term" : "Holding"}</dt><dd className="font-sans font-semibold">{isLoan ? `${p.loan!.months} mo` : `${p.holdingYears} yrs`}</dd></div>
            </dl>
            <p className="border-t border-line px-5 py-4 text-[11px] leading-snug text-muted">{RISK_WARNING} {isLoan ? "" : "*Property-level, before fees; not your return."}</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
