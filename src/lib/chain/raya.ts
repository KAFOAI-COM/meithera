/**
 * Raya Chain — SIMULATED.
 *
 * A deterministic, in-memory model of the ledger Meithera proposes to run. Nothing here talks to a
 * real network, wallet or token contract. The model exists so that every simulated investment,
 * payout, loan repayment and administrative action in the demonstration leaves a transaction that
 * the investor, the administrator and a supervisor can all see.
 *
 * Design points mirrored from docs/raya-chain-architecture.md:
 *  - one master record (Raya Chain); Merkle roots are ANCHORED to illustrative other chains so the
 *    record stays single while proofs travel;
 *  - a verified-wallet allowlist: transfers to unverified wallets are rejected and recorded as such;
 *  - FREEZE and court-ordered CORRECTION with reason codes;
 *  - pseudonymous holder IDs only — never personal data;
 *  - the compliance rule evaluated travels with each transaction.
 *
 * Hashing is a deterministic FNV-1a construction (not cryptographic) so the chain can be
 * recomputed synchronously in the browser and verified by the "verify chain" button.
 */
import type { EntitlementLedger, EntitlementRecord, TransferCheck } from "../ledger";
import { pseudonym } from "../ledger";
import type { SimInvestment } from "../types";
import { fnv } from "../utils";

export type TxType = "ISSUE" | "TRANSFER" | "DISTRIBUTION" | "REPAYMENT" | "FREEZE" | "CORRECTION" | "ANCHOR" | "ATTEST";
export type TxStatus = "confirmed" | "rejected";

export interface ChainTx {
  id: string; // RTX-000001
  type: TxType;
  at: string;
  status: TxStatus;
  propertyId?: string;
  spvId?: string;
  /** Holder pseudonyms. Never personal data. */
  from?: string;
  to?: string;
  /** 1 unit = €1 of net invested or lent capital. */
  units?: number;
  /** Euro amount for payouts and repayments (simulated — no money moves). */
  amountEur?: number;
  memo: string;
  /** Reason code for FREEZE / CORRECTION / rejected transactions. */
  reasonCode?: string;
  /** Off-chain reference: investment id, distribution id, passport entry id, audit event id. */
  ref?: string;
  /** The compliance rule evaluated when the transaction was processed. The rule travels with the asset. */
  rule: string;
  hash: string;
}

export interface Block {
  height: number;
  timestamp: string;
  prevHash: string;
  hash: string;
  merkleRoot: string;
  txIds: string[];
}

export type AnchorTarget = "Chain B" | "Chain C";

export interface Anchor {
  id: string;
  blockHeight: number;
  merkleRoot: string;
  targetChain: AnchorTarget;
  at: string;
  /** Simulated receipt hash on the target chain. */
  receipt: string;
  /** Set once an ANCHOR transaction acknowledging the mirror has been written to Raya Chain. */
  ackTxId?: string;
}

export type WalletKind = "investor" | "tenant" | "spv" | "external";

export interface Wallet {
  id: string; // pseudonym
  label: string; // non-identifying description, e.g. "Investor wallet (Dublin)"
  kind: WalletKind;
  verified: boolean;
  frozen: boolean;
  frozenReason?: string;
}

export interface ChainState {
  network: "raya-chain-sim";
  blocks: Block[];
  txs: ChainTx[];
  anchors: Anchor[];
  wallets: Wallet[];
}

export type TxInput = Omit<ChainTx, "id" | "hash" | "status" | "rule"> & { rule?: string; status?: TxStatus };

export const GENESIS_HASH = "0".repeat(64);
export const ANCHOR_EVERY_N_BLOCKS = 3;

/** 64-hex deterministic digest built from eight salted FNV-1a rounds. Simulated — not cryptographic. */
export function digest(input: string) {
  let out = "";
  for (let i = 0; i < 8; i++) out += fnv(`${i}:${input}`);
  return out;
}

export const REASON_CODES: Record<string, string> = {
  RECIPIENT_UNVERIFIED: "Recipient wallet has not completed verified onboarding",
  RECIPIENT_FROZEN: "Recipient wallet is frozen",
  SENDER_FROZEN: "Sender holding is frozen",
  INSUFFICIENT_UNITS: "Sender does not hold enough units",
  SELF_TRANSFER: "Sender and recipient are the same wallet",
  AML_REVIEW: "AML review in progress",
  COURT_ORDER: "Court order (illustrative)",
  LOST_KEY: "Holder key recovery (illustrative)",
  SANCTIONS_HIT: "Sanctions screening match (illustrative)",
  COURT_ORDER_CORRECTION: "Register correction under court order (illustrative)",
  ADMIN_CORRECTION: "Administrative correction, dual-approved (illustrative)",
};

