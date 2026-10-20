"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, Fingerprint, Loader2, ScanSearch, ShieldAlert, Link2, Clock, Undo2 } from "lucide-react";
import { useDemo } from "@/lib/store";
import { useHydrated } from "@/components/site/hydrator";
import { ECSPR, exceedsWarningThreshold, illustrate, raiseTarget } from "@/lib/finance";
import { seedSpvs } from "@/lib/data/seed";
import { eur, pct, cn } from "@/lib/utils";
import { Button, Card, Input, Label, Progress, Badge } from "@/components/ui";
import { Checkbox } from "@/components/ui/tabs";
import { RISK_WARNING, RiskNotice, IllustrativeNotice } from "@/components/site/notices";
import { StageBadge } from "@/components/site/stage-badge";
import { PropertyArt } from "@/components/site/property-art";
import { Stepper } from "./stepper";
import { IllustrationPanel } from "./illustration-panel";
import { KiisCard } from "./kiis-card";

const PRESETS = [100, 500, 1000, 2500, 5000, 10000];

export const KNOWLEDGE_QUESTIONS: { q: string; options: string[]; answer: number }[] = [
  { q: "If the home stays empty longer than planned, what happens to a rent-share investor's income?", options: ["It is topped up by Meithera", "It falls or stops", "It is guaranteed by the SPV"], answer: 1 },
  { q: "Who holds legal title to the home?", options: ["Each investor, in proportion", "The home's company (SPV) or the borrower", "The Central Bank"], answer: 1 },
  { q: "Can you sell your notes whenever you want?", options: ["Yes, instantly", "No — they are illiquid; a bulletin board is not a guaranteed market", "Only on weekdays"], answer: 1 },
  { q: "What does a first legal charge do for a lender?", options: ["Removes all risk of loss", "Gives security over the property but does not remove the risk of loss", "Pays interest automatically"], answer: 1 },
  { q: "Are the income figures shown guaranteed?", options: ["Yes", "No — they are illustrative and before investor-level taxes", "Yes, if the BER improves"], answer: 1 },
];

type SimStatus = "idle" | "running" | "done";

function SimCheck({ icon: Icon, title, result, status, onRun, runLabel }: { icon: typeof Fingerprint; title: string; result: string; status: SimStatus; onRun: () => void; runLabel: string }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-surface p-4">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-mint text-emerald"><Icon className="h-5 w-5" /></span>
        <div>
          <p className="font-sans text-sm font-semibold">{title}</p>
          <p className="text-xs text-muted">{status === "done" ? result : "Nothing is collected or sent. The result is scripted."}</p>
        </div>
      </div>
      {status === "done" ? (
        <Badge tone="mint"><CheckCircle2 className="h-3.5 w-3.5" /> Simulated — passed</Badge>
      ) : (
        <Button type="button" variant="secondary" size="sm" onClick={onRun} disabled={status === "running"}>
          {status === "running" ? <Loader2 className="h-4 w-4 animate-spin" /> : null} {status === "running" ? "Simulating…" : runLabel}
        </Button>
      )}
    </div>
  );
}

