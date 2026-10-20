/**
 * Entitlement ledger abstraction.
 *
 * The off-chain register (legal record of SPV interests) is authoritative today. Any on-chain
 * representation is a mirror that must be reconciled against it. This module defines the
 * interface a chain adapter implements. The simulated Raya Chain adapter lives in
 * `src/lib/chain/raya.ts` (`RayaChainSimulator`). No chain, token standard or custody model is
 * assumed to be legally appropriate; Stage 4 (Raya Chain as the official register) depends on EU reform.
 */
import type { SimInvestment } from "./types";
import { fnv } from "./utils";

export interface EntitlementRecord {
  recordId: string;
  investorRef: string; // pseudonymous identity mapping — never personal data on-chain
  spvId: string;
  units: number; // simulated units, 1 unit = €1 of net invested capital
  issuedAt: string;
  txRef: string;
  transferRestricted: boolean;
  lockUpUntil: string;
}

export interface TransferCheck {
  allowed: boolean;
  reasons: string[];
}

export interface EntitlementLedger {
  readonly mode: "simulated" | "testnet" | "production";
  issue(inv: SimInvestment, spvId: string): EntitlementRecord;
  checkTransfer(rec: EntitlementRecord, toInvestorVerified: boolean, now?: Date): TransferCheck;
  reconcile(offChain: { recordId: string; units: number }[], onChain: EntitlementRecord[]): { recordId: string; status: "matched" | "mismatch" | "missing" }[];
}

/** Salted pseudonym for a holder. The mapping to a person lives only in the off-chain identity store. */
export function pseudonym(investorId: string) {
  return `ID-${fnv("meithera-salt:" + investorId).toUpperCase()}`;
}