export const RULES = {
  issue: "ECSPR onboarding: holder wallet verified; offer within €5m cap; knowledge test and risk warning recorded",
  transfer: "Allowlist: recipient must be a verified, unfrozen wallet; sender must hold the units and not be frozen",
  distribution: "Payout only to verified holders of record at period end; amounts from the finance engine",
  repayment: "Loan interest/principal only to verified lenders of record; amounts from the loan schedule",
  freeze: "Freeze requires a reason code and an authorised operator; recorded for the supervisor",
  correction: "Correction requires a reason code, dual approval and an off-chain order reference",
  anchor: "Merkle root of a Raya Chain block mirrored to another chain; master record unchanged",
  attest: "Attestation of a passport event by the platform operator, linked to an off-chain document",
} as const;

export function emptyChain(): ChainState {
  return { network: "raya-chain-sim", blocks: [], txs: [], anchors: [], wallets: [] };
}

function txHash(t: Omit<ChainTx, "hash">) {
  return digest(
    [t.id, t.type, t.at, t.status, t.propertyId ?? "", t.spvId ?? "", t.from ?? "", t.to ?? "", t.units ?? "", t.amountEur ?? "", t.memo, t.reasonCode ?? "", t.ref ?? "", t.rule].join("|"),
  );
}

export function merkleRoot(hashes: string[]): string {
  if (hashes.length === 0) return digest("empty");
  let level = [...hashes];
  while (level.length > 1) {
    const next: string[] = [];
    for (let i = 0; i < level.length; i += 2) next.push(digest(level[i] + (level[i + 1] ?? level[i])));
    level = next;
  }
  return level[0];
}

function blockHash(b: Omit<Block, "hash">) {
  return digest(`${b.height}|${b.timestamp}|${b.prevHash}|${b.merkleRoot}|${b.txIds.join(",")}`);
}

export function nextTxId(state: ChainState) {
  return `RTX-${String(state.txs.length + 1).padStart(6, "0")}`;
}

/** Units held per (holder, propertyId), derived from confirmed transactions. */
export function holdings(state: ChainState) {
  const map = new Map<string, number>();
  const key = (holder: string, propertyId: string) => `${holder}|${propertyId}`;
  const add = (holder: string | undefined, propertyId: string | undefined, delta: number) => {
    if (!holder || !propertyId) return;
    map.set(key(holder, propertyId), (map.get(key(holder, propertyId)) ?? 0) + delta);
  };
  for (const t of state.txs) {
    if (t.status !== "confirmed") continue;
    if (t.type === "ISSUE") add(t.to, t.propertyId, t.units ?? 0);
    if (t.type === "TRANSFER" || t.type === "CORRECTION") {
      add(t.from, t.propertyId, -(t.units ?? 0));
      add(t.to, t.propertyId, t.units ?? 0);
    }
    if (t.type === "REPAYMENT" && t.units) add(t.to, t.propertyId, -t.units);
  }
  return Array.from(map.entries())
    .filter(([, units]) => units > 0)
    .map(([k, units]) => {
      const [holder, propertyId] = k.split("|");
      return { holder, propertyId, units };
    });
}

export function holdingsFor(state: ChainState, holder: string) {
  return holdings(state).filter((h) => h.holder === holder);
}

export function capTable(state: ChainState, propertyId: string) {
  const rows = holdings(state).filter((h) => h.propertyId === propertyId);
  const total = rows.reduce((s, r) => s + r.units, 0);
  const frozenHolders = new Set(state.wallets.filter((w) => w.frozen).map((w) => w.id));
  return rows
    .map((r) => ({ ...r, share: total > 0 ? r.units / total : 0, frozen: frozenHolders.has(r.holder) }))
    .sort((a, b) => b.units - a.units);
}

export function getWallet(state: ChainState, id: string) {
  return state.wallets.find((w) => w.id === id);
}

export function upsertWallet(state: ChainState, w: Wallet): ChainState {
  const exists = state.wallets.some((x) => x.id === w.id);
  return { ...state, wallets: exists ? state.wallets.map((x) => (x.id === w.id ? w : x)) : [...state.wallets, w] };
}

