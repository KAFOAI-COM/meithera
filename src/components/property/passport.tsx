"use client";

import Link from "next/link";
import { ArrowUpRight, CheckCircle2, CircleDashed } from "lucide-react";
import type { ChainTx, Property } from "@/lib/types";
import { useDemo } from "@/lib/store";
import { capTable } from "@/lib/chain/raya";
import { cn, eur, shortDate, shortHash } from "@/lib/utils";

/** SEAI-style BER band colours (A → G). Domain colours, used only on the energy chips. */
const BER_COLOR: Record<string, string> = { A: "#00843d", B: "#4fae32", C: "#b7d334", D: "#fdd500", E: "#f8a61b", F: "#ee7623", G: "#e2231a" };
const berColor = (b: string) => BER_COLOR[b.replace(/[^A-G]/g, "").charAt(0)] ?? "#8a9a93";

export function BerChip({ value, label }: { value: string; label: string }) {
  const band = value.replace(/^Target\s*/i, "");
  const c = berColor(band);
  const dark = ["C", "D"].includes(band.charAt(0));
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-12 min-w-14 items-center justify-center rounded-lg px-2 font-sans text-xl font-bold" style={{ background: c, color: dark ? "#172521" : "#fff" }}>
        {band}
      </span>
      <span className="text-xs leading-tight text-muted">{label}</span>
    </div>
  );
}

interface Entry {
  key: string;
  title: string;
  detail: string;
  at?: string;
  tx?: ChainTx;
  done: boolean;
}

function buildEntries(p: Property, txs: ChainTx[]): Entry[] {
  const mine = txs.filter((t) => t.spvId === p.spvId);
  const attest = (reason: string) => mine.filter((t) => t.type === "ATTEST" && t.reason === reason);
  const issues = mine.filter((t) => t.type === "ISSUE");
  const payouts = mine.filter((t) => t.type === "REPAYMENT" || t.type === "DISTRIBUTION");
  const holders = capTable(txs, p.spvId).length;
  const milestoneTxs = attest("MILESTONE");
  let doneIdx = 0;

  const entries: Entry[] = [
    { key: "vacant", title: `Long-term vacant since ${p.vacantSince}`, detail: "Vacancy recorded as the home’s starting point (illustrative).", tx: attest("VACANCY")[0], at: attest("VACANCY")[0]?.at, done: true },
    { key: "ber-before", title: `Pre-works BER survey: ${p.berBefore}`, detail: "Energy baseline before any works (illustrative survey).", tx: attest("BER_BEFORE")[0], at: attest("BER_BEFORE")[0]?.at, done: true },
    issues.length
      ? {
          key: "funders",
          title: `${holders} pseudonymous funder${holders === 1 ? "" : "s"} on the register`,
          detail: `${issues.length} holding${issues.length === 1 ? "" : "s"} recorded · ${eur(issues.reduce((s, t) => s + (t.amount ?? 0), 0))} committed (simulated). First holding shown.`,
          tx: issues[0],
          at: issues[0].at,
          done: true,
        }
      : { key: "funders", title: "Funding opens", detail: "Holdings will be recorded on Raya Chain as they are simulated.", done: false },
    ...p.milestones.map((m): Entry => {
      const tx = m.done ? milestoneTxs[doneIdx++] : undefined;
      return { key: `m-${m.label}`, title: m.label, detail: m.done ? "Milestone attested (illustrative)." : `Planned for ${m.date} (indicative).`, tx, at: tx?.at, done: m.done };
    }),
    { key: "ber-after", title: `Post-works BER: ${p.ber.replace(/^Target\s*/i, "target ")}`, detail: "Certificate to be attested once works complete.", done: false },
  ];

  if (payouts.length) {
    const byBlock = new Map<number, ChainTx[]>();
    payouts.forEach((t) => byBlock.set(t.block, [...(byBlock.get(t.block) ?? []), t]));
    for (const [, group] of byBlock) {
      const first = group[0];
      entries.push({
        key: `pay-${first.txId}`,
        title: `${first.type === "REPAYMENT" ? "Loan interest" : "Rent distribution"} paid · ${eur(group.reduce((s, t) => s + (t.amount ?? 0), 0), 2)}`,
        detail: `${group.length} holder${group.length === 1 ? "" : "s"} paid, net of the 0.5% administration fee (simulated).`,
        tx: first,
        at: first.at,
        done: true,
      });
    }
  } else {
    entries.push({ key: "pay", title: p.offerType === "loan" ? "First monthly interest payment" : "First monthly rent distribution", detail: p.offerType === "loan" ? "After drawdown." : "After the tenancy begins.", done: false });
  }

  const done = entries.filter((e) => e.done).sort((a, b) => (a.at ?? "").localeCompare(b.at ?? ""));
  return [...done, ...entries.filter((e) => !e.done)];
}

