"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { AuditEvent, AuditType, AutoInvestRules, BulletinPost, ChainTx, DistributionRun, Investor, Property, SimInvestment, StaircaseStep, VoteChoice } from "./types";
import { seedProperties } from "./data/properties";
import { chainAudit, DEMO_INVESTOR_ID, issueTx, seedAudit, seedChain, seedDistributions, seedInvestments, seedInvestors, verifiedWallets } from "./data/seed";
import { commit, type ChainState, type TxInput } from "./chain/raya";
import { pseudonym } from "./ledger";
import { eur, fnv, uid } from "./utils";
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
  /** Exit-window votes, keyed `${investorId}:${propertyId}`. */
  votes: Record<string, VoteChoice>;
  bulletin: BulletinPost[];
  autoInvest: AutoInvestRules;
  staircase: StaircaseStep[];
  log: (type: AuditType, actor: string, detail: string) => void;
  commitTxs: (inputs: TxInput[]) => ChainTx[];
  simulateInvestment: (investorId: string, propertyId: string, amount: number) => SimInvestment;
  updateProperty: (id: string, patch: Partial<Property>) => void;
  addProperty: (p: Property) => void;
  addInvestor: (i: Investor) => void;
  updateInvestor: (id: string, patch: Partial<Investor>) => void;
  /** Monthly rent distribution (Stage 2) or loan interest payment (Stage 1). */
  runDistribution: (propertyId: string, period: string) => DistributionRun | null;
  freezeHolding: (spvId: string, investorId: string, reason: string) => ChainTx;
  correctHolding: (spvId: string, fromInvestorId: string, toInvestorId: string, units: number, reason: string) => ChainTx;
  /** Attempt a transfer; rejected (and recorded as REJECTED) unless the recipient wallet is verified. */
  tryTransfer: (spvId: string, fromInvestorId: string, toWallet: string, units: number) => ChainTx;
  /** Withdraw within the 4-day reflection period: records a WITHDRAWAL tx and releases the units. */
  withdrawInvestment: (simId: string) => ChainTx | null;
  castVote: (investorId: string, propertyId: string, choice: VoteChoice) => void;
  postToBulletin: (investorId: string, propertyId: string, units: number, askPerUnit: number) => BulletinPost;
  setAutoInvest: (rules: AutoInvestRules) => void;
  /** Stage 3: tenant buys a further share of their home's company; recorded on Raya Chain. */
  recordStaircaseStep: (tenantId: string, propertyId: string, year: number, tenantPct: number, payment: number) => StaircaseStep;
  reset: () => void;
}

export const REFLECTION_DAYS = 4;
export const inReflection = (sim: SimInvestment, now = Date.now()) =>
  sim.status === "Simulated" && now - new Date(sim.createdAt).getTime() < REFLECTION_DAYS * 86_400_000;

const DEFAULT_AUTOINVEST: AutoInvestRules = { enabled: false, offerTypes: ["loan", "rent-share"], maxPerOffer: 500, monthlyBudget: 1000 };

const initial = () => ({
  properties: structuredClone(seedProperties),
  investors: structuredClone(seedInvestors),
  investments: structuredClone(seedInvestments),
  distributions: structuredClone(seedDistributions),
  audit: structuredClone(seedAudit),
  chain: structuredClone(seedChain),
  votes: {} as Record<string, VoteChoice>,
  bulletin: [] as BulletinPost[],
  autoInvest: { ...DEFAULT_AUTOINVEST },
  staircase: [] as StaircaseStep[],
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
      updateInvestor: (id, patch) => set({ investors: get().investors.map((i) => (i.id === id ? { ...i, ...patch } : i)) }),
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
      withdrawInvestment: (simId) => {
        const sim = get().investments.find((i) => i.id === simId);
        if (!sim || !inReflection(sim)) return null;
        const p = get().properties.find((x) => x.id === sim.propertyId)!;
        const units = Math.round(sim.netInvested);
        const [tx] = get().commitTxs([
          { type: "WITHDRAWAL", spvId: p.spvId, from: pseudonym(sim.investorId), units, amount: sim.amount, reason: "REFLECTION_PERIOD", memo: `${p.location} · withdrawn within the ${REFLECTION_DAYS}-day reflection period · ${sim.id}` },
        ]);
        set({
          investments: get().investments.map((i) => (i.id === simId ? { ...i, status: "Withdrawn" as const } : i)),
          properties: get().properties.map((x) => (x.id === p.id ? { ...x, fundedPct: Math.max(0, x.fundedPct - sim.netInvested / offerSize(x)) } : x)),
        });
        get().log("REFLECTION_WITHDRAWAL", sim.investorId, `Withdrew simulated €${sim.amount.toLocaleString("en-IE")} from ${p.location} within the reflection period — Raya Chain ${tx.txId.slice(0, 12)}…`);
        return tx;
      },
      castVote: (investorId, propertyId, choice) => {
        set({ votes: { ...get().votes, [`${investorId}:${propertyId}`]: choice } });
        const p = get().properties.find((x) => x.id === propertyId);
        get().log("EXIT_VOTE", investorId, `Exit-window vote "${choice}" on ${p?.location ?? propertyId} (simulated)`);
      },
      postToBulletin: (investorId, propertyId, units, askPerUnit) => {
        const post: BulletinPost = { id: uid("BB"), investorId, propertyId, units, askPerUnit, at: new Date().toISOString() };
        set({ bulletin: [post, ...get().bulletin] });
        const p = get().properties.find((x) => x.id === propertyId);
        get().log("BULLETIN_POST", investorId, `Interest to sell ${units} units of ${p?.location ?? propertyId} at ${eur(askPerUnit, 2)}/unit posted to the bulletin board — no order matching`);
        return post;
      },
      setAutoInvest: (rules) => {
        set({ autoInvest: rules });
        get().log("AUTOINVEST_RULE", DEMO_INVESTOR_ID, `AutoInvest ${rules.enabled ? "on" : "off"}: ${rules.offerTypes.join(" + ")}, max €${rules.maxPerOffer}/offer, €${rules.monthlyBudget}/month (simulated, nothing executes)`);
      },
      recordStaircaseStep: (tenantId, propertyId, year, tenantPct, payment) => {
        const p = get().properties.find((x) => x.id === propertyId)!;
        const units = Math.round(payment);
        const [tx] = get().commitTxs([
          { type: "TRANSFER", spvId: p.spvId, from: "ID-INVESTOR-POOL", to: pseudonym(tenantId), units, amount: payment, reason: "STAIRCASE", memo: `${p.location} · staircasing year ${year}: tenant share to ${Math.round(tenantPct * 100)}% · investors bought out (simulated)` },
        ]);
        const step: StaircaseStep = { year, tenantPct, payment, txId: tx.txId, at: tx.at };
        set({ staircase: [...get().staircase.filter((x) => x.year !== year), step].sort((a, b) => a.year - b.year) });
        get().log("STAIRCASING", tenantId, `Staircasing year ${year} recorded: tenant share ${Math.round(tenantPct * 100)}% — Raya Chain ${tx.txId.slice(0, 12)}…`);
        return step;
      },
      reset: () => set(initial()),
    }),
    {
      name: "meithera-demo-v2",
      storage: createJSONStorage(() => sessionStorage),
      skipHydration: true,
      partialize: (s) => ({ properties: s.properties, investors: s.investors, investments: s.investments, distributions: s.distributions, audit: s.audit, chain: s.chain, votes: s.votes, bulletin: s.bulletin, autoInvest: s.autoInvest, staircase: s.staircase }),
    },
  ),
);
