"use client";

import Link from "next/link";
import { AlertTriangle, ArrowUpRight, CheckCircle2, Download, Eye, FileJson, ShieldAlert } from "lucide-react";
import { useDemo } from "@/lib/store";
import { capTable, TX_LABEL, verifyChain } from "@/lib/chain/raya";
import { verifyAudit, download, toCsv } from "@/lib/audit";
import { offerSize } from "@/lib/finance";
import { pseudonym } from "@/lib/ledger";
import { propertyColor } from "@/lib/portfolio";
import { cn, dateTime, eur, shortHash } from "@/lib/utils";
import { Button, Card } from "@/components/ui";
import { StageBadge } from "@/components/site/stage-badge";

/** ECSPR: €5m total consideration per project owner over 12 months. */
export const ECSPR_CAP = 5_000_000;
/** Illustrative AML rule: single simulated commitments at or above this are flagged for enhanced review. */
const AML_THRESHOLD = 7500;

const COMPLAINTS = [
  { id: "CMP-0007", topic: "Statement arrived later than expected", status: "Resolved", days: 3 },
  { id: "CMP-0009", topic: "Question about how the administration fee is charged", status: "Open", days: 2 },
];

function Kpi({ label, value, sub, tone = "default" }: { label: string; value: string; sub: string; tone?: "default" | "good" | "warn" }) {
  return (
    <div className="rounded-2xl border border-line bg-card p-5">
      <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.1em] text-muted">{label}</p>
      <p className={cn("tabular mt-2 font-serif text-[32px] leading-none", tone === "good" ? "text-forest" : tone === "warn" ? "text-risk-ink" : "text-ink")}>{value}</p>
      <p className="mt-2 text-xs text-muted">{sub}</p>
    </div>
  );
}

