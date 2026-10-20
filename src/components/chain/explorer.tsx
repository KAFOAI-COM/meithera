"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { AlertOctagon, ArrowRight, Ban, Boxes, CheckCircle2, Link2, Search, ShieldCheck, X } from "lucide-react";
import type { ChainBlock, ChainTx, ChainTxType } from "@/lib/types";
import { useDemo } from "@/lib/store";
import { ANCHOR_CHAINS, capTable, TX_LABEL, verifyChain } from "@/lib/chain/raya";
import { pseudonym } from "@/lib/ledger";
import { verifiedWallets } from "@/lib/data/seed";
import { cn, dateTime, eur, shortHash } from "@/lib/utils";
import { StageBadge } from "@/components/site/stage-badge";

const GROUPS: { id: string; label: string; types: ChainTxType[] }[] = [
  { id: "all", label: "All", types: [] },
  { id: "holdings", label: "Holdings", types: ["ISSUE", "TRANSFER", "CORRECTION", "WITHDRAWAL"] },
  { id: "payouts", label: "Payouts", types: ["REPAYMENT", "DISTRIBUTION"] },
  { id: "controls", label: "Controls", types: ["FREEZE", "REJECTED"] },
  { id: "passport", label: "Passport", types: ["ATTEST"] },
];

const TONE: Partial<Record<ChainTxType, string>> = {
  ISSUE: "bg-[#5fd3a5]/15 text-[#7fe0b8]",
  REPAYMENT: "bg-gold/15 text-gold",
  DISTRIBUTION: "bg-gold/15 text-gold",
  FREEZE: "bg-[#e2735f]/15 text-[#f0a090]",
  REJECTED: "bg-[#e2735f]/15 text-[#f0a090]",
  CORRECTION: "bg-[#8fb3e0]/15 text-[#b3cdef]",
  WITHDRAWAL: "bg-white/10 text-white/80",
  ATTEST: "bg-white/10 text-white/70",
  GENESIS: "bg-white/10 text-white/70",
  TRANSFER: "bg-[#8fb3e0]/15 text-[#b3cdef]",
};

