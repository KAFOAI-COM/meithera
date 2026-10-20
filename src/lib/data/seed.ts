import type { AuditEvent, DistributionRun, Investor, Property, SimInvestment, Spv } from "../types";
import { fnv } from "../utils";
import { FEES, illustrateLoan, offerSize } from "../finance";
import { commit, type ChainState, type TxInput } from "../chain/raya";
import { pseudonym } from "../ledger";
import { seedProperties } from "./properties";

export const DEMO_INVESTOR_ID = "inv-001";

/** Five fictional investors. None of these people exist. */
export const seedInvestors: Investor[] = [
  { id: "inv-001", name: "Aoife Byrne (fictional)", email: "aoife.demo@example.ie", county: "Dublin", classification: "Retail (non-sophisticated)", onboarding: { kyc: "Simulated — passed", aml: "Simulated — clear", risk: "Completed", appropriateness: "Placeholder — passed" }, joined: "2026-06-02T10:00:00Z" },
  { id: "inv-002", name: "Ciarán Walsh (fictional)", email: "ciaran.demo@example.ie", county: "Cork", classification: "Retail (non-sophisticated)", onboarding: { kyc: "Simulated — passed", aml: "Simulated — clear", risk: "Completed", appropriateness: "Placeholder — passed" }, joined: "2026-06-14T09:30:00Z" },
  { id: "inv-003", name: "Niamh O’Connor (fictional)", email: "niamh.demo@example.ie", county: "Galway", classification: "Sophisticated (self-certified)", onboarding: { kyc: "Simulated — passed", aml: "Simulated — clear", risk: "Completed", appropriateness: "Placeholder — passed" }, joined: "2026-07-01T14:10:00Z" },
  { id: "inv-004", name: "Darragh Murphy (fictional)", email: "darragh.demo@example.ie", county: "Limerick", classification: "Retail (non-sophisticated)", onboarding: { kyc: "Simulated — pending", aml: "Simulated — review", risk: "Pending", appropriateness: "Placeholder — pending" }, joined: "2026-09-20T16:45:00Z" },
  { id: "inv-005", name: "Sinéad Kelly (fictional)", email: "sinead.demo@example.ie", county: "Kildare", classification: "Retail (non-sophisticated)", onboarding: { kyc: "Simulated — passed", aml: "Simulated — clear", risk: "Completed", appropriateness: "Placeholder — passed" }, joined: "2026-08-08T11:20:00Z" },
];

export const seedSpvs: Spv[] = seedProperties.map((p) => ({
  id: p.spvId,
  name: `Meithera ${p.location} Property DAC (proposed)`,
  propertyId: p.id,
  instrument:
    p.offerType === "loan"
      ? "Proposed: participation in a secured refurbishment loan (first legal charge)"
      : "Proposed: profit-participating note in the property company (to be determined)",
  jurisdiction: "Ireland (proposed)",
  status: p.status === "funded" ? "Illustrative — fully subscribed (simulated)" : "Illustrative — not incorporated",
}));

/** Wallets that have passed (simulated) onboarding. Transfers to anyone else are rejected on Raya Chain. */
export function verifiedWallets(investors: Investor[]) {
  return investors.filter((i) => i.onboarding.kyc === "Simulated — passed").map((i) => pseudonym(i.id));
}

/** Raya Chain ISSUE tx for a holding. Units: 1 unit = €1 of net invested / lent capital. */
export function issueTx(p: Property, sim: SimInvestment): TxInput {
  return {
    type: "ISSUE",
    spvId: p.spvId,
    to: pseudonym(sim.investorId),
    units: Math.round(sim.netInvested),
    amount: sim.amount,
    memo: `${p.location} · ${p.offerType === "loan" ? "loan participation" : "rent-share notes"} · ${sim.id}`,
    at: sim.createdAt,
  };
}

function inv(id: string, investorId: string, propertyId: string, amount: number, createdAt: string): SimInvestment {
  const p = seedProperties.find((x) => x.id === propertyId)!;
  const entryFee = Math.round(amount * FEES.entryFeePct * 100) / 100;
  const netInvested = amount - entryFee;
  return { id, investorId, propertyId, amount, entryFee, netInvested, participation: netInvested / offerSize(p), createdAt, ref: `0x${fnv(id + investorId + propertyId)}${fnv(createdAt)}`, status: "Seed" };
}

