"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Anchor, Boxes, CheckCircle2, Search, ShieldCheck, Snowflake, Users, XCircle, ArrowRightLeft, RefreshCw } from "lucide-react";
import { useDemo } from "@/lib/store";
import { useHydrated } from "@/components/site/hydrator";
import { blockForTx, capTable, holdings, search, verifyChain, type VerifyReport } from "@/lib/chain/raya";
import { pseudonym } from "@/lib/ledger";
import { cn, dateTime, pct } from "@/lib/utils";
import { Button, Card, Input, Stat, Table, Th, Td, Badge } from "@/components/ui";
import { Tabs } from "@/components/ui/tabs";
import { StageBadge } from "@/components/site/stage-badge";
import { IllustrativeNotice } from "@/components/site/notices";
import { Hash, TxDetail, TxRow, TxTypeBadge, TX_META } from "./tx-bits";

type Tab = "overview" | "transactions" | "holders" | "captable" | "anchors" | "controls";
const TABS: { id: Tab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "transactions", label: "Transactions" },
  { id: "holders", label: "Holders" },
  { id: "captable", label: "Cap tables" },
  { id: "anchors", label: "Anchors" },
  { id: "controls", label: "Verify & controls" },
];

export function ChainExplorer() {
  const hydrated = useHydrated();
  const router = useRouter();
  const params = useSearchParams();
  const { chain, properties, attemptTransfer, anchor } = useDemo();
  const [tab, setTab] = useState<Tab>("overview");
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<string | null>(params.get("tx"));
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [report, setReport] = useState<VerifyReport | null>(null);
  const [lastDemoTx, setLastDemoTx] = useState<string | null>(null);

  useEffect(() => {
    const tx = params.get("tx");
    if (tx) setSelected(tx);
  }, [params]);

  const propName = (id?: string) => properties.find((p) => p.id === id)?.location;
  const txsDesc = useMemo(() => [...chain.txs].reverse(), [chain.txs]);
  const blocksDesc = useMemo(() => [...chain.blocks].reverse(), [chain.blocks]);
  const results = useMemo(() => search(chain, q), [chain, q]);
  const allHoldings = useMemo(() => holdings(chain), [chain]);
  const holders = useMemo(() => {
    const m = new Map<string, { units: number; props: number }>();
    for (const h of allHoldings) m.set(h.holder, { units: (m.get(h.holder)?.units ?? 0) + h.units, props: (m.get(h.holder)?.props ?? 0) + 1 });
    return Array.from(m.entries()).map(([id, v]) => ({ id, ...v, wallet: chain.wallets.find((w) => w.id === id) })).sort((a, b) => b.units - a.units);
  }, [allHoldings, chain.wallets]);
  const selectedTx = selected ? chain.txs.find((t) => t.id === selected) : undefined;
  const rejected = chain.txs.filter((t) => t.status === "rejected").length;
  const frozen = chain.wallets.filter((w) => w.frozen).length;

  if (!hydrated) return <div className="h-96 animate-pulse rounded-2xl bg-mint/50" />;

  const select = (id: string) => {
    setSelected(id);
    router.replace(`/chain?tx=${id}`, { scroll: false });
  };

  const demoRejected = () => {
    const tx = attemptTransfer(pseudonym("inv-001"), "ID-EXT-UNVERIFIED", "prop-d8", 100);
    setLastDemoTx(tx.id);
    select(tx.id);
  };
  const demoAllowed = () => {
    const tx = attemptTransfer(pseudonym("inv-001"), pseudonym("inv-002"), "prop-d8", 50);
    setLastDemoTx(tx.id);
    select(tx.id);
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Stat label="Block height" value={chain.blocks.length} sub="Simulated blocks" />
        <Stat label="Transactions" value={chain.txs.length} sub={`${rejected} rejected by rule`} />
        <Stat label="Holders" value={holders.length} sub="Pseudonymous wallets with units" />
        <Stat label="Anchors" value={chain.anchors.length} sub="Merkle roots mirrored to Chain B / C" />
        <Stat label="Frozen" value={frozen} sub="Wallets under freeze" />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs tabs={TABS} value={tab} onChange={setTab} />
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <Input aria-label="Search by transaction, holder, home or hash" placeholder="Search tx, holder, home, hash…" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
        </div>
      </div>

      {q.trim() ? (
        <Card className="p-5">
          <p className="font-sans text-sm font-semibold">Search results for “{q}”</p>
          {results.holders.length ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {results.holders.map((h) => (
                <button key={h} type="button" onClick={() => { setTab("holders"); setQ(h); }} className="rounded-full border border-line bg-surface px-3 py-1 font-mono text-xs">{h}</button>
              ))}
            </div>
          ) : null}
          {results.blocks.length ? <p className="mt-3 text-xs text-muted">Blocks: {results.blocks.map((b) => `#${b.height}`).join(", ")}</p> : null}
          <div className="mt-3 rounded-xl border border-line">
            {results.txs.length ? results.txs.slice(0, 25).map((t) => <TxRow key={t.id} t={t} propertyName={propName(t.propertyId)} onSelect={select} selected={selected === t.id} />) : <p className="p-4 text-sm text-muted">No matching transactions.</p>}
          </div>
        </Card>
      ) : null}

      {selectedTx ? <TxDetail t={selectedTx} blockHeight={blockForTx(chain, selectedTx.id)?.height} propertyName={propName(selectedTx.propertyId)} /> : null}

      {tab === "overview" ? (
        <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
          <Card className="p-5">
            <p className="flex items-center gap-2 font-sans text-sm font-semibold"><Boxes className="h-4 w-4 text-forest" /> Latest blocks</p>
            <ul className="mt-3 divide-y divide-line">
              {blocksDesc.slice(0, 8).map((b) => (
                <li key={b.height} className="py-2.5 text-sm">
                  <div className="flex items-center justify-between"><span className="tabular font-sans font-semibold">#{b.height}</span><span className="text-xs text-muted">{dateTime(b.timestamp)}</span></div>
                  <div className="mt-1 flex items-center justify-between gap-2 text-xs text-muted"><span>{b.txIds.length} tx</span><Hash value={b.hash} /></div>
                </li>
              ))}
            </ul>
          </Card>
          <Card className="overflow-hidden">
            <p className="flex items-center gap-2 p-5 pb-2 font-sans text-sm font-semibold"><ArrowRightLeft className="h-4 w-4 text-forest" /> Transaction feed</p>
            <div>{txsDesc.slice(0, 12).map((t) => <TxRow key={t.id} t={t} propertyName={propName(t.propertyId)} onSelect={select} selected={selected === t.id} />)}</div>
            <button type="button" onClick={() => setTab("transactions")} className="min-h-11 w-full p-3 font-sans text-sm font-semibold text-forest hover:bg-mint/40">All transactions →</button>
          </Card>
        </div>
      ) : null}

      {tab === "transactions" ? (
        <Card className="overflow-hidden">
          <div className="flex flex-wrap gap-2 p-4">
            {["all", ...Object.keys(TX_META)].map((k) => (
              <button key={k} type="button" onClick={() => setTypeFilter(k)} className={cn("min-h-9 rounded-full border px-3 font-sans text-xs font-semibold", typeFilter === k ? "border-emerald bg-emerald text-white" : "border-line bg-card text-muted hover:bg-mint")}>
                {k === "all" ? "All" : TX_META[k as keyof typeof TX_META].label}
              </button>
            ))}
          </div>
          <div>{txsDesc.filter((t) => typeFilter === "all" || t.type === typeFilter).map((t) => <TxRow key={t.id} t={t} propertyName={propName(t.propertyId)} onSelect={select} selected={selected === t.id} />)}</div>
        </Card>
      ) : null}

      {tab === "holders" ? (
        <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
          <Card className="p-5">
            <p className="flex items-center gap-2 font-sans text-sm font-semibold"><Users className="h-4 w-4 text-forest" /> Holders by pseudonym</p>
            <Table className="mt-3">
              <thead><tr><Th>Holder</Th><Th>Wallet</Th><Th className="text-right">Units</Th><Th className="text-right">Homes</Th></tr></thead>
              <tbody>
                {holders.map((h) => (
                  <tr key={h.id} className={cn(q === h.id && "bg-mint/40")}>
                    <Td><button type="button" onClick={() => setQ(h.id)} className="font-mono text-xs font-semibold text-forest">{h.id}</button></Td>
                    <Td className="text-xs">{h.wallet?.label ?? "—"} {h.wallet?.frozen ? <Badge tone="gold" className="ml-1"><Snowflake className="h-3 w-3" /> frozen</Badge> : null}{h.wallet && !h.wallet.verified ? <Badge tone="risk" className="ml-1">unverified</Badge> : null}</Td>
                    <Td className="tabular text-right font-medium">{h.units.toLocaleString("en-IE")}</Td>
                    <Td className="tabular text-right">{h.props}</Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card>
          <Card className="p-5">
            <p className="font-sans text-sm font-semibold">Allowlist (verified wallets)</p>
            <p className="mt-1 text-xs text-muted">Transfers are only accepted to wallets on this list. A wallet is added only after the authorised entity has completed onboarding.</p>
            <ul className="mt-3 divide-y divide-line text-sm">
              {chain.wallets.map((w) => (
                <li key={w.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                  <span><code className="font-mono text-xs">{w.id}</code><span className="block text-xs text-muted">{w.label} · {w.kind}</span></span>
                  <span className="flex gap-1">
                    {w.verified ? <Badge tone="mint"><CheckCircle2 className="h-3 w-3" /> verified</Badge> : <Badge tone="risk"><XCircle className="h-3 w-3" /> not verified</Badge>}
                    {w.frozen ? <Badge tone="gold"><Snowflake className="h-3 w-3" /> {w.frozenReason}</Badge> : null}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      ) : null}

      {tab === "captable" ? (
        <div className="grid gap-6 md:grid-cols-2">
          {properties.map((p) => {
            const rows = capTable(chain, p.id);
            const total = rows.reduce((s, r) => s + r.units, 0);
            return (
              <Card key={p.id} className="p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-sans text-sm font-semibold">{p.title}</p>
                  <StageBadge stage={p.offerType === "loan" ? 1 : 2} compact />
                </div>
                <p className="tabular mt-1 text-xs text-muted">{total.toLocaleString("en-IE")} units on register · {rows.length} holders · company treasury SPV-{p.spvId.replace("spv-", "").toUpperCase()}</p>
                {rows.length ? (
                  <Table className="mt-3">
                    <thead><tr><Th>Holder</Th><Th className="text-right">Units</Th><Th className="text-right">Share</Th></tr></thead>
                    <tbody>
                      {rows.map((r) => (
                        <tr key={r.holder}>
                          <Td className="font-mono text-xs">{r.holder} {r.frozen ? <Snowflake className="ml-1 inline h-3 w-3 text-gold-ink" aria-label="frozen" /> : null}</Td>
                          <Td className="tabular text-right">{r.units.toLocaleString("en-IE")}</Td>
                          <Td className="tabular text-right">{pct(r.share, 1)}</Td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                ) : (
                  <p className="mt-3 text-sm text-muted">No units issued yet.</p>
                )}
              </Card>
            );
          })}
        </div>
      ) : null}

      {tab === "anchors" ? (
        <Card className="p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="flex items-center gap-2 font-sans text-sm font-semibold"><Anchor className="h-4 w-4 text-forest" /> Anchors to other chains</p>
              <p className="mt-1 max-w-2xl text-xs text-muted">Every third block’s Merkle root is posted to two illustrative networks, “Chain B” and “Chain C”. The master record stays single on Raya Chain; only proofs travel. Each mirror is acknowledged by an ANCHOR transaction so the supervisor can see the round trip. The compliance rules travel with the asset — a holding mirrored elsewhere still carries its transfer restrictions.</p>
            </div>
            <Button variant="secondary" size="sm" onClick={anchor}><RefreshCw className="h-4 w-4" /> Anchor latest block now</Button>
          </div>
          <Table className="mt-4">
            <thead><tr><Th>Anchor</Th><Th>Block</Th><Th>Target</Th><Th>Merkle root</Th><Th>Receipt</Th><Th>Ack tx</Th><Th>When</Th></tr></thead>
            <tbody>
              {[...chain.anchors].reverse().map((a) => (
                <tr key={a.id}>
                  <Td className="font-mono text-xs">{a.id}</Td>
                  <Td className="tabular">#{a.blockHeight}</Td>
                  <Td><Badge tone="neutral">{a.targetChain}</Badge></Td>
                  <Td><Hash value={a.merkleRoot} /></Td>
                  <Td><Hash value={a.receipt} /></Td>
                  <Td>{a.ackTxId ? <button type="button" className="font-mono text-xs font-semibold text-forest" onClick={() => select(a.ackTxId!)}>{a.ackTxId}</button> : <span className="text-xs text-muted">pending next block</span>}</Td>
                  <Td className="text-xs text-muted">{dateTime(a.at)}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      ) : null}

      {tab === "controls" ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="p-5">
            <p className="flex items-center gap-2 font-sans text-sm font-semibold"><ShieldCheck className="h-4 w-4 text-forest" /> Verify chain</p>
            <p className="mt-1 text-xs text-muted">Recomputes every transaction hash, every block’s Merkle root and hash, each link to the previous block, and each anchored root. Runs entirely in this browser.</p>
            <Button className="mt-4" onClick={() => setReport(verifyChain(chain))}><RefreshCw className="h-4 w-4" /> Verify chain</Button>
            {report ? (
              <div className={cn("mt-4 rounded-xl p-4 text-sm", report.ok ? "bg-mint text-emerald" : "bg-risk text-risk-ink")}>
                <p className="flex items-center gap-2 font-sans font-semibold">{report.ok ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />} {report.ok ? "Chain verified — no discrepancies" : `${report.issues.length} issue(s) found`}</p>
                <p className="tabular mt-1 text-xs">{report.blocksChecked} blocks · {report.txsChecked} transactions · {report.anchorsChecked} anchors · {dateTime(report.checkedAt)}</p>
                {report.issues.length ? <ul className="mt-2 list-disc pl-5 text-xs">{report.issues.map((i) => <li key={i}>{i}</li>)}</ul> : null}
              </div>
            ) : null}
          </Card>
          <Card className="p-5">
            <p className="flex items-center gap-2 font-sans text-sm font-semibold"><ArrowRightLeft className="h-4 w-4 text-forest" /> Try a transfer</p>
            <p className="mt-1 text-xs text-muted">The allowlist rule is evaluated before anything is written. A rejected transfer is still recorded — with its reason code — so the supervisor sees the attempt.</p>
            <div className="mt-4 grid gap-2">
              <Button variant="secondary" onClick={demoRejected}><XCircle className="h-4 w-4" /> 100 units → unverified external wallet</Button>
              <Button variant="secondary" onClick={demoAllowed}><CheckCircle2 className="h-4 w-4" /> 50 units → verified investor wallet</Button>
            </div>
            {lastDemoTx ? (() => {
              const t = chain.txs.find((x) => x.id === lastDemoTx);
              if (!t) return null;
              return (
                <div className={cn("mt-4 rounded-xl p-4 text-sm", t.status === "rejected" ? "bg-risk text-risk-ink" : "bg-mint text-emerald")}>
                  <p className="flex items-center gap-2 font-sans font-semibold"><TxTypeBadge type={t.type} status={t.status} /> {t.id}</p>
                  <p className="mt-1">{t.memo}</p>
                  {t.reasonCode ? <p className="mt-1 font-mono text-xs">Reason code: {t.reasonCode}</p> : null}
                </div>
              );
            })() : null}
            <p className="mt-4 text-xs text-muted">Transfers between verified wallets illustrate how an ECSPR bulletin-board match could settle (Stage 2). Open transferability is a Stage 4 question that depends on the reformed EU DLT Pilot Regime.</p>
          </Card>
        </div>
      ) : null}

      <IllustrativeNotice>Raya Chain is simulated in this demonstration. No network, wallet or token contract exists. Euro amounts shown come from the finance engine; no money has moved.</IllustrativeNotice>
    </div>
  );
}
