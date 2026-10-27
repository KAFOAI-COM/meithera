import { describe, expect, it } from "vitest";
import { FEES, headlineRate, illustrate, illustrateLoan, loanFacility, netOperatingYield, offerSize, staircase, totalCost } from "@/lib/finance";
import { seedProperties } from "@/lib/data/properties";
import { buildSeed, seedChain, seedDistributions, seedInvestments } from "@/lib/data/seed";
import { capTable, commit, verifyChain } from "@/lib/chain/raya";
import { pseudonym } from "@/lib/ledger";
import { eur } from "@/lib/utils";

const prop = (id: string) => seedProperties.find((p) => p.id === id)!;
const d8 = prop("prop-d8");
const cork = prop("prop-cork");
const lim = prop("prop-limerick");

describe("fees", () => {
  it("uses the Innovation Hub submission fees", () => {
    expect(FEES.entryFeePct).toBe(0.015);
    expect(FEES.annualAdminPct).toBe(0.005);
  });
});

describe("Dublin 8 rent share, per €1,000", () => {
  const r = illustrate(d8, 1000);
  it("walks gross to net", () => {
    expect(totalCost(d8)).toBe(372000);
    expect(r.entryFee).toBeCloseTo(15, 10);
    expect(r.netInvested).toBeCloseTo(985, 10);
    expect(r.noiShare).toBeCloseTo(53.09, 2);
    expect(r.adminFee).toBeCloseTo(4.925, 10);
    expect(r.annualIncome).toBeCloseTo(48.16, 2);
    expect(r.monthlyIncome).toBeCloseTo(48.16 / 12, 2);
  });
  it("formats money with Intl, not toFixed", () => {
    expect(eur(r.netInvested, 2)).toBe("€985.00");
    expect(eur(r.adminFee, 2)).toBe("€4.93");
    expect(eur(r.annualIncome, 2)).toBe("€48.16");
  });
  it("property yield is 5.39% and is not the investor return", () => {
    expect(netOperatingYield(d8)).toBeCloseTo(0.0539, 4);
    expect(r.propertyYield).toBe(netOperatingYield(d8));
    expect(r.investorYield).toBeLessThan(r.propertyYield);
    expect(headlineRate(d8)).toBe(netOperatingYield(d8));
  });
});

describe("Stage 1 loan maths", () => {
  const l = illustrateLoan(1000, 7.5, 18, loanFacility(cork));
  it("pays fixed monthly interest net of the admin fee", () => {
    expect(l.netLent).toBeCloseTo(985, 10);
    expect(l.monthlyInterest).toBeCloseTo((985 * 0.075) / 12, 10); // €6.16
    expect(l.adminFeeMonthly).toBeCloseTo((985 * 0.005) / 12, 10); // €0.41
    expect(l.monthlyNet).toBeCloseTo(l.monthlyInterest - l.adminFeeMonthly, 10);
    expect(l.totalInterest).toBeCloseTo(110.8125, 6);
    expect(eur(l.monthlyNet, 2)).toBe("€5.75");
  });
  it("returns principal only at maturity", () => {
    expect(l.schedule).toHaveLength(18);
    expect(l.schedule.slice(0, 17).every((m) => m.principal === 0)).toBe(true);
    expect(l.schedule[17].principal).toBeCloseTo(985, 10);
  });
  it("sizes the facility from LTV × valuation, capped at project cost", () => {
    expect(loanFacility(cork)).toBe(162000); // 62% of €262,000, rounded to €1,000
    expect(loanFacility(cork)).toBeLessThanOrEqual(totalCost(cork));
    expect(l.participation).toBeCloseTo(985 / 162000, 12);
    expect(offerSize(cork)).toBe(loanFacility(cork));
    expect(offerSize(d8)).toBe(totalCost(d8));
    expect(headlineRate(cork)).toBe(0.075);
  });
});

describe("staircasing (Stage 3)", () => {
  it("rent falls as the tenant share grows", () => {
    const rows = staircase(d8, 0.1, 0.05, 5);
    expect(rows[0].tenantPct).toBeCloseTo(0.1);
    expect(rows[5].tenantPct).toBeCloseTo(0.35);
    expect(rows[5].annualRent).toBeLessThan(rows[0].annualRent);
  });
});

describe("Raya Chain seed and verification", () => {
  it("the seed chain verifies", () => {
    const v = verifyChain(seedChain);
    expect(v.ok).toBe(true);
    expect(v.checked).toBe(seedChain.blocks.length);
  });
  it("starts with genesis, records every seed holding and Aug–Oct Limerick interest", () => {
    expect(seedChain.txs[0].type).toBe("GENESIS");
    expect(seedChain.txs.filter((t) => t.type === "ISSUE")).toHaveLength(seedInvestments.length);
    expect(seedInvestments.every((i) => seedChain.txs.some((t) => t.txId === i.txId))).toBe(true);
    const reps = seedChain.txs.filter((t) => t.type === "REPAYMENT");
    expect(new Set(reps.map((t) => t.at.slice(0, 7)))).toEqual(new Set(["2026-08", "2026-09", "2026-10"]));
    expect(seedDistributions.every((d) => d.kind === "interest" && d.propertyId === lim.id)).toBe(true);
  });
  it("is deterministic (server and client build the same chain)", () => {
    expect(buildSeed().chain.blocks.map((b) => b.hash)).toEqual(seedChain.blocks.map((b) => b.hash));
  });
  it("loan participation is net lent over the facility", () => {
    const i = seedInvestments.find((x) => x.propertyId === lim.id)!;
    expect(i.participation).toBeCloseTo(i.netInvested / loanFacility(lim), 12);
  });
  it("detects tampering and names the broken block", () => {
    const tampered = structuredClone(seedChain);
    tampered.blocks[3].merkleRoot = "f".repeat(64);
    expect(verifyChain(tampered)).toMatchObject({ ok: false, brokenAt: 3 });
  });
  it("cap table applies corrections and freezes", () => {
    const a = pseudonym("inv-003");
    const b = pseudonym("inv-002");
    const { state } = commit(seedChain, [
      { type: "CORRECTION", spvId: d8.spvId, from: a, to: b, units: 100, memo: "test", reason: "COURT_ORDER" },
      { type: "FREEZE", spvId: d8.spvId, from: a, memo: "test", reason: "AML_REVIEW" },
    ]);
    expect(verifyChain(state).ok).toBe(true);
    const table = capTable(state.txs, d8.spvId);
    expect(table.find((h) => h.holder === b)?.units).toBe(100);
    expect(table.find((h) => h.holder === a)?.frozen).toBe(true);
  });
});