export function SupervisorView() {
  const properties = useDemo((s) => s.properties);
  const investors = useDemo((s) => s.investors);
  const investments = useDemo((s) => s.investments);
  const audit = useDemo((s) => s.audit);
  const chain = useDemo((s) => s.chain);

  const raised = properties.map((p) => ({ p, raised: p.fundedPct * offerSize(p), recorded: investments.filter((i) => i.propertyId === p.id && i.status !== "Withdrawn").reduce((s, i) => s + i.amount, 0), holders: capTable(chain.txs, p.spvId).length }));
  const byClass = { retail: investors.filter((i) => i.classification.startsWith("Retail")).length, soph: investors.filter((i) => i.classification.startsWith("Sophisticated")).length };
  const tests = audit.filter((e) => e.type === "KNOWLEDGE_TEST");
  const passed = tests.filter((e) => /passed/.test(e.detail)).length;
  const riskAcks = audit.filter((e) => e.type === "RISK_ACKNOWLEDGEMENT").length;
  const extra = audit.filter((e) => e.type === "EXTRA_WARNING").length;
  const withdrawals = chain.txs.filter((t) => t.type === "WITHDRAWAL");
  const amlReview = investors.filter((i) => i.onboarding.aml === "Simulated — review");
  const largeTickets = investments.filter((i) => i.amount >= AML_THRESHOLD && i.status !== "Withdrawn");
  const frozen = properties.flatMap((p) => capTable(chain.txs, p.spvId).filter((h) => h.frozen).map((h) => ({ ...h, location: p.location })));
  const rejected = chain.txs.filter((t) => t.type === "REJECTED");
  const chainOk = verifyChain(chain);
  const auditOk = verifyAudit(audit);
  const feed = [...chain.txs].reverse().slice(0, 12);
  const where = (spvId?: string) => properties.find((p) => p.spvId === spvId)?.location ?? "—";

  const snapshot = () => ({
    generatedAt: new Date().toISOString(),
    disclaimer: "Illustrative supervisory view — not a Central Bank system. All data fictional and simulated.",
    fundsBySpv: raised.map((r) => ({ spv: r.p.spvId, home: r.p.location, offer: r.p.offerType, raised: Math.round(r.raised), ecsprCap: ECSPR_CAP, capUsedPct: +(r.raised / ECSPR_CAP * 100).toFixed(2), holdersOnRegister: r.holders })),
    investorsByClassification: byClass,
    knowledgeTests: { total: tests.length, passed, passRate: tests.length ? passed / tests.length : null },
    warnings: { riskAcknowledgements: riskAcks, additionalWarnings: extra },
    reflectionWithdrawals: withdrawals.length,
    amlAlerts: [...amlReview.map((i) => ({ holder: pseudonym(i.id), reason: "Onboarding AML review pending" })), ...largeTickets.map((i) => ({ holder: pseudonym(i.investorId), reason: `Single commitment ≥ €${AML_THRESHOLD}` }))],
    frozenHoldings: frozen,
    rejectedTransfers: rejected.length,
    complaints: COMPLAINTS,
    integrity: { rayaChain: chainOk, auditLog: auditOk, blocks: chain.blocks.length, auditEvents: audit.length },
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div>
          <p className="flex items-center gap-2 font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-gold-ink"><Eye className="h-4 w-4" /> Read-only · live from the demo</p>
          <h1 className="mt-2 font-serif text-4xl tracking-tight text-ink sm:text-5xl">Supervisory view</h1>
          <p className="mt-2 max-w-2xl text-muted">What a supervisor could be given: a live, read-only window onto funds, investors, protections and the register — straight from the same record the platform runs on.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" size="sm" onClick={() => download("meithera-supervisory-snapshot.json", JSON.stringify(snapshot(), null, 2), "application/json")}><FileJson className="h-4 w-4" /> Export JSON</Button>
          <Button variant="secondary" size="sm" onClick={() => download("meithera-raya-chain-txs.csv", toCsv(chain.txs.map((t) => ({ at: t.at, block: t.block, type: t.type, spv: t.spvId ?? "", from: t.from ?? "", to: t.to ?? "", units: t.units ?? "", amount: t.amount ?? "", reason: t.reason ?? "", tx: t.txId }))), "text/csv")}><Download className="h-4 w-4" /> Export CSV</Button>
        </div>
      </div>
      <p className="mt-6 flex items-center gap-2 rounded-xl border-2 border-dashed border-gold/60 bg-[#fbf7ef] px-4 py-3 font-sans text-sm font-semibold text-gold-ink">
        <ShieldAlert className="h-5 w-5 shrink-0" /> Illustrative supervisory view — not a Central Bank system. All data is fictional and simulated.
      </p>

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi label="Knowledge-test pass rate" value={tests.length ? `${Math.round((passed / tests.length) * 100)}%` : "—"} sub={`${passed} of ${tests.length} attempts passed`} />
        <Kpi label="Risk warnings shown" value={String(riskAcks + extra)} sub={`${riskAcks} acknowledgements · ${extra} above-threshold`} />
        <Kpi label="Reflection withdrawals" value={String(withdrawals.length)} sub="within the 4-day period" />
        <Kpi label="Register integrity" value={chainOk.ok && auditOk.ok ? "Intact" : "Broken"} sub={`${chain.blocks.length} blocks · ${audit.length} audit events`} tone={chainOk.ok && auditOk.ok ? "good" : "warn"} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <Card className="p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="font-sans text-base font-semibold text-ink">Funds raised per property company</h2>
              <p className="text-xs text-muted">Against the ECSPR €5m cap per project owner (12 months). Simulated.</p>
            </div>
            <StageBadge stage={1} detail />
          </div>
          <ul className="mt-6 space-y-5">
            {raised.map((r) => (
              <li key={r.p.id}>
                <div className="flex flex-wrap items-baseline justify-between gap-2 text-sm">
                  <span className="flex items-center gap-2 font-sans font-semibold text-ink"><span className="h-2.5 w-2.5 rounded-sm" style={{ background: propertyColor(r.p.id) }} />{r.p.location} <span className="font-normal text-muted">· {r.p.offerType === "loan" ? "loan" : "rent share"}</span></span>
                  <span className="tabular text-muted"><strong className="text-ink">{eur(r.raised)}</strong> · {((r.raised / ECSPR_CAP) * 100).toLocaleString("en-IE", { maximumFractionDigits: 1 })}% of cap</span>
                </div>
                <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-mint/60" role="img" aria-label={`${r.p.location}: ${eur(r.raised)} of ${eur(ECSPR_CAP)}`}>
                  <div className="h-full rounded-full" style={{ width: `${Math.max(0.6, (r.raised / ECSPR_CAP) * 100)}%`, background: propertyColor(r.p.id) }} />
                </div>
                <p className="mt-1 text-[11px] text-muted">{r.holders} holders on Raya Chain · {eur(r.recorded)} in itemised demo holdings</p>
              </li>
            ))}
          </ul>
        </Card>
        <div className="grid gap-6">
          <Card className="p-6">
            <h2 className="font-sans text-base font-semibold text-ink">Investors by classification</h2>
            <div className="mt-4 flex h-3 overflow-hidden rounded-full" aria-hidden>
              <span className="bg-forest" style={{ width: `${(byClass.retail / investors.length) * 100}%` }} />
              <span className="ml-0.5 bg-gold" style={{ width: `${(byClass.soph / investors.length) * 100}%` }} />
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div><dt className="flex items-center gap-2 text-muted"><span className="h-2.5 w-2.5 rounded-sm bg-forest" />Non-sophisticated</dt><dd className="tabular mt-1 font-serif text-3xl text-ink">{byClass.retail}</dd></div>
              <div><dt className="flex items-center gap-2 text-muted"><span className="h-2.5 w-2.5 rounded-sm bg-gold" />Sophisticated</dt><dd className="tabular mt-1 font-serif text-3xl text-ink">{byClass.soph}</dd></div>
            </dl>
          </Card>
          <Card className="p-6">
            <h2 className="font-sans text-base font-semibold text-ink">Complaints <span className="font-normal text-muted">· simulated</span></h2>
            <ul className="mt-3 divide-y divide-line text-sm">
              {COMPLAINTS.map((c) => (
                <li key={c.id} className="flex items-start justify-between gap-3 py-2.5">
                  <span className="text-ink">{c.topic}<span className="block font-mono text-[11px] text-muted">{c.id} · {c.days} days</span></span>
                  <span className={cn("shrink-0 rounded-full px-2 py-0.5 font-sans text-[11px] font-semibold", c.status === "Open" ? "bg-demo text-demo-ink" : "bg-mint text-emerald")}>{c.status}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="p-6">
          <h2 className="flex items-center gap-2 font-sans text-base font-semibold text-ink"><AlertTriangle className="h-4 w-4 text-risk-ink" /> AML alerts <span className="font-normal text-muted">· simulated</span></h2>
          <ul className="mt-3 space-y-2 text-sm">
            {amlReview.map((i) => <li key={i.id} className="rounded-lg bg-risk/60 px-3 py-2 text-risk-ink"><span className="font-mono text-xs">{pseudonym(i.id)}</span><span className="block text-xs">Onboarding AML review pending</span></li>)}
            {largeTickets.map((i) => <li key={i.id} className="rounded-lg bg-demo px-3 py-2 text-demo-ink"><span className="font-mono text-xs">{pseudonym(i.investorId)}</span><span className="block text-xs">Single commitment {eur(i.amount)} ≥ {eur(AML_THRESHOLD)} — enhanced review</span></li>)}
          </ul>
        </Card>
        <Card className="p-6">
          <h2 className="font-sans text-base font-semibold text-ink">Frozen holdings & rejected transfers</h2>
          {frozen.length ? (
            <ul className="mt-3 space-y-2 text-sm">{frozen.map((f) => <li key={f.holder + f.location} className="flex justify-between gap-3"><span className="font-mono text-xs text-risk-ink">{f.holder}</span><span className="tabular text-xs text-muted">{f.location} · {f.units} u</span></li>)}</ul>
          ) : (
            <p className="mt-3 text-sm text-muted">No holdings frozen.</p>
          )}
          <p className="mt-4 text-sm text-ink"><strong className="tabular">{rejected.length}</strong> transfer{rejected.length === 1 ? "" : "s"} to unverified wallets rejected.</p>
        </Card>
        <Card className="p-6">
          <h2 className="font-sans text-base font-semibold text-ink">Integrity checks</h2>
          <ul className="mt-3 space-y-3 text-sm">
            {[["Raya Chain blocks", chainOk.ok, `${chainOk.checked} verified`], ["Audit log hash chain", auditOk.ok, `${auditOk.checked} events verified`]].map(([k, ok, sub]) => (
              <li key={String(k)} className="flex items-start gap-2.5">
                {ok ? <CheckCircle2 className="mt-0.5 h-4 w-4 text-forest" /> : <AlertTriangle className="mt-0.5 h-4 w-4 text-risk-ink" />}
                <span><span className="font-semibold text-ink">{String(k)}</span><span className="block text-xs text-muted">{ok ? String(sub) : "Broken — investigate"}</span></span>
              </li>
            ))}
          </ul>
          <Link href="/chain" className="mt-4 inline-flex min-h-10 items-center gap-1 font-sans text-sm font-semibold text-forest hover:underline">Verify in the explorer <ArrowUpRight className="h-4 w-4" /></Link>
        </Card>
      </div>

      <Card className="mt-6 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-sans text-base font-semibold text-ink">Live Raya Chain feed</h2>
          <span className="flex items-center gap-2 text-xs text-muted"><span className="h-2 w-2 animate-pulse rounded-full bg-forest motion-reduce:animate-none" /> updates as the demo runs</span>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[600px] text-sm">
            <thead className="text-left text-[11px] uppercase tracking-wide text-muted"><tr className="border-b border-line"><th className="py-2 pr-3">Time</th><th className="py-2 pr-3">Type</th><th className="py-2 pr-3">Home</th><th className="py-2 pr-3">Holder</th><th className="py-2 pr-3 text-right">Amount</th><th className="py-2">Tx</th></tr></thead>
            <tbody>
              {feed.map((t) => (
                <tr key={t.txId} className="border-b border-line last:border-0">
                  <td className="tabular whitespace-nowrap py-2.5 pr-3 text-xs text-muted">{dateTime(t.at)}</td>
                  <td className="py-2.5 pr-3 font-sans font-semibold text-ink">{TX_LABEL[t.type]}</td>
                  <td className="py-2.5 pr-3 text-ink">{where(t.spvId)}</td>
                  <td className="py-2.5 pr-3 font-mono text-xs text-muted">{t.to ?? t.from ?? "—"}</td>
                  <td className="tabular py-2.5 pr-3 text-right">{t.amount != null ? eur(t.amount, 2) : "—"}</td>
                  <td className="py-2.5"><Link href={`/chain?tx=${t.txId}`} className="font-mono text-xs text-forest hover:underline">{shortHash(t.txId)}</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
