"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { AuditEvent, AuditType, DistributionRun, Investor, Property, SimInvestment } from "./types";
import { seedProperties } from "./data/properties";
import { chainAudit, seedAudit, seedDistributions, seedInvestments, seedInvestors } from "./data/seed";
import { fnv, uid } from "./utils";
import { FEES, totalCost } from "./finance";

/**
 * Demonstration state. Holds only fictional, non-sensitive demo data and is kept in
 * sessionStorage (cleared when the tab closes). No identity documents, bank details or
 * personal financial information are ever collected or stored.
 */
interface DemoState {
  properties: Property[];
  investors: Investor[];
  investments: SimInvestment[];
  distributions: DistributionRun[];
  audit: AuditEvent[];
  log: (type: AuditType, actor: string, detail: string) => void;
  simulateInvestment: (investorId: string, propertyId: string, amount: number) => SimInvestment;
  updateProperty: (id: string, patch: Partial<Property>) => void;
  addProperty: (p: Property) => void;
  addInvestor: (i: Investor) => void;
  runDistribution: (propertyId: string, period: string) => DistributionRun | null;
  reset: () => void;
}

const initial = () => ({
  properties: structuredClone(seedProperties),
  investors: structuredClone(seedInvestors),
  investments: structuredClone(seedInvestments),
  distributions: structuredClone(seedDistributions),
  audit: structuredClone(seedAudit),
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
      simulateInvestment: (investorId, propertyId, amount) => {
        const p = get().properties.find((x) => x.id === propertyId);
        if (!p) throw new Error("Unknown property");
        const entryFee = Math.round(amount * FEES.entryFeePct * 100) / 100;
        const netInvested = amount - entryFee;
        const createdAt = new Date().toISOString();
        const id = uid("SIM");
        const sim: SimInvestment = {
          id,
          investorId,
          propertyId,
          amount,
          entryFee,
          netInvested,
          participation: netInvested / totalCost(p),
          createdAt,
          ref: `0x${fnv(id + investorId + propertyId)}${fnv(createdAt)}`,
          status: "Simulated",
        };
        const total = totalCost(p);
        const fundedPct = Math.min(1, p.fundedPct + netInvested / total);
        set({
          investments: [...get().investments, sim],
          properties: get().properties.map((x) => (x.id === p.id ? { ...x, fundedPct } : x)),
        });
        get().log("INVESTMENT_SIMULATION", investorId, `Simulated €${amount.toLocaleString("en-IE")} into ${p.location} SPV (${id}) — no funds moved`);
        get().log("LEDGER_EVENT", "system", `Simulated entitlement record ENT-${id} created (${Math.round(netInvested)} units, transfer-restricted)`);
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
        const rentalIncome = (p.annualRent * (1 - p.vacancyPct)) / 4;
        const expenses = p.annualOpex / 4;
        const allocated = holdings.reduce((s, h) => s + h.netInvested, 0);
        const mgmtFee = (allocated * FEES.annualAdminPct) / 12;
        const distributablePool = rentalIncome - expenses;
        const allocations = holdings.map((h) => ({
          investorId: h.investorId,
          amount: Math.max(0, distributablePool * h.participation - (h.netInvested * FEES.annualAdminPct) / 12),
        }));
        const run: DistributionRun = {
          id: uid("DIST"),
          propertyId,
          period,
          rentalIncome,
          expenses,
          mgmtFee,
          distributable: allocations.reduce((s, a) => s + a.amount, 0),
          createdAt: new Date().toISOString(),
          allocations,
        };
        set({ distributions: [run, ...get().distributions] });
        get().log("DISTRIBUTION_SIMULATION", "admin", `Simulated ${period} distribution for ${p.location} SPV — no payments made`);
        return run;
      },
      reset: () => set(initial()),
    }),
    {
      name: "meithera-demo-v1",
      storage: createJSONStorage(() => sessionStorage),
      skipHydration: true,
      partialize: (s) => ({ properties: s.properties, investors: s.investors, investments: s.investments, distributions: s.distributions, audit: s.audit }),
    },
  ),
);
