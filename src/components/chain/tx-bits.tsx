import Link from "next/link";
import { ArrowRightLeft, Anchor, Ban, Coins, FileCheck2, Snowflake, Stamp, Wrench, Receipt } from "lucide-react";
import type { ChainTx, TxType } from "@/lib/chain/raya";
import { REASON_CODES } from "@/lib/chain/raya";
import { cn, dateTime, eur } from "@/lib/utils";

export const TX_META: Record<TxType, { label: string; icon: typeof Coins; tone: string }> = {
  ISSUE: { label: "Issue", icon: Stamp, tone: "bg-mint text-emerald" },
  TRANSFER: { label: "Transfer", icon: ArrowRightLeft, tone: "bg-surface text-ink border border-line" },
  DISTRIBUTION: { label: "Distribution", icon: Coins, tone: "bg-mint text-emerald" },
  REPAYMENT: { label: "Repayment", icon: Receipt, tone: "bg-mint text-emerald" },
  FREEZE: { label: "Freeze", icon: Snowflake, tone: "bg-demo text-demo-ink" },
  CORRECTION: { label: "Correction", icon: Wrench, tone: "bg-demo text-demo-ink" },
  ANCHOR: { label: "Anchor", icon: Anchor, tone: "bg-surface text-muted border border-line" },
  ATTEST: { label: "Attestation", icon: FileCheck2, tone: "bg-surface text-ink border border-line" },
};

export function TxTypeBadge({ type, status }: { type: TxType; status?: ChainTx["status"] }) {
  const m = TX_META[type];
  const Icon = status === "rejected" ? Ban : m.icon;
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-sans text-[11px] font-semibold", status === "rejected" ? "bg-risk text-risk-ink" : m.tone)}>
      <Icon className="h-3 w-3" /> {status === "rejected" ? `${m.label} · rejected` : m.label}
    </span>
  );
}

export function Hash({ value, short = 12, className }: { value: string; short?: number; className?: string }) {
  return (
    <code className={cn("tabular rounded bg-surface px-1.5 py-0.5 font-mono text-[11px] text-muted", className)} title={value}>
      {value.slice(0, short)}…{value.slice(-4)}
    </code>
  );
}

export function TxLink({ id, className }: { id: string; className?: string }) {
  return (
    <Link href={`/chain?tx=${id}`} className={cn("tabular font-mono text-xs font-semibold text-forest underline-offset-2 hover:underline", className)}>
      {id}
    </Link>
  );
}

export function TxRow({ t, propertyName, onSelect, selected }: { t: ChainTx; propertyName?: string; onSelect?: (id: string) => void; selected?: boolean }) {
  return (
    <button
      type="button"
      onClick={() => onSelect?.(t.id)}
      className={cn("grid w-full grid-cols-[auto_1fr] items-start gap-3 border-b border-line px-3 py-3 text-left hover:bg-mint/40 sm:grid-cols-[120px_130px_1fr_auto] sm:items-center", selected && "bg-mint/50")}
    >
      <span className="tabular font-mono text-xs font-semibold text-forest">{t.id}</span>
      <span><TxTypeBadge type={t.type} status={t.status} /></span>
      <span className="col-span-2 text-sm text-ink sm:col-span-1">
        {t.memo}
        {propertyName ? <span className="block text-xs text-muted">{propertyName}</span> : null}
      </span>
      <span className="tabular col-span-2 text-xs text-muted sm:col-span-1 sm:text-right">
        {t.units ? <span className="block font-medium text-ink">{t.units.toLocaleString("en-IE")} units</span> : null}
        {t.amountEur ? <span className="block font-medium text-ink">{eur(t.amountEur, 2)}</span> : null}
        {dateTime(t.at)}
      </span>
    </button>
  );
}

export function TxDetail({ t, blockHeight, propertyName, className }: { t: ChainTx; blockHeight?: number; propertyName?: string; className?: string }) {
  const rows: [string, React.ReactNode][] = [
    ["Transaction", <span key="id" className="tabular font-mono font-semibold">{t.id}</span>],
    ["Type", <TxTypeBadge key="type" type={t.type} status={t.status} />],
    ["Status", t.status === "confirmed" ? "Confirmed" : `Rejected — ${t.reasonCode ? REASON_CODES[t.reasonCode] ?? t.reasonCode : "rule failed"}`],
    ["Block", blockHeight ? `#${blockHeight}` : "—"],
    ["Timestamp", dateTime(t.at)],
    ["Home / company", propertyName ?? t.spvId ?? "—"],
    ["From", t.from ? <code key="from" className="font-mono text-xs">{t.from}</code> : "—"],
    ["To", t.to ? <code key="to" className="font-mono text-xs">{t.to}</code> : "—"],
    ["Units", t.units ? `${t.units.toLocaleString("en-IE")} (1 unit = €1 net)` : "—"],
    ["Amount", t.amountEur ? `${eur(t.amountEur, 2)} (simulated — no money moved)` : "—"],
    ["Reason code", t.reasonCode ? `${t.reasonCode} — ${REASON_CODES[t.reasonCode] ?? ""}` : "—"],
    ["Off-chain reference", t.ref ?? "—"],
    ["Compliance rule evaluated", <span key="rule" className="text-xs">{t.rule}</span>],
    ["Hash", <Hash key="hash" value={t.hash} short={24} />],
  ];
  return (
    <div className={cn("rounded-2xl border border-line bg-card p-5", className)}>
      <p className="font-sans text-xs font-semibold uppercase tracking-wide text-muted">Transaction detail</p>
      <p className="mt-1 text-sm text-ink">{t.memo}</p>
      <dl className="mt-4 grid gap-y-2 text-sm sm:grid-cols-[180px_1fr]">
        {rows.map(([k, v]) => (
          <div key={k} className="contents"><dt className="text-muted">{k}</dt><dd className="break-words text-ink">{v}</dd></div>
        ))}
      </dl>
      <p className="mt-4 text-xs text-muted">Holder identifiers are salted pseudonyms. The mapping to a person exists only in the off-chain identity store of the authorised entity. Nothing on this page is personal data.</p>
    </div>
  );
}
