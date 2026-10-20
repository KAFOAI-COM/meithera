/**
 * Raya Chain — SIMULATED adapter.
 *
 * Models how Meithera would record holdings on Raya Chain (Raya Software's "Internet of Value"
 * Layer Zero network). Nothing here touches a real network. Design principles shown in the demo:
 *  - One master record (the SPV register). Other chains receive ANCHOR proofs (Merkle roots), not copies.
 *  - Compliance travels with the asset: verified-wallet allowlist, freeze, court-ordered correction.
 *  - No personal data on-chain: holders appear only as salted pseudonyms.
 */
import type { ChainBlock, ChainTx, ChainTxType } from "../types";
import { fnv } from "../utils";

export const ANCHOR_CHAINS = ["Chain B · EVM testnet (illustrative)", "Chain C · XRPL testnet (illustrative)"] as const;

/** 64-hex digest built from FNV rounds — deterministic and fast. Illustrative, not cryptographic. */
export function digest(input: string) {
  let out = "";
  for (let i = 0; i < 8; i++) out += fnv(`${i}:${input}:${out}`);
  return out;
}

export function merkleRoot(ids: string[]): string {
  if (ids.length === 0) return digest("empty");
  let level = ids.map((id) => digest(id));
  while (level.length > 1) {
    const next: string[] = [];
    for (let i = 0; i < level.length; i += 2) next.push(digest(level[i] + (level[i + 1] ?? level[i])));
    level = next;
  }
  return level[0];
}

export function blockHash(b: Omit<ChainBlock, "hash">) {
  return digest(`${b.height}|${b.at}|${b.prevHash}|${b.merkleRoot}`);
}

export interface ChainState {
  blocks: ChainBlock[];
  txs: ChainTx[];
}

export type TxInput = Omit<ChainTx, "txId" | "block" | "at"> & { at?: string };

/** Commit a batch of transactions as one new block. Every 2nd block is anchored to the other chains. */
export function commit(state: ChainState, inputs: TxInput[], at = new Date().toISOString()): { state: ChainState; txs: ChainTx[]; block: ChainBlock } {
  const height = state.blocks.length;
  const prev = state.blocks[height - 1];
  const txs: ChainTx[] = inputs.map((t, i) => ({
    ...t,
    at: t.at ?? at,
    block: height,
    txId: `0x${digest(`${height}:${i}:${t.type}:${t.memo}:${t.at ?? at}`).slice(0, 40)}`,
  }));
  const base = { height, at, prevHash: prev ? prev.hash : "0".repeat(64), merkleRoot: merkleRoot(txs.map((t) => t.txId)), txIds: txs.map((t) => t.txId), anchors: [] as ChainBlock["anchors"] };
  const hash = blockHash(base);
  const anchors = height % 2 === 0 ? ANCHOR_CHAINS.map((c) => ({ chain: c, ref: `0x${digest(c + hash).slice(0, 24)}` })) : [];
  const block: ChainBlock = { ...base, hash, anchors };
  return { state: { blocks: [...state.blocks, block], txs: [...state.txs, ...txs] }, txs, block };
}

export function verifyChain(state: ChainState): { ok: boolean; checked: number; brokenAt?: number } {
  for (let i = 0; i < state.blocks.length; i++) {
    const b = state.blocks[i];
    const prevHash = i === 0 ? "0".repeat(64) : state.blocks[i - 1].hash;
    if (b.prevHash !== prevHash) return { ok: false, checked: i, brokenAt: i };
    if (merkleRoot(b.txIds) !== b.merkleRoot) return { ok: false, checked: i, brokenAt: i };
    if (blockHash({ height: b.height, at: b.at, prevHash: b.prevHash, merkleRoot: b.merkleRoot, txIds: b.txIds, anchors: b.anchors }) !== b.hash) return { ok: false, checked: i, brokenAt: i };
  }
  return { ok: true, checked: state.blocks.length };
}

/** Holdings by SPV and holder, net of transfers, corrections and freezes. */
export function capTable(txs: ChainTx[], spvId: string) {
  const units = new Map<string, number>();
  const frozen = new Set<string>();
  for (const t of txs) {
    if (t.spvId !== spvId) continue;
    if (t.type === "ISSUE" && t.to) units.set(t.to, (units.get(t.to) ?? 0) + (t.units ?? 0));
    if ((t.type === "TRANSFER" || t.type === "CORRECTION") && t.from && t.to) {
      units.set(t.from, (units.get(t.from) ?? 0) - (t.units ?? 0));
      units.set(t.to, (units.get(t.to) ?? 0) + (t.units ?? 0));
    }
    if (t.type === "FREEZE" && t.from) frozen.add(t.from);
  }
  return Array.from(units.entries())
    .filter(([, u]) => u > 0)
    .map(([holder, u]) => ({ holder, units: u, frozen: frozen.has(holder) }))
    .sort((a, b) => b.units - a.units);
}

export const TX_LABEL: Record<ChainTxType, string> = {
  GENESIS: "Genesis",
  ISSUE: "Holding recorded",
  TRANSFER: "Transfer",
  DISTRIBUTION: "Rent distribution",
  REPAYMENT: "Loan interest",
  FREEZE: "Freeze",
  CORRECTION: "Court-ordered correction",
  ANCHOR: "Anchor",
  REJECTED: "Rejected transfer",
};