function Panel({ title, children, className, action }: { title: string; children: React.ReactNode; className?: string; action?: React.ReactNode }) {
  return (
    <section className={cn("rounded-2xl bg-white/[0.035] ring-1 ring-inset ring-white/10", className)}>
      <div className="flex items-center justify-between gap-3 border-b border-white/10 px-5 py-3.5">
        <h2 className="font-sans text-[11px] font-semibold uppercase tracking-[0.16em] text-white/60">{title}</h2>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

function TypePill({ type }: { type: ChainTxType }) {
  return <span className={cn("inline-flex whitespace-nowrap rounded-md px-2 py-0.5 font-sans text-[11px] font-semibold", TONE[type] ?? "bg-white/10 text-white/70")}>{TX_LABEL[type]}</span>;
}

function VerifyPanel() {
  const chain = useDemo((s) => s.chain);
  const [result, setResult] = useState<null | { ok: boolean; checked: number; brokenAt?: number; tampered: boolean }>(null);
  const run = (tamper: boolean) => {
    let state = chain;
    if (tamper) {
      // Tamper with a COPY only — the demo store is never modified.
      state = structuredClone(chain);
      const i = Math.max(1, Math.floor(state.blocks.length / 2));
      state.blocks[i].merkleRoot = "f".repeat(64);
    }
    setResult({ ...verifyChain(state), tampered: tamper });
  };
  return (
    <Panel title="Integrity">
      <p className="text-sm leading-relaxed text-white/70">Recomputes every block’s Merkle root and hash, and checks each block points at the one before it.</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" onClick={() => run(false)} className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-[#5fd3a5] px-4 font-sans text-sm font-semibold text-emerald hover:bg-[#7fe0b8]"><ShieldCheck className="h-4 w-4" /> Verify chain</button>
        <button type="button" onClick={() => run(true)} className="inline-flex min-h-10 items-center gap-2 rounded-lg px-4 font-sans text-sm font-semibold text-white/70 ring-1 ring-white/20 hover:bg-white/5">Tamper with a copy</button>
      </div>
      {result ? (
        result.ok ? (
          <p className="mt-4 flex items-start gap-2 rounded-xl bg-[#5fd3a5]/10 p-3.5 text-sm text-[#9be8c6]" role="status"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> All {result.checked} blocks verified. The record is intact.</p>
        ) : (
          <p className="mt-4 flex items-start gap-2 rounded-xl bg-[#e2735f]/12 p-3.5 text-sm text-[#f0a090]" role="status"><AlertOctagon className="mt-0.5 h-4 w-4 shrink-0" /> Broken at block #{result.brokenAt}: its Merkle root no longer matches its transactions, so every later block is untrusted. {result.tampered ? "(Tampered copy — the live record is unchanged.)" : ""}</p>
        )
      ) : null}
    </Panel>
  );
}

function TransferPanel({ spvId }: { spvId: string }) {
  const investors = useDemo((s) => s.investors);
  const txs = useDemo((s) => s.chain.txs);
  const tryTransfer = useDemo((s) => s.tryTransfer);
  const holders = capTable(txs, spvId);
  const fromOptions = investors.filter((i) => holders.some((h) => h.holder === pseudonym(i.id)));
  const verified = verifiedWallets(investors);
  const toOptions = [
    ...investors.map((i) => ({ value: pseudonym(i.id), label: `${pseudonym(i.id)} · ${verified.includes(pseudonym(i.id)) ? "verified" : "onboarding pending"}` })),
    { value: "0xA11CE0000000000000000000000000000000BEEF", label: "External wallet 0xA11CE…BEEF · unknown" },
  ];
  const [from, setFrom] = useState(fromOptions[0]?.id ?? "");
  const [to, setTo] = useState("0xA11CE0000000000000000000000000000000BEEF");
  const [last, setLast] = useState<ChainTx | null>(null);
  const fromId = fromOptions.some((i) => i.id === from) ? from : fromOptions[0]?.id;
  const sel = "h-10 w-full rounded-lg bg-white/5 px-3 font-mono text-xs text-white ring-1 ring-white/15 focus-visible:outline-2 focus-visible:outline-[#5fd3a5]";
  return (
    <Panel title="Transfer controls" action={<StageBadge stage={2} className="bg-white/10 text-white ring-white/20" />}>
      <p className="text-sm leading-relaxed text-white/70">Compliance travels with the asset: holdings can only move to wallets that passed onboarding. Try it.</p>
      {fromId ? (
        <div className="mt-4 space-y-3">
          <label className="block text-xs text-white/60">From
            <select className={cn(sel, "mt-1")} value={fromId} onChange={(e) => setFrom(e.target.value)}>{fromOptions.map((i) => <option key={i.id} value={i.id} className="bg-emerald">{pseudonym(i.id)}</option>)}</select>
          </label>
          <label className="block text-xs text-white/60">To
            <select className={cn(sel, "mt-1")} value={to} onChange={(e) => setTo(e.target.value)}>{toOptions.filter((o) => o.value !== pseudonym(fromId)).map((o) => <option key={o.value} value={o.value} className="bg-emerald">{o.label}</option>)}</select>
          </label>
          <button type="button" onClick={() => setLast(tryTransfer(spvId, fromId, to, 100))} className="inline-flex min-h-10 items-center gap-2 rounded-lg px-4 font-sans text-sm font-semibold text-white ring-1 ring-white/25 hover:bg-white/10">Attempt transfer of 100 units <ArrowRight className="h-4 w-4" /></button>
        </div>
      ) : (
        <p className="mt-4 text-sm text-white/50">No holders on this company yet.</p>
      )}
      {last ? (
        last.type === "REJECTED" ? (
          <div className="mt-4 rounded-xl bg-[#e2735f]/12 p-3.5 text-sm text-[#f0a090]" role="status">
            <p className="flex items-center gap-2 font-semibold"><Ban className="h-4 w-4" /> Rejected · {last.reason}</p>
            <p className="mt-1 text-xs text-[#f0a090]/80">{last.memo}</p>
            <p className="mt-2 font-mono text-[11px]">recorded as {shortHash(last.txId, 10, 6)} in block #{last.block}</p>
          </div>
        ) : (
          <div className="mt-4 rounded-xl bg-[#5fd3a5]/10 p-3.5 text-sm text-[#9be8c6]" role="status">
            <p className="flex items-center gap-2 font-semibold"><CheckCircle2 className="h-4 w-4" /> Transfer recorded between verified wallets</p>
            <p className="mt-2 font-mono text-[11px]">{shortHash(last.txId, 10, 6)} · block #{last.block}</p>
          </div>
        )
      ) : null}
    </Panel>
  );
}

function AnchorsPanel({ blocks }: { blocks: ChainBlock[] }) {
  const anchored = blocks.filter((b) => b.anchors.length).slice(-4).reverse();
  return (
    <Panel title="Cross-chain anchors" action={<StageBadge stage={4} className="bg-white/10 text-white ring-white/20" />}>
      <div className="grid gap-4 sm:grid-cols-[auto_1fr_auto] sm:items-center">
        <div className="rounded-xl bg-[#5fd3a5]/10 px-4 py-3 text-center ring-1 ring-[#5fd3a5]/30">
          <p className="font-sans text-xs font-semibold text-[#9be8c6]">Raya Chain</p>
          <p className="text-[11px] text-white/50">master record</p>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-white/50"><span className="h-px flex-1 border-t border-dashed border-gold/60" /> Merkle roots only <span className="h-px flex-1 border-t border-dashed border-gold/60" /></div>
        <div className="space-y-2">
          {ANCHOR_CHAINS.map((c) => <p key={c} className="rounded-lg bg-white/5 px-3 py-1.5 text-[11px] text-white/70 ring-1 ring-white/10">{c}</p>)}
        </div>
      </div>
      <p className="mt-4 text-sm leading-relaxed text-white/70">One master record; proofs travel. Other chains hold a fingerprint of each anchored block — never holdings or personal data — so anyone can check Raya Chain hasn’t been rewritten.</p>
      <ul className="mt-4 space-y-2">
        {anchored.map((b) => (
          <li key={b.height} className="rounded-lg bg-white/[0.03] p-3 font-mono text-[11px] text-white/70 ring-1 ring-white/10">
            <span className="text-white">#{b.height}</span> root {shortHash(b.merkleRoot, 8, 6)}
            {b.anchors.map((a) => <span key={a.chain} className="mt-1 block text-white/50">→ {a.chain.split(" ·")[0]} {shortHash(a.ref, 8, 4)}</span>)}
          </li>
        ))}
      </ul>
    </Panel>
  );
}

function Drawer({ tx, block, where, onClose }: { tx: ChainTx; block?: ChainBlock; where: { title: string; slug: string } | undefined; onClose: () => void }) {
  const rows: [string, React.ReactNode][] = [
    ["Type", <TypePill key="t" type={tx.type} />],
    ["Transaction", tx.txId],
    ["Time", dateTime(tx.at)],
    ["Block", `#${tx.block}`],
    ["Company", tx.spvId ?? "—"],
    ["From", tx.from ?? "—"],
    ["To", tx.to ?? "—"],
    ["Units", tx.units != null ? tx.units.toLocaleString("en-IE") : "—"],
    ["Amount", tx.amount != null ? eur(tx.amount, 2) : "—"],
    ["Reason code", tx.reason ?? "—"],
    ["Memo", tx.memo],
    ["Block hash", block?.hash],
    ["Prev hash", block?.prevHash],
    ["Merkle root", block?.merkleRoot],
  ];
  return (
    <div className="fixed inset-0 z-[60] flex justify-end bg-black/50 backdrop-blur-sm" onClick={onClose} role="dialog" aria-modal="true" aria-label="Transaction detail">
      <aside className="h-full w-full max-w-lg overflow-y-auto bg-[#061f1a] p-6 text-white shadow-2xl ring-1 ring-white/10" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.16em] text-[#5fd3a5]">Transaction detail</p>
          <button type="button" onClick={onClose} className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-white/10" aria-label="Close" autoFocus><X className="h-5 w-5" /></button>
        </div>
        <dl className="mt-6 space-y-3.5">
          {rows.map(([k, v]) => (
            <div key={k} className="grid grid-cols-[7rem_1fr] gap-3 text-sm">
              <dt className="text-white/50">{k}</dt>
              <dd className="min-w-0 break-all font-mono text-[12.5px] text-white/90">{v}</dd>
            </div>
          ))}
        </dl>
        {where ? <Link href={`/properties/${where.slug}#passport`} className="mt-8 inline-flex min-h-10 items-center gap-2 rounded-lg px-4 font-sans text-sm font-semibold ring-1 ring-white/25 hover:bg-white/10">{where.title} — passport <ArrowRight className="h-4 w-4" /></Link> : null}
        <p className="mt-6 text-xs text-white/40">Simulated. Holders are pseudonyms; no personal data is ever on-chain.</p>
      </aside>
    </div>
  );
}

export function ChainExplorer() {
  const chain = useDemo((s) => s.chain);
  const properties = useDemo((s) => s.properties);
  const params = useSearchParams();
  const router = useRouter();
  const [q, setQ] = useState("");
  const [group, setGroup] = useState("all");
  const [limit, setLimit] = useState(25);
  const spvParam = params.get("spv");
  const [spv, setSpv] = useState(spvParam && properties.some((p) => p.spvId === spvParam) ? spvParam : properties[0].spvId);
  const txParam = params.get("tx");

  const bySpv = useMemo(() => new Map(properties.map((p) => [p.spvId, p])), [properties]);
  const types = GROUPS.find((g) => g.id === group)!.types;
  const needle = q.trim().toLowerCase();
  const feed = [...chain.txs].reverse().filter((t) => {
    if (types.length && !types.includes(t.type)) return false;
    if (!needle) return true;
    const p = t.spvId ? bySpv.get(t.spvId) : undefined;
    return [t.txId, t.from, t.to, t.spvId, t.memo, p?.location, p?.county].some((f) => f?.toLowerCase().includes(needle));
  });
  const holders = new Set(chain.txs.flatMap((t) => [t.to, t.from]).filter((h): h is string => !!h && h.startsWith("ID-") && h !== "ID-INVESTOR-POOL")).size;
  const head = chain.blocks[chain.blocks.length - 1];
  const intact = verifyChain(chain).ok;
  const table = capTable(chain.txs, spv);
  const tableTotal = table.reduce((s, h) => s + h.units, 0);
  const selTx = txParam ? chain.txs.find((t) => t.txId === txParam) : undefined;
  const closeDrawer = () => router.replace(spvParam ? `/chain?spv=${spvParam}` : "/chain", { scroll: false });
  const openTx = (id: string) => router.replace(`/chain?tx=${id}`, { scroll: false });

  return (
    <div className="-mb-24 bg-[#06231e] pb-24 text-white">
      <div className="mx-auto max-w-7xl px-4 pt-12 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="flex items-center gap-2 font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-[#5fd3a5]"><Boxes className="h-4 w-4" /> Raya Chain · audit console</p>
            <h1 className="mt-3 font-serif text-4xl tracking-tight sm:text-5xl">One record of every euro, holder and payout</h1>
            <p className="mt-3 max-w-2xl text-white/60">Simulated in your browser. Pseudonymous holders, tamper-evident blocks, compliance rules that travel with the asset. A token records a holding; it is not legal title.</p>
          </div>
          <div className="flex flex-wrap gap-2"><StageBadge stage={0} detail /><StageBadge stage={4} detail className="bg-white/10 text-white ring-white/20" /></div>
        </div>

        <dl className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-white/10 ring-1 ring-white/10 lg:grid-cols-5">
          {[
            ["Block height", `#${head?.height ?? 0}`],
            ["Transactions", chain.txs.length.toLocaleString("en-IE")],
            ["Holders", String(holders)],
            ["Last block", head ? dateTime(head.at) : "—"],
            ["Status", intact ? "Verified" : "Broken"],
          ].map(([k, v]) => (
            <div key={k} className={cn("bg-[#06231e] p-5", k === "Status" && "col-span-2 lg:col-span-1")}>
              <dt className="font-sans text-[11px] font-semibold uppercase tracking-[0.12em] text-white/50">{k}</dt>
              <dd className={cn("tabular mt-2 font-mono text-lg", k === "Status" ? (intact ? "text-[#7fe0b8]" : "text-[#f0a090]") : "text-white")}>{k === "Status" ? (intact ? "● " : "● ") + v : v}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
          <Panel
            title="Transaction feed"
            action={<span className="font-mono text-[11px] text-white/40">{feed.length} shown</span>}
          >
            <div className="flex flex-wrap items-center gap-3">
              <label className="relative min-w-0 flex-1 basis-full sm:basis-auto">
                <span className="sr-only">Search transactions</span>
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search tx, holder ID or property…" className="h-11 w-full rounded-lg bg-white/5 pl-9 pr-3 font-mono text-xs text-white ring-1 ring-white/15 placeholder:text-white/30 focus-visible:outline-2 focus-visible:outline-[#5fd3a5]" />
              </label>
              <div className="-mx-1 flex max-w-full gap-1 overflow-x-auto px-1" role="tablist" aria-label="Transaction type">
                {GROUPS.map((g) => (
                  <button key={g.id} role="tab" aria-selected={group === g.id} onClick={() => setGroup(g.id)} className={cn("min-h-9 shrink-0 rounded-lg px-3 font-sans text-xs font-semibold", group === g.id ? "bg-white text-emerald" : "text-white/60 hover:bg-white/10 hover:text-white")}>{g.label}</button>
                ))}
              </div>
            </div>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-xs">
                <thead className="text-white/40">
                  <tr className="border-b border-white/10">
                    <th className="py-2 pr-3 font-semibold">Time</th><th className="py-2 pr-3 font-semibold">Type</th><th className="py-2 pr-3 font-semibold">Home</th><th className="py-2 pr-3 font-semibold">From → To</th><th className="py-2 pr-3 text-right font-semibold">Amount</th><th className="py-2 font-semibold">Tx</th>
                  </tr>
                </thead>
                <tbody>
                  {feed.slice(0, limit).map((t) => (
                    <tr key={t.txId} className="cursor-pointer border-b border-white/5 hover:bg-white/[0.04]" onClick={() => openTx(t.txId)}>
                      <td className="tabular whitespace-nowrap py-2.5 pr-3 font-mono text-white/50">{dateTime(t.at)}</td>
                      <td className="py-2.5 pr-3"><TypePill type={t.type} /></td>
                      <td className="py-2.5 pr-3 text-white/80">{t.spvId ? bySpv.get(t.spvId)?.location ?? t.spvId : "—"}</td>
                      <td className="whitespace-nowrap py-2.5 pr-3 font-mono text-white/60">{t.from || t.to ? <>{t.from ? shortHash(t.from, 6, 3) : t.type === "ISSUE" ? "issuer" : t.spvId ? "company" : "—"} → {t.to ? shortHash(t.to, 6, 3) : "—"}</> : "—"}</td>
                      <td className="tabular py-2.5 pr-3 text-right font-mono text-white/90">{t.amount != null ? eur(t.amount, 2) : t.units != null ? `${t.units} u` : ""}</td>
                      <td className="py-2.5"><button type="button" className="font-mono text-[#7fe0b8] hover:underline" onClick={(e) => { e.stopPropagation(); openTx(t.txId); }}>{shortHash(t.txId)}</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!feed.length ? <p className="py-8 text-center text-sm text-white/50">No transactions match.</p> : null}
              {feed.length > limit ? <button type="button" onClick={() => setLimit(limit + 25)} className="mt-3 min-h-10 w-full rounded-lg font-sans text-xs font-semibold text-white/60 ring-1 ring-white/10 hover:bg-white/5">Show more ({feed.length - limit} older)</button> : null}
            </div>
          </Panel>

          <Panel title="Latest blocks">
            <ol className="space-y-2.5">
              {chain.blocks.slice(-8).reverse().map((b) => (
                <li key={b.height} className="rounded-xl bg-white/[0.03] p-3.5 ring-1 ring-white/10">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="font-mono text-sm text-white">#{b.height}</p>
                    <p className="tabular font-mono text-[11px] text-white/40">{dateTime(b.at)}</p>
                  </div>
                  <p className="mt-1 font-mono text-[11px] text-white/50">root {shortHash(b.merkleRoot, 10, 6)} · {b.txIds.length} tx</p>
                  {b.anchors.length ? <p className="mt-1.5 flex items-center gap-1.5 text-[11px] text-gold"><Link2 className="h-3 w-3" /> anchored to Chain B, Chain C</p> : null}
                </li>
              ))}
            </ol>
          </Panel>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Panel
            title="Cap table"
            className="lg:col-span-1"
            action={
              <select aria-label="Property company" value={spv} onChange={(e) => setSpv(e.target.value)} className="h-9 rounded-lg bg-white/5 px-2 font-sans text-xs text-white ring-1 ring-white/15">
                {properties.map((p) => <option key={p.spvId} value={p.spvId} className="bg-emerald">{p.location}</option>)}
              </select>
            }
          >
            {table.length ? (
              <ul className="space-y-2">
                {table.map((h) => (
                  <li key={h.holder} className="text-xs">
                    <div className="flex items-baseline justify-between gap-3 font-mono">
                      <span className={cn("text-white/80", h.frozen && "text-[#f0a090]")}>{h.holder}{h.frozen ? " · frozen" : ""}</span>
                      <span className="tabular text-white">{h.units.toLocaleString("en-IE")} u · {Math.round((h.units / tableTotal) * 100)}%</span>
                    </div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/10"><div className={cn("h-full rounded-full", h.frozen ? "bg-[#e2735f]" : "bg-[#5fd3a5]")} style={{ width: `${(h.units / tableTotal) * 100}%` }} /></div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-white/50">No holdings recorded for this company yet.</p>
            )}
            <p className="mt-4 text-[11px] text-white/40">Recorded holdings only; 1 unit = €1 of net capital. Pooled demo funding shown on the property page is not itemised here.</p>
          </Panel>
          <VerifyPanel />
          <TransferPanel spvId={spv} />
        </div>
        <div className="mt-6"><AnchorsPanel blocks={chain.blocks} /></div>
      </div>
      {selTx ? <Drawer tx={selTx} block={chain.blocks[selTx.block]} where={selTx.spvId ? (() => { const p = bySpv.get(selTx.spvId!); return p ? { title: p.location, slug: p.slug } : undefined; })() : undefined} onClose={closeDrawer} /> : null}
    </div>
  );
}
