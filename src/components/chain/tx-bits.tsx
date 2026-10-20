import Link from "next/link";
import type { ChainTx } from "@/lib/types";
import { TX_LABEL } from "@/lib/chain/raya";
import { cn, dateTime, eur, shortHash } from "@/lib/utils";

/** Compact light-theme tx row for embedding the Raya Chain feed in other pages. */
export function TxRow({ t, propertyName }: { t: ChainTx; propertyName?: string }) {
  const bad = t.type === "REJECTED" || t.type === "FREEZE";
  return (
    <Link href={`/chain?tx=${t.txId}`} className="grid grid-cols-[1fr_auto] items-start gap-3 border-b border-line px-4 py-3 text-left last:border-0 hover:bg-mint/40">
      <span className="min-w-0">
        <span className={cn("inline-flex rounded-full px-2 py-0.5 font-sans text-[11px] font-semibold", bad ? "bg-risk text-risk-ink" : "bg-mint text-emerald")}>{TX_LABEL[t.type]}</span>
        <span className="mt-1 block truncate text-sm text-ink">{propertyName ?? t.memo}</span>
        <span className="block font-mono text-[11px] text-muted">{shortHash(t.txId, 8, 4)} · block #{t.block}</span>
      </span>
      <span className="tabular text-right text-xs text-muted">
        {t.amount != null ? <span className="block font-semibold text-ink">{eur(t.amount, 2)}</span> : t.units != null ? <span className="block font-semibold text-ink">{t.units.toLocaleString("en-IE")} u</span> : null}
        {dateTime(t.at)}
      </span>
    </Link>
  );
}
