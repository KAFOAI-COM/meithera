"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { Property } from "@/lib/types";
import { FEES, illustrate, illustrateLoan, loanFacility } from "@/lib/finance";
import { cn, eur, pct } from "@/lib/utils";
import { Input, Label } from "@/components/ui";
import { StageBadge } from "@/components/site/stage-badge";
import { offerStage } from "@/lib/stages";

const MIN = 100;
const MAX = 10000;
const clamp = (n: number) => Math.min(MAX, Math.max(MIN, Math.round(n)));

function Line({ k, v, sub, minus, strong }: { k: string; v: string; sub?: string; minus?: boolean; strong?: boolean }) {
  return (
    <div className={cn("flex items-baseline justify-between gap-4 border-b border-line py-2.5", strong && "font-semibold")}>
      <span className={strong ? "text-ink" : "text-muted"}>
        {k}
        {sub ? <span className="ml-1.5 text-xs text-muted/80">{sub}</span> : null}
      </span>
      <span className={cn("tabular font-medium", minus && "text-risk-ink")}>{minus ? `−${v}` : v}</span>
    </div>
  );
}

/** Gross → net bar: each segment's width is proportional to its euro amount. */
function Waterfall({ parts }: { parts: { label: string; value: number; tone: "gross" | "cost" | "net" }[] }) {
  const max = Math.max(...parts.map((p) => p.value), 0.01);
  const tone = { gross: "bg-forest", cost: "bg-risk-ink/70", net: "bg-gold" };
  return (
    <div className="space-y-2.5">
      {parts.map((p) => (
        <div key={p.label} className="grid grid-cols-[minmax(0,8.5rem)_1fr_auto] items-center gap-3 text-xs">
          <span className="truncate text-muted">{p.label}</span>
          <span className="h-2.5 overflow-hidden rounded-full bg-mint/60">
            <span className={cn("block h-full rounded-full", tone[p.tone])} style={{ width: `${(p.value / max) * 100}%` }} />
          </span>
          <span className="tabular w-16 text-right font-sans font-semibold text-ink">{eur(p.value, 2)}</span>
        </div>
      ))}
    </div>
  );
}

