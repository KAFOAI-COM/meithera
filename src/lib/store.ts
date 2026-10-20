"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { AuditEvent, AuditType, AutoInvestRule, BulletinListing, Complaint, DistributionRun, ExitVote, Investor, Property, SimInvestment, TenantPosition } from "./types";
import { chainAudit, seedAudit, seedBulletin, seedChain, seedComplaints, seedDistributions, seedInvestments, seedInvestors, seedProperties, seedTenant, DEMO_TENANT_ID } from "./data/seed";
import { fnv, uid } from "./utils";
import { FEES, illustrateLoan, raiseTarget } from "./finance";
import { pseudonym } from "./ledger";
import { anchorNow, checkTransfer, commit, spvWallet, type ChainState, type ChainTx, type TxInput } from "./chain/raya";

/**
 * Demonstration state. Holds only fictional, non-sensitive demo data and is kept in
 * sessionStorage (cleared when the tab closes). No identity documents, bank details or
 * personal financial information are ever collected or stored.
 *
 * Every mutation that would matter to a supervisor writes a transaction to the simulated
 * Raya Chain and an event to the hash-chained audit log.
 */
interface DemoState {
  properties: Property[];
  investors: Investor[];
  investments: SimInvestment[];
  distributions: DistributionRun[];
  audit: AuditEvent[];
  chain: ChainState;
  complaints: Complaint[];
  bulletin: BulletinListing[];
  votes: ExitVote[];
  autoInvest: AutoInvestRule[];
  tenant: TenantPosition;
  agentApprovals: Record<string, string>; // agentId -> ISO approved at

  log: (type: AuditType, actor: string, detail: string) => void;
  writeTx: (inputs: TxInput[]) => ChainTx[];
  simulateInvestment: (investorId: string, propertyId: string, amount: number, opts?: { warningShown?: boolean }) => SimInvestment;
  withdrawInvestment: (investmentId: string) => void;
  recordKnowledgeTest: (investorId: string, score: number, total: number) => void;
  updateProperty: (id: string, patch: Partial<Property>) => void;
  addProperty: (p: Property) => void;
  addInvestor: (i: Investor) => void;
  attestPassport: (propertyId: string, entryId: string) => void;
  runDistribution: (propertyId: string, period: string) => DistributionRun | null;
  attemptTransfer: (from: string, to: string, propertyId: string, units: number) => ChainTx;
  freezeHolding: (holder: string, propertyId: string, reasonCode: string) => ChainTx;
  unfreezeHolding: (holder: string) => void;
  correctHolding: (from: string, to: string, propertyId: string, units: number, reasonCode: string, orderRef: string) => ChainTx;
  anchor: () => void;
  castVote: (investorId: string, propertyId: string, choice: "sell" | "hold") => void;
  postListing: (investorId: string, propertyId: string, units: number, askPerUnit: number) => void;
  saveAutoInvest: (rule: AutoInvestRule) => void;
  openComplaint: (investorId: string, subject: string) => void;
  staircaseStep: (year: number, sharePct: number, topUp: number, monthlyRent: number) => void;
  resetTenant: () => void;
  approveAgent: (agentId: string) => void;
  reset: () => void;
}

