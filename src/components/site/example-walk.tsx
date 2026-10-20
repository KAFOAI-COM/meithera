import { Card } from "@/components/ui";
import { FEES, illustrate, illustrateLoan } from "@/lib/finance";
import { seedProperties } from "@/lib/data/properties";
import { eur, pct } from "@/lib/utils";
import { StageBadge } from "./stage-badge";

/**
 * The landing-page "per €1,000" examples. Computed from the finance engine — never hard-coded —
 * so the fee assumptions on screen can only ever come from src/lib/finance.ts.
 */
export function RentShareExample({ amount = 1000 }: { amount?: number }) {
  const p = seedProperties.find((x) => x.id === "prop-d8")!;
  const x = illustrate(p, amount);
  const rows: [string, string][] = [
    ["Amount entered", eur(x.amount, 2)],
    [`Less illustrative acquisition fee (${pct(FEES.entryFeePct, 1)})`, `−${eur(x.entryFee, 2)}`],
    ["Net invested in the home's company", eur(x.netInvested, 2)],
    ["Share of gross rent", eur(x.grossRentShare, 2)],
    ["Less share of operating costs", `−${eur(x.opexShare, 2)}`],
    ["Share of net operating income", eur(x.noiShare, 2)],
    [`Less illustrative administration fee (${pct(FEES.annualAdminPct, 1)} p.a.)`, `−${eur(x.adminFee, 2)}`],
  ];
  return (
    <Card className="tabular p-6 text-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-sans text-xs font-semibold uppercase tracking-[0.08em] text-muted">Example — {p.location} rent share, per {eur(amount)} entered</p>
        <StageBadge stage={2} compact />
      </div>
      {rows.map(([k, v]) => (
        <div key={k} className="flex justify-between gap-4 border-b border-line py-2"><span className="text-muted">{k}</span><span className="font-medium">{v}</span></div>
      ))}
      <div className="flex justify-between py-3 font-sans text-base font-bold text-emerald"><span>Illustrative annual income*</span><span>{eur(x.annualIncome, 2)}</span></div>
      <div className="flex justify-between border-b border-line pb-2 text-xs text-muted"><span>Paid monthly (illustrative)</span><span>{eur(x.monthlyIncome, 2)} / month</span></div>
      <div className="flex justify-between pt-2 text-xs text-muted"><span>Property-level NOI yield {pct(x.propertyYield)} → investor-level {pct(x.investorYield)}</span></div>
      <p className="mt-2 text-xs text-muted">*Before investor-level taxes. Not guaranteed. Figures are illustrative.</p>
    </Card>
  );
}

export function LoanExample({ amount = 1000 }: { amount?: number }) {
  const p = seedProperties.find((x) => x.id === "prop-cork")!;
  const l = illustrateLoan(amount, p.loan!.ratePct, p.loan!.termMonths);
  const rows: [string, string][] = [
    ["Amount lent", eur(l.amount, 2)],
    ["Lender fee", "€0.00 (borrower pays the arrangement fee)"],
    [`Fixed rate (${l.ratePct}% p.a., ${l.months} months)`, `${eur(l.monthlyInterest, 2)} / month`],
    ["Total interest over the term", eur(l.totalInterest, 2)],
    ["Principal repaid at term", eur(l.amount, 2)],
    ["Security", p.loan!.security],
  ];
  return (
    <Card className="tabular p-6 text-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-sans text-xs font-semibold uppercase tracking-[0.08em] text-muted">Example — {p.location} secured loan, per {eur(amount)} lent</p>
        <StageBadge stage={1} compact />
      </div>
      {rows.map(([k, v]) => (
        <div key={k} className="flex justify-between gap-4 border-b border-line py-2"><span className="text-muted">{k}</span><span className="text-right font-medium">{v}</span></div>
      ))}
      <div className="flex justify-between py-3 font-sans text-base font-bold text-emerald"><span>Illustrative total repaid*</span><span>{eur(l.totalRepaid, 2)}</span></div>
      <p className="text-xs text-muted">*Before investor-level taxes. Assumes no borrower default. A first legal charge reduces but does not remove the risk of loss.</p>
    </Card>
  );
}
