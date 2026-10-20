import { FileText } from "lucide-react";
import type { Property, Spv } from "@/lib/types";
import { ECSPR, FEES, loanToValue, netOperatingYield, raiseTarget } from "@/lib/finance";
import { eur, pct, cn } from "@/lib/utils";
import { StageBadge } from "@/components/site/stage-badge";
import { RISK_WARNING } from "@/components/site/notices";

export const RISK_FACTORS = [
  "Capital at risk — you could lose some or all of the amount you put in.",
  "Rental vacancy — if the home is empty, income falls or stops.",
  "Valuation changes — the home could be worth less than it cost.",
  "Refurbishment overruns — works can cost more and take longer than planned.",
  "Illiquidity — there may be no way to sell before the planned exit.",
  "Regulatory uncertainty — the structure is subject to regulatory assessment.",
  "Tax — income shown is before investor-level taxes.",
];

export const LOAN_RISK_FACTORS = [
  "Borrower default — interest and principal depend on the borrower paying.",
  "Security shortfall — a first legal charge may not cover the loan if the home sells for less.",
  "Delay — refurbishment or refinancing can run late, delaying repayment.",
  "Illiquidity — the loan cannot be sold before term in this demonstration.",
  "Regulatory uncertainty — the structure is subject to regulatory assessment.",
  "Tax — interest shown is before investor-level taxes.",
];

/**
 * Key Investment Information Sheet — SIMULATED, in the style of ECSPR Annex I. Shown in the
 * review step and in dashboard documents. Watermarked wherever it is rendered as a document.
 */
export function KiisCard({ p, spv, className, document }: { p: Property; spv?: Spv; className?: string; document?: boolean }) {
  const isLoan = p.offerType === "loan" && p.loan;
  const rows: [string, string][] = isLoan
    ? [
        ["Project owner", `${p.location} refurbishment borrower (fictional)`],
        ["Offer type", "Secured fixed-rate loan (Stage 1 · Lending)"],
        ["Instrument", spv?.instrument ?? "Secured loan note"],
        ["Target raise", eur(p.loan!.amount)],
        ["Raised so far (simulated)", `${eur(p.loan!.amount * p.fundedPct)} (${Math.round(p.fundedPct * 100)}%)`],
        ["Interest", `${p.loan!.ratePct}% p.a. fixed, paid monthly, ${p.loan!.termMonths} months`],
        ["Security", p.loan!.security],
        ["Loan-to-value", `${pct(loanToValue(p), 0)} (limit ${pct(FEES.maxLtv, 0)})`],
        ["Lender fees", `None — borrower pays a ${pct(FEES.loanArrangementPct, 1)} arrangement fee`],
        ["Minimum / maximum per investor (demo)", `${eur(100)} / ${eur(10000)}`],
        ["Exit", "Principal at term. No secondary market in this demonstration."],
      ]
    : [
        ["Project owner", spv?.name ?? `Meithera ${p.location} Property DAC (proposed)`],
        ["Offer type", "Notes in the company that owns the home (Stage 2 · Rent share)"],
        ["Instrument", spv?.instrument ?? "Profit-participating note (proposed)"],
        ["Target raise", eur(raiseTarget(p))],
        ["Raised so far (simulated)", `${eur(raiseTarget(p) * p.fundedPct)} (${Math.round(p.fundedPct * 100)}%)`],
        ["Income", `Monthly share of net rental income; property-level NOI yield ${pct(netOperatingYield(p))} (not the investor return)`],
        ["Fees", `${pct(FEES.entryFeePct, 1)} acquisition (one-off), ${pct(FEES.annualAdminPct, 1)} p.a. administration`],
        ["Holding period", `${p.holdingYears} years indicative; investor vote on sale`],
        ["Minimum / maximum per investor (demo)", `${eur(100)} / ${eur(10000)}`],
        ["Exit", "Sale after an investor vote, or an ECSPR bulletin board (no guaranteed buyer)."],
      ];
  return (
    <div className={cn("rounded-2xl border border-line bg-card p-5 text-sm", document && "watermark", className)}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-forest" />
          <div>
            <p className="font-sans text-base font-semibold text-ink">Key Investment Information Sheet</p>
            <p className="text-xs text-muted">Simulated, in the style of ECSPR Annex I · {p.title}</p>
          </div>
        </div>
        <StageBadge stage={isLoan ? 1 : 2} compact />
      </div>
      <dl className="tabular mt-4 grid gap-y-2 sm:grid-cols-[200px_1fr]">
        {rows.map(([k, v]) => (
          <div key={k} className="contents">
            <dt className="text-muted">{k}</dt>
            <dd className="font-medium text-ink">{v}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-4 font-sans text-xs font-semibold uppercase tracking-wide text-muted">Principal risks</p>
      <ul className="mt-1 list-disc space-y-1 pl-5 text-xs text-muted">
        {(isLoan ? LOAN_RISK_FACTORS : RISK_FACTORS).map((r) => <li key={r}>{r}</li>)}
      </ul>
      <p className="mt-4 rounded-lg bg-risk p-3 text-xs text-risk-ink">{RISK_WARNING}</p>
      <p className="mt-3 text-xs text-muted">
        Non-sophisticated investors would have a {ECSPR.reflectionDays}-calendar-day pre-contractual reflection period. A live sheet would carry the ECSPR statement that the offer has been neither verified nor approved by competent authorities or ESMA. Complaints: via the platform and, depending on the authorised entity, the Financial Services and Pensions Ombudsman.
      </p>
    </div>
  );
}