export function InvestWizard({ propertyId, userId }: { propertyId: string; userId: string }) {
  const hydrated = useHydrated();
  const { properties, investors, simulateInvestment, withdrawInvestment, recordKnowledgeTest, log } = useDemo();
  const p = properties.find((x) => x.id === propertyId);
  const investor = investors.find((i) => i.id === userId) ?? investors[0];
  const spv = seedSpvs.find((s) => s.propertyId === propertyId);

  const [step, setStep] = useState(2);
  const [amount, setAmount] = useState(1000);
  const [idCheck, setIdCheck] = useState<SimStatus>("idle");
  const [aml, setAml] = useState<SimStatus>("idle");
  const [classification, setClassification] = useState<"retail" | "sophisticated">("retail");
  const [answers, setAnswers] = useState<(number | null)[]>(Array(KNOWLEDGE_QUESTIONS.length).fill(null));
  const [testSubmitted, setTestSubmitted] = useState(false);
  const [netWorth, setNetWorth] = useState(investor?.statedNetWorth ?? 45000);
  const [lossAck, setLossAck] = useState(false);
  const [riskAck, setRiskAck] = useState(false);
  const [thresholdAck, setThresholdAck] = useState(false);
  const [resultId, setResultId] = useState<string | null>(null);

  useEffect(() => {
    if (investor?.statedNetWorth) setNetWorth(investor.statedNetWorth);
  }, [investor?.statedNetWorth]);

  const score = answers.filter((a, i) => a === KNOWLEDGE_QUESTIONS[i].answer).length;
  const passed = score >= ECSPR.knowledgeTestPass;
  const warning = exceedsWarningThreshold(amount, netWorth);
  const result = useDemo((s) => s.investments.find((x) => x.id === resultId));
  const isLoan = !!(p && p.offerType === "loan" && p.loan);
  const remaining = useMemo(() => (p ? Math.max(0, raiseTarget(p) * (1 - p.fundedPct)) : 0), [p]);

  if (!hydrated) return <div className="h-96 animate-pulse rounded-2xl bg-mint/50" />;
  if (!p) return <Card className="p-8 text-center"><p className="font-sans font-semibold">Unknown offer.</p><Link href="/invest" className="mt-3 inline-block text-forest underline">Back to offers</Link></Card>;
  if (p.status !== "open" && step < 6)
    return (
      <Card className="p-8 text-center">
        <p className="font-sans font-semibold">This offer is {p.status === "funded" ? "fully subscribed (simulated)" : "not yet open"}.</p>
        <Link href="/invest" className="mt-3 inline-block text-forest underline">Choose another offer</Link>
      </Card>
    );

  const onboardingDone = idCheck === "done" && aml === "done" && testSubmitted && passed && lossAck;
  const clampAmount = (v: number) => Math.min(10000, Math.max(100, Math.round(v)));

  const run = (setter: (s: SimStatus) => void) => {
    setter("running");
    setTimeout(() => setter("done"), 900);
  };

  const submitTest = () => {
    setTestSubmitted(true);
    recordKnowledgeTest(investor.id, score, KNOWLEDGE_QUESTIONS.length);
  };

  const complete = () => {
    if (warning.exceeds) log("WARNING_SHOWN", investor.id, `${eur(amount)} exceeds the higher of €1,000 or 5% of stated net worth (${eur(warning.threshold)}) — warning shown and accepted`);
    log("RISK_ACKNOWLEDGEMENT", investor.id, `Risk warning acknowledged for ${p.location} simulation`);
    const sim = simulateInvestment(investor.id, p.id, amount, { warningShown: warning.exceeds });
    setResultId(sim.id);
    setStep(6);
  };

  return (
    <div className="space-y-8">
      <Stepper current={step} />

      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          {/* Step 2 — amount */}
          {step === 2 ? (
            <Card className="p-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-sans text-xl font-semibold">How much would you like to {isLoan ? "lend" : "invest"}?</h2>
                <StageBadge stage={isLoan ? 1 : 2} compact />
              </div>
              <p className="mt-1 text-sm text-muted">Between {eur(100)} and {eur(10000)}. Illustrative only — no money is involved at any point.</p>
              <div className="mt-5 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
                <div className="space-y-1.5">
                  <Label htmlFor="amount">Amount (€)</Label>
                  <Input id="amount" type="number" inputMode="numeric" min={100} max={10000} step={50} value={amount} onChange={(e) => setAmount(Number(e.target.value) || 100)} onBlur={() => setAmount(clampAmount(amount))} className="text-lg font-semibold" />
                </div>
                <div className="flex flex-wrap gap-2">
                  {PRESETS.map((v) => (
                    <button key={v} type="button" onClick={() => setAmount(v)} className={cn("min-h-11 rounded-lg border px-3 font-sans text-sm font-semibold", amount === v ? "border-emerald bg-emerald text-white" : "border-line-strong bg-card text-ink hover:bg-mint")}>
                      {eur(v)}
                    </button>
                  ))}
                </div>
              </div>
              <input aria-label="Amount slider" type="range" min={100} max={10000} step={50} value={amount} onChange={(e) => setAmount(Number(e.target.value))} className="mt-4 w-full accent-[#063f36]" />
              <div className="mt-5">
                <div className="mb-1 flex justify-between text-xs text-muted"><span>Remaining in this offer (simulated)</span><span className="tabular">{eur(remaining)}</span></div>
                <Progress value={p.fundedPct} label="Funding progress" />
              </div>
              <div className="mt-6 flex justify-between">
                <Link href="/invest" className="inline-flex min-h-11 items-center gap-2 font-sans text-sm font-semibold text-forest"><ArrowLeft className="h-4 w-4" /> Choose a different offer</Link>
                <Button onClick={() => { setAmount(clampAmount(amount)); setStep(3); }}>Continue <ArrowRight className="h-4 w-4" /></Button>
              </div>
            </Card>
          ) : null}

          {/* Step 3 — onboarding */}
          {step === 3 ? (
            <Card className="p-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-sans text-xl font-semibold">Simulated onboarding</h2>
                <StageBadge stage={0} compact />
              </div>
              <p className="mt-1 text-sm text-muted">In a live service these steps would be performed by an authorised provider. Here every result is scripted and nothing is collected.</p>

              <section className="mt-6">
                <h3 className="font-sans text-sm font-semibold uppercase tracking-wide text-muted">1 · Personal details (prefilled, fictional)</h3>
                <div className="mt-2 grid gap-3 sm:grid-cols-2">
                  {[["Name", investor.name], ["County", investor.county], ["Date of birth", "—  (not collected in the demo)"], ["PPSN / ID number", "—  (not collected in the demo)"]].map(([k, v]) => (
                    <div key={k} className="rounded-lg border border-line bg-surface p-3"><p className="text-xs text-muted">{k}</p><p className="text-sm font-medium">{v}</p></div>
                  ))}
                </div>
              </section>

              <section className="mt-6 space-y-3">
                <h3 className="font-sans text-sm font-semibold uppercase tracking-wide text-muted">2 · Identity and AML (simulated)</h3>
                <SimCheck icon={Fingerprint} title="Identity verification" result="Simulated — passed. No document was requested or stored." status={idCheck} onRun={() => run(setIdCheck)} runLabel="Run simulated ID check" />
                <SimCheck icon={ScanSearch} title="AML / sanctions screening" result="Simulated — clear. No lists were queried." status={aml} onRun={() => run(setAml)} runLabel="Run simulated AML screen" />
              </section>

              <section className="mt-6">
                <h3 className="font-sans text-sm font-semibold uppercase tracking-wide text-muted">3 · Investor classification (ECSPR-style)</h3>
                <div className="mt-2 grid gap-3 sm:grid-cols-2">
                  {([
                    ["retail", "Retail (non-sophisticated)", "Knowledge test, loss-bearing simulation, €1,000 / 5% warning and a 4-day reflection period apply."],
                    ["sophisticated", "Sophisticated (self-certified)", "Would require a self-certification meeting ECSPR Annex II criteria. Treated identically in this demo."],
                  ] as const).map(([v, t, d]) => (
                    <label key={v} className={cn("flex min-h-11 cursor-pointer items-start gap-3 rounded-xl border p-4", classification === v ? "border-emerald bg-mint/50" : "border-line bg-card")}>
                      <input type="radio" name="classification" value={v} checked={classification === v} onChange={() => setClassification(v)} className="mt-1 accent-[#063f36]" />
                      <span><span className="font-sans text-sm font-semibold">{t}</span><span className="block text-xs text-muted">{d}</span></span>
                    </label>
                  ))}
                </div>
              </section>

              <section className="mt-6">
                <h3 className="font-sans text-sm font-semibold uppercase tracking-wide text-muted">4 · Entry knowledge test (5 questions, pass at {ECSPR.knowledgeTestPass}/5)</h3>
                <ol className="mt-2 space-y-4">
                  {KNOWLEDGE_QUESTIONS.map((q, qi) => (
                    <li key={q.q} className="rounded-xl border border-line bg-surface p-4">
                      <p className="font-sans text-sm font-semibold">{qi + 1}. {q.q}</p>
                      <div className="mt-2 grid gap-2">
                        {q.options.map((o, oi) => {
                          const chosen = answers[qi] === oi;
                          const correct = testSubmitted && oi === q.answer;
                          const wrong = testSubmitted && chosen && oi !== q.answer;
                          return (
                            <label key={o} className={cn("flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 text-sm", chosen && !testSubmitted && "border-emerald bg-mint/50", correct && "border-forest bg-mint", wrong && "border-risk-ink bg-risk", !chosen && !correct && "border-line bg-card")}>
                              <input type="radio" name={`q${qi}`} checked={chosen} disabled={testSubmitted} onChange={() => setAnswers(answers.map((a, i) => (i === qi ? oi : a)))} className="accent-[#063f36]" />
                              {o}
                            </label>
                          );
                        })}
                      </div>
                    </li>
                  ))}
                </ol>
                {!testSubmitted ? (
                  <Button className="mt-4" variant="secondary" disabled={answers.some((a) => a === null)} onClick={submitTest}>Submit answers</Button>
                ) : (
                  <div className={cn("mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl p-4 text-sm", passed ? "bg-mint text-emerald" : "bg-risk text-risk-ink")}>
                    <span className="font-sans font-semibold">{passed ? `Passed — ${score}/5` : `Not passed — ${score}/5. Under ECSPR you would be warned and could retake the test.`}</span>
                    {!passed ? <Button size="sm" variant="secondary" onClick={() => { setTestSubmitted(false); setAnswers(Array(KNOWLEDGE_QUESTIONS.length).fill(null)); }}>Retake</Button> : null}
                  </div>
                )}
              </section>

              <section className="mt-6">
                <h3 className="font-sans text-sm font-semibold uppercase tracking-wide text-muted">5 · Can you bear the loss? (simulation)</h3>
                <div className="mt-2 grid gap-4 sm:grid-cols-[220px_1fr] sm:items-start">
                  <div className="space-y-1.5">
                    <Label htmlFor="nw">Stated net worth (fictional, €)</Label>
                    <Input id="nw" type="number" inputMode="numeric" min={0} step={1000} value={netWorth} onChange={(e) => setNetWorth(Math.max(0, Number(e.target.value) || 0))} />
                  </div>
                  <div className="tabular rounded-xl border border-line bg-surface p-4 text-sm">
                    <p>This {isLoan ? "loan" : "investment"} of <strong>{eur(amount)}</strong> is <strong>{netWorth > 0 ? pct(amount / netWorth, 1) : "—"}</strong> of the stated net worth.</p>
                    <p className="mt-1 text-muted">If the full amount were lost, {eur(netWorth - amount)} would remain. ECSPR guidance is that non-sophisticated investors should not invest more than 10% of net worth in crowdfunding.</p>
                    <p className={cn("mt-1 font-semibold", netWorth > 0 && amount / netWorth > 0.1 ? "text-risk-ink" : "text-emerald")}>{netWorth > 0 && amount / netWorth > 0.1 ? "Above the 10% guidance level." : "Within the 10% guidance level."}</p>
                  </div>
                </div>
                <div className="mt-3">
                  <Checkbox id="loss" checked={lossAck} onChange={setLossAck}>I understand that I could lose the whole amount and that no income is guaranteed.</Checkbox>
                </div>
              </section>

              <div className="mt-6 flex justify-between">
                <Button variant="ghost" onClick={() => setStep(2)}><ArrowLeft className="h-4 w-4" /> Back</Button>
                <Button disabled={!onboardingDone} onClick={() => setStep(4)}>Continue <ArrowRight className="h-4 w-4" /></Button>
              </div>
            </Card>
          ) : null}

          {/* Step 4 — risk acknowledgement */}
          {step === 4 ? (
            <Card className="p-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-sans text-xl font-semibold">Risk acknowledgement</h2>
                <StageBadge stage={isLoan ? 1 : 2} compact />
              </div>
              <RiskNotice className="mt-4" />
              <div className="mt-4">
                <Checkbox id="risk" checked={riskAck} onChange={setRiskAck}>I have read and understood: “{RISK_WARNING}”</Checkbox>
              </div>
              {warning.exceeds ? (
                <div className="mt-4 rounded-xl border border-gold/60 bg-demo p-4 text-sm text-demo-ink">
                  <p className="flex items-center gap-2 font-sans font-semibold"><ShieldAlert className="h-5 w-5" /> Additional ECSPR-style warning</p>
                  <p className="mt-1">{eur(amount)} is more than the higher of €1,000 or 5% of your stated net worth ({eur(warning.threshold)}). Under ECSPR you would receive this specific risk warning and have to expressly consent before proceeding.</p>
                  <div className="mt-3">
                    <Checkbox id="threshold" checked={thresholdAck} onChange={setThresholdAck}>I have received this warning and expressly consent to proceed (simulated).</Checkbox>
                  </div>
                </div>
              ) : null}
              <div className="mt-6 flex justify-between">
                <Button variant="ghost" onClick={() => setStep(3)}><ArrowLeft className="h-4 w-4" /> Back</Button>
                <Button disabled={!riskAck || (warning.exceeds && !thresholdAck)} onClick={() => setStep(5)}>Continue to review <ArrowRight className="h-4 w-4" /></Button>
              </div>
            </Card>
          ) : null}

          {/* Step 5 — review */}
          {step === 5 ? (
            <div className="space-y-6">
              <Card className="p-6">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="font-sans text-xl font-semibold">Review your simulation</h2>
                  <StageBadge stage={isLoan ? 1 : 2} compact />
                </div>
                <dl className="tabular mt-4 grid gap-y-2 text-sm sm:grid-cols-[220px_1fr]">
                  {[
                    ["Offer", p.title],
                    ["Instrument", spv?.instrument ?? "—"],
                    ["Company / borrower", spv?.name ?? "—"],
                    ["Amount", eur(amount, 2)],
                    ["Fees deducted", isLoan ? "€0.00 (borrower pays the arrangement fee)" : eur(illustrate(p, amount).entryFee, 2)],
                    ["Net invested / lent", eur(isLoan ? amount : illustrate(p, amount).netInvested, 2)],
                    ["Participation in the raise", pct((isLoan ? amount : illustrate(p, amount).netInvested) / raiseTarget(p), 3)],
                    ["Classification", classification === "retail" ? "Retail (non-sophisticated)" : "Sophisticated (self-certified)"],
                    ["Knowledge test", `${score}/5 — passed`],
                    ["Warning shown", warning.exceeds ? "Yes — €1,000 / 5% net-worth warning accepted" : "Not required"],
                  ].map(([k, v]) => (
                    <div key={k} className="contents"><dt className="text-muted">{k}</dt><dd className="font-medium">{v}</dd></div>
                  ))}
                </dl>
                <div className="mt-5 rounded-xl border border-line bg-surface p-4">
                  <IllustrationPanel p={p} amount={amount} />
                </div>
                <div className="mt-4 flex items-start gap-3 rounded-xl bg-mint/60 p-4 text-sm text-emerald">
                  <Clock className="mt-0.5 h-5 w-5 shrink-0" />
                  <p><strong>{ECSPR.reflectionDays}-day reflection period.</strong> As a non-sophisticated investor you could withdraw this offer without cost within {ECSPR.reflectionDays} calendar days. The demo lets you try that on the next screen.</p>
                </div>
                <div className="mt-6 flex justify-between">
                  <Button variant="ghost" onClick={() => setStep(4)}><ArrowLeft className="h-4 w-4" /> Back</Button>
                  <Button onClick={complete}>Complete simulation <ArrowRight className="h-4 w-4" /></Button>
                </div>
              </Card>
              <KiisCard p={p} spv={spv} />
            </div>
          ) : null}

          {/* Step 6 — confirmation */}
          {step === 6 && result ? (
            <Card className="p-6 sm:p-8">
              <div className="flex items-start gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-mint text-emerald"><CheckCircle2 className="h-7 w-7" /></span>
                <div>
                  <h2 className="font-serif text-3xl font-medium">Simulation Completed</h2>
                  <p className="mt-2 font-sans font-semibold text-ink">No real money has been transferred.</p>
                  <p className="font-sans font-semibold text-ink">No securities or tokens have been issued.</p>
                </div>
              </div>
              <dl className="tabular mt-6 grid gap-y-2 text-sm sm:grid-cols-[220px_1fr]">
                {[
                  ["Simulation reference", result.id],
                  ["Offer", p.title],
                  ["Amount", eur(result.amount, 2)],
                  ["Units recorded", `${Math.round(result.netInvested)} (1 unit = €1 net)`],
                  ["Status", result.status],
                ].map(([k, v]) => (
                  <div key={k} className="contents"><dt className="text-muted">{k}</dt><dd className="font-medium">{v}</dd></div>
                ))}
              </dl>
              <div className="mt-6 rounded-xl border border-line bg-surface p-4">
                <p className="flex items-center gap-2 font-sans text-sm font-semibold"><Link2 className="h-4 w-4 text-forest" /> Recorded on Raya Chain (simulated)</p>
                <p className="mt-1 text-xs text-muted">ISSUE transaction {result.txId} · pseudonymous holder only · transfer-restricted</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Link href={`/chain?tx=${result.txId}`} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-emerald px-4 font-sans text-sm font-semibold text-white hover:bg-forest">View the transaction <ArrowRight className="h-4 w-4" /></Link>
                  <Link href="/dashboard" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-line-strong bg-card px-4 font-sans text-sm font-semibold text-ink hover:bg-mint/60">Go to dashboard</Link>
                </div>
              </div>
              {result.status === "Simulated" ? (
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-mint/60 p-4 text-sm text-emerald">
                  <p><strong>Reflection period open.</strong> You have {ECSPR.reflectionDays} calendar days to withdraw without cost (simulated).</p>
                  <Button variant="secondary" size="sm" onClick={() => withdrawInvestment(result.id)}><Undo2 className="h-4 w-4" /> Withdraw (demo)</Button>
                </div>
              ) : (
                <div className="mt-4 rounded-xl bg-demo p-4 text-sm text-demo-ink"><strong>Withdrawn.</strong> A CORRECTION transaction returned the units to the company treasury on Raya Chain, and the audit log records the withdrawal.</div>
              )}
              <IllustrativeNotice className="mt-6">Nothing has happened outside this browser tab. The record lives in sessionStorage and disappears when the tab closes.</IllustrativeNotice>
            </Card>
          ) : null}
        </div>

        {/* Side panel */}
        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <Card className="overflow-hidden">
            <div className="aspect-[16/8]"><PropertyArt palette={p.palette} kind={p.type.includes("apartment") ? "apartment" : "terrace"} label={`Illustration of ${p.title}`} /></div>
            <div className="p-5">
              <p className="font-sans text-xs font-semibold uppercase tracking-wide text-muted">{p.location}</p>
              <h3 className="font-sans text-lg font-semibold">{p.type}</h3>
              <p className="mt-1 text-xs text-muted">{isLoan ? "Secured refurbishment loan" : "Notes in the company that owns the home"}</p>
              <div className="mt-4"><IllustrationPanel p={p} amount={amount} showSchedule={false} /></div>
            </div>
          </Card>
          <IllustrativeNotice />
        </aside>
      </div>
    </div>
  );
}