/** Evaluate the transfer rule without writing anything. */
export function checkTransfer(state: ChainState, from: string, to: string, propertyId: string, units: number): { allowed: boolean; reasonCode?: string; reasons: string[] } {
  const reasons: string[] = [];
  let reasonCode: string | undefined;
  const fail = (code: string) => {
    reasons.push(REASON_CODES[code]);
    reasonCode ??= code;
  };
  if (from === to) fail("SELF_TRANSFER");
  const recipient = getWallet(state, to);
  if (!recipient || !recipient.verified) fail("RECIPIENT_UNVERIFIED");
  if (recipient?.frozen) fail("RECIPIENT_FROZEN");
  const sender = getWallet(state, from);
  if (sender?.frozen) fail("SENDER_FROZEN");
  const held = holdings(state).find((h) => h.holder === from && h.propertyId === propertyId)?.units ?? 0;
  if (held < units) fail("INSUFFICIENT_UNITS");
  return { allowed: reasons.length === 0, reasonCode, reasons };
}

/**
 * Commit a batch of transactions as one block. Any pending anchors are acknowledged with ANCHOR
 * transactions inside the block; every Nth block is then mirrored to Chain B and Chain C.
 */
export function commit(state: ChainState, inputs: TxInput[], at: string): { state: ChainState; txs: ChainTx[]; block: Block } {
  const txs: ChainTx[] = [];
  let n = state.txs.length;
  const mk = (i: TxInput): ChainTx => {
    n += 1;
    const base = {
      id: `RTX-${String(n).padStart(6, "0")}`,
      type: i.type,
      at: i.at,
      status: i.status ?? "confirmed",
      propertyId: i.propertyId,
      spvId: i.spvId,
      from: i.from,
      to: i.to,
      units: i.units,
      amountEur: i.amountEur,
      memo: i.memo,
      reasonCode: i.reasonCode,
      ref: i.ref,
      rule: i.rule ?? RULES[i.type.toLowerCase() as keyof typeof RULES],
    } satisfies Omit<ChainTx, "hash">;
    return { ...base, hash: txHash(base) };
  };

  // Acknowledge pending anchors first.
  let anchors = state.anchors;
  const pending = anchors.filter((a) => !a.ackTxId);
  for (const a of pending) {
    const tx = mk({ type: "ANCHOR", at, memo: `Merkle root of block #${a.blockHeight} mirrored to ${a.targetChain} (receipt ${a.receipt.slice(0, 12)}…)`, ref: a.id });
    txs.push(tx);
    anchors = anchors.map((x) => (x.id === a.id ? { ...x, ackTxId: tx.id } : x));
  }
  for (const i of inputs) txs.push(mk(i));

  const prev = state.blocks[state.blocks.length - 1];
  const height = (prev?.height ?? 0) + 1;
  const partial = { height, timestamp: at, prevHash: prev?.hash ?? GENESIS_HASH, merkleRoot: merkleRoot(txs.map((t) => t.hash)), txIds: txs.map((t) => t.id) };
  const block: Block = { ...partial, hash: blockHash(partial) };

  if (height % ANCHOR_EVERY_N_BLOCKS === 0) {
    for (const target of ["Chain B", "Chain C"] as AnchorTarget[]) {
      anchors = [
        ...anchors,
        { id: `ANC-${String(anchors.length + 1).padStart(4, "0")}`, blockHeight: height, merkleRoot: block.merkleRoot, targetChain: target, at, receipt: digest(`${target}|${block.hash}`) },
      ];
    }
  }

  return { state: { ...state, blocks: [...state.blocks, block], txs: [...state.txs, ...txs], anchors }, txs, block };
}

/** Force an anchor of the latest block to both illustrative chains (admin action). */
export function anchorNow(state: ChainState, at: string): ChainState {
  const last = state.blocks[state.blocks.length - 1];
  if (!last) return state;
  let anchors = state.anchors;
  for (const target of ["Chain B", "Chain C"] as AnchorTarget[]) {
    anchors = [...anchors, { id: `ANC-${String(anchors.length + 1).padStart(4, "0")}`, blockHeight: last.height, merkleRoot: last.merkleRoot, targetChain: target, at, receipt: digest(`${target}|${last.hash}|${at}`) }];
  }
  return { ...state, anchors };
}

export interface VerifyReport {
  ok: boolean;
  blocksChecked: number;
  txsChecked: number;
  anchorsChecked: number;
  issues: string[];
  checkedAt: string;
}

