import type { ChainTx, Property, SimInvestment } from "./types";
import { illustrate, illustrateLoan } from "./finance";
import { pseudonym } from "./ledger";

/**
 * Fixed categorical colour per property — validated with the dataviz palette checker
 * (lightness band, chroma floor, CVD separation, contrast vs surface: all pass).
 * Colour follows the entity, never its rank.
 */
export const PROPERTY_COLOR: Record<string, string> = {
  "prop-d8": "#00826A",
  "prop-cork": "#B8892E",
  "prop-galway": "#3D7FC0",
  "prop-limerick": "#C2593E",
};
export const propertyColor = (id: string) => PROPERTY_COLOR[id] ?? "#65736D";

export interface Holding {
  sim: SimInvestment;
  property: Property;
  /** Illustrative net income per month once paying, after fees, before investor-level taxes. */
  monthlyNet: number;
  /** First month (YYYY-MM) the holding is modelled to pay. */
  incomeStarts: string;
  received: number;
}

const ym = (d: Date) => `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
export const addMonths = (month: string, n: number) => {
  const [y, m] = month.split("-").map(Number);
  return ym(new Date(Date.UTC(y, m - 1 + n, 1)));
};
export const monthLabel = (month: string, withYear = false) =>
  new Date(`${month}-01T00:00:00Z`).toLocaleDateString("en-IE", { month: "short", ...(withYear ? { year: "2-digit" } : {}), timeZone: "UTC" });

export function monthlyNetFor(p: Property, amount: number) {
  return p.offerType === "loan" && p.loan ? illustrateLoan(amount, p.loan.ratePct, p.loan.months).monthlyNet : illustrate(p, amount).monthlyIncome;
}

/** Loan interest is paid around the 15th: holdings funded by then are paid that month, later ones from the next. */
export const LOAN_PAYMENT_DAY = 15;

/** Loans pay from the funding month (or the next, after the payment day); rent shares from the "Tenancy begins" milestone. */
export function incomeStart(p: Property, sim: SimInvestment) {
  if (p.offerType === "loan") {
    const month = sim.createdAt.slice(0, 7);
    return Number(sim.createdAt.slice(8, 10)) <= LOAN_PAYMENT_DAY ? month : addMonths(month, 1);
  }
  return p.milestones.find((m) => /tenancy/i.test(m.label))?.date ?? addMonths(sim.createdAt.slice(0, 7), 12);
}

export const PAYOUT_TYPES = new Set(["REPAYMENT", "DISTRIBUTION"]);

export function payoutsFor(investorId: string, txs: ChainTx[]) {
  const me = pseudonym(investorId);
  return txs.filter((t) => t.to === me && PAYOUT_TYPES.has(t.type));
}

/** Every Raya Chain tx touching this investor's pseudonym, newest first. */
export function ledgerFor(investorId: string, txs: ChainTx[]) {
  const me = pseudonym(investorId);
  return txs.filter((t) => t.to === me || t.from === me).reverse();
}

export function holdingsFor(investorId: string, investments: SimInvestment[], properties: Property[], txs: ChainTx[]): Holding[] {
  const pays = payoutsFor(investorId, txs);
  return investments
    .filter((i) => i.investorId === investorId && i.status !== "Withdrawn")
    .map((sim) => {
      const property = properties.find((p) => p.id === sim.propertyId)!;
      const share = investments.filter((i) => i.investorId === investorId && i.propertyId === sim.propertyId && i.status !== "Withdrawn");
      const totalHere = share.reduce((s, i) => s + i.amount, 0) || 1;
      // Payouts are recorded per holder per company; split across that investor's holdings in proportion.
      const received = pays.filter((t) => t.spvId === property.spvId).reduce((s, t) => s + (t.amount ?? 0), 0) * (sim.amount / totalHere);
      return { sim, property, monthlyNet: monthlyNetFor(property, sim.amount), incomeStarts: incomeStart(property, sim), received };
    })
    .filter((h) => h.property);
}

export interface MonthPoint {
  month: string;
  label: string;
  realised: number;
  projected: number;
  byProperty: Record<string, number>;
  isPast: boolean;
}

/** Twelve months of income: realised from chain payouts, projected from the finance engine. */
export function incomeSeries(investorId: string, holdings: Holding[], txs: ChainTx[], from: string, months = 12, today = new Date()): MonthPoint[] {
  const pays = payoutsFor(investorId, txs);
  const now = ym(today);
  return Array.from({ length: months }, (_, i) => {
    const month = addMonths(from, i);
    const byProperty: Record<string, number> = {};
    let projected = 0;
    for (const h of holdings) {
      const loanEnded = h.property.loan ? month > addMonths(h.incomeStarts, h.property.loan.months - 1) : false;
      if (month >= h.incomeStarts && !loanEnded) {
        projected += h.monthlyNet;
        byProperty[h.property.id] = (byProperty[h.property.id] ?? 0) + h.monthlyNet;
      }
    }
    const realised = pays.filter((t) => t.at.slice(0, 7) === month).reduce((s, t) => s + (t.amount ?? 0), 0);
    return { month, label: monthLabel(month), realised, projected, byProperty, isPast: month <= now };
  });
}
