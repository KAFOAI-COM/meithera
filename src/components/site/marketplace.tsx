"use client";

import { useMemo, useState } from "react";
import { SlidersHorizontal, RotateCcw, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDemo } from "@/lib/store";
import { headlineRate, totalCost } from "@/lib/finance";
import { Button, Label, Select } from "@/components/ui";
import { PropertyCard } from "./property-card";
import { IrelandMap } from "./ireland-map";

type Sort = "yield-desc" | "cost-asc" | "cost-desc" | "funded-desc";

export function Marketplace() {
  const properties = useDemo((s) => s.properties);
  const [location, setLocation] = useState("all");
  const [type, setType] = useState("all");
  const [budget, setBudget] = useState("all");
  const [minYield, setMinYield] = useState("0");
  const [status, setStatus] = useState("all");
  const [offer, setOffer] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [sort, setSort] = useState<Sort>("yield-desc");

  const counties = Array.from(new Set(properties.map((p) => p.county)));
  const types = Array.from(new Set(properties.map((p) => p.type)));

  const list = useMemo(() => {
    const out = properties.filter((p) => {
      const tc = totalCost(p);
      if (location !== "all" && p.county !== location) return false;
      if (type !== "all" && p.type !== type) return false;
      if (budget === "lt250" && tc >= 250000) return false;
      if (budget === "250-300" && (tc < 250000 || tc > 300000)) return false;
      if (budget === "gt300" && tc <= 300000) return false;
      if (headlineRate(p) < Number(minYield) / 100) return false;
      if (status !== "all" && p.status !== status) return false;
      if (offer !== "all" && p.offerType !== offer) return false;
      return true;
    });
    const by: Record<Sort, (a: (typeof out)[0], b: (typeof out)[0]) => number> = {
      "yield-desc": (a, b) => headlineRate(b) - headlineRate(a),
      "cost-asc": (a, b) => totalCost(a) - totalCost(b),
      "cost-desc": (a, b) => totalCost(b) - totalCost(a),
      "funded-desc": (a, b) => b.fundedPct - a.fundedPct,
    };
    return [...out].sort(by[sort]);
  }, [properties, location, type, budget, minYield, status, offer, sort]);

  const reset = () => {
    setLocation("all"); setType("all"); setBudget("all"); setMinYield("0"); setStatus("all"); setOffer("all"); setSort("yield-desc");
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
      <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
        <div className="flex items-center justify-between">
          <button
            type="button"
            className="flex min-h-11 items-center gap-2 font-sans font-semibold lg:pointer-events-none"
            onClick={() => setShowFilters((v) => !v)}
            aria-expanded={showFilters}
            aria-controls="market-filters"
          >
            <SlidersHorizontal className="h-4 w-4" /> Filters
            <ChevronDown className={cn("h-4 w-4 transition-transform lg:hidden", showFilters && "rotate-180")} />
          </button>
          <Button variant="ghost" size="sm" onClick={reset}><RotateCcw className="h-3.5 w-3.5" /> Reset</Button>
        </div>
        <div id="market-filters" className={cn("space-y-5", !showFilters && "hidden lg:block")}>
        <div className="space-y-1.5">
          <Label htmlFor="f-offer">Offer type</Label>
          <Select id="f-offer" value={offer} onChange={(e) => setOffer(e.target.value)}>
            <option value="all">All offers</option>
            <option value="loan">Stage 1 · Secured loan</option>
            <option value="rent-share">Stage 2 · Rent share</option>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="f-loc">Location</Label>
          <Select id="f-loc" value={location} onChange={(e) => setLocation(e.target.value)}>
            <option value="all">All locations</option>
            {counties.map((c) => <option key={c} value={c}>{c}</option>)}
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="f-type">Property type</Label>
          <Select id="f-type" value={type} onChange={(e) => setType(e.target.value)}>
            <option value="all">All types</option>
            {types.map((t) => <option key={t} value={t}>{t}</option>)}
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="f-budget">Project budget</Label>
          <Select id="f-budget" value={budget} onChange={(e) => setBudget(e.target.value)}>
            <option value="all">Any budget</option>
            <option value="lt250">Under €250,000</option>
            <option value="250-300">€250,000 – €300,000</option>
            <option value="gt300">Over €300,000</option>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="f-yield">Minimum headline rate: <span className="tabular">{Number(minYield).toFixed(1)}%</span></Label>
          <input id="f-yield" type="range" min={0} max={8} step={0.1} value={minYield} onChange={(e) => setMinYield(e.target.value)} className="w-full accent-[#063f36]" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="f-status">Investment status</Label>
          <Select id="f-status" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="all">Any status</option>
            <option value="open">Open (simulated)</option>
            <option value="coming-soon">Coming soon</option>
            <option value="funded">Fully subscribed (simulated)</option>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="f-sort">Sort by</Label>
          <Select id="f-sort" value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
            <option value="yield-desc">Headline rate (high → low)</option>
            <option value="cost-asc">Project cost (low → high)</option>
            <option value="cost-desc">Project cost (high → low)</option>
            <option value="funded-desc">Simulated funding progress</option>
          </Select>
        </div>
        <div className="hidden overflow-hidden rounded-2xl border border-line bg-card p-3 lg:block">
          <p className="mb-2 font-sans text-xs font-semibold uppercase tracking-wide text-muted">Area centroids (PostGIS)</p>
          <IrelandMap points={list.map((p) => ({ id: p.id, label: p.location, lat: p.geo.lat, lng: p.geo.lng }))} />
        </div>
        </div>
      </aside>
      <div>
        <p className="mb-4 text-sm text-muted" aria-live="polite">{list.length} of {properties.length} illustrative properties</p>
        {list.length ? (
          <div className="grid gap-6 sm:grid-cols-2 2xl:grid-cols-3">
            {list.map((p) => <PropertyCard key={p.id} p={p} />)}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-line-strong bg-card p-10 text-center">
            <p className="font-sans font-semibold">No properties match these filters</p>
            <Button variant="secondary" className="mt-4" onClick={reset}>Reset filters</Button>
          </div>
        )}
      </div>
    </div>
  );
}