/** Recompute every transaction hash, Merkle root, block hash and link. */
export function verifyChain(state: ChainState, now = new Date().toISOString()): VerifyReport {
  const issues: string[] = [];
  const byId = new Map(state.txs.map((t) => [t.id, t]));
  for (const t of state.txs) {
    const { hash, ...rest } = t;
    if (txHash(rest) !== hash) issues.push(`Transaction ${t.id}: hash mismatch`);
  }
  let prev = GENESIS_HASH;
  state.blocks.forEach((b, i) => {
    if (b.height !== i + 1) issues.push(`Block #${b.height}: unexpected height`);
    if (b.prevHash !== prev) issues.push(`Block #${b.height}: broken link to previous block`);
    const txs = b.txIds.map((id) => byId.get(id));
    if (txs.some((t) => !t)) issues.push(`Block #${b.height}: references a missing transaction`);
    const root = merkleRoot(txs.filter((t): t is ChainTx => !!t).map((t) => t.hash));
    if (root !== b.merkleRoot) issues.push(`Block #${b.height}: Merkle root mismatch`);
    const { hash, ...rest } = b;
    if (blockHash(rest) !== hash) issues.push(`Block #${b.height}: block hash mismatch`);
    prev = b.hash;
  });
  for (const a of state.anchors) {
    const b = state.blocks.find((x) => x.height === a.blockHeight);
    if (!b) issues.push(`Anchor ${a.id}: block not found`);
    else if (b.merkleRoot !== a.merkleRoot) issues.push(`Anchor ${a.id}: mirrored root differs from block #${b.height}`);
  }
  return { ok: issues.length === 0, blocksChecked: state.blocks.length, txsChecked: state.txs.length, anchorsChecked: state.anchors.length, issues, checkedAt: now };
}

export function findTx(state: ChainState, id: string) {
  return state.txs.find((t) => t.id === id);
}

export function blockForTx(state: ChainState, txId: string) {
  return state.blocks.find((b) => b.txIds.includes(txId));
}

export function search(state: ChainState, q: string) {
  const s = q.trim().toLowerCase();
  if (!s) return { txs: [] as ChainTx[], holders: [] as string[], blocks: [] as Block[] };
  const txs = state.txs.filter((t) => [t.id, t.from, t.to, t.propertyId, t.spvId, t.memo, t.ref, t.hash].some((v) => v?.toLowerCase().includes(s)));
  const holders = Array.from(new Set(state.wallets.filter((w) => w.id.toLowerCase().includes(s)).map((w) => w.id)));
  const blocks = state.blocks.filter((b) => String(b.height) === s || b.hash.toLowerCase().includes(s));
  return { txs, holders, blocks };
}

export const spvWallet = (spvId: string) => `SPV-${spvId.replace("spv-", "").toUpperCase()}`;

/**
 * RayaChainSimulator — the EntitlementLedger implementation backed by the simulated chain above.
 * Used where the older interface is expected (ledger reconciliation panels). State is immutable;
 * the Zustand store owns the current ChainState.
 */
export class RayaChainSimulator implements EntitlementLedger {
  readonly mode = "simulated" as const;
  constructor(public state: ChainState) {}

  issue(inv: SimInvestment, spvId: string): EntitlementRecord {
    const lock = new Date(inv.createdAt);
    lock.setFullYear(lock.getFullYear() + (inv.offerType === "loan" ? 0 : 3));
    return {
      recordId: `ENT-${inv.id.toUpperCase()}`,
      investorRef: pseudonym(inv.investorId),
      spvId,
      units: Math.round(inv.netInvested),
      issuedAt: inv.createdAt,
      txRef: inv.txId ?? inv.ref,
      transferRestricted: true,
      lockUpUntil: lock.toISOString(),
    };
  }

  checkTransfer(rec: EntitlementRecord, toInvestorVerified: boolean, now = new Date()): TransferCheck {
    const reasons: string[] = [];
    if (!toInvestorVerified) reasons.push(REASON_CODES.RECIPIENT_UNVERIFIED);
    if (now < new Date(rec.lockUpUntil)) reasons.push("Illustrative lock-up period has not ended");
    reasons.push("Secondary transfers are not enabled in this demonstration");
    return { allowed: false, reasons };
  }

  reconcile(offChain: { recordId: string; units: number }[], onChain: EntitlementRecord[]) {
    return offChain.map((o) => {
      const match = onChain.find((r) => r.recordId === o.recordId);
      if (!match) return { recordId: o.recordId, status: "missing" as const };
      return { recordId: o.recordId, status: match.units === o.units ? ("matched" as const) : ("mismatch" as const) };
    });
  }
}