/** Illustrative €100–€10,000 calculator. Rent shares use illustrate(); loans use illustrateLoan(). */
export function Calculator({ p }: { p: Property }) {
  const [amount, setAmount] = useState(1000);
  const [raw, setRaw] = useState("1000");
  const [showAll, setShowAll] = useState(false);
  const isLoan = p.offerType === "loan" && !!p.loan;
  const set = (n: number) => {
    const v = clamp(n);
    setAmount(v);
    setRaw(String(v));
  };

  const entryPct = pct(FEES.entryFeePct, 1);
  const adminPct = pct(FEES.annualAdminPct, 1);
  const r = illustrate(p, amount);
  const l = isLoan ? illustrateLoan(amount, p.loan!.ratePct, p.loan!.months, loanFacility(p)) : null;

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
      <div>
        <div className="flex items-center justify-between gap-3">
          <Label htmlFor="calc-amount">Illustrative amount</Label>
          <StageBadge stage={offerStage(p)} />
        </div>
        <div className="mt-3 flex items-center gap-3">
          <div className="relative w-40">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-sans font-semibold text-muted">€</span>
            <Input
              id="calc-amount"
              inputMode="numeric"
              className="tabular h-12 pl-7 font-sans text-lg font-semibold"
              value={raw}
              onChange={(e) => {
                const d = e.target.value.replace(/[^\d]/g, "");
                setRaw(d);
                if (d) setAmount(clamp(Number(d)));
              }}
              onBlur={() => set(Number(raw || MIN))}
              aria-describedby="calc-range"
            />
          </div>
          <p id="calc-range" className="text-xs text-muted">Between {eur(MIN)} and {eur(MAX)}</p>
        </div>
        <input
          type="range"
          min={MIN}
          max={MAX}
          step={50}
          value={amount}
          onChange={(e) => set(Number(e.target.value))}
          className="mt-5 w-full accent-[#063f36]"
          aria-label="Illustrative amount slider"
        />
        <div className="mt-2 flex flex-wrap gap-2">
          {[100, 500, 1000, 2500, 5000, 10000].map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => set(v)}
              className={cn("min-h-9 rounded-full border px-3 font-sans text-xs font-semibold transition-colors", amount === v ? "border-emerald bg-emerald text-white" : "border-line-strong/50 text-muted hover:border-emerald hover:text-emerald")}
            >
              {eur(v)}
            </button>
          ))}
        </div>

        <div className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line">
          <div className="bg-emerald p-5 text-white">
            <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.1em] text-white/60">{isLoan ? "Net interest / month" : "Net income / month"}</p>
            <p className="tabular mt-2 font-serif text-4xl leading-none">{eur(isLoan ? l!.monthlyNet : r.monthlyIncome, 2)}</p>
            <p className="mt-2 text-[11px] text-white/60">after fees, before investor-level taxes</p>
          </div>
          <div className="bg-card p-5">
            <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.1em] text-muted">{isLoan ? "Total over the term" : "Net income / year"}</p>
            <p className="tabular mt-2 font-serif text-4xl leading-none text-emerald">{eur(isLoan ? l!.totalNet : r.annualIncome, 2)}</p>
            <p className="mt-2 text-[11px] text-muted">{isLoan ? `${l!.months} monthly payments + ${eur(l!.netLent, 2)} principal at maturity` : `${pct(r.investorYield)} on the amount entered`}</p>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-line bg-surface p-5">
          <p className="mb-4 font-sans text-[11px] font-semibold uppercase tracking-[0.1em] text-muted">Where the money goes · per year</p>
          {isLoan ? (
            <Waterfall
              parts={[
                { label: `Interest at ${l!.ratePct}%`, value: l!.monthlyInterest * 12, tone: "gross" },
                { label: `Admin fee (${adminPct})`, value: l!.adminFeeMonthly * 12, tone: "cost" },
                { label: "Your net interest", value: l!.monthlyNet * 12, tone: "net" },
              ]}
            />
          ) : (
            <Waterfall
              parts={[
                { label: "Share of gross rent", value: r.grossRentShare, tone: "gross" },
                { label: "Operating costs", value: r.opexShare, tone: "cost" },
                { label: `Admin fee (${adminPct})`, value: r.adminFee, tone: "cost" },
                { label: "Your net income", value: r.annualIncome, tone: "net" },
              ]}
            />
          )}
        </div>
      </div>

      <div className="tabular text-sm">
        {isLoan ? (
          <>
            <Line k="Amount entered" v={eur(l!.amount, 2)} />
            <Line k="Acquisition fee" sub={`${entryPct}, one-off`} v={eur(l!.entryFee, 2)} minus />
            <Line k="Net lent" v={eur(l!.netLent, 2)} strong />
            <Line k="Share of the loan facility" sub={`of ${eur(loanFacility(p))}`} v={pct(l!.participation, 4)} />
            <Line k="Gross interest per month" sub={`${l!.ratePct}% p.a. fixed`} v={eur(l!.monthlyInterest, 2)} />
            <Line k="Administration fee per month" sub={`${adminPct} p.a.`} v={eur(l!.adminFeeMonthly, 2)} minus />
            <Line k="Net interest per month" v={eur(l!.monthlyNet, 2)} strong />
            <Line k="Principal returned at maturity" sub={`month ${l!.months}`} v={eur(l!.netLent, 2)} />
            <div className="mt-5 overflow-hidden rounded-xl border border-line">
              <table className="w-full text-xs">
                <thead className="bg-surface text-muted">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold">Month</th>
                    <th className="px-3 py-2 text-right font-semibold">Interest</th>
                    <th className="px-3 py-2 text-right font-semibold">Admin fee</th>
                    <th className="px-3 py-2 text-right font-semibold">Net</th>
                    <th className="px-3 py-2 text-right font-semibold">Principal</th>
                  </tr>
                </thead>
                <tbody>
                  {l!.schedule.filter((_, i) => showAll || i < 3 || i === l!.months - 1).map((m) => (
                    <tr key={m.month} className="border-t border-line">
                      <td className="px-3 py-2">{m.month}</td>
                      <td className="px-3 py-2 text-right">{eur(m.interest, 2)}</td>
                      <td className="px-3 py-2 text-right text-risk-ink">−{eur(m.adminFee, 2)}</td>
                      <td className="px-3 py-2 text-right font-semibold">{eur(m.net, 2)}</td>
                      <td className="px-3 py-2 text-right">{m.principal ? eur(m.principal, 2) : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button type="button" onClick={() => setShowAll((v) => !v)} className="flex min-h-10 w-full items-center justify-center gap-1 border-t border-line font-sans text-xs font-semibold text-forest hover:bg-mint/40">
                {showAll ? "Show fewer months" : `Show all ${l!.months} months`} <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", showAll && "rotate-180")} />
              </button>
            </div>
          </>
        ) : (
          <>
            <Line k="Amount entered" v={eur(r.amount, 2)} />
            <Line k="Acquisition fee" sub={`${entryPct}, one-off`} v={eur(r.entryFee, 2)} minus />
            <Line k="Net invested in the company" v={eur(r.netInvested, 2)} strong />
            <Line k="Illustrative participation" sub="of the company’s economic interest" v={pct(r.participation, 4)} />
            <Line k="Share of gross rent" sub="per year" v={eur(r.grossRentShare, 2)} />
            <Line k="Share of operating costs" v={eur(r.opexShare, 2)} minus />
            <Line k="Share of net operating income" v={eur(r.noiShare, 2)} />
            <Line k="Administration fee" sub={`${adminPct} of net invested`} v={eur(r.adminFee, 2)} minus />
            <Line k="Illustrative annual income" v={eur(r.annualIncome, 2)} strong />
            <Line k="Illustrative monthly income" sub="paid monthly" v={eur(r.monthlyIncome, 2)} strong />
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-line p-4">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">Property-level yield</p>
                <p className="mt-1 font-serif text-2xl text-ink">{pct(r.propertyYield)}</p>
                <p className="mt-1 text-[11px] leading-snug text-muted">NOI ÷ total project cost. Not your return.</p>
              </div>
              <div className="rounded-xl border border-gold/50 bg-[#fbf7ef] p-4">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-gold-ink">Your illustrative net yield</p>
                <p className="mt-1 font-serif text-2xl text-ink">{pct(r.investorYield)}</p>
                <p className="mt-1 text-[11px] leading-snug text-muted">Net income ÷ amount entered, after both fees.</p>
              </div>
            </div>
          </>
        )}
        <p className="mt-4 text-xs leading-relaxed text-muted">
          Illustrative only, before investor-level taxes. Assumes rent, costs{isLoan ? ", interest and repayment" : " and occupancy"} as modelled; actual results may be lower and you may lose capital. Nothing here is an offer.
        </p>
      </div>
    </div>
  );
}
