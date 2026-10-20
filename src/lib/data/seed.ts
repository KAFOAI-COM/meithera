import type { AuditEvent, BulletinListing, Complaint, DistributionRun, Investor, Property, SimInvestment, Spv, TenantPosition } from "../types";
import { fnv } from "../utils";
import { FEES, illustrateLoan, raiseTarget } from "../finance";
import { pseudonym } from "../ledger";
import { commit, emptyChain, spvWallet, type ChainState, type TxInput, type Wallet } from "../chain/raya";
import { seedProperties as baseProperties } from "./properties";

export const DEMO_INVESTOR_ID = "inv-001";
export const DEMO_TENANT_ID = "ten-001";
export const DEMO_SUPERVISOR_ID = "sup-001";

/** Five fictional investors. None of these people exist. */
export const seedInvestors: Investor[] = [
  { id: "inv-001", name: "Aoife Byrne (fictional)", email: "aoife.demo@example.ie", county: "Dublin", classification: "Retail (non-sophisticated)", onboarding: { kyc: "Simulated — passed", aml: "Simulated — clear", risk: "Completed", appropriateness: "Placeholder — passed" }, knowledgeTest: { score: 5, total: 5, passed: true, at: "2026-06-02T10:05:00Z" }, statedNetWorth: 45000, joined: "2026-06-02T10:00:00Z" },
  { id: "inv-002", name: "Ciarán Walsh (fictional)", email: "ciaran.demo@example.ie", county: "Cork", classification: "Retail (non-sophisticated)", onboarding: { kyc: "Simulated — passed", aml: "Simulated — clear", risk: "Completed", appropriateness: "Placeholder — passed" }, knowledgeTest: { score: 4, total: 5, passed: true, at: "2026-06-14T09:35:00Z" }, statedNetWorth: 120000, joined: "2026-06-14T09:30:00Z" },
  { id: "inv-003", name: "Niamh O’Connor (fictional)", email: "niamh.demo@example.ie", county: "Galway", classification: "Sophisticated (self-certified)", onboarding: { kyc: "Simulated — passed", aml: "Simulated — clear", risk: "Completed", appropriateness: "Placeholder — passed" }, knowledgeTest: { score: 5, total: 5, passed: true, at: "2026-07-01T14:15:00Z" }, statedNetWorth: 650000, joined: "2026-07-01T14:10:00Z" },
  { id: "inv-004", name: "Darragh Murphy (fictional)", email: "darragh.demo@example.ie", county: "Limerick", classification: "Retail (non-sophisticated)", onboarding: { kyc: "Simulated — pending", aml: "Simulated — review", risk: "Pending", appropriateness: "Placeholder — pending" }, knowledgeTest: { score: 2, total: 5, passed: false, at: "2026-09-20T16:50:00Z" }, statedNetWorth: 30000, joined: "2026-09-20T16:45:00Z" },
  { id: "inv-005", name: "Sinéad Kelly (fictional)", email: "sinead.demo@example.ie", county: "Kildare", classification: "Retail (non-sophisticated)", onboarding: { kyc: "Simulated — passed", aml: "Simulated — clear", risk: "Completed", appropriateness: "Placeholder — passed" }, knowledgeTest: { score: 4, total: 5, passed: true, at: "2026-08-08T11:25:00Z" }, statedNetWorth: 80000, joined: "2026-08-08T11:20:00Z" },
];

export const seedSpvs: Spv[] = baseProperties.map((p) => ({
  id: p.spvId,
  name: p.offerType === "loan" ? `Meithera ${p.location} Refurbishment Loan (proposed)` : `Meithera ${p.location} Property DAC (proposed)`,
  propertyId: p.id,
  instrument: p.offerType === "loan" ? "Proposed: secured fixed-rate loan note (first legal charge via security trustee)" : "Proposed: profit-participating note in the home's company (SPV)",
  jurisdiction: "Ireland (proposed)",
  status: p.status === "funded" ? "Illustrative — fully subscribed (simulated)" : "Illustrative — not incorporated",
}));

