import { describe, expect, it } from "vitest";
import { FEES, exceedsWarningThreshold, illustrate, illustrateLoan, loanToValue, netOperatingYield, raiseTarget, staircase, totalCost } from "@/lib/finance";
import { seedProperties } from "@/lib/data/properties";

const eur2 = new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR", minimumFractionDigits: 2, maximumFractionDigits: 2 });
const d8 = seedProperties.find((p) => p.id === "prop-d8")!;
const cork = seedProperties.find((p) => p.id === "prop-cork")!;
const limerick = seedProperties.find((p) => p.id === "prop-limerick")!;

describe("fees", () => {
  it("match the Innovation Hub submission: 1.5% acquisition, 0.5% p.a. administration", () => {
    expect(FEES.entryFeePct).toBe(0.015);
    expect(FEES.annualAdminPct).toBe(0.005);
  });
});

describe("Dublin 8 rent-share, per €1,000 entered", () => {
  const x = illustrate(d8, 1000);
  it("total project cost is €290,000 and NOI yield 6.21%", () => {
    expect(totalCost(d8)).toBe(290000);
    expect(netOperatingYield(d8)).toBeCloseTo(0.0621, 4);
  });
  it("net invested €985.00", () => {
    expect(x.entryFee).toBeCloseTo(15, 10);
    expect(eur2.format(x.netInvested)).toBe("€985.00");
  });
  it("NOI share €61.14", () => {
    expect(eur2.format(x.noiShare)).toBe("€61.14");
  });
  it("admin fee €4.925, shown as €4.93", () => {
    expect(x.adminFee).toBeCloseTo(4.925, 6);
    expect(eur2.format(x.adminFee)).toBe("€4.93");
  });
  it("annual income €56.21 before investor-level taxes, monthly €4.68", () => {
    expect(eur2.format(x.annualIncome)).toBe("€56.21");
    expect(eur2.format(x.monthlyIncome)).toBe("€4.68");
  });
  it("investor yield is below property yield", () => {
    expect(x.investorYield).toBeLessThan(x.propertyYield);
    expect(x.investorYield).toBeCloseTo(0.05621, 4);
  });
});

describe("Stage 1 loan maths", () => {
  it("Cork and Limerick are loan offers within the 65% LTV limit", () => {
    expect(cork.offerType).toBe("loan");
    expect(limerick.offerType).toBe("loan");
    expect(loanToValue(cork)).toBeLessThanOrEqual(FEES.maxLtv);
    expect(loanToValue(limerick)).toBeLessThanOrEqual(FEES.maxLtv);
    expect(raiseTarget(cork)).toBe(160000);
  });
  it("€1,000 at 7.5% over 18 months pays €6.25 a month and €112.50 in total, principal at term", () => {
    const l = illustrateLoan(1000, 7.5, 18);
    expect(eur2.format(l.monthlyInterest)).toBe("€6.25");
    expect(eur2.format(l.totalInterest)).toBe("€112.50");
    expect(eur2.format(l.totalRepaid)).toBe("€1,112.50");
    expect(l.schedule).toHaveLength(18);
    expect(l.schedule[0].principal).toBe(0);
    expect(l.schedule[0].balance).toBe(1000);
    expect(l.schedule[17].principal).toBe(1000);
    expect(l.schedule[17].balance).toBe(0);
    expect(l.investorYield).toBeCloseTo(0.075, 10);
  });
  it("lenders pay no entry fee (borrower pays the arrangement fee)", () => {
    expect(FEES.loanArrangementPct).toBe(0.015);
  });
});

describe("ECSPR warning threshold", () => {
  it("is the higher of €1,000 or 5% of stated net worth", () => {
    expect(exceedsWarningThreshold(900, 10000)).toEqual({ exceeds: false, threshold: 1000 });
    expect(exceedsWarningThreshold(1500, 10000)).toEqual({ exceeds: true, threshold: 1000 });
    expect(exceedsWarningThreshold(2500, 100000)).toEqual({ exceeds: false, threshold: 5000 });
    expect(exceedsWarningThreshold(6000, 100000)).toEqual({ exceeds: true, threshold: 5000 });
    expect(exceedsWarningThreshold(1001, undefined).exceeds).toBe(true);
  });
});

describe("staircasing (Stage 3)", () => {
  it("rent falls as the tenant's share grows and investors are bought out", () => {
    const steps = staircase({ valuation: 300000, marketMonthlyRent: 2000, startPct: 0.05, yearlyTopUp: 15000, years: 5 });
    expect(steps[0].sharePct).toBeCloseTo(0.05);
    expect(steps[0].monthlyRent).toBeCloseTo(1900);
    expect(steps[5].sharePct).toBeCloseTo(0.3);
    expect(steps[5].monthlyRent).toBeCloseTo(1400);
    expect(steps[5].investorBuyout).toBeCloseTo(90000);
    for (let i = 1; i < steps.length; i++) expect(steps[i].monthlyRent).toBeLessThan(steps[i - 1].monthlyRent);
  });
});
