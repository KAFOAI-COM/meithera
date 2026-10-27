"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Check, CheckCircle2, Fingerprint, GraduationCap, Loader2, Scale, ShieldCheck, UserRound, XCircle } from "lucide-react";
import { cn, eur } from "@/lib/utils";
import { Button } from "@/components/ui";

export type Classification = "retail" | "sophisticated";
export interface NetWorthBand {
  id: string;
  label: string;
  mid: number;
}
export const NET_WORTH_BANDS: NetWorthBand[] = [
  { id: "lt25", label: "Under €25,000", mid: 15000 },
  { id: "25-100", label: "€25,000 – €100,000", mid: 60000 },
  { id: "100-250", label: "€100,000 – €250,000", mid: 175000 },
  { id: "gt250", label: "Over €250,000", mid: 350000 },
];

export const QUIZ = [
  { q: "If the project goes badly, what could happen to the money you put in?", options: ["I could lose some or all of it", "The State would repay me", "Meithera guarantees it"], correct: 0 },
  { q: "Can you get your money back whenever you want?", options: ["Yes, at any time", "No — I may have to hold until maturity or a sale", "Yes, after one month"], correct: 1 },
  { q: "A property shows a 5.39% net operating yield. Is that your return?", options: ["Yes, exactly", "No — fees and taxes reduce what I receive, and it isn’t guaranteed"], correct: 1 },
  { q: "In a Stage 2 rent share, what would you hold?", options: ["A share of the house’s title deeds", "Notes in the company that owns the home", "A cryptocurrency"], correct: 1 },
  { q: "Is this covered by the Deposit Guarantee Scheme?", options: ["Yes, up to €100,000", "No"], correct: 1 },
];
export const QUIZ_PASS = 4;

export interface OnboardingResult {
  classification: Classification;
  quizScore: number;
  band: NetWorthBand;
}

const SUBSTEPS = [
  { id: "details", label: "Personal details", icon: UserRound },
  { id: "id", label: "Identity check", icon: Fingerprint },
  { id: "aml", label: "AML screening", icon: ShieldCheck },
  { id: "class", label: "Investor classification", icon: Scale },
  { id: "quiz", label: "Knowledge test", icon: GraduationCap },
  { id: "loss", label: "Ability to bear loss", icon: Scale },
] as const;