function inv(id: string, investorId: string, propertyId: string, amount: number, createdAt: string): SimInvestment {
  const p = baseProperties.find((x) => x.id === propertyId)!;
  const isLoan = p.offerType === "loan";
  const entryFee = isLoan ? 0 : Math.round(amount * FEES.entryFeePct * 100) / 100;
  const netInvested = amount - entryFee;
  return { id, investorId, propertyId, offerType: p.offerType, amount, entryFee, netInvested, participation: netInvested / raiseTarget(p), createdAt, ref: `0x${fnv(id + investorId + propertyId)}${fnv(createdAt)}`, status: "Seed" };
}

const rawInvestments: SimInvestment[] = [
  inv("sim-0001", "inv-001", "prop-d8", 2500, "2026-07-03T10:12:00Z"),
  inv("sim-0004", "inv-003", "prop-d8", 10000, "2026-07-11T15:30:00Z"),
  inv("sim-0003", "inv-002", "prop-cork", 5000, "2026-07-20T09:05:00Z"),
  inv("sim-0005", "inv-003", "prop-limerick", 7500, "2026-08-02T08:50:00Z"),
  inv("sim-0002", "inv-001", "prop-limerick", 1000, "2026-08-15T12:40:00Z"),
  inv("sim-0006", "inv-005", "prop-d8", 750, "2026-08-21T17:15:00Z"),
  inv("sim-0007", "inv-005", "prop-cork", 1500, "2026-09-05T13:00:00Z"),
];

export const seedComplaints: Complaint[] = [
  { id: "CMP-0001", investorId: "inv-002", subject: "Clarity of the fee illustration on the Cork loan page", status: "Resolved", openedAt: "2026-08-12T09:00:00Z" },
  { id: "CMP-0002", investorId: "inv-005", subject: "Timing of the simulated monthly statement", status: "Open", openedAt: "2026-10-02T14:30:00Z" },
];

export const seedBulletin: BulletinListing[] = [
  { id: "BB-0001", propertyId: "prop-d8", sellerRef: pseudonym("inv-005"), units: 300, askPerUnit: 1.0, postedAt: "2026-10-05T10:00:00Z" },
];

export const seedTenant: TenantPosition = { propertyId: "prop-d8", sharePct: 0.05, history: [] };

/**
 * Build the genesis state of the simulated Raya Chain from the seed data, deterministically.
 * Returns the chain plus the properties and investments enriched with their transaction ids.
 */
