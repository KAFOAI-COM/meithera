"use client";

import Link from "next/link";
import { useState } from "react";
import { Vote, Store, Repeat, ArrowRight, Link2 } from "lucide-react";
import { useDemo } from "@/lib/store";
import { useHydrated } from "@/components/site/hydrator";
import { pseudonym } from "@/lib/ledger";
import { eur, pct, cn, shortDate } from "@/lib/utils";
import { Badge, Button, Card, Input, Label, Select, Table, Th, Td } from "@/components/ui";
import { StageBadge } from "@/components/site/stage-badge";
import { TxLink } from "@/components/chain/tx-bits";
import { usePortfolio } from "./use-portfolio";

export function Portfolio({ userId }: { userId: string }) {
  const hydrated = useHydrated();
  const pf = usePortfolio(userId);
  const { votes, castVote, bulletin, postListing, autoInvest, saveAutoInvest, properties } = useDemo();
  const [units, setUnits] = useState(100);
  const [ask, setAsk] = useState(1);
  const [listProp, setListProp] = useState("");
  const [rule, setRule] = useState({ monthlyAmount: 100, county: "any", offer: "both", maxPerProperty: 2000 });

  if (!hydrated) return <div className="h-96 animate-pulse rounded-2xl bg-mint/50" />;
  const rentShare = pf.holdings.filter((h) => h.p.offerType === "rent-share");
  const myVote = (pid: string) => votes.find((v) => v.investorId === userId && v.propertyId === pid)?.choice;
  const tally = (pid: string) => ({ sell: votes.filter((v) => v.propertyId === pid && v.choice === "sell").length, hold: votes.filter((v) => v.propertyId === pid && v.choice === "hold").length });
  const existing = autoInvest[0];

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <div className="p-5 pb-2"><p className="font-sans text-sm font-semibold">Simulated holdings</p></div>
        <Table>
          <thead><tr><Th>Home</Th><Th>Stage</Th><Th className="text-right">Amount</Th><Th className="text-right">Participation</Th><Th>Status</Th><Th className="text-right">Income / yr*</Th><Th>Risk</Th><Th>Chain</Th></tr></thead>
          <tbody>
            {pf.holdings.map((h) => (
              <tr key={h.inv.id}>
                <Td><Link href={`/properties/${h.p.slug}`} className="font-medium text-forest hover:underline">{h.p.title}</Link><span className="block text-xs text-muted">{shortDate(h.inv.createdAt)} · {h.inv.id}</span></Td>
                <Td><StageBadge stage={h.p.offerType === "loan" ? 1 : 2} compact /></Td>
                <Td className="tabular text-right">{eur(h.inv.amount)}<span className="block text-xs text-muted">net {eur(h.inv.netInvested, 2)}</span></Td>
                <Td className="tabular text-right">{pct(h.inv.participation, 3)}</Td>
                <Td><Badge tone={h.p.status === "funded" ? "emerald" : h.p.status === "open" ? "mint" : "neutral"}>{h.p.status === "funded" ? "Funded (sim.)" : h.p.status === "open" ? "Funding (sim.)" : "Coming soon"}</Badge></Td>
                <Td className="tabular text-right">{eur(h.annualIncome, 2)}<span className="block text-xs text-muted">{eur(h.monthlyIncome, 2)}/mo</span></Td>
                <Td><Badge tone={h.p.riskLevel === "High" ? "risk" : h.p.riskLevel === "Elevated" ? "gold" : "mint"}>{h.p.riskLevel}</Badge></Td>
                <Td>{h.inv.txId ? <TxLink id={h.inv.txId} /> : "—"}</Td>
              </tr>
            ))}
            {!pf.holdings.length ? <tr><Td colSpan={8} className="text-center text-muted">No simulated holdings yet. <Link href="/invest" className="text-forest underline">Simulate one</Link>.</Td></tr> : null}
          </tbody>
        </Table>
        <p className="p-4 text-xs text-muted">*Illustrative, before investor-level taxes. Holder on Raya Chain: <code className="font-mono">{pf.me}</code>.</p>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="flex items-center gap-2 font-sans text-sm font-semibold"><Vote className="h-4 w-4 text-forest" /> Exit vote (per holding)</p>
            <StageBadge stage={2} compact />
          </div>
          <p className="mt-1 text-xs text-muted">Under the proposed Stage 2 rules, note holders vote on whether the home’s company sells. Simulated — nothing is sold.</p>
          <ul className="mt-3 space-y-3">
            {rentShare.map((h) => {
              const t = tally(h.p.id);
              const v = myVote(h.p.id);
              return (
                <li key={h.inv.id} className="rounded-xl border border-line bg-surface p-3 text-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-medium">{h.p.location}</span>
                    <span className="tabular text-xs text-muted">Sell {t.sell} · Hold {t.hold}</span>
                  </div>
                  <div className="mt-2 flex gap-2">
                    <Button size="sm" variant={v === "hold" ? "primary" : "secondary"} onClick={() => castVote(userId, h.p.id, "hold")}>Hold</Button>
                    <Button size="sm" variant={v === "sell" ? "primary" : "secondary"} onClick={() => castVote(userId, h.p.id, "sell")}>Sell</Button>
                    {v ? <span className="self-center text-xs text-muted">You voted “{v}”</span> : null}
                  </div>
                </li>
              );
            })}
            {!rentShare.length ? <li className="text-sm text-muted">Exit votes apply to rent-share holdings only.</li> : null}
          </ul>
        </Card>

        <Card className="p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="flex items-center gap-2 font-sans text-sm font-semibold"><Store className="h-4 w-4 text-forest" /> Bulletin board (ECSPR-style)</p>
            <StageBadge stage={2} compact />
          </div>
          <p className="mt-1 text-xs text-muted">Holders may advertise an interest in selling. The board does not match or settle orders and is not a market. Transfers would still need a verified recipient.</p>
          <ul className="mt-3 divide-y divide-line text-sm">
            {bulletin.map((b) => (
              <li key={b.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                <span><span className="font-medium">{properties.find((p) => p.id === b.propertyId)?.location}</span> · <code className="font-mono text-xs">{b.sellerRef}</code>{b.sellerRef === pseudonym(userId) ? <Badge tone="mint" className="ml-1">you</Badge> : null}</span>
                <span className="tabular text-xs text-muted">{b.units} units @ {eur(b.askPerUnit, 2)} · {shortDate(b.postedAt)}</span>
              </li>
            ))}
          </ul>
          {rentShare.length ? (
            <form className="mt-4 grid gap-3 sm:grid-cols-[1fr_100px_100px_auto] sm:items-end" onSubmit={(e) => { e.preventDefault(); const pid = listProp || rentShare[0].p.id; postListing(userId, pid, units, ask); }}>
              <div className="space-y-1"><Label htmlFor="bb-prop">Holding</Label><Select id="bb-prop" value={listProp || rentShare[0].p.id} onChange={(e) => setListProp(e.target.value)}>{rentShare.map((h) => <option key={h.inv.id} value={h.p.id}>{h.p.location}</option>)}</Select></div>
              <div className="space-y-1"><Label htmlFor="bb-units">Units</Label><Input id="bb-units" type="number" min={1} value={units} onChange={(e) => setUnits(Math.max(1, Number(e.target.value) || 1))} /></div>
              <div className="space-y-1"><Label htmlFor="bb-ask">€/unit</Label><Input id="bb-ask" type="number" min={0.5} step={0.01} value={ask} onChange={(e) => setAsk(Math.max(0.01, Number(e.target.value) || 1))} /></div>
              <Button type="submit" variant="secondary">Post interest</Button>
            </form>
          ) : null}
        </Card>
      </div>

      <Card className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="flex items-center gap-2 font-sans text-sm font-semibold"><Repeat className="h-4 w-4 text-forest" /> AutoInvest rules (simulated)</p>
          <StageBadge stage={2} compact />
        </div>
        <p className="mt-1 text-xs text-muted">A standing instruction a live service might offer. Here it only saves a rule; nothing is executed.</p>
        {existing ? (
          <div className="mt-3 rounded-xl bg-mint/60 p-3 text-sm text-emerald">
            Active rule: {eur(existing.monthlyAmount)} a month · {existing.counties.length ? existing.counties.join(", ") : "any county"} · {existing.offerTypes.join(" + ")} · max {eur(existing.maxPerProperty)} per home
            <Button size="sm" variant="ghost" className="ml-2" onClick={() => saveAutoInvest({ ...existing, active: !existing.active })}>{existing.active ? "Pause" : "Resume"}</Button>
          </div>
        ) : null}
        <form className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_1fr_1fr_auto] sm:items-end" onSubmit={(e) => { e.preventDefault(); saveAutoInvest({ id: "rule-1", monthlyAmount: rule.monthlyAmount, counties: rule.county === "any" ? [] : [rule.county], offerTypes: rule.offer === "both" ? ["loan", "rent-share"] : [rule.offer as "loan" | "rent-share"], maxPerProperty: rule.maxPerProperty, active: true }); }}>
          <div className="space-y-1"><Label htmlFor="ai-amt">€ per month</Label><Input id="ai-amt" type="number" min={100} max={10000} step={50} value={rule.monthlyAmount} onChange={(e) => setRule({ ...rule, monthlyAmount: Number(e.target.value) || 100 })} /></div>
          <div className="space-y-1"><Label htmlFor="ai-county">County</Label><Select id="ai-county" value={rule.county} onChange={(e) => setRule({ ...rule, county: e.target.value })}><option value="any">Any</option>{Array.from(new Set(properties.map((p) => p.county))).map((c) => <option key={c}>{c}</option>)}</Select></div>
          <div className="space-y-1"><Label htmlFor="ai-offer">Offer type</Label><Select id="ai-offer" value={rule.offer} onChange={(e) => setRule({ ...rule, offer: e.target.value })}><option value="both">Loans and rent share</option><option value="loan">Loans only (Stage 1)</option><option value="rent-share">Rent share only (Stage 2)</option></Select></div>
          <div className="space-y-1"><Label htmlFor="ai-max">Max € per home</Label><Input id="ai-max" type="number" min={100} max={10000} step={100} value={rule.maxPerProperty} onChange={(e) => setRule({ ...rule, maxPerProperty: Number(e.target.value) || 100 })} /></div>
          <Button type="submit" variant="secondary">Save rule</Button>
        </form>
      </Card>

      <p className={cn("flex items-center gap-2 text-xs text-muted")}><Link2 className="h-3.5 w-3.5" /> Every holding above is an ISSUE transaction on the simulated Raya Chain. <Link href="/chain" className="font-semibold text-forest">Open the explorer <ArrowRight className="inline h-3 w-3" /></Link></p>
    </div>
  );
}
