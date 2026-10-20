"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { AuditEvent, AuditType, ChainTx, DistributionRun, Investor, Property, SimInvestment } from "./types";
import { seedProperties } from "./data/properties";
import { chainAudit, issueTx, seedAudit, seedChain, seedDistributions, seedInvestments, seedInvestors, verifiedWallets } from "./data/seed";
import { commit, type ChainState, type TxInput } from "./chain/raya";
import { pseudonym } from "./ledger";
import { fnv, uid } from "./utils";
import { FEES, illustrateLoan, offerSize } from "./finance";

/**
 * Demonstration state. Holds only fictional, non-sensitive demo data and is kept in
 * sessionStorage (cleared when the tab closes). No identity documents, bank details or
 * personal financial information are ever collected or stored.
 *
 * Every economic or administrative action commits a block to the simulated Raya Chain.
 */
interface DemoState {
  properties: Property[];
  investors: Investor[];
  investments: SimInvestment[];
  distributions: DistributionRun[];
  audit: AuditEvent[];
  chain: ChainState;
  log: (type: AuditType, actor: string, detail: string) => void;
  commitTxs: (inputs: TxInput[]) => ChainTx[];
  simulateInvestment: (investorId: string, propertyId: string, amount: number) => SimInvestment;
  updateProperty: (id: string, patch: Partial<Property>) => void;
  addProperty: (p: Property) => void;
  addInvestor: (i: Investor) => void;
  /** Monthly rent distribution (Stage 2) or loan interest payment (Stage 1). */
  runDistribution: (propertyId: string, period: string) => DistributionRun | null;
  freezeHolding: (spvId: string, investorId: string, reason: string) => ChainTx;
  correctHolding: (spvId: string, fromInvestorId: string, toInvestorId: string, units: number, reason: string) => ChainTx;
  /** Attempt a transfer; rejected (and recorded as REJECTED) unless the recipient wallet is verified. */
  tryTransfer: (spvId: string, fromInvestorId: string, toWallet: string, units: number) => ChainTx;
  reset: () => void;
}

const initial = () => ({
  properties: structuredClone(seedProperties),
  investors: structuredClone(seedInvestors),
  investments: structuredClone(seedInvestments),
  distributions: structuredClone(seedDistributions),
  audit: structuredClone(seedAudit),
  chain: structuredClone(seedChain),
});

