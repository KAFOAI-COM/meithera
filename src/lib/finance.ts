import type { Property } from "./types";

/**
 * Illustrative fee assumptions, as described in the Innovation Hub submission.
 * Not a fee schedule.
 */
export const FEES = {
  entryFeePct: 0.015, // 1.5% acquisition fee, one-off, deducted from the amount entered
  annualAdminPct: 0.005, // 0.5% annual administration fee on net invested capital
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

/** Headline indicative rate shown on cards: loan coupon for Stage 1, property NOI yield for Stage 2. */
export function headlineRate(p: Property) {
  return p.offerType === "loan" && p.loan ? p.loan.ratePct / 100 : netOperatingYield(p);
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
 * Illustrative investor-level figures for a Stage 2 rent-share. Property-level yield is NOT the
 * investor's return: entry and administration fees are deducted, investor-level taxes are not modelled.
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

export interface LoanIllustration {
  amount: number;
  entryFee: number;
  netLent: number;
  participation: number; // share of the loan facility
  ratePct: number;
  months: number;
  monthlyInterest: number;
  adminFeeMonthly: number;
  monthlyNet: number;
  totalInterest: number;
  totalNet: number;
  schedule: { month: number; interest: number; adminFee: number; net: number; principal: number }[];
}

/** Stage 1 secured refurbishment loan: fixed interest paid monthly, principal returned at maturity. */
export function illustrateLoan(amount: number, ratePct: number, months: number, facility = 0): LoanIllustration {
  const entryFee = amount * FEES.entryFeePct;
  const netLent = amount - entryFee;
  const monthlyInterest = (netLent * ratePct) / 100 / 12;
  const adminFeeMonthly = (netLent * FEES.annualAdminPct) / 12;
  const monthlyNet = monthlyInterest - adminFeeMonthly;
  const schedule = Array.from({ length: months }, (_, i) => ({
    month: i + 1,
    interest: monthlyInterest,
    adminFee: adminFeeMonthly,
    net: monthlyNet,
    principal: i === months - 1 ? netLent : 0,
  }));
  return {
    amount,
    entryFee,
    netLent,
    participation: facility > 0 ? netLent / facility : 0,
    ratePct,
    months,
    monthlyInterest,
    adminFeeMonthly,
    monthlyNet,
    totalInterest: monthlyInterest * months,
    totalNet: monthlyNet * months,
    schedule,
  };
}

/** Loan facility for a Stage 1 offer = LTV × valuation, capped at total project cost. */
export function loanFacility(p: Property) {
  if (!p.loan) return 0;
  return Math.min(totalCost(p), Math.round((p.valuation * p.loan.ltvPct) / 100 / 1000) * 1000);
}

/** Size of the offer an investor participates in: the loan facility (Stage 1) or total project cost (Stage 2). */
export function offerSize(p: Property) {
  return p.offerType === "loan" ? loanFacility(p) : totalCost(p);
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

/** Staircasing (Stage 3): tenant buys equity in their home's company over time. */
export function staircase(p: Property, startPct: number, yearlyTopUpPct: number, years: number) {
  const total = totalCost(p);
  const rows: { year: number; tenantPct: number; investorPct: number; annualRent: number; tenantEquity: number }[] = [];
  let share = startPct;
  for (let y = 0; y <= years; y++) {
    rows.push({ year: y, tenantPct: share, investorPct: 1 - share, annualRent: p.annualRent * (1 - share), tenantEquity: total * share });
    share = Math.min(1, share + yearlyTopUpPct);
  }
  return rows;
}
