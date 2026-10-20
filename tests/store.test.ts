import { beforeEach, describe, expect, it } from "vitest";

// Minimal sessionStorage for the persisted demo store in a node test environment.
const mem = new Map<string, string>();
globalThis.sessionStorage = {
  getItem: (k: string) => mem.get(k) ?? null,
  setItem: (k: string, v: string) => void mem.set(k, v),
  removeItem: (k: string) => void mem.delete(k),
  clear: () => mem.clear(),
  key: () => null,
  length: 0,
} as Storage;

const { useDemo } = await import("@/lib/store");
const { verifyChain, capTable } = await import("@/lib/chain/raya");
const { pseudonym } = await import("@/lib/ledger");
const { loanFacility } = await import("@/lib/finance");
const { incomeStart, holdingsFor } = await import("@/lib/portfolio");

const s = () => useDemo.getState();

describe("demo store writes every action to Raya Chain", () => {
  beforeEach(() => s().reset());

  it("a rent-share investment commits an ISSUE tx and keeps the chain valid", () => {
    const before = s().chain.blocks.length;
    const sim = s().simulateInvestment("inv-001", "prop-d8", 1000);
    const tx = s().chain.txs.find((t) => t.txId === sim.txId)!;
    expect(tx).toMatchObject({ type: "ISSUE", spvId: "spv-d8", to: pseudonym("inv-001"), units: 985, amount: 1000 });
    expect(s().chain.blocks).toHaveLength(before + 1);
    expect(verifyChain(s().chain).ok).toBe(true);
    expect(s().audit.at(-1)?.type).toBe("LEDGER_EVENT");
  });

  it("a loan participation is sized against the loan facility", () => {
    const sim = s().simulateInvestment("inv-002", "prop-cork", 1000);
    const cork = s().properties.find((p) => p.id === "prop-cork")!;
    expect(sim.participation).toBeCloseTo(985 / loanFacility(cork), 12);
  });

  it("monthly runs write REPAYMENT for loans and DISTRIBUTION for rent shares", () => {
    const loan = s().runDistribution("prop-limerick", "2026-11")!;
    expect(loan.kind).toBe("interest");
    expect(loan.allocations.every((a) => s().chain.txs.find((t) => t.txId === a.txId)?.type === "REPAYMENT")).toBe(true);
    const rent = s().runDistribution("prop-d8", "2026-11")!;
    expect(rent.kind).toBe("rent");
    expect(rent.allocations.every((a) => s().chain.txs.find((t) => t.txId === a.txId)?.type === "DISTRIBUTION")).toBe(true);
    expect(verifyChain(s().chain).ok).toBe(true);
  });

  it("rejects transfers to unverified wallets and allows verified ones", () => {
    expect(s().tryTransfer("spv-d8", "inv-001", pseudonym("inv-004"), 50)).toMatchObject({ type: "REJECTED", reason: "RECIPIENT_NOT_VERIFIED" });
    expect(s().tryTransfer("spv-d8", "inv-001", "ID-UNKNOWN", 50).type).toBe("REJECTED");
    expect(s().tryTransfer("spv-d8", "inv-001", pseudonym("inv-005"), 50).type).toBe("TRANSFER");
  });

  it("freeze and court-ordered correction are recorded and reflected in the cap table", () => {
    s().freezeHolding("spv-d8", "inv-003", "AML_REVIEW");
    s().correctHolding("spv-d8", "inv-003", "inv-001", 200, "COURT_ORDER");
    const table = capTable(s().chain.txs, "spv-d8");
    expect(table.find((h) => h.holder === pseudonym("inv-003"))?.frozen).toBe(true);
    expect(table.find((h) => h.holder === pseudonym("inv-001"))?.units).toBe(Math.round(2500 * 0.985) + 200);
    expect(verifyChain(s().chain).ok).toBe(true);
  });

  it("reflection withdrawal releases the units and is recorded as WITHDRAWAL", () => {
    const sim = s().simulateInvestment("inv-001", "prop-d8", 1000);
    const before = capTable(s().chain.txs, "spv-d8").find((h) => h.holder === pseudonym("inv-001"))!.units;
    const tx = s().withdrawInvestment(sim.id)!;
    expect(tx).toMatchObject({ type: "WITHDRAWAL", reason: "REFLECTION_PERIOD", units: 985 });
    expect(capTable(s().chain.txs, "spv-d8").find((h) => h.holder === pseudonym("inv-001"))!.units).toBe(before - 985);
    expect(s().investments.find((i) => i.id === sim.id)?.status).toBe("Withdrawn");
    expect(s().withdrawInvestment(sim.id)).toBeNull(); // only once
    expect(s().withdrawInvestment("sim-0001")).toBeNull(); // seed holdings are past the window
    expect(s().audit.at(-1)?.type).toBe("REFLECTION_WITHDRAWAL");
  });

  it("votes, bulletin posts and staircasing are recorded", () => {
    s().castVote("inv-001", "prop-d8", "against");
    expect(s().votes["inv-001:prop-d8"]).toBe("against");
    s().postToBulletin("inv-001", "prop-d8", 100, 1.02);
    expect(s().bulletin[0]).toMatchObject({ units: 100, askPerUnit: 1.02 });
    const step = s().recordStaircaseStep("ten-001", "prop-d8", 0, 0.1, 29000);
    expect(s().chain.txs.find((t) => t.txId === step.txId)).toMatchObject({ type: "TRANSFER", reason: "STAIRCASE", to: pseudonym("ten-001") });
    expect(verifyChain(s().chain).ok).toBe(true);
  });
});

describe("portfolio maths", () => {
  beforeEach(() => s().reset());
  it("loans funded by the 15th pay that month; rent shares from the tenancy milestone", () => {
    const lim = s().properties.find((p) => p.id === "prop-limerick")!;
    const d8 = s().properties.find((p) => p.id === "prop-d8")!;
    const sim = s().investments[0];
    expect(incomeStart(lim, { ...sim, createdAt: "2026-08-15T12:40:00Z" })).toBe("2026-08");
    expect(incomeStart(lim, { ...sim, createdAt: "2026-10-20T12:00:00Z" })).toBe("2026-11");
    expect(incomeStart(d8, sim)).toBe("2027-07");
  });
  it("Aoife's seed holdings and received interest add up", () => {
    const h = holdingsFor("inv-001", s().investments, s().properties, s().chain.txs);
    expect(h.reduce((a, x) => a + x.sim.amount, 0)).toBe(3500);
    expect(h.reduce((a, x) => a + x.received, 0)).toBeCloseTo(3 * ((985 * 0.08 - 985 * 0.005) / 12), 6);
  });
});
