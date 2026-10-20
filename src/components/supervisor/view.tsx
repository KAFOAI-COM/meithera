"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Download, FileJson, ShieldCheck, AlertTriangle, Snowflake, MessageSquareWarning, Undo2, GraduationCap, Users, CheckCircle2, XCircle, Link2 } from "lucide-react";
import { useDemo } from "@/lib/store";
import { useHydrated } from "@/components/site/hydrator";
import { ECSPR, raiseTarget } from "@/lib/finance";
import { verifyAudit } from "@/lib/data/seed";
import { verifyChain, type VerifyReport } from "@/lib/chain/raya";
import { pseudonym } from "@/lib/ledger";
import { downloadCsv, downloadJson } from "@/lib/export";
import { cn, dateTime, eur, pct } from "@/lib/utils";
import { Badge, Button, Card, Stat, Table, Th, Td } from "@/components/ui";
import { StageBadge } from "@/components/site/stage-badge";
import { TxRow } from "@/components/chain/tx-bits";

export function SupervisorView() {
  const hydrated = useHydrated();
  const { properties, investors, investments, audit, chain, complaints } = useDemo();
  const [chainReport, setChainReport] = useState<VerifyReport | null>(null);

  const snapshot = useMemo(() => {
    const live = investments.filter((i) => i.status !== "Withdrawn (reflection period)");
    const perSpv = properties.map((p) => {
      const raised = live.filter((i) => i.propertyId === p.id).reduce((s, i) => s + i.netInvested, 0);
      return { spvId: p.spvId, property: p.title, offerType: p.offerType, stage: p.offerType === "loan" ? 1 : 2, target: raiseTarget(p), raised, investors: new Set(live.filter((i) => i.propertyId === p.id).map((i) => i.investorId)).size, capUsedPct: raised / ECSPR.offerCapEur };
    });
    const byClass = { retail: investors.filter((i) => i.classification === "Retail (non-sophisticated)").length, sophisticated: investors.filter((i) => i.classification === "Sophisticated (self-certified)").length };
    const tests = investors.filter((i) => i.knowledgeTest);
    const testPass = tests.filter((i) => i.knowledgeTest!.passed).length;
    const warnings = audit.filter((a) => a.type === "WARNING_SHOWN").length + investments.filter((i) => i.warningShown && i.status === "Seed").length;
    const withdrawals = investments.filter((i) => i.status === "Withdrawn (reflection period)").length;
    const amlAlerts = audit.filter((a) => a.type === "AML_ALERT").length + investors.filter((i) => i.onboarding.aml === "Simulated — review").length;
    const frozen = chain.wallets.filter((w) => w.frozen);
    const rejected = chain.txs.filter((t) => t.status === "rejected").length;
    const pendingKyc = investors.filter((i) => i.onboarding.kyc !== "Simulated — passed").length;
    const auditStatus = verifyAudit(audit);
    return { perSpv, byClass, tests: tests.length, testPass, warnings, withdrawals, amlAlerts, frozen, rejected, pendingKyc, auditStatus, totalRaised: perSpv.reduce((s, r) => s + r.raised, 0) };
  }, [properties, investors, investments, audit, chain]);

  if (!hydrated) return <div className="h-96 animate-pulse rounded-2xl bg-mint/50" />;

  const exportCsv = () => {
    downloadCsv("meithera-supervisory-spvs.csv", snapshot.perSpv.map((r) => ({ ...r, raised: Math.round(r.raised * 100) / 100, capUsedPct: Math.round(r.capUsedPct * 10000) / 100 })));
    downloadCsv("meithera-supervisory-chain.csv", chain.txs.map((t) => ({ id: t.id, type: t.type, status: t.status, at: t.at, propertyId: t.propertyId ?? "", from: t.from ?? "", to: t.to ?? "", units: t.units ?? "", amountEur: t.amountEur ?? "", reasonCode: t.reasonCode ?? "", memo: t.memo, hash: t.hash })));
  };
  const exportJson = () =>
    downloadJson("meithera-supervisory-snapshot.json", {
      generatedAt: new Date().toISOString(),
      label: "Illustrative supervisory view — not a Central Bank system. All data fictional and simulated.",
      summary: { ...snapshot, frozen: snapshot.frozen.map((w) => ({ id: w.id, reason: w.frozenReason })) },
      investorsByClassification: snapshot.byClass,
      complaints,
      audit,
      chain: { blocks: chain.blocks.length, txs: chain.txs, anchors: chain.anchors },
    });

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gold/60 bg-demo p-4 text-sm text-demo-ink">
        <p className="flex items-center gap-2 font-sans font-semibold"><ShieldCheck className="h-5 w-5" /> Illustrative supervisory view — not a Central Bank system</p>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" size="sm" onClick={exportCsv}><Download className="h-4 w-4" /> Export CSV</Button>
          <Button variant="secondary" size="sm" onClick={exportJson}><FileJson className="h-4 w-4" /> Export JSON</Button>
        </div>
      </div>

      <section>
        <h2 className="font-sans text-sm font-semibold uppercase tracking-wide text-muted">Offers against the ECSPR cap</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Total raised (simulated)" value={eur(snapshot.totalRaised)} sub={`${pct(snapshot.totalRaised / ECSPR.offerCapEur, 2)} of a single €5m project-owner cap`} />
          <Stat label="Investors" value={investors.length} sub={`${snapshot.byClass.retail} retail · ${snapshot.byClass.sophisticated} sophisticated`} />
          <Stat label="Knowledge-test pass rate" value={snapshot.tests ? pct(snapshot.testPass / snapshot.tests, 0) : "—"} sub={`${snapshot.testPass} of ${snapshot.tests} attempts passed`} />
          <Stat label="Pending onboarding" value={snapshot.pendingKyc} sub="KYC not yet passed (simulated)" />
        </div>
        <Card className="mt-4 p-5">
          <Table>
            <thead><tr><Th>Project owner / SPV</Th><Th>Stage</Th><Th className="text-right">Target</Th><Th className="text-right">Raised</Th><Th className="text-right">Investors</Th><Th>Use of €5m cap (12 months)</Th></tr></thead>
            <tbody>
              {snapshot.perSpv.map((r) => (
                <tr key={r.spvId}>
                  <Td><span className="font-medium">{r.property}</span><span className="block font-mono text-xs text-muted">{r.spvId}</span></Td>
                  <Td><StageBadge stage={r.stage as 1 | 2} compact /></Td>
                  <Td className="tabular text-right">{eur(r.target)}</Td>
                  <Td className="tabular text-right font-medium">{eur(r.raised)}</Td>
                  <Td className="tabular text-right">{r.investors}</Td>
                  <Td>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-full max-w-[200px] overflow-hidden rounded-full bg-mint"><div className="h-full bg-forest" style={{ width: `${Math.max(1, r.capUsedPct * 100)}%` }} /></div>
                      <span className="tabular text-xs text-muted">{pct(r.capUsedPct, 2)}</span>
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      </section>

      <section>
        <h2 className="font-sans text-sm font-semibold uppercase tracking-wide text-muted">Investor protection events</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="€1,000 / 5% warnings shown" value={snapshot.warnings} sub="ECSPR Art. 21(7)-style warning, accepted" />
          <Stat label="Reflection-period withdrawals" value={snapshot.withdrawals} sub={`Within ${ECSPR.reflectionDays} calendar days`} />
          <Stat label="AML alerts" value={snapshot.amlAlerts} sub="Simulated monitor flags + reviews" />
          <Stat label="Frozen holdings" value={snapshot.frozen.length} sub={snapshot.frozen.map((w) => w.frozenReason).join(", ") || "None"} />
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <p className="flex items-center gap-2 font-sans text-sm font-semibold"><Users className="h-4 w-4 text-forest" /> Investors by classification and onboarding</p>
          <Table className="mt-3">
            <thead><tr><Th>Holder</Th><Th>Classification</Th><Th>KYC</Th><Th>AML</Th><Th>Test</Th></tr></thead>
            <tbody>
              {investors.map((i) => (
                <tr key={i.id}>
                  <Td><code className="font-mono text-xs">{pseudonym(i.id)}</code><span className="block text-xs text-muted">{i.county}</span></Td>
                  <Td className="text-xs">{i.classification}</Td>
                  <Td>{i.onboarding.kyc === "Simulated — passed" ? <Badge tone="mint">passed</Badge> : <Badge tone="gold">pending</Badge>}</Td>
                  <Td>{i.onboarding.aml === "Simulated — clear" ? <Badge tone="mint">clear</Badge> : <Badge tone="risk">review</Badge>}</Td>
                  <Td className="tabular text-xs">{i.knowledgeTest ? `${i.knowledgeTest.score}/${i.knowledgeTest.total} ${i.knowledgeTest.passed ? "✓" : "✗"}` : "—"}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
          <p className="mt-2 text-xs text-muted">Names are not shown to the supervisor by default; identity is resolvable by the authorised entity on request.</p>
        </Card>
        <div className="space-y-6">
          <Card className="p-5">
            <p className="flex items-center gap-2 font-sans text-sm font-semibold"><MessageSquareWarning className="h-4 w-4 text-forest" /> Complaints (simulated)</p>
            <Table className="mt-3">
              <thead><tr><Th>Ref</Th><Th>Subject</Th><Th>Status</Th><Th>Opened</Th></tr></thead>
              <tbody>
                {complaints.map((c) => (
                  <tr key={c.id}><Td className="font-mono text-xs">{c.id}</Td><Td className="text-xs">{c.subject}</Td><Td><Badge tone={c.status === "Resolved" ? "mint" : c.status === "Escalated" ? "risk" : "gold"}>{c.status}</Badge></Td><Td className="text-xs text-muted">{dateTime(c.openedAt)}</Td></tr>
                ))}
              </tbody>
            </Table>
          </Card>
          <Card className="p-5">
            <p className="flex items-center gap-2 font-sans text-sm font-semibold"><Snowflake className="h-4 w-4 text-forest" /> Frozen holdings and rejected transfers</p>
            <ul className="mt-3 space-y-2 text-sm">
              {snapshot.frozen.map((w) => (
                <li key={w.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-demo p-3 text-demo-ink"><code className="font-mono text-xs">{w.id}</code><span className="text-xs">{w.label} · {w.frozenReason}</span></li>
              ))}
              {!snapshot.frozen.length ? <li className="text-muted">No holdings frozen.</li> : null}
              <li className="flex items-center justify-between rounded-lg bg-surface p-3"><span>Transfers rejected by the allowlist rule</span><span className="tabular font-semibold">{snapshot.rejected}</span></li>
            </ul>
          </Card>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <p className="flex items-center gap-2 font-sans text-sm font-semibold"><GraduationCap className="h-4 w-4 text-forest" /> Audit log and hash chain</p>
          <div className={cn("mt-3 flex items-center gap-2 rounded-xl p-3 text-sm", snapshot.auditStatus.ok ? "bg-mint text-emerald" : "bg-risk text-risk-ink")}>
            {snapshot.auditStatus.ok ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
            <span className="font-sans font-semibold">{snapshot.auditStatus.ok ? `Audit chain intact — ${audit.length} events` : `Audit chain broken at ${snapshot.auditStatus.brokenAt}`}</span>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Button size="sm" variant="secondary" onClick={() => setChainReport(verifyChain(chain))}><Link2 className="h-4 w-4" /> Verify Raya Chain</Button>
            {chainReport ? <span className={cn("text-sm font-semibold", chainReport.ok ? "text-emerald" : "text-risk-ink")}>{chainReport.ok ? `Verified: ${chainReport.blocksChecked} blocks, ${chainReport.txsChecked} tx, ${chainReport.anchorsChecked} anchors` : `${chainReport.issues.length} issue(s)`}</span> : null}
          </div>
          <ul className="mt-4 max-h-72 space-y-1 overflow-auto text-xs">
            {[...audit].reverse().slice(0, 40).map((e) => (
              <li key={e.id} className="grid grid-cols-[88px_1fr] gap-2 border-b border-line py-1.5">
                <span className="font-mono text-muted">{e.id}</span>
                <span><span className="font-sans font-semibold text-ink">{e.type}</span> <span className="text-muted">· {e.actor} · {dateTime(e.at)}</span><span className="block text-ink">{e.detail}</span></span>
              </li>
            ))}
          </ul>
        </Card>
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between p-5 pb-2">
            <p className="flex items-center gap-2 font-sans text-sm font-semibold"><Link2 className="h-4 w-4 text-forest" /> Raya Chain transaction feed</p>
            <Link href="/chain" className="font-sans text-sm font-semibold text-forest">Open explorer →</Link>
          </div>
          <div className="max-h-[560px] overflow-auto">
            {[...chain.txs].reverse().slice(0, 30).map((t) => <TxRow key={t.id} t={t} propertyName={properties.find((p) => p.id === t.propertyId)?.location} />)}
          </div>
        </Card>
      </section>

      <div className="flex gap-3 rounded-xl bg-surface p-4 text-xs text-muted">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
        <p>This is a demonstration of the <em>kind</em> of read-only view an authorised entity could offer a supervisor under ECSPR. Everything on it is fictional and simulated. It implies no engagement, approval or endorsement by the Central Bank of Ireland.</p>
      </div>
      <div className="flex items-center gap-2"><Undo2 className="h-4 w-4 text-muted" /><Link href="/presentation" className="font-sans text-sm font-semibold text-forest">Open the full-vision presentation →</Link></div>
    </div>
  );
}
