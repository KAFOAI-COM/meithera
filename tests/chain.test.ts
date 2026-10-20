import { describe, expect, it } from "vitest";
import { ANCHOR_EVERY_N_BLOCKS, capTable, checkTransfer, commit, emptyChain, holdings, verifyChain, type ChainState } from "@/lib/chain/raya";
import { seedChain, seedInvestments, seedProperties } from "@/lib/data/seed";
import { pseudonym } from "@/lib/ledger";

describe("Raya Chain simulator", () => {
  it("genesis chain verifies and every seed investment has an ISSUE tx", () => {
    const report = verifyChain(seedChain);
    expect(report.ok).toBe(true);
    expect(report.issues).toEqual([]);
    for (const s of seedInvestments) {
      const tx = seedChain.txs.find((t) => t.id === s.txId);
      expect(tx?.type).toBe("ISSUE");
      expect(tx?.to).toBe(pseudonym(s.investorId));
    }
  });

  it("passport entries that are done link to an ATTEST tx", () => {
    for (const p of seedProperties) for (const e of p.passport) {
      if (e.done) expect(seedChain.txs.find((t) => t.id === e.txId)?.type).toBe("ATTEST");
      else expect(e.txId).toBeUndefined();
    }
  });

  it("holdings derive from confirmed transactions only", () => {
    const h = holdings(seedChain);
    const aoife = h.filter((x) => x.holder === pseudonym("inv-001"));
    expect(aoife.find((x) => x.propertyId === "prop-d8")?.units).toBe(Math.round(2500 - 37.5));
    expect(aoife.find((x) => x.propertyId === "prop-limerick")?.units).toBe(1000);
    const cap = capTable(seedChain, "prop-d8");
    expect(cap.reduce((s, r) => s + r.share, 0)).toBeCloseTo(1);
  });

  it("rejects transfers to unverified wallets with a reason code", () => {
    const check = checkTransfer(seedChain, pseudonym("inv-001"), "ID-EXT-UNVERIFIED", "prop-d8", 100);
    expect(check.allowed).toBe(false);
    expect(check.reasonCode).toBe("RECIPIENT_UNVERIFIED");
  });

  it("rejects transfers from frozen wallets and over-transfers", () => {
    expect(checkTransfer(seedChain, pseudonym("inv-005"), pseudonym("inv-001"), "prop-cork", 10).reasonCode).toBe("SENDER_FROZEN");
    expect(checkTransfer(seedChain, pseudonym("inv-001"), pseudonym("inv-002"), "prop-d8", 1_000_000).reasonCode).toBe("INSUFFICIENT_UNITS");
    expect(checkTransfer(seedChain, pseudonym("inv-001"), pseudonym("inv-002"), "prop-d8", 100).allowed).toBe(true);
  });

  it("anchors every Nth block and acknowledges anchors with ANCHOR txs; tampering is detected", () => {
    let s: ChainState = { ...emptyChain(), wallets: [{ id: "A", label: "a", kind: "investor", verified: true, frozen: false }] };
    for (let i = 0; i < ANCHOR_EVERY_N_BLOCKS + 1; i++) s = commit(s, [{ type: "ATTEST", at: `2026-01-0${i + 1}T00:00:00Z`, memo: `e${i}` }], `2026-01-0${i + 1}T00:00:00Z`).state;
    expect(s.anchors.length).toBe(2);
    expect(s.anchors.every((a) => a.ackTxId)).toBe(true);
    expect(s.txs.filter((t) => t.type === "ANCHOR")).toHaveLength(2);
    expect(verifyChain(s).ok).toBe(true);
    const tampered: ChainState = { ...s, txs: s.txs.map((t, i) => (i === 0 ? { ...t, memo: "edited" } : t)) };
    const r = verifyChain(tampered);
    expect(r.ok).toBe(false);
    expect(r.issues[0]).toMatch(/hash mismatch/);
  });
});
