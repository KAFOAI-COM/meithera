import type { AuditEvent, DistributionRun, Investor, SimInvestment, Spv } from "../types";
import { fnv } from "../utils";
import { FEES } from "../finance";
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
  instrument: "Proposed: profit-participating note or SPV share (to be determined)",
  jurisdiction: "Ireland (proposed)",
  status: p.status === "funded" ? "Illustrative — fully subscribed (simulated)" : "Illustrative — not incorporated",
}));

function inv(id: string, investorId: string, propertyId: string, amount: number, createdAt: string): SimInvestment {
  const p = seedProperties.find((x) => x.id === propertyId)!;
  const total = p.acquisition + p.refurbishment + p.legal + p.contingency;
  const entryFee = Math.round(amount * FEES.entryFeePct * 100) / 100;
  const netInvested = amount - entryFee;
  return { id, investorId, propertyId, amount, entryFee, netInvested, participation: netInvested / total, createdAt, ref: `0x${fnv(id + investorId + propertyId)}${fnv(createdAt)}`, status: "Seed" };
}

export const seedInvestments: SimInvestment[] = [
  inv("sim-0001", "inv-001", "prop-d8", 2500, "2026-07-03T10:12:00Z"),
  inv("sim-0002", "inv-001", "prop-limerick", 1000, "2026-08-15T12:40:00Z"),
  inv("sim-0003", "inv-002", "prop-cork", 5000, "2026-07-20T09:05:00Z"),
  inv("sim-0004", "inv-003", "prop-d8", 10000, "2026-07-11T15:30:00Z"),
  inv("sim-0005", "inv-003", "prop-limerick", 7500, "2026-08-02T08:50:00Z"),
  inv("sim-0006", "inv-005", "prop-d8", 750, "2026-08-21T17:15:00Z"),
  inv("sim-0007", "inv-005", "prop-cork", 1500, "2026-09-05T13:00:00Z"),
];

export const seedDistributions: DistributionRun[] = [];

const rawAudit: Omit<AuditEvent, "hash" | "prevHash">[] = [
  { id: "EVT-000001", type: "USER_REGISTRATION", actor: "inv-001", detail: "Fictional investor Aoife Byrne registered (demo)", at: "2026-06-02T10:00:00Z" },
  { id: "EVT-000002", type: "RISK_ACKNOWLEDGEMENT", actor: "inv-001", detail: "Risk warning acknowledged for Dublin 8 simulation", at: "2026-07-03T10:10:00Z" },
  { id: "EVT-000003", type: "INVESTMENT_SIMULATION", actor: "inv-001", detail: "Simulated €2,500 into Dublin 8 SPV (sim-0001)", at: "2026-07-03T10:12:00Z" },
  { id: "EVT-000004", type: "LEDGER_EVENT", actor: "system", detail: "Simulated entitlement record created for sim-0001", at: "2026-07-03T10:12:01Z" },
  { id: "EVT-000005", type: "USER_REGISTRATION", actor: "inv-004", detail: "Fictional investor Darragh Murphy registered (demo)", at: "2026-09-20T16:45:00Z" },
  { id: "EVT-000006", type: "ADMIN_CHANGE", actor: "admin", detail: "Limerick milestone 'Illustrative acquisition' marked complete", at: "2026-09-30T09:00:00Z" },
  { id: "EVT-000007", type: "DOCUMENT_GENERATION", actor: "inv-001", detail: "Demo investment summary generated", at: "2026-10-01T11:22:00Z" },
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

export const seedAudit: AuditEvent[] = chainAudit(rawAudit);
