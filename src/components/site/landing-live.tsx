"use client";

import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Boxes } from "lucide-react";
import { useDemo } from "@/lib/store";
import { capTable, TX_LABEL } from "@/lib/chain/raya";
import { dateTime, eur, shortHash } from "@/lib/utils";

/** Floating card on the hero showing the three most recent Raya Chain transactions from the demo store. */
export function LiveChainCard() {
  const chain = useDemo((s) => s.chain);
  const properties = useDemo((s) => s.properties);
  const reduce = useReducedMotion();
  // One row per recent block, so the card shows the variety of activity (holdings, interest, rent…).
  const latest = chain.blocks
    .slice(-3)
    .reverse()
    .map((b) => ({ tx: chain.txs.find((t) => t.txId === b.txIds[0])!, more: b.txIds.length - 1 }))
    .filter((r) => r.tx && r.tx.type !== "GENESIS");
  const head = chain.blocks[chain.blocks.length - 1];
  const where = (spvId?: string) => properties.find((p) => p.spvId === spvId)?.location ?? "Register";

  return (
    <div className="w-full max-w-sm rounded-2xl border border-white/15 bg-emerald/55 p-5 text-white shadow-[0_24px_64px_rgba(0,0,0,0.35)] backdrop-blur-xl">
      <div className="flex items-center justify-between">
        <p className="flex items-center gap-2 font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-white/80">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#5fd3a5] opacity-60 motion-reduce:hidden" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#5fd3a5]" />
          </span>
          Live on Raya Chain
        </p>
        <span className="tabular font-mono text-[11px] text-white/60">block #{head?.height ?? 0}</span>
      </div>
      <ul className="mt-4 space-y-2.5" aria-live="polite">
        <AnimatePresence initial={false}>
          {latest.map(({ tx: t, more }) => (
            <motion.li
              key={t.txId}
              layout={!reduce}
              initial={reduce ? false : { opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
              className="rounded-xl bg-white/[0.07] px-3.5 py-3 ring-1 ring-inset ring-white/10"
            >
              <div className="flex items-baseline justify-between gap-3">
                <span className="font-sans text-sm font-semibold">
                  {TX_LABEL[t.type]}
                  {more > 0 ? <span className="ml-1.5 font-normal text-white/50">+{more} in block #{t.block}</span> : null}
                </span>
                {t.amount != null ? <span className="tabular font-sans text-sm font-semibold text-gold">{eur(t.amount, 2)}</span> : null}
              </div>
              <div className="mt-1 flex items-baseline justify-between gap-3 text-[11px] text-white/60">
                <span className="truncate">{where(t.spvId)} · {dateTime(t.at)}</span>
                <span className="shrink-0 font-mono">{shortHash(t.txId)}</span>
              </div>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
      <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3 text-[11px] text-white/60">
        <span className="font-mono">root {shortHash(head?.merkleRoot ?? "", 8, 4)}</span>
        <Link href="/chain" className="inline-flex items-center gap-1 font-sans font-semibold text-white hover:text-gold">
          Open explorer <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
      <p className="mt-2 flex items-center gap-1.5 text-[10px] text-white/45"><Boxes className="h-3 w-3" /> Simulated in your browser — no network, no tokens.</p>
    </div>
  );
}

/** Hero stat strip — every number is derived from the demo store. */
export function LiveStats() {
  const properties = useDemo((s) => s.properties);
  const investments = useDemo((s) => s.investments);
  const chain = useDemo((s) => s.chain);
  const committed = investments.reduce((s, i) => s + i.amount, 0);
  const holders = new Set(properties.flatMap((p) => capTable(chain.txs, p.spvId).map((h) => h.holder))).size;
  const paid = chain.txs.filter((t) => t.type === "DISTRIBUTION" || t.type === "REPAYMENT").reduce((s, t) => s + (t.amount ?? 0), 0);
  const stats: [string, string][] = [
    [String(properties.length), "Vacant homes in the demo pipeline"],
    [eur(committed), "Simulated capital committed"],
    [String(holders), "Pseudonymous holders on the register"],
    [eur(paid, 2), "Interest & income paid (simulated)"],
  ];
  return (
    <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-white/10 ring-1 ring-white/10 lg:grid-cols-4">
      {stats.map(([v, k]) => (
        <div key={k} className="bg-emerald/70 px-5 py-5 backdrop-blur-md sm:px-6">
          <dd className="tabular font-serif text-3xl leading-none text-white sm:text-4xl">{v}</dd>
          <dt className="mt-2 font-sans text-[11px] font-medium uppercase leading-snug tracking-[0.1em] text-white/60">{k}</dt>
        </div>
      ))}
    </dl>
  );
}