export const useDemo = create<DemoState>()(
  persist(
    (set, get) => ({
      ...initial(),
      log: (type, actor, detail) => {
        const audit = get().audit;
        const prev = audit.length ? audit[audit.length - 1].hash : "00000000";
        const n = audit.length + 1;
        const [evt] = chainAudit([{ id: `EVT-${String(n).padStart(6, "0")}`, type, actor, detail, at: new Date().toISOString() }], prev);
        set({ audit: [...audit, evt] });
      },
      commitTxs: (inputs) => {
        const r = commit(get().chain, inputs);
        set({ chain: r.state });
        return r.txs;
      },
      simulateInvestment: (investorId, propertyId, amount) => {
        const p = get().properties.find((x) => x.id === propertyId);
        if (!p) throw new Error("Unknown property");
        const entryFee = Math.round(amount * FEES.entryFeePct * 100) / 100;
        const netInvested = amount - entryFee;
        const createdAt = new Date().toISOString();
        const id = uid("SIM");
        const size = offerSize(p);
        const draft: SimInvestment = {
          id,
          investorId,
          propertyId,
          amount,
          entryFee,
          netInvested,
          participation: netInvested / size,
          createdAt,
          ref: `0x${fnv(id + investorId + propertyId)}${fnv(createdAt)}`,
          status: "Simulated",
        };
        const [tx] = get().commitTxs([issueTx(p, draft)]);
        const sim = { ...draft, txId: tx.txId };
        const fundedPct = Math.min(1, p.fundedPct + netInvested / size);
        set({
          investments: [...get().investments, sim],
          properties: get().properties.map((x) => (x.id === p.id ? { ...x, fundedPct } : x)),
        });
        get().log("INVESTMENT_SIMULATION", investorId, `Simulated €${amount.toLocaleString("en-IE")} into ${p.location} SPV (${id}) — no funds moved`);
        get().log("LEDGER_EVENT", "system", `Raya Chain ISSUE ${tx.txId.slice(0, 12)}… in block #${tx.block} (${Math.round(netInvested)} units, transfer-restricted)`);
        return sim;
      },
      updateProperty: (id, patch) => {
        set({ properties: get().properties.map((p) => (p.id === id ? { ...p, ...patch } : p)) });
      },
      addProperty: (p) => set({ properties: [...get().properties, p] }),
      addInvestor: (i) => set({ investors: [...get().investors, i] }),
      runDistribution: (propertyId, period) => {
        const p = get().properties.find((x) => x.id === propertyId);
        if (!p) return null;
        const holdings = get().investments.filter((i) => i.propertyId === propertyId);
        if (!holdings.length) return null;
        const isLoan = p.offerType === "loan" && !!p.loan;
        let rentalIncome: number, expenses: number, mgmtFee: number;
        let allocations: { investorId: string; amount: number }[];
        if (isLoan) {
          const rows = holdings.map((h) => ({ h, l: illustrateLoan(h.amount, p.loan!.ratePct, p.loan!.months) }));
          rentalIncome = rows.reduce((s, r) => s + r.l.monthlyInterest, 0);
          expenses = 0;
          mgmtFee = rows.reduce((s, r) => s + r.l.adminFeeMonthly, 0);
          allocations = rows.map((r) => ({ investorId: r.h.investorId, amount: r.l.monthlyNet }));
        } else {
          rentalIncome = (p.annualRent * (1 - p.vacancyPct)) / 12;
          expenses = p.annualOpex / 12;
          const pool = rentalIncome - expenses;
          mgmtFee = holdings.reduce((s, h) => s + (h.netInvested * FEES.annualAdminPct) / 12, 0);
          allocations = holdings.map((h) => ({
            investorId: h.investorId,
            amount: Math.max(0, pool * h.participation - (h.netInvested * FEES.annualAdminPct) / 12),
          }));
        }
        const txs = get().commitTxs(
          allocations.map((a) => ({
            type: isLoan ? ("REPAYMENT" as const) : ("DISTRIBUTION" as const),
            spvId: p.spvId,
            to: pseudonym(a.investorId),
            amount: a.amount,
            memo: `${p.location} · ${isLoan ? "loan interest" : "rent distribution"} ${period} (net of 0.5% admin fee) · simulated`,
          })),
        );
        const run: DistributionRun = {
          id: uid("DIST"),
          kind: isLoan ? "interest" : "rent",
          propertyId,
          period,
          rentalIncome,
          expenses,
          mgmtFee,
          distributable: allocations.reduce((s, a) => s + a.amount, 0),
          createdAt: new Date().toISOString(),
          allocations: allocations.map((a, i) => ({ ...a, txId: txs[i].txId })),
        };
        set({ distributions: [run, ...get().distributions] });
        get().log("DISTRIBUTION_SIMULATION", "admin", `Simulated ${period} ${isLoan ? "loan interest" : "rent distribution"} for ${p.location} SPV — ${txs.length} Raya Chain txs, no payments made`);
        return run;
      },
      freezeHolding: (spvId, investorId, reason) => {
        const [tx] = get().commitTxs([{ type: "FREEZE", spvId, from: pseudonym(investorId), reason, memo: `Holding frozen · ${reason}` }]);
        get().log("ADMIN_CHANGE", "admin", `Raya Chain FREEZE ${tx.txId.slice(0, 12)}… on ${pseudonym(investorId)} (${reason})`);
        return tx;
      },
      correctHolding: (spvId, fromInvestorId, toInvestorId, units, reason) => {
        const [tx] = get().commitTxs([
          { type: "CORRECTION", spvId, from: pseudonym(fromInvestorId), to: pseudonym(toInvestorId), units, reason, memo: `Court-ordered correction · ${units} units · ${reason}` },
        ]);
        get().log("ADMIN_CHANGE", "admin", `Raya Chain CORRECTION ${tx.txId.slice(0, 12)}… ${units} units ${pseudonym(fromInvestorId)} → ${pseudonym(toInvestorId)} (${reason})`);
        return tx;
      },
      tryTransfer: (spvId, fromInvestorId, toWallet, units) => {
        const verified = verifiedWallets(get().investors).includes(toWallet);
        const from = pseudonym(fromInvestorId);
        const [tx] = get().commitTxs([
          verified
            ? { type: "TRANSFER", spvId, from, to: toWallet, units, memo: `Transfer of ${units} units between verified wallets · simulated` }
            : { type: "REJECTED", spvId, from, to: toWallet, units, reason: "RECIPIENT_NOT_VERIFIED", memo: "Transfer rejected: recipient wallet has not completed onboarding (allowlist check)" },
        ]);
        get().log("LEDGER_EVENT", fromInvestorId, `Raya Chain ${tx.type} ${tx.txId.slice(0, 12)}… (${units} units to ${toWallet})`);
        return tx;
      },
      reset: () => set(initial()),
    }),
    {
      name: "meithera-demo-v2",
      storage: createJSONStorage(() => sessionStorage),
      skipHydration: true,
      partialize: (s) => ({ properties: s.properties, investors: s.investors, investments: s.investments, distributions: s.distributions, audit: s.audit, chain: s.chain }),
    },
  ),
);