function Animated({ ms, onDone, children }: { ms: number; onDone: () => void; children: (done: boolean, pct: number) => React.ReactNode }) {
  const reduce = useReducedMotion();
  const [pct, setPct] = useState(reduce ? 100 : 0);
  useEffect(() => {
    if (reduce) {
      onDone();
      return;
    }
    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(100, ((t - start) / ms) * 100);
      setPct(p);
      if (p < 100) raf = requestAnimationFrame(tick);
      else onDone();
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return <>{children(pct >= 100, pct)}</>;
}

/** Simulated onboarding. Nothing is verified, collected or sent — every result is pre-determined and fictional. */
export function Onboarding({ amount, personaName, onComplete, onLog }: { amount: number; personaName: string; onComplete: (r: OnboardingResult) => void; onLog: (type: "KNOWLEDGE_TEST" | "ONBOARDING_SIMULATION", detail: string) => void }) {
  const [i, setI] = useState(0);
  const [idDone, setIdDone] = useState(false);
  const [amlDone, setAmlDone] = useState(false);
  const [classification, setClassification] = useState<Classification>("retail");
  const [answers, setAnswers] = useState<(number | null)[]>(QUIZ.map(() => null));
  const [submitted, setSubmitted] = useState(false);
  const [bandId, setBandId] = useState<string>("25-100");
  const [lossOk, setLossOk] = useState(false);

  const score = answers.filter((a, k) => a === QUIZ[k].correct).length;
  const passed = score >= QUIZ_PASS;
  const band = NET_WORTH_BANDS.find((b) => b.id === bandId)!;
  const capacity = band.mid * 0.1;

  const next = () => setI((v) => v + 1);
  const firstName = personaName.split(" ")[0].replace(/\(.*\)/, "").trim() || "Aoife";

  return (
    <ol className="space-y-3">
      {SUBSTEPS.map((s, k) => {
        const state = k < i ? "done" : k === i ? "active" : "todo";
        return (
          <li key={s.id} className={cn("overflow-hidden rounded-2xl border transition-colors", state === "active" ? "border-forest/40 bg-card shadow-card" : "border-line bg-card/60")}>
            <div className="flex items-center gap-3 px-5 py-4">
              <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl", state === "done" ? "bg-forest text-white" : state === "active" ? "bg-mint text-emerald" : "bg-surface text-muted ring-1 ring-line")}>
                {state === "done" ? <Check className="h-4 w-4" /> : <s.icon className="h-4 w-4" />}
              </span>
              <p className={cn("flex-1 font-sans text-sm font-semibold", state === "todo" ? "text-muted" : "text-ink")}>{s.label}</p>
              {state === "done" ? <span className="font-sans text-xs font-semibold text-forest">Completed (simulated)</span> : null}
            </div>

            {state === "active" ? (
              <div className="border-t border-line px-5 pb-5 pt-4">
                {s.id === "details" ? (
                  <>
                    <p className="text-sm text-muted">Prefilled with a fictional profile. Nothing you type here is stored — and there is nothing to type.</p>
                    <dl className="mt-4 grid gap-px overflow-hidden rounded-xl border border-line bg-line text-sm sm:grid-cols-2">
                      {[["Name", `${firstName} (fictional)`], ["County", "Dublin"], ["Email", "not collected"], ["Date of birth", "not collected"], ["Tax residence", "Ireland (assumed)"], ["Source of funds", "Salary (fictional)"]].map(([k, v]) => (
                        <div key={k} className="bg-surface p-3"><dt className="text-[11px] uppercase tracking-wide text-muted">{k}</dt><dd className="mt-0.5 font-sans font-semibold text-ink">{v}</dd></div>
                      ))}
                    </dl>
                    <Button className="mt-5" onClick={next}>Confirm details</Button>
                  </>
                ) : null}

                {s.id === "id" ? (
                  <Animated ms={1600} onDone={() => setIdDone(true)}>
                    {(done, pct) => (
                      <>
                        <div className="flex items-center gap-3 text-sm">
                          {done ? <CheckCircle2 className="h-5 w-5 text-forest" /> : <Loader2 className="h-5 w-5 animate-spin text-forest" />}
                          <span className="font-medium text-ink">{done ? "Identity verified (simulated)" : "Running simulated ID check…"}</span>
                        </div>
                        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-mint"><div className="h-full rounded-full bg-forest" style={{ width: `${pct}%` }} /></div>
                        <p className="mt-3 rounded-lg bg-demo px-3 py-2 text-xs font-medium text-demo-ink">ID check — no document collected. A live service would use an authorised identity-verification provider.</p>
                        <Button className="mt-5" onClick={next} disabled={!idDone}>Continue</Button>
                      </>
                    )}
                  </Animated>
                ) : null}

                {s.id === "aml" ? (
                  <Animated ms={1800} onDone={() => setAmlDone(true)}>
                    {(_, pct) => (
                      <>
                        <ul className="space-y-2 text-sm">
                          {["Sanctions lists (EU, UN, OFAC)", "Politically exposed persons", "Adverse media", "Source-of-funds plausibility"].map((c, n) => {
                            const ok = pct >= ((n + 1) / 4) * 100 - 1;
                            return (
                              <li key={c} className="flex items-center gap-2.5">
                                {ok ? <CheckCircle2 className="h-4 w-4 text-forest" /> : <Loader2 className="h-4 w-4 animate-spin text-muted" />}
                                <span className={ok ? "text-ink" : "text-muted"}>{c}</span>
                                {ok ? <span className="ml-auto text-xs font-semibold text-forest">Clear (simulated)</span> : null}
                              </li>
                            );
                          })}
                        </ul>
                        <p className="mt-3 text-xs text-muted">Simulated screening against no real list. No data leaves your browser.</p>
                        <Button className="mt-5" onClick={next} disabled={!amlDone}>Continue</Button>
                      </>
                    )}
                  </Animated>
                ) : null}

                {s.id === "class" ? (
                  <>
                    <div className="grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Investor classification">
                      {([["retail", "Non-sophisticated (retail)", "Default. Knowledge test, loss simulation, warnings and a 4-day reflection period apply."], ["sophisticated", "Sophisticated (self-certified)", "Would require evidence of experience or wealth in a live service."]] as const).map(([v, t, d]) => (
                        <button key={v} type="button" role="radio" aria-checked={classification === v} onClick={() => setClassification(v)} className={cn("rounded-xl border p-4 text-left transition-colors", classification === v ? "border-emerald bg-mint/50" : "border-line hover:border-forest/40")}>
                          <p className="font-sans text-sm font-semibold text-ink">{t}</p>
                          <p className="mt-1 text-xs leading-relaxed text-muted">{d}</p>
                        </button>
                      ))}
                    </div>
                    <Button className="mt-5" onClick={next}>Continue</Button>
                  </>
                ) : null}

                {s.id === "quiz" ? (
                  <>
                    <p className="text-sm text-muted">Five questions, ECSPR-style. You need {QUIZ_PASS} of 5 to continue.</p>
                    <ol className="mt-4 space-y-5">
                      {QUIZ.map((q, n) => (
                        <li key={q.q}>
                          <p className="font-sans text-sm font-semibold text-ink">{n + 1}. {q.q}</p>
                          <div className="mt-2 flex flex-col gap-2">
                            {q.options.map((o, oi) => {
                              const chosen = answers[n] === oi;
                              const right = submitted && oi === q.correct;
                              const wrong = submitted && chosen && oi !== q.correct;
                              return (
                                <button
                                  key={o}
                                  type="button"
                                  disabled={submitted && passed}
                                  onClick={() => {
                                    setSubmitted(false);
                                    setAnswers(answers.map((a, x) => (x === n ? oi : a)));
                                  }}
                                  className={cn(
                                    "flex min-h-11 items-center gap-2 rounded-lg border px-3 text-left text-sm transition-colors",
                                    right ? "border-forest bg-mint/60 text-emerald" : wrong ? "border-risk-ink/40 bg-risk text-risk-ink" : chosen ? "border-emerald bg-mint/40" : "border-line hover:border-forest/40",
                                  )}
                                >
                                  {right ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : wrong ? <XCircle className="h-4 w-4 shrink-0" /> : <span className={cn("h-4 w-4 shrink-0 rounded-full border", chosen ? "border-[5px] border-emerald" : "border-line-strong")} />}
                                  {o}
                                </button>
                              );
                            })}
                          </div>
                        </li>
                      ))}
                    </ol>
                    {submitted ? (
                      <p className={cn("mt-5 rounded-lg px-3 py-2 text-sm font-semibold", passed ? "bg-mint text-emerald" : "bg-risk text-risk-ink")}>
                        {score} of 5 correct — {passed ? "passed." : `please review the highlighted answers and try again (${QUIZ_PASS} needed).`}
                      </p>
                    ) : null}
                    <div className="mt-5 flex gap-3">
                      {!submitted || !passed ? (
                        <Button
                          disabled={answers.some((a) => a === null)}
                          onClick={() => {
                            setSubmitted(true);
                            onLog("KNOWLEDGE_TEST", `Knowledge test ${score}/5 — ${score >= QUIZ_PASS ? "passed" : "failed"} (simulated)`);
                          }}
                        >
                          Check answers
                        </Button>
                      ) : (
                        <Button onClick={next}>Continue</Button>
                      )}
                    </div>
                  </>
                ) : null}

                {s.id === "loss" ? (
                  <>
                    <p className="text-sm text-muted">Roughly what is your net worth? A band is enough — it is used only here, in your browser, to show what a loss would mean.</p>
                    <div className="mt-4 grid gap-2 sm:grid-cols-2">
                      {NET_WORTH_BANDS.map((b) => (
                        <button key={b.id} type="button" onClick={() => setBandId(b.id)} aria-pressed={bandId === b.id} className={cn("min-h-11 rounded-lg border px-3 text-left font-sans text-sm font-semibold transition-colors", bandId === b.id ? "border-emerald bg-mint/50 text-emerald" : "border-line text-ink hover:border-forest/40")}>
                          {b.label}
                        </button>
                      ))}
                    </div>
                    <div className="mt-5 grid gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-3">
                      <div className="bg-surface p-4"><p className="text-[11px] uppercase tracking-wide text-muted">If you lost it all</p><p className="tabular mt-1 font-serif text-2xl text-risk-ink">−{eur(amount)}</p></div>
                      <div className="bg-surface p-4"><p className="text-[11px] uppercase tracking-wide text-muted">Share of net worth</p><p className="tabular mt-1 font-serif text-2xl text-ink">{((amount / band.mid) * 100).toLocaleString("en-IE", { maximumFractionDigits: 1 })}%</p></div>
                      <div className="bg-surface p-4"><p className="text-[11px] uppercase tracking-wide text-muted">10% loss capacity</p><p className="tabular mt-1 font-serif text-2xl text-ink">{eur(capacity)}</p></div>
                    </div>
                    {amount > capacity ? <p className="mt-3 rounded-lg bg-risk px-3 py-2 text-xs font-medium text-risk-ink">This amount is above 10% of the midpoint of your band. Consider a smaller amount.</p> : null}
                    <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-xl border border-line bg-surface p-4 text-sm">
                      <input type="checkbox" checked={lossOk} onChange={(e) => setLossOk(e.target.checked)} className="mt-0.5 h-5 w-5 shrink-0 accent-[#063f36]" />
                      <span>I understand I could lose the whole {eur(amount)} and could bear that loss.</span>
                    </label>
                    <Button
                      className="mt-5"
                      disabled={!lossOk}
                      onClick={() => {
                        onLog("ONBOARDING_SIMULATION", `Simulated onboarding completed: ${classification}, knowledge test ${score}/5, net-worth band ${band.label}`);
                        onComplete({ classification, quizScore: score, band });
                      }}
                    >
                      Finish onboarding
                    </Button>
                  </>
                ) : null}
              </div>
            ) : null}
          </li>
        );
      })}
      <motion.li layout className="px-1 pt-1 text-xs text-muted">This onboarding is a simulation. It does not perform legally sufficient KYC, AML, appropriateness or suitability checks.</motion.li>
    </ol>
  );
}
