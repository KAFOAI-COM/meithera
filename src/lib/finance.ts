import type { Property } from "./types";

/**
 * Illustrative platform fee assumptions, as described in the Innovation Hub submission.
 * Not a fee schedule. Every fee figure on screen must come from this module.
 */
export const FEES = {
  /** One-off acquisition fee, deducted from the amount entered (rent-share offers). */
  entryFeePct: 0.015,
  /** Annual administration fee, charged on net invested capital (rent-share offers). */
  annualAdminPct: 0.005,
  /** Arrangement fee on loan offers — paid by the borrower, never deducted from lenders. */
  loanArrangementPct: 0.015,
  /** Maximum loan-to-value for Stage 1 loan offers. */
  maxLtv: 0.65,
} as const;

/** ECSPR illustrative thresholds used in the demo. */
export const ECSPR = {
  offerCapEur: 5_000_000, // per project owner, 12 months
  warningFloorEur: 1_000, // higher of €1,000 or 5% of net worth
  warningNetWorthPct: 0.05,
  reflectionDays: 4,
  knowledgeTestPass: 4, // out of 5
} as const;

export function totalCost(p: Pick<Property, "acquisition" | "refurbishment" | "legal" | "contingency">) {
  return p.acquisition + p.refurbishment + p.legal + p.contingency;
}

export function noi(p: Pick<Property, "annualRent" | "annualOpex">) {
  return p.annualRent - p.annualOpex;
}

/** Property-level net operating yield = NOI / total project cost. */
export function netOperatingYield(p: Property) {
  return noi(p) / totalCost(p);
}

export function grossYield(p: Property) {
  return p.annualRent / totalCost(p);
}

/** Loan-to-value of a Stage 1 loan offer against the illustrative valuation. */
export function loanToValue(p: Property) {
  return p.loan ? p.loan.amount / p.valuation : 0;
}

/** Size of the raise an investor participates in: loan principal for loans, total project cost for rent share. */
export function raiseTarget(p: Property) {
  return p.offerType === "loan" && p.loan ? p.loan.amount : totalCost(p);
}

export interface InvestorIllustration {
  amount: number;
  entryFee: number;
  netInvested: number;
  participation: number;
  grossRentShare: number;
  opexShare: number;
  noiShare: number;
  adminFee: number;
  annualIncome: number; // before investor-level taxes
  monthlyIncome: number;
  investorYield: number; // annual income / amount entered
  propertyYield: number;
}

/**
 * Illustrative investor-level figures for a rent-share (Stage 2) offer. Property-level yield is NOT
 * the investor's return: acquisition and administration fees are deducted, and investor-level taxes
 * are not modelled.
 */
export function illustrate(p: Property, amount: number): InvestorIllustration {
  const total = totalCost(p);
  const entryFee = amount * FEES.entryFeePct;
  const netInvested = amount - entryFee;
  const participation = netInvested / total;
  const grossRentShare = p.annualRent * participation;
  const opexShare = p.annualOpex * participation;
  const noiShare = grossRentShare - opexShare;
  const adminFee = netInvested * FEES.annualAdminPct;
  const annualIncome = Math.max(0, noiShare - adminFee);
  return {
    amount,
    entryFee,
    netInvested,
    participation,
    grossRentShare,
    opexShare,
    noiShare,
    adminFee,
    annualIncome,
    monthlyIncome: annualIncome / 12,
    investorYield: amount > 0 ? annualIncome / amount : 0,
    propertyYield: netOperatingYield(p),
  };
}

export interface LoanScheduleRow {
  month: number;
  interest: number;
  principal: number;
  balance: number;
}

export interface LoanIllustration {
  amount: number;
  ratePct: number;
  months: number;
  monthlyInterest: number;
  totalInterest: number;
  totalRepaid: number;
  /** Interest-only with the principal repaid in the final month (bullet). */
  schedule: LoanScheduleRow[];
  investorYield: number; // annualised, = ratePct / 100
}

/**
 * Illustrative lender figures for a Stage 1 loan. Fixed rate, interest paid monthly, principal
 * repaid at term. The borrower pays the arrangement fee, so nothing is deducted from the lender.
 * Figures are before investor-level taxes and assume no default.
 */
export function illustrateLoan(amount: number, ratePct: number, months: number): LoanIllustration {
  const monthlyInterest = (amount * ratePct) / 100 / 12;
  const schedule: LoanScheduleRow[] = [];
  for (let m = 1; m <= months; m++) {
    const principal = m === months ? amount : 0;
    schedule.push({ month: m, interest: monthlyInterest, principal, balance: amount - principal });
  }
  const totalInterest = monthlyInterest * months;
  return {
    amount,
    ratePct,
    months,
    monthlyInterest,
    totalInterest,
    totalRepaid: amount + totalInterest,
    schedule,
    investorYield: ratePct / 100,
  };
}

/** Monthly income an investor would see for a given property and amount, whichever the offer type. */
export function monthlyIncomeFor(p: Property, amount: number) {
  if (p.offerType === "loan" && p.loan) return illustrateLoan(amount, p.loan.ratePct, p.loan.termMonths).monthlyInterest;
  return illustrate(p, amount).monthlyIncome;
}