const initial = () => ({
  properties: structuredClone(seedProperties),
  investors: structuredClone(seedInvestors),
  investments: structuredClone(seedInvestments),
  distributions: structuredClone(seedDistributions),
  audit: structuredClone(seedAudit),
  chain: structuredClone(seedChain),
  complaints: structuredClone(seedComplaints),
  bulletin: structuredClone(seedBulletin),
  votes: [] as ExitVote[],
  autoInvest: [] as AutoInvestRule[],
  tenant: structuredClone(seedTenant),
  agentApprovals: {} as Record<string, string>,
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

      writeTx: (inputs) => {
        const at = new Date().toISOString();
        const r = commit(get().chain, inputs.map((i) => ({ ...i, at: i.at || at })), at);
        set({ chain: r.state });
        return r.txs.filter((t) => t.type !== "ANCHOR" || inputs.some((i) => i.type === "ANCHOR"));
      },

      simulateInvestment: (investorId, propertyId, amount, opts) => {
        const p = get().properties.find((x) => x.id === propertyId);
        if (!p) throw new Error("Unknown property");
        const isLoan = p.offerType === "loan";
        const entryFee = isLoan ? 0 : Math.round(amount * FEES.entryFeePct * 100) / 100;
        const netInvested = amount - entryFee;
        const createdAt = new Date().toISOString();
        const id = uid("SIM");
        const target = raiseTarget(p);
        const [tx] = get().writeTx([
          {
            type: "ISSUE",
            at: createdAt,
            propertyId: p.id,
            spvId: p.spvId,
            from: spvWallet(p.spvId),
            to: pseudonym(investorId),
            units: Math.round(netInvested),
            amountEur: amount,
            memo: isLoan ? `Loan participation issued — ${p.location} (simulated)` : `Notes issued — ${p.location} company (simulated)`,
            ref: id,
          },
        ]);
        const sim: SimInvestment = {
          id,
          investorId,
          propertyId,
          offerType: p.offerType,
          amount,
          entryFee,
          netInvested,
          participation: netInvested / target,
          createdAt,
          ref: `0x${fnv(id + investorId + propertyId)}${fnv(createdAt)}`,
          txId: tx.id,
          status: "Simulated",
          warningShown: opts?.warningShown,
        };
        const fundedPct = Math.min(1, p.fundedPct + netInvested / target);
        set({
          investments: [...get().investments, sim],
          properties: get().properties.map((x) => (x.id === p.id ? { ...x, fundedPct, status: fundedPct >= 1 ? "funded" : x.status } : x)),
        });
        get().log("INVESTMENT_SIMULATION", investorId, `Simulated €${amount.toLocaleString("en-IE")} into ${p.location} ${isLoan ? "loan" : "company"} (${id}) — no funds moved`);
        get().log("LEDGER_EVENT", "system", `Raya Chain ISSUE ${tx.id}: ${Math.round(netInvested)} units to ${pseudonym(investorId)} (transfer-restricted)`);
        return sim;
      },

      withdrawInvestment: (investmentId) => {
        const s = get().investments.find((x) => x.id === investmentId);
        if (!s || s.status !== "Simulated") return;
        const p = get().properties.find((x) => x.id === s.propertyId);
        if (!p) return;
        const [tx] = get().writeTx([
          { type: "CORRECTION", at: "", propertyId: p.id, spvId: p.spvId, from: pseudonym(s.investorId), to: spvWallet(p.spvId), units: Math.round(s.netInvested), memo: "Withdrawn within the 4-day reflection period (simulated)", reasonCode: "REFLECTION_WITHDRAWAL", ref: s.id },
        ]);
        set({
          investments: get().investments.map((x) => (x.id === investmentId ? { ...x, status: "Withdrawn (reflection period)" } : x)),
          properties: get().properties.map((x) => (x.id === p.id ? { ...x, fundedPct: Math.max(0, x.fundedPct - s.netInvested / raiseTarget(p)) } : x)),
        });
        get().log("REFLECTION_WITHDRAWAL", s.investorId, `Withdrew ${s.id} during reflection period — Raya Chain ${tx.id}`);
      },

      recordKnowledgeTest: (investorId, score, total) => {
        const passed = score >= 4;
        set({ investors: get().investors.map((i) => (i.id === investorId ? { ...i, knowledgeTest: { score, total, passed, at: new Date().toISOString() } } : i)) });
        get().log("KNOWLEDGE_TEST", investorId, `ECSPR-style knowledge test ${passed ? "passed" : "failed"} ${score}/${total} (simulated)`);
      },

      updateProperty: (id, patch) => {
        set({ properties: get().properties.map((p) => (p.id === id ? { ...p, ...patch } : p)) });
      },
      addProperty: (p) => set({ properties: [...get().properties, p] }),
      addInvestor: (i) => set({ investors: [...get().investors, i] }),

      attestPassport: (propertyId, entryId) => {
        const p = get().properties.find((x) => x.id === propertyId);
        const e = p?.passport.find((x) => x.id === entryId);
        if (!p || !e) return;
        const [tx] = get().writeTx([{ type: "ATTEST", at: "", propertyId: p.id, spvId: p.spvId, memo: `${e.label} — ${p.location}`, ref: e.id }]);
        set({
          properties: get().properties.map((x) =>
            x.id === propertyId ? { ...x, passport: x.passport.map((y) => (y.id === entryId ? { ...y, done: true, txId: tx.id } : y)), milestones: x.milestones.map((m) => (m.label === e.label ? { ...m, done: true } : m)) } : x,
          ),
        });
        get().log("ADMIN_CHANGE", "admin", `Passport entry "${e.label}" attested for ${p.location} — Raya Chain ${tx.id}`);
      },

      runDistribution: (propertyId, period) => {
        const p = get().properties.find((x) => x.id === propertyId);
        if (!p) return null;
        const holdings = get().investments.filter((i) => i.propertyId === propertyId && i.status !== "Withdrawn (reflection period)");
        const frozen = new Set(get().chain.wallets.filter((w) => w.frozen).map((w) => w.id));
        const id = uid("DIST");
        let run: DistributionRun;
        if (p.offerType === "loan" && p.loan) {
          const allocations = holdings.map((h) => ({ investorId: h.investorId, amount: frozen.has(pseudonym(h.investorId)) ? 0 : illustrateLoan(h.netInvested, p.loan!.ratePct, p.loan!.termMonths).monthlyInterest }));
          const total = allocations.reduce((s, a) => s + a.amount, 0);
          run = { id, propertyId, period, kind: "interest", rentalIncome: total, expenses: 0, adminFee: 0, distributable: total, createdAt: new Date().toISOString(), allocations };
        } else {
          const rentalIncome = (p.annualRent * (1 - p.vacancyPct)) / 12;
          const expenses = p.annualOpex / 12;
          const allocated = holdings.reduce((s, h) => s + h.netInvested, 0);
          const adminFee = (allocated * FEES.annualAdminPct) / 12;
          const pool = rentalIncome - expenses;
          const allocations = holdings.map((h) => ({
            investorId: h.investorId,
            amount: frozen.has(pseudonym(h.investorId)) ? 0 : Math.max(0, pool * h.participation - (h.netInvested * FEES.annualAdminPct) / 12),
          }));
          run = { id, propertyId, period, kind: "rent", rentalIncome, expenses, adminFee, distributable: allocations.reduce((s, a) => s + a.amount, 0), createdAt: new Date().toISOString(), allocations };
        }
        const txs = get().writeTx(
          run.allocations
            .filter((a) => a.amount > 0)
            .map<TxInput>((a) => ({
              type: run.kind === "interest" ? "REPAYMENT" : "DISTRIBUTION",
              at: "",
              propertyId: p.id,
              spvId: p.spvId,
              from: spvWallet(p.spvId),
              to: pseudonym(a.investorId),
              amountEur: Math.round(a.amount * 100) / 100,
              memo: `${run.kind === "interest" ? "Monthly interest" : "Monthly rental distribution"}, ${period} (simulated — no money moved)`,
              ref: id,
            })),
        );
        const paid = run.allocations.filter((a) => a.amount > 0);
        run.allocations = run.allocations.map((a) => {
          const idx = paid.indexOf(a);
          return idx >= 0 ? { ...a, txId: txs.filter((t) => t.type !== "ANCHOR")[idx]?.id } : a;
        });
        set({ distributions: [run, ...get().distributions] });
        get().log("DISTRIBUTION_SIMULATION", "admin", `Simulated ${period} ${run.kind === "interest" ? "interest" : "rental"} run for ${p.location} — ${txs.length} Raya Chain tx, no payments made`);
        return run;
      },

      attemptTransfer: (from, to, propertyId, units) => {
        const p = get().properties.find((x) => x.id === propertyId);
        const check = checkTransfer(get().chain, from, to, propertyId, units);
        const [tx] = get().writeTx([
          {
            type: "TRANSFER",
            at: "",
            propertyId,
            spvId: p?.spvId,
            from,
            to,
            units,
            status: check.allowed ? "confirmed" : "rejected",
            reasonCode: check.reasonCode,
            memo: check.allowed ? `Transfer of ${units} units (simulated)` : `Transfer rejected: ${check.reasons[0]}`,
          },
        ]);
        get().log("LEDGER_EVENT", "system", `Raya Chain TRANSFER ${tx.id} ${check.allowed ? "confirmed" : `rejected (${check.reasonCode})`}`);
        return tx;
      },

      freezeHolding: (holder, propertyId, reasonCode) => {
        const p = get().properties.find((x) => x.id === propertyId);
        const [tx] = get().writeTx([{ type: "FREEZE", at: "", propertyId, spvId: p?.spvId, to: holder, memo: `Holding frozen (${reasonCode}) — illustrative`, reasonCode }]);
        set({ chain: { ...get().chain, wallets: get().chain.wallets.map((w) => (w.id === holder ? { ...w, frozen: true, frozenReason: reasonCode } : w)) } });
        get().log("ADMIN_CHANGE", "admin", `FREEZE ${tx.id} on ${holder} (${reasonCode})`);
        return tx;
      },

      unfreezeHolding: (holder) => {
        const [tx] = get().writeTx([{ type: "FREEZE", at: "", to: holder, memo: "Freeze lifted — review closed (illustrative)", reasonCode: "REVIEW_CLOSED" }]);
        set({ chain: { ...get().chain, wallets: get().chain.wallets.map((w) => (w.id === holder ? { ...w, frozen: false, frozenReason: undefined } : w)) } });
        get().log("ADMIN_CHANGE", "admin", `Freeze lifted on ${holder} — Raya Chain ${tx.id}`);
      },

      correctHolding: (from, to, propertyId, units, reasonCode, orderRef) => {
        const p = get().properties.find((x) => x.id === propertyId);
        const [tx] = get().writeTx([{ type: "CORRECTION", at: "", propertyId, spvId: p?.spvId, from, to, units, memo: `Register correction of ${units} units (${reasonCode}) — order ${orderRef}`, reasonCode, ref: orderRef }]);
        get().log("ADMIN_CHANGE", "admin", `CORRECTION ${tx.id}: ${units} units ${from} → ${to} (${reasonCode}, ${orderRef})`);
        return tx;
      },

      anchor: () => {
        set({ chain: anchorNow(get().chain, new Date().toISOString()) });
        get().writeTx([]);
        get().log("LEDGER_EVENT", "admin", "Manual anchor: latest Merkle root mirrored to Chain B and Chain C (simulated)");
      },

      castVote: (investorId, propertyId, choice) => {
        const votes = get().votes.filter((v) => !(v.investorId === investorId && v.propertyId === propertyId));
        set({ votes: [...votes, { investorId, propertyId, choice, at: new Date().toISOString() }] });
        get().log("LEDGER_EVENT", investorId, `Exit vote "${choice}" recorded for ${propertyId} (simulated)`);
      },

      postListing: (investorId, propertyId, units, askPerUnit) => {
        set({ bulletin: [{ id: uid("BB"), propertyId, sellerRef: pseudonym(investorId), units, askPerUnit, postedAt: new Date().toISOString() }, ...get().bulletin] });
        get().log("LEDGER_EVENT", investorId, `Bulletin-board listing posted: ${units} units at €${askPerUnit} (simulated — no matching, no settlement)`);
      },

      saveAutoInvest: (rule) => {
        const rest = get().autoInvest.filter((r) => r.id !== rule.id);
        set({ autoInvest: [...rest, rule] });
        get().log("USER_REGISTRATION", "inv-001", `AutoInvest rule saved: €${rule.monthlyAmount}/month (simulated)`);
      },

      openComplaint: (investorId, subject) => {
        const c: Complaint = { id: `CMP-${String(get().complaints.length + 1).padStart(4, "0")}`, investorId, subject, status: "Open", openedAt: new Date().toISOString() };
        set({ complaints: [...get().complaints, c] });
        get().log("COMPLAINT", investorId, `Complaint ${c.id} opened: ${subject}`);
      },

      staircaseStep: (year, sharePct, topUp, monthlyRent) => {
        const t = get().tenant;
        const p = get().properties.find((x) => x.id === t.propertyId)!;
        const units = Math.round(topUp);
        const [tx] = get().writeTx([
          { type: "TRANSFER", at: "", propertyId: p.id, spvId: p.spvId, from: spvWallet(p.spvId), to: pseudonym(DEMO_TENANT_ID), units, amountEur: topUp, memo: `Staircasing year ${year}: tenant acquires ${(sharePct * 100).toFixed(1)}% cumulative (Stage 3, simulated)` },
        ]);
        set({ tenant: { ...t, sharePct, history: [...t.history, { year, sharePct, topUp, monthlyRent, txId: tx.id }] } });
        get().log("LEDGER_EVENT", DEMO_TENANT_ID, `Staircasing step year ${year} → ${(sharePct * 100).toFixed(1)}% — Raya Chain ${tx.id}`);
      },
      resetTenant: () => set({ tenant: structuredClone(seedTenant) }),

      approveAgent: (agentId) => {
        set({ agentApprovals: { ...get().agentApprovals, [agentId]: new Date().toISOString() } });
        get().log("AGENT_APPROVAL", "admin", `Human approval recorded for agent output "${agentId}" (EU AI Act oversight — simulated)`);
      },

      reset: () => set(initial()),
    }),
    {
      name: "meithera-demo-v2",
      storage: createJSONStorage(() => sessionStorage),
      skipHydration: true,
      partialize: (s) => ({
        properties: s.properties,
        investors: s.investors,
        investments: s.investments,
        distributions: s.distributions,
        audit: s.audit,
        chain: s.chain,
        complaints: s.complaints,
        bulletin: s.bulletin,
        votes: s.votes,
        autoInvest: s.autoInvest,
        tenant: s.tenant,
        agentApprovals: s.agentApprovals,
      }),
    },
  ),
);