/** The Home Digital Passport: one timeline per home, each recorded entry linked to its Raya Chain tx. */
export function Passport({ p }: { p: Property }) {
  const txs = useDemo((s) => s.chain.txs);
  const entries = buildEntries(p, txs);
  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
      <ol className="relative">
        {entries.map((e, i) => (
          <li key={e.key} className="relative grid grid-cols-[2rem_1fr] gap-4 pb-6 last:pb-0">
            {i < entries.length - 1 ? <span className={cn("absolute left-[15px] top-8 h-[calc(100%-1.5rem)] w-px", e.done ? "bg-forest/40" : "bg-line")} aria-hidden /> : null}
            <span className={cn("relative z-10 mt-0.5 flex h-8 w-8 items-center justify-center rounded-full", e.done ? "bg-mint text-forest" : "bg-surface text-line-strong ring-1 ring-line")}>
              {e.done ? <CheckCircle2 className="h-4 w-4" /> : <CircleDashed className="h-4 w-4" />}
            </span>
            <div className={cn("rounded-xl border p-4", e.done ? "border-line bg-card" : "border-dashed border-line bg-surface")}>
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <p className={cn("font-sans text-sm font-semibold", e.done ? "text-ink" : "text-muted")}>{e.title}</p>
                {e.at ? <p className="tabular text-xs text-muted">{shortDate(e.at)}</p> : <p className="text-xs text-muted">Pending</p>}
              </div>
              <p className="mt-1 text-xs leading-relaxed text-muted">{e.detail}</p>
              {e.tx ? (
                <Link href={`/chain?tx=${e.tx.txId}`} className="mt-2.5 inline-flex min-h-8 items-center gap-1.5 rounded-md bg-surface px-2 font-mono text-[11px] text-forest ring-1 ring-line hover:bg-mint">
                  block #{e.tx.block} · {shortHash(e.tx.txId, 8, 6)} <ArrowUpRight className="h-3 w-3" />
                </Link>
              ) : null}
            </div>
          </li>
        ))}
      </ol>
      <aside className="space-y-4 lg:sticky lg:top-40 lg:self-start">
        <div className="rounded-2xl border border-line bg-card p-5">
          <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.1em] text-muted">Energy rating</p>
          <div className="mt-4 flex items-center gap-4">
            <BerChip value={p.berBefore} label="Before works (survey)" />
            <span className="text-muted" aria-hidden>→</span>
            <BerChip value={p.ber} label="Target after works" />
          </div>
        </div>
        <div className="rounded-2xl bg-emerald p-5 text-sm leading-relaxed text-white/80">
          <p className="font-sans font-semibold text-white">What the passport is</p>
          <p className="mt-2">A single, tamper-evident history of the home — vacancy, works, energy rating, tenancy, funders and payouts — recorded on Raya Chain with no personal data. Holders appear only as pseudonyms.</p>
          <p className="mt-2 text-white/60">Simulated in your browser. A token records a holding; it is not legal title to the home.</p>
        </div>
      </aside>
    </div>
  );
}