const baseInvestments: SimInvestment[] = [
  inv("sim-0001", "inv-001", "prop-d8", 2500, "2026-07-03T10:12:00Z"),
  inv("sim-0002", "inv-001", "prop-limerick", 1000, "2026-08-15T12:40:00Z"),
  inv("sim-0003", "inv-002", "prop-cork", 5000, "2026-07-20T09:05:00Z"),
  inv("sim-0004", "inv-003", "prop-d8", 10000, "2026-07-11T15:30:00Z"),
  inv("sim-0005", "inv-003", "prop-limerick", 7500, "2026-08-02T08:50:00Z"),
  inv("sim-0006", "inv-005", "prop-d8", 750, "2026-08-21T17:15:00Z"),
  inv("sim-0007", "inv-005", "prop-cork", 1500, "2026-09-05T13:00:00Z"),
];

/** Monthly interest payment dates for the funded Limerick loan (simulated). */
const LIMERICK_PAYMENTS = [
  { period: "2026-08", at: "2026-08-17T10:00:00Z" },
  { period: "2026-09", at: "2026-09-15T10:00:00Z" },
  { period: "2026-10", at: "2026-10-15T10:00:00Z" },
];

export const EMPTY_CHAIN: ChainState = { blocks: [], txs: [] };

/**
 * Builds the seed Raya Chain deterministically: a genesis block, one block per seed holding
 * (ISSUE), and monthly REPAYMENT blocks for the funded Limerick loan. Same output on server and client.
 */
export function buildSeed() {
  let chain = commit(EMPTY_CHAIN, [{ type: "GENESIS", memo: "Raya Chain demonstration register opened for Meithera property companies (illustrative)" }], "2026-06-01T09:00:00Z").state;
  // Home Digital Passport: vacancy and pre-works BER survey attested for every home.
  const passportAt = "2026-06-01T09:30:00Z";
  chain = commit(
    chain,
    seedProperties.flatMap((p): TxInput[] => [
      { type: "ATTEST", spvId: p.spvId, memo: `${p.location} · passport · long-term vacant since ${p.vacantSince} (illustrative)`, reason: "VACANCY", at: passportAt },
      { type: "ATTEST", spvId: p.spvId, memo: `${p.location} · passport · pre-works BER survey: ${p.berBefore} (illustrative)`, reason: "BER_BEFORE", at: passportAt },
    ]),
    passportAt,
  ).state;
  const investments = baseInvestments.map((i) => ({ ...i }));
  const distributions: DistributionRun[] = [];

  type Ev = { at: string; run: () => void };
  const events: Ev[] = investments.map((sim) => ({
    at: sim.createdAt,
    run: () => {
      const p = seedProperties.find((x) => x.id === sim.propertyId)!;
      const r = commit(chain, [issueTx(p, sim)], sim.createdAt);
      chain = r.state;
      sim.txId = r.txs[0].txId;
    },
  }));

  const lim = seedProperties.find((p) => p.id === "prop-limerick")!;
  for (const pay of LIMERICK_PAYMENTS) {
    events.push({
      at: pay.at,
      run: () => {
        const holders = investments.filter((i) => i.propertyId === lim.id && i.createdAt < pay.at);
        const allocations = holders.map((h) => ({ investorId: h.investorId, amount: illustrateLoan(h.amount, lim.loan!.ratePct, lim.loan!.months).monthlyNet }));
        const r = commit(
          chain,
          allocations.map((a) => ({
            type: "REPAYMENT" as const,
            spvId: lim.spvId,
            to: pseudonym(a.investorId),
            amount: a.amount,
            memo: `${lim.location} · loan interest ${pay.period} (net of 0.5% admin fee) · simulated`,
            at: pay.at,
          })),
          pay.at,
        );
        chain = r.state;
        const interest = holders.reduce((s, h) => s + illustrateLoan(h.amount, lim.loan!.ratePct, lim.loan!.months).monthlyInterest, 0);
        const admin = holders.reduce((s, h) => s + illustrateLoan(h.amount, lim.loan!.ratePct, lim.loan!.months).adminFeeMonthly, 0);
        distributions.unshift({
          id: `DIST-LIM-${pay.period}`,
          kind: "interest",
          propertyId: lim.id,
          period: pay.period,
          rentalIncome: interest,
          expenses: 0,
          mgmtFee: admin,
          distributable: allocations.reduce((s, a) => s + a.amount, 0),
          createdAt: pay.at,
          allocations: allocations.map((a, i) => ({ ...a, txId: r.txs[i].txId })),
        });
      },
    });
  }

  const acquiredAt = "2026-09-30T09:00:00Z";
  events.push({
    at: acquiredAt,
    run: () => {
      chain = commit(chain, [{ type: "ATTEST", spvId: lim.spvId, memo: `${lim.location} · passport · illustrative acquisition completed`, reason: "MILESTONE", at: acquiredAt }], acquiredAt).state;
    },
  });

  events.sort((a, b) => a.at.localeCompare(b.at)).forEach((e) => e.run());
  return { chain, investments, distributions };
}

