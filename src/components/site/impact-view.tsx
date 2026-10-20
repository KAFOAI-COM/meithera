"use client";

import Image from "next/image";
import { useState } from "react";
import { useDemo } from "@/lib/store";
import { totalCost } from "@/lib/finance";
import { eur } from "@/lib/utils";
import { BerChip } from "@/components/property/passport";

const BANDS = ["A", "B", "C", "D", "E", "F", "G"];
const bandIndex = (b: string) => BANDS.indexOf(b.replace(/^Target\s*/i, "").charAt(0));

/** Projected impact computed from the demo store. These are projections, not achieved results. */
export function ImpactView() {
  const properties = useDemo((s) => s.properties);
  const [scale, setScale] = useState(100);
  const deployed = properties.reduce((s, p) => s + totalCost(p), 0);
  const bedrooms = properties.reduce((s, p) => s + p.bedrooms, 0);
  const refurb = properties.reduce((s, p) => s + p.refurbishment, 0);
  const uplift = properties.reduce((s, p) => s + (bandIndex(p.berBefore) - bandIndex(p.ber)), 0);
  const avgCost = deployed / Math.max(1, properties.length);
  const avgBeds = bedrooms / Math.max(1, properties.length);

  const stats: [string, string][] = [
    [String(properties.length), "Vacant homes returned to use"],
    [String(bedrooms), "Bedrooms back on the rental market"],
    [eur(deployed), "Capital deployed into the homes"],
    [`${uplift} bands`, "Combined energy-rating uplift"],
  ];

  return (
    <>
      <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-line ring-1 ring-line lg:grid-cols-4">
        {stats.map(([v, k]) => (
          <div key={k} className="bg-card p-6">
            <dd className="tabular font-serif text-4xl leading-none text-emerald">{v}</dd>
            <dt className="mt-2 font-sans text-[11px] font-semibold uppercase tracking-[0.1em] text-muted">{k}</dt>
            <p className="mt-3 inline-block rounded-full bg-demo px-2 py-0.5 font-sans text-[10px] font-semibold text-demo-ink">Projected — not achieved</p>
          </div>
        ))}
      </dl>
      <p className="mt-3 text-xs text-muted">Computed live from the four illustrative demo properties, {eur(refurb)} of which is refurbishment spend. If the projects proceed as modelled.</p>

      <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {properties.map((p) => (
          <article key={p.id} className="overflow-hidden rounded-2xl border border-line bg-card">
            <div className="relative aspect-[16/10]">
              <Image src={p.images[0]} alt="" fill sizes="(min-width: 1280px) 25vw, 50vw" className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-emerald/80 to-transparent" />
              <p className="absolute bottom-3 left-4 font-serif text-xl text-white">{p.location}</p>
            </div>
            <div className="space-y-4 p-5">
              <p className="text-xs text-muted">Vacant since {p.vacantSince} · {p.bedrooms} bedrooms</p>
              <div className="flex items-center gap-3">
                <BerChip value={p.berBefore} label="Before" />
                <span className="text-muted" aria-hidden>→</span>
                <BerChip value={p.ber} label="Target" />
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-12 rounded-3xl bg-emerald p-7 text-white sm:p-10">
        <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-gold">At scale · illustrative arithmetic</p>
        <label htmlFor="impact-scale" className="mt-4 block font-serif text-3xl leading-tight sm:text-4xl">
          If <span className="tabular text-gold">{scale}</span> homes like these were returned to use…
        </label>
        <input id="impact-scale" type="range" min={10} max={1000} step={10} value={scale} onChange={(e) => setScale(Number(e.target.value))} className="mt-6 w-full accent-[#c7a86d]" />
        <dl className="mt-8 grid gap-6 sm:grid-cols-3">
          {[
            [eur(avgCost * scale), "capital deployed"],
            [Math.round(avgBeds * scale).toLocaleString("en-IE"), "bedrooms back in use"],
            [Math.round(scale * 2.6).toLocaleString("en-IE"), "people housed (2.6 per home, illustrative)"],
          ].map(([v, k]) => (
            <div key={k}>
              <dd className="tabular font-serif text-4xl">{v}</dd>
              <dt className="mt-1 text-sm text-white/60">{k}</dt>
            </div>
          ))}
        </dl>
        <p className="mt-8 text-xs text-white/50">Simple multiplication of the demo averages. Not a forecast, target or claim; actual costs, rents and outcomes would differ.</p>
      </div>
    </>
  );
}