function buildGenesis(): { chain: ChainState; properties: Property[]; investments: SimInvestment[] } {
  const wallets: Wallet[] = [
    ...seedInvestors.map<Wallet>((i) => ({ id: pseudonym(i.id), label: `Investor wallet (${i.county})`, kind: "investor", verified: i.onboarding.kyc === "Simulated — passed", frozen: false })),
    { id: pseudonym(DEMO_TENANT_ID), label: "Tenant wallet (Dublin 8 home)", kind: "tenant", verified: true, frozen: false },
    ...baseProperties.map<Wallet>((p) => ({ id: spvWallet(p.spvId), label: `${p.location} company treasury`, kind: "spv", verified: true, frozen: false })),
    { id: "ID-EXT-UNVERIFIED", label: "External wallet — not onboarded", kind: "external", verified: false, frozen: false },
  ];
  let chain: ChainState = { ...emptyChain(), wallets };
  const properties = structuredClone(baseProperties);
  const investments = structuredClone(rawInvestments);

  // Events in chronological order: passport attestations, issues, first interest payment.
  type Ev = { at: string; input: TxInput; apply?: (txId: string) => void };
  const events: Ev[] = [];
  const monthToIso = (m: string) => (m.length === 7 ? `${m}-15T09:00:00Z` : m);

  for (const p of properties) {
    for (const e of p.passport) {
      if (!e.done) continue;
      events.push({
        at: monthToIso(e.date),
        input: { type: "ATTEST", at: monthToIso(e.date), propertyId: p.id, spvId: p.spvId, memo: `${e.label} — ${p.location}`, ref: e.id },
        apply: (txId) => {
          e.txId = txId;
        },
      });
    }
  }
  for (const s of investments) {
    const p = properties.find((x) => x.id === s.propertyId)!;
    events.push({
      at: s.createdAt,
      input: {
        type: "ISSUE",
        at: s.createdAt,
        propertyId: p.id,
        spvId: p.spvId,
        from: spvWallet(p.spvId),
        to: pseudonym(s.investorId),
        units: Math.round(s.netInvested),
        amountEur: s.amount,
        memo: p.offerType === "loan" ? `Loan participation issued — ${p.location} (simulated)` : `Notes issued — ${p.location} company (simulated)`,
        ref: s.id,
      },
      apply: (txId) => {
        s.txId = txId;
      },
    });
  }
  // Limerick: first monthly interest to its two lenders (simulated), Oct 2026.
  const lim = properties.find((p) => p.id === "prop-limerick")!;
  for (const s of investments.filter((x) => x.propertyId === "prop-limerick")) {
    const li = illustrateLoan(s.netInvested, lim.loan!.ratePct, lim.loan!.termMonths);
    events.push({
      at: "2026-10-01T09:00:00Z",
      input: { type: "REPAYMENT", at: "2026-10-01T09:00:00Z", propertyId: lim.id, spvId: lim.spvId, from: spvWallet(lim.spvId), to: pseudonym(s.investorId), amountEur: Math.round(li.monthlyInterest * 100) / 100, memo: "Monthly interest, Sept 2026 (simulated — no money moved)", ref: "DIST-SEED-LIM-2026-09" },
    });
  }
  // Illustrative freeze on one holding (AML review) so the supervisor view has something to show.
  events.push({
    at: "2026-10-12T11:00:00Z",
    input: { type: "FREEZE", at: "2026-10-12T11:00:00Z", propertyId: "prop-cork", spvId: "spv-cork", to: pseudonym("inv-005"), memo: "Holding frozen pending AML review (illustrative)", reasonCode: "AML_REVIEW", ref: "AML-0001" },
    apply: () => {
      chain = { ...chain, wallets: chain.wallets.map((w) => (w.id === pseudonym("inv-005") ? { ...w, frozen: true, frozenReason: "AML_REVIEW" } : w)) };
    },
  });

  events.sort((a, b) => a.at.localeCompare(b.at));
  // Group events into blocks by day for a realistic-looking chain.
  const groups = new Map<string, Ev[]>();
  for (const e of events) {
    const day = e.at.slice(0, 10);
    groups.set(day, [...(groups.get(day) ?? []), e]);
  }
  for (const [, evs] of groups) {
    const at = evs[evs.length - 1].at;
    const r = commit(chain, evs.map((e) => e.input), at);
    chain = r.state;
    // Map produced txs back to events (ANCHOR acks come first in the block).
    const produced = r.txs.filter((t) => t.type !== "ANCHOR");
    produced.forEach((t, i) => evs[i].apply?.(t.id));
  }
  return { chain, properties, investments };
}

const genesis = buildGenesis();
export const seedChain = genesis.chain;
export const seedProperties = genesis.properties;
export const seedInvestments = genesis.investments;

const limerickLenders = seedInvestments.filter((s) => s.propertyId === "prop-limerick");
export const seedDistributions: DistributionRun[] = [
  {
    id: "DIST-SEED-LIM-2026-09",
    propertyId: "prop-limerick",
    period: "2026-09",
    kind: "interest",
    rentalIncome: limerickLenders.reduce((s, l) => s + illustrateLoan(l.netInvested, 7.5, 18).monthlyInterest, 0),
    expenses: 0,
    adminFee: 0,
    distributable: limerickLenders.reduce((s, l) => s + illustrateLoan(l.netInvested, 7.5, 18).monthlyInterest, 0),
    createdAt: "2026-10-01T09:00:00Z",
    allocations: limerickLenders.map((l) => ({
      investorId: l.investorId,
      amount: illustrateLoan(l.netInvested, 7.5, 18).monthlyInterest,
      txId: seedChain.txs.find((t) => t.type === "REPAYMENT" && t.to === pseudonym(l.investorId))?.id,
    })),
  },
];

