"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useDemo } from "@/lib/store";
import { headlineRate } from "@/lib/finance";
import { offerLabel } from "@/lib/stages";
import { cn, eur, pct } from "@/lib/utils";
import { monthlyPer1000, statusMeta } from "@/components/site/property-card";
import { Progress } from "@/components/ui";

/** Step 1 of the journey: choose an open offer. Funded and coming-soon offers are shown but not selectable. */
export function OfferPicker() {
  const properties = useDemo((s) => s.properties);
  const sorted = [...properties].sort((a, b) => Number(b.status === "open") - Number(a.status === "open"));
  return (
    <ul className="grid gap-5 md:grid-cols-2">
      {sorted.map((p) => {
        const open = p.status === "open";
        const isLoan = p.offerType === "loan";
        const body = (
          <>
            <div className="relative h-full min-h-40 w-full overflow-hidden sm:w-48 sm:shrink-0">
              <Image src={p.images[0]} alt="" fill sizes="(min-width: 640px) 192px, 100vw" className={cn("object-cover transition-transform duration-700", open && "group-hover:scale-105", !open && "grayscale-[40%]")} />
              <span className={cn("absolute left-3 top-3 rounded-full px-2.5 py-1 font-sans text-[11px] font-semibold backdrop-blur", isLoan ? "bg-white/90 text-emerald" : "bg-emerald/80 text-white")}>{offerLabel(p)}</span>
            </div>
            <div className="flex flex-1 flex-col p-5">
              <p className="font-sans text-xs font-medium text-muted">{p.location} · Co. {p.county}</p>
              <p className="mt-0.5 font-serif text-xl leading-snug text-ink">{p.type}</p>
              <div className="mt-4 flex items-end justify-between gap-3">
                <div>
                  <p className="tabular font-serif text-3xl leading-none text-emerald">{pct(headlineRate(p))}</p>
                  <p className="mt-1 text-[11px] uppercase tracking-wide text-muted">{isLoan ? "fixed interest p.a." : "property yield*"}</p>
                </div>
                <p className="tabular text-right text-sm font-semibold text-ink">{eur(monthlyPer1000(p), 2)}<span className="block text-[11px] font-normal text-muted">per €1,000 / month, net</span></p>
              </div>
              <div className="mt-4"><Progress value={p.fundedPct} label={`Simulated funding ${Math.round(p.fundedPct * 100)}%`} /></div>
              <div className="mt-4 flex items-center justify-between font-sans text-sm font-semibold">
                <span className="text-muted">{statusMeta[p.status].label}</span>
                {open ? <span className="inline-flex items-center gap-1 text-forest">Choose <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span> : <span className="text-muted">Not available</span>}
              </div>
            </div>
          </>
        );
        return (
          <li key={p.id}>
            {open ? (
              <Link href={`/invest/${p.id}`} className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-card shadow-card transition-[box-shadow,border-color] hover:border-forest/40 hover:shadow-raised sm:flex-row">{body}</Link>
            ) : (
              <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-dashed border-line bg-card/60 sm:flex-row" aria-disabled>{body}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