const seed = buildSeed();
export const seedChain: ChainState = seed.chain;
export const seedInvestments: SimInvestment[] = seed.investments;
export const seedDistributions: DistributionRun[] = seed.distributions;

type RawEvent = Omit<AuditEvent, "hash" | "prevHash" | "id">;
const rawEvents: RawEvent[] = [
  { type: "USER_REGISTRATION", actor: "inv-001", detail: "Fictional investor Aoife Byrne registered (demo)", at: "2026-06-02T10:00:00Z" },
  { type: "KNOWLEDGE_TEST", actor: "inv-001", detail: "Knowledge test 5/5 — passed (simulated)", at: "2026-07-03T10:05:00Z" },
  { type: "RISK_ACKNOWLEDGEMENT", actor: "inv-001", detail: "Risk warning acknowledged for Dublin 8 simulation", at: "2026-07-03T10:10:00Z" },
  { type: "EXTRA_WARNING", actor: "inv-001", detail: "Additional warning shown and acknowledged: €2,500 above €1,000 threshold", at: "2026-07-03T10:10:30Z" },
  { type: "INVESTMENT_SIMULATION", actor: "inv-001", detail: "Simulated €2,500 into Dublin 8 SPV (sim-0001)", at: "2026-07-03T10:12:00Z" },
  { type: "LEDGER_EVENT", actor: "system", detail: `Raya Chain ISSUE ${seed.investments[0].txId?.slice(0, 12)}… recorded for sim-0001`, at: "2026-07-03T10:12:01Z" },
  { type: "KNOWLEDGE_TEST", actor: "inv-002", detail: "Knowledge test 4/5 — passed (simulated)", at: "2026-07-20T09:00:00Z" },
  { type: "RISK_ACKNOWLEDGEMENT", actor: "inv-002", detail: "Risk warning acknowledged for Cork City simulation", at: "2026-07-20T09:02:00Z" },
  { type: "EXTRA_WARNING", actor: "inv-002", detail: "Additional warning shown and acknowledged: €5,000 above €3,000 threshold", at: "2026-07-20T09:02:30Z" },
  { type: "RISK_ACKNOWLEDGEMENT", actor: "inv-003", detail: "Risk warning acknowledged for Dublin 8 simulation (sophisticated, self-certified)", at: "2026-07-11T15:25:00Z" },
  { type: "KNOWLEDGE_TEST", actor: "inv-005", detail: "Knowledge test 3/5 — failed (simulated)", at: "2026-08-21T17:00:00Z" },
  { type: "KNOWLEDGE_TEST", actor: "inv-005", detail: "Knowledge test 5/5 — passed (simulated)", at: "2026-08-21T17:08:00Z" },
  { type: "RISK_ACKNOWLEDGEMENT", actor: "inv-005", detail: "Risk warning acknowledged for Dublin 8 simulation", at: "2026-08-21T17:12:00Z" },
  { type: "DISTRIBUTION_SIMULATION", actor: "admin", detail: "Simulated Limerick loan interest for 2026-08 — no payments made", at: "2026-08-17T10:00:00Z" },
  { type: "USER_REGISTRATION", actor: "inv-004", detail: "Fictional investor Darragh Murphy registered (demo)", at: "2026-09-20T16:45:00Z" },
  { type: "KNOWLEDGE_TEST", actor: "inv-004", detail: "Knowledge test 2/5 — failed (simulated)", at: "2026-09-20T16:55:00Z" },
  { type: "ADMIN_CHANGE", actor: "admin", detail: "Limerick milestone 'Illustrative acquisition' marked complete", at: "2026-09-30T09:00:00Z" },
  { type: "DOCUMENT_GENERATION", actor: "inv-001", detail: "Demo investment summary generated", at: "2026-10-01T11:22:00Z" },
];
const rawAudit: Omit<AuditEvent, "hash" | "prevHash">[] = [...rawEvents]
  .sort((a, b) => a.at.localeCompare(b.at))
  .map((e, i) => ({ ...e, id: `EVT-${String(i + 1).padStart(6, "0")}` }));

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

export const seedAudit: AuditEvent[] = chainAudit(rawAudit);