const rawAudit: Omit<AuditEvent, "hash" | "prevHash">[] = [
  { id: "EVT-000001", type: "USER_REGISTRATION", actor: "inv-001", detail: "Fictional investor Aoife Byrne registered (demo)", at: "2026-06-02T10:00:00Z" },
  { id: "EVT-000002", type: "KNOWLEDGE_TEST", actor: "inv-001", detail: "ECSPR-style knowledge test passed 5/5 (simulated)", at: "2026-06-02T10:05:00Z" },
  { id: "EVT-000003", type: "RISK_ACKNOWLEDGEMENT", actor: "inv-001", detail: "Risk warning acknowledged for Dublin 8 simulation", at: "2026-07-03T10:10:00Z" },
  { id: "EVT-000004", type: "WARNING_SHOWN", actor: "inv-001", detail: "€2,500 exceeds the higher of €1,000 or 5% of stated net worth — warning shown and accepted", at: "2026-07-03T10:11:00Z" },
  { id: "EVT-000005", type: "INVESTMENT_SIMULATION", actor: "inv-001", detail: "Simulated €2,500 into Dublin 8 company (sim-0001)", at: "2026-07-03T10:12:00Z" },
  { id: "EVT-000006", type: "LEDGER_EVENT", actor: "system", detail: `Raya Chain ISSUE ${seedInvestments.find((s) => s.id === "sim-0001")?.txId} recorded for sim-0001`, at: "2026-07-03T10:12:01Z" },
  { id: "EVT-000007", type: "COMPLAINT", actor: "inv-002", detail: "Complaint CMP-0001 opened: clarity of fee illustration — resolved 2026-08-20", at: "2026-08-12T09:00:00Z" },
  { id: "EVT-000008", type: "USER_REGISTRATION", actor: "inv-004", detail: "Fictional investor Darragh Murphy registered (demo)", at: "2026-09-20T16:45:00Z" },
  { id: "EVT-000009", type: "KNOWLEDGE_TEST", actor: "inv-004", detail: "ECSPR-style knowledge test failed 2/5 — investment blocked until retake (simulated)", at: "2026-09-20T16:50:00Z" },
  { id: "EVT-000010", type: "ADMIN_CHANGE", actor: "admin", detail: "Limerick milestone 'Illustrative acquisition' marked complete", at: "2026-09-30T09:00:00Z" },
  { id: "EVT-000011", type: "DISTRIBUTION_SIMULATION", actor: "admin", detail: "Simulated Sept 2026 interest run for Limerick loan — no payments made", at: "2026-10-01T09:00:00Z" },
  { id: "EVT-000012", type: "DOCUMENT_GENERATION", actor: "inv-001", detail: "Demo investment summary generated", at: "2026-10-01T11:22:00Z" },
  { id: "EVT-000013", type: "COMPLAINT", actor: "inv-005", detail: "Complaint CMP-0002 opened: timing of simulated monthly statement", at: "2026-10-02T14:30:00Z" },
  { id: "EVT-000014", type: "AML_ALERT", actor: "system", detail: "AML Monitor flagged holding of ID for inv-005 in Cork for review (illustrative) — FREEZE written to Raya Chain", at: "2026-10-12T11:00:00Z" },
];

export function chainAudit(events: Omit<AuditEvent, "hash" | "prevHash">[], prev = "00000000"): AuditEvent[] {
  const out: AuditEvent[] = [];
  let p = prev;
  for (const e of events) {
    const hash = fnv(p + e.id + e.type + e.actor + e.detail + e.at);
    out.push({ ...e, prevHash: p, hash });
    p = hash;
  }
  return out;
}

/** Recompute the audit hash chain and report any break. */
export function verifyAudit(events: AuditEvent[]): { ok: boolean; brokenAt?: string } {
  let p = "00000000";
  for (const e of events) {
    if (e.prevHash !== p) return { ok: false, brokenAt: e.id };
    const hash = fnv(p + e.id + e.type + e.actor + e.detail + e.at);
    if (hash !== e.hash) return { ok: false, brokenAt: e.id };
    p = hash;
  }
  return { ok: true };
}

export const seedAudit: AuditEvent[] = chainAudit(rawAudit);
