/**
 * Entitlement ledger abstraction.
 *
 * The off-chain register (legal record of SPV interests) is authoritative. Any on-chain
 * representation is a mirror that must be reconciled against it. This module defines the
 * interface a future blockchain adapter would implement, and ships ONLY a simulated adapter.
 * No chain, token standard or custody model is assumed to be legally appropriate.
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

export function pseudonym(investorId: string) {
  return `ID-${fnv("meithera-salt:" + investorId).toUpperCase()}`;
}

export const simulatedLedger: EntitlementLedger = {
  mode: "simulated",
  issue(inv, spvId) {
    const issued = new Date(inv.createdAt);
    const lock = new Date(issued);
    lock.setFullYear(lock.getFullYear() + 3);
    return {
      recordId: `ENT-${inv.id.toUpperCase()}`,
      investorRef: pseudonym(inv.investorId),
      spvId,
      units: Math.round(inv.netInvested),
      issuedAt: inv.createdAt,
      txRef: inv.ref,
      transferRestricted: true,
      lockUpUntil: lock.toISOString(),
    };
  },
  checkTransfer(rec, toInvestorVerified, now = new Date()) {
    const reasons: string[] = [];
    if (!toInvestorVerified) reasons.push("Recipient has not completed (simulated) onboarding");
    if (now < new Date(rec.lockUpUntil)) reasons.push("Illustrative lock-up period has not ended");
    reasons.push("Secondary transfers are not enabled in this demonstration");
    return { allowed: false, reasons };
  },
  reconcile(offChain, onChain) {
    return offChain.map((o) => {
      const match = onChain.find((r) => r.recordId === o.recordId);
      if (!match) return { recordId: o.recordId, status: "missing" as const };
      return { recordId: o.recordId, status: match.units === o.units ? ("matched" as const) : ("mismatch" as const) };
    });
  },
};
