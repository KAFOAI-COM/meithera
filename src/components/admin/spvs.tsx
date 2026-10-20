"use client";

import { useDemo } from "@/lib/store";
import { useHydrated } from "@/components/site/hydrator";
import { seedSpvs } from "@/lib/data/seed";
import { capTable } from "@/lib/chain/raya";
import { raiseTarget } from "@/lib/finance";
import { eur, pct } from "@/lib/utils";
import { Card, Progress, Table, Th, Td } from "@/components/ui";
import { StageBadge } from "@/components/site/stage-badge";

export function AdminSpvs() {
  const hydrated = useHydrated();
  const { properties, investments, chain } = useDemo();
  if (!hydrated) return <div className="h-96 animate-pulse rounded-2xl bg-mint/50" />;
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {properties.map((p) => {
        const spv = seedSpvs.find((s) => s.propertyId === p.id) ?? { id: p.spvId, name: `Meithera ${p.location} ${p.offerType === "loan" ? "Refurbishment Loan" : "Property DAC"} (proposed)`, instrument: p.offerType === "loan" ? "Secured loan note (proposed)" : "Profit-participating note (proposed)", jurisdiction: "Ireland (proposed)", status: "Illustrative — not incorporated", propertyId: p.id };
        const live = investments.filter((i) => i.propertyId === p.id && i.status !== "Withdrawn (reflection period)");
        const raised = live.reduce((s, i) => s + i.netInvested, 0);
        const rows = capTable(chain, p.id);
        return (
          <Card key={p.id} className="p-5">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div><p className="font-sans text-base font-semibold">{spv.name}</p><p className="text-xs text-muted">{p.title} · {spv.jurisdiction}</p></div>
              <StageBadge stage={p.offerType === "loan" ? 1 : 2} compact />
            </div>
            <dl className="tabular mt-3 grid gap-y-1 text-sm sm:grid-cols-[180px_1fr]">
              <dt className="text-muted">Instrument</dt><dd>{spv.instrument}</dd>
              <dt className="text-muted">Status</dt><dd>{spv.status}</dd>
              <dt className="text-muted">Total project funding</dt><dd>{eur(raiseTarget(p))}</dd>
              <dt className="text-muted">Raised (simulated)</dt><dd>{eur(raised)} from {live.length} investments</dd>
            </dl>
            <Progress className="mt-3" value={p.fundedPct} label="Funding" />
            <p className="mt-4 font-sans text-xs font-semibold uppercase tracking-wide text-muted">Investor entitlements (Raya Chain cap table)</p>
            {rows.length ? (
              <Table className="mt-2">
                <thead><tr><Th>Holder</Th><Th className="text-right">Units</Th><Th className="text-right">Share</Th></tr></thead>
                <tbody>{rows.map((r) => <tr key={r.holder}><Td className="font-mono text-xs">{r.holder}{r.frozen ? " ❄" : ""}</Td><Td className="tabular text-right">{r.units.toLocaleString("en-IE")}</Td><Td className="tabular text-right">{pct(r.share, 1)}</Td></tr>)}</tbody>
              </Table>
            ) : <p className="mt-2 text-sm text-muted">No units issued.</p>}
          </Card>
        );
      })}
    </div>
  );
}
