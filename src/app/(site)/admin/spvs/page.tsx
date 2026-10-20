"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useDemo } from "@/lib/store";
import { seedSpvs } from "@/lib/data/seed";
import { capTable } from "@/lib/chain/raya";
import { offerSize } from "@/lib/finance";
import { offerLabel } from "@/lib/stages";
import { eur } from "@/lib/utils";
import { Card } from "@/components/ui";

export default function AdminSpvs() {
  const properties = useDemo((s) => s.properties);
  const txs = useDemo((s) => s.chain.txs);
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-3xl text-ink">Property companies</h2>
        <p className="mt-1 text-sm text-muted">One proposed company (SPV) per home. Legal title sits here; investors hold its notes or lend to it. None is incorporated.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {properties.map((p) => {
          const spv = seedSpvs.find((s) => s.id === p.spvId);
          const table = capTable(txs, p.spvId);
          const units = table.reduce((s, h) => s + h.units, 0);
          return (
            <Card key={p.id} className="p-6">
              <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.1em] text-gold-ink">{offerLabel(p)}</p>
              <h3 className="mt-1 font-serif text-xl text-ink">{spv?.name ?? `Meithera ${p.location} Property DAC (proposed)`}</h3>
              <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div><dt className="text-[11px] uppercase tracking-wide text-muted">Raised (simulated)</dt><dd className="tabular font-sans font-semibold">{eur(p.fundedPct * offerSize(p))}</dd></div>
                <div><dt className="text-[11px] uppercase tracking-wide text-muted">Holders on Raya Chain</dt><dd className="tabular font-sans font-semibold">{table.length} · {units.toLocaleString("en-IE")} units</dd></div>
                <div className="col-span-2"><dt className="text-[11px] uppercase tracking-wide text-muted">Instrument</dt><dd className="text-xs text-ink">{spv?.instrument ?? (p.offerType === "loan" ? "Proposed: secured loan participation" : "Proposed: profit-participating note")}</dd></div>
                <div className="col-span-2"><dt className="text-[11px] uppercase tracking-wide text-muted">Status</dt><dd className="text-xs text-ink">{spv?.status ?? "Illustrative — not incorporated"} · {spv?.jurisdiction ?? "Ireland (proposed)"}</dd></div>
              </dl>
              <Link href={`/chain?spv=${p.spvId}`} className="mt-4 inline-flex min-h-10 items-center gap-1 font-sans text-sm font-semibold text-forest hover:underline">Cap table on Raya Chain <ArrowUpRight className="h-4 w-4" /></Link>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
