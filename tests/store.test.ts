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
});