/** Annual income (before investor-level taxes) for a given property and amount, whichever the offer type. */
export function annualIncomeFor(p: Property, amount: number) {
  if (p.offerType === "loan" && p.loan) return illustrateLoan(amount, p.loan.ratePct, p.loan.termMonths).monthlyInterest * 12;
  return illustrate(p, amount).annualIncome;
}

/** ECSPR-style warning: a single investment above the higher of €1,000 or 5% of stated net worth. */
export function exceedsWarningThreshold(amount: number, statedNetWorth: number | undefined) {
  const threshold = Math.max(ECSPR.warningFloorEur, (statedNetWorth ?? 0) * ECSPR.warningNetWorthPct);
  return { exceeds: amount > threshold, threshold };
}

export interface ModelInputs {
  acquisition: number;
  refurbishment: number;
  transaction: number;
  contingency: number;
  rent: number; // annual gross rent
  vacancyPct: number;
  maintenance: number;
  insurance: number;
  managementPct: number; // property management, % of collected rent
  platformFeePct: number; // annual, % of invested capital
  investment: number;
}

export interface ModelOutputs {
  totalCost: number;
  grossYield: number;
  collectedRent: number;
  managementCost: number;
  opex: number;
  noi: number;
  noiYield: number;
  participation: number;
  investorNoiShare: number;
  platformFee: number;
  investorIncome: number;
  investorYield: number;
}

export function runModel(i: ModelInputs): ModelOutputs {
  const total = i.acquisition + i.refurbishment + i.transaction + i.contingency;
  const collected = i.rent * (1 - i.vacancyPct);
  const managementCost = collected * i.managementPct;
  const opex = i.maintenance + i.insurance + managementCost;
  const n = collected - opex;
  const participation = total > 0 ? i.investment / total : 0;
  const investorNoiShare = n * participation;
  const platformFee = i.investment * i.platformFeePct;
  const investorIncome = investorNoiShare - platformFee;
  return {
    totalCost: total,
    grossYield: total > 0 ? i.rent / total : 0,
    collectedRent: collected,
    managementCost,
    opex,
    noi: n,
    noiYield: total > 0 ? n / total : 0,
    participation,
    investorNoiShare,
    platformFee,
    investorIncome,
    investorYield: i.investment > 0 ? investorIncome / i.investment : 0,
  };
}

export type Scenario = "base" | "optimistic" | "downside";

export const SCENARIOS: Record<Scenario, { label: string; rentAdj: number; vacancyAdd: number; costAdj: number; note: string }> = {
  base: { label: "Base case", rentAdj: 0, vacancyAdd: 0, costAdj: 0, note: "Inputs as entered." },
  optimistic: { label: "Optimistic case", rentAdj: 0.05, vacancyAdd: -0.02, costAdj: -0.05, note: "Rent +5%, vacancy −2 pts, maintenance & refurbishment −5%." },
  downside: { label: "Downside case", rentAdj: -0.1, vacancyAdd: 0.08, costAdj: 0.2, note: "Rent −10%, vacancy +8 pts, maintenance & refurbishment +20% (overrun)." },
};

export function applyScenario(i: ModelInputs, s: Scenario): ModelInputs {
  const sc = SCENARIOS[s];
  return {
    ...i,
    rent: i.rent * (1 + sc.rentAdj),
    vacancyPct: Math.min(1, Math.max(0, i.vacancyPct + sc.vacancyAdd)),
    refurbishment: i.refurbishment * (1 + sc.costAdj),
    maintenance: i.maintenance * (1 + sc.costAdj),
  };
}

export function propertyToModel(p: Property, investment = 1000): ModelInputs {
  return {
    acquisition: p.acquisition,
    refurbishment: p.refurbishment,
    transaction: p.legal,
    contingency: p.contingency,
    rent: p.annualRent,
    vacancyPct: p.vacancyPct,
    maintenance: p.opex.maintenance + p.opex.other,
    insurance: p.opex.insurance,
    managementPct: p.annualRent > 0 ? p.opex.management / (p.annualRent * (1 - p.vacancyPct)) : 0.1,
    platformFeePct: FEES.annualAdminPct,
    investment,
  };
}

/**
 * Staircasing (Stage 3) illustration: a tenant buys shares in their home's company step by step.
 * Rent falls in proportion to the share held; investors are bought out at the illustrative valuation.
 */
export interface StaircaseStep {
  year: number;
  sharePct: number;
  topUp: number; // € paid this year to buy shares
  monthlyRent: number;
  investorBuyout: number; // cumulative € returned to investors
}

export function staircase(opts: { valuation: number; marketMonthlyRent: number; startPct: number; yearlyTopUp: number; years: number; growthPct?: number }): StaircaseStep[] {
  const growth = opts.growthPct ?? 0;
  const steps: StaircaseStep[] = [];
  let share = opts.startPct;
  let value = opts.valuation;
  let bought = share * value;
  steps.push({ year: 0, sharePct: share, topUp: share * value, monthlyRent: opts.marketMonthlyRent * (1 - share), investorBuyout: bought });
  for (let y = 1; y <= opts.years && share < 1; y++) {
    value = value * (1 + growth);
    const affordable = Math.min(opts.yearlyTopUp, (1 - share) * value);
    const extra = affordable / value;
    share = Math.min(1, share + extra);
    bought += affordable;
    steps.push({ year: y, sharePct: share, topUp: affordable, monthlyRent: opts.marketMonthlyRent * (1 - share), investorBuyout: bought });
  }
  return steps;
}
