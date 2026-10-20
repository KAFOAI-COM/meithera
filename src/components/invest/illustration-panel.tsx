"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { Property } from "@/lib/types";
import { FEES, illustrate, illustrateLoan, loanToValue } from "@/lib/finance";
import { eur, pct, cn } from "@/lib/utils";
import { StageBadge } from "@/components/site/stage-badge";

function Row({ k, v, strong, muted }: { k: string; v: string; strong?: boolean; muted?: boolean }) {
  return (
    <div className={cn("flex justify-between gap-4 border-b border-line py-2", strong && "font-sans text-base font-bold text-emerald", muted && "text-xs text-muted")}>
      <span className={cn(!strong && !muted && "text-muted")}>{k}</span>
      <span className={cn("text-right", !strong && "font-medium")}>{v}</span>
    </div>
  );
}

/**
 * Gross → net illustration for one offer and one amount. Rent-share and loan offers share the
 * frame but show different instrument and income panels. All numbers from src/lib/finance.ts.
 */
export function IllustrationPanel({ p, amount, className, showSchedule = true }: { p: Property; amount: number; className?: string; showSchedule?: boolean }) {
  const [open, setOpen] = useState(false);
  if (p.offerType === "loan" && p.loan) {
    const l = illustrateLoan(amount, p.loan.ratePct, p.loan.termMonths);
    return (
      <div className={cn("tabular text-sm", className)}>
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <p className="font-sans text-xs font-semibold uppercase tracking-[0.08em] text-muted">Illustrative lender figures</p>
          <StageBadge stage={1} compact />
        </div>
        <Row k="Amount lent" v={eur(l.amount, 2)} />
        <Row k="Lender fee" v="€0.00" />
        <Row k={`Arrangement fee (${pct(FEES.loanArrangementPct, 1)})`} v="Paid by the borrower" />
        <Row k={`Fixed rate, ${l.months} months`} v={`${l.ratePct}% p.a.`} />
        <Row k="Monthly interest" v={eur(l.monthlyInterest, 2)} />
        <Row k="Total interest over the term" v={eur(l.totalInterest, 2)} />
        <Row k="Principal repaid at term" v={eur(l.amount, 2)} />
        <Row k="Illustrative total repaid*" v={eur(l.totalRepaid, 2)} strong />
        <Row k="Security" v={p.loan.security} muted />
        <Row k="Loan-to-value" v={`${pct(loanToValue(p), 0)} of the illustrative valuation (limit ${pct(FEES.maxLtv, 0)})`} muted />
        {showSchedule ? (
          <div className="mt-3">
            <button type="button" onClick={() => setOpen(!open)} className="flex min-h-11 w-full items-center justify-between rounded-lg border border-line bg-surface px-3 py-2 font-sans text-sm font-semibold text-ink" aria-expanded={open}>
              Repayment schedule ({l.months} months) <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
            </button>
            {open ? (
              <div className="mt-2 max-h-64 overflow-auto rounded-lg border border-line">
                <table className="w-full text-xs">
                  <thead className="sticky top-0 bg-surface">
                    <tr>{["Month", "Interest", "Principal", "Balance"].map((h) => <th key={h} className="px-2 py-1.5 text-left font-sans font-semibold text-muted">{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {l.schedule.map((r) => (
                      <tr key={r.month} className="border-t border-line">
                        <td className="px-2 py-1">{r.month}</td><td className="px-2 py-1">{eur(r.interest, 2)}</td><td className="px-2 py-1">{eur(r.principal, 2)}</td><td className="px-2 py-1">{eur(r.balance, 2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}
          </div>
        ) : null}
        <p className="mt-2 text-xs text-muted">*Before investor-level taxes. Assumes the borrower does not default. Security reduces, but does not remove, the risk of losing capital.</p>
      </div>
    );
  }
  const x = illustrate(p, amount);
  return (
    <div className={cn("tabular text-sm", className)}>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <p className="font-sans text-xs font-semibold uppercase tracking-[0.08em] text-muted">Illustrative investor figures, gross → net</p>
        <StageBadge stage={2} compact />
      </div>
      <Row k="Amount entered" v={eur(x.amount, 2)} />
      <Row k={`Less acquisition fee (${pct(FEES.entryFeePct, 1)}, one-off)`} v={`−${eur(x.entryFee, 2)}`} />
      <Row k="Net invested in the home's company" v={eur(x.netInvested, 2)} />
      <Row k="Illustrative participation" v={pct(x.participation, 3)} />
      <Row k="Share of gross rent (annual)" v={eur(x.grossRentShare, 2)} />
      <Row k="Less share of operating costs" v={`−${eur(x.opexShare, 2)}`} />
      <Row k="Share of net operating income" v={eur(x.noiShare, 2)} />
      <Row k={`Less administration fee (${pct(FEES.annualAdminPct, 1)} p.a. on net invested)`} v={`−${eur(x.adminFee, 2)}`} />
      <Row k="Illustrative annual income*" v={eur(x.annualIncome, 2)} strong />
      <Row k="Paid monthly (illustrative)" v={`${eur(x.monthlyIncome, 2)} / month`} />
      <Row k="Property-level NOI yield → investor-level yield" v={`${pct(x.propertyYield)} → ${pct(x.investorYield)}`} muted />
      <p className="mt-2 text-xs text-muted">*Before investor-level taxes. Not guaranteed: rent can fall, the home can sit empty, works can overrun. The property-level yield is not your return.</p>
    </div>
  );
}
