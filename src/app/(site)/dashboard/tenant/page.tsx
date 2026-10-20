"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ArrowUpRight, CheckCircle2, KeyRound } from "lucide-react";
import { useInvestor } from "@/components/dashboard/investor-context";
import { useDemo } from "@/lib/store";
import { staircase, totalCost } from "@/lib/finance";
import { cn, eur, shortHash } from "@/lib/utils";
import { Button, Card, Label, Table, Td, Th } from "@/components/ui";
import { StageBadge } from "@/components/site/stage-badge";
import { RISK_WARNING } from "@/components/site/notices";

const HOME_ID = "prop-d8";
const YEARS = 10;
const TENANT = "#00826A";
const RENT = "#B8892E";
const AXIS = { fontSize: 11, fill: "#65736D" };

function Tip({ active, payload, label, fmt, name }: { active?: boolean; payload?: { value: number }[]; label?: string | number; fmt: (v: number) => string; name: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-line bg-card px-3 py-2 text-xs shadow-raised">
      <p className="font-sans font-semibold text-ink">Year {label}</p>
      <p className="mt-1 text-muted">{name}: <span className="tabular font-semibold text-ink">{fmt(payload[0].value)}</span></p>
    </div>
  );
}

export default function TenantPage() {
  const d = useInvestor();
  const p = useDemo((s) => s.properties.find((x) => x.id === HOME_ID))!;
  const steps = useDemo((s) => s.staircase);
  const record = useDemo((s) => s.recordStaircaseStep);
  const [start, setStart] = useState(0.1);
  const [topUp, setTopUp] = useState(0.05);
  const rows = staircase(p, start, topUp, YEARS);
  const total = totalCost(p);
  const recorded = new Map(steps.map((s) => [s.year, s]));
  const nextYear = rows.find((r) => !recorded.has(r.year))?.year;
  const payment = (y: number) => (y === 0 ? rows[0].tenantEquity : rows[y].tenantEquity - rows[y - 1].tenantEquity);
  const last = rows[rows.length - 1];
  const chart = rows.map((r) => ({ year: r.year, tenant: r.tenantPct, rent: r.annualRent / 12 }));

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <Card className="overflow-hidden">
          <div className="relative aspect-[16/7]">
            <Image src={p.images[1] ?? p.images[0]} alt="" fill sizes="(min-width: 1024px) 60vw, 100vw" className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-emerald/90 via-emerald/30 to-transparent" />
            <div className="absolute inset-x-6 bottom-5 text-white">
              <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-gold">Your home · illustrative</p>
              <p className="font-serif text-3xl">{p.title}</p>
            </div>
          </div>
          <div className="p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="flex items-center gap-2 font-sans text-base font-semibold text-ink"><KeyRound className="h-4 w-4 text-gold-ink" /> Tenant to owner — staircasing</h2>
              <StageBadge stage={3} detail />
            </div>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              As the tenant you buy shares in the company that owns your home, step by step. Your rent falls as your share grows, and the investors who funded the home are bought out. Never presented as live: Stage 3 needs further permissions or a lending partner, and affordability checks with human oversight.
            </p>
            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              <div>
                <Label htmlFor="st-start">Starting share: <span className="tabular">{Math.round(start * 100)}%</span> <span className="font-normal text-muted">({eur(total * start)})</span></Label>
                <input id="st-start" type="range" min={0.05} max={0.1} step={0.01} value={start} onChange={(e) => setStart(Number(e.target.value))} className="mt-3 w-full accent-[#063f36]" />
              </div>
              <div>
                <Label htmlFor="st-top">Yearly top-up: <span className="tabular">{Math.round(topUp * 100)}%</span> <span className="font-normal text-muted">({eur(total * topUp)} / yr)</span></Label>
                <input id="st-top" type="range" min={0.01} max={0.1} step={0.01} value={topUp} onChange={(e) => setTopUp(Number(e.target.value))} className="mt-3 w-full accent-[#063f36]" disabled={steps.length > 0} />
              </div>
            </div>
            {steps.length ? <p className="mt-2 text-xs text-muted">Top-up is fixed once a step is recorded. Reset the demo in Settings to start again.</p> : null}
          </div>
        </Card>
        <div className="grid gap-4">
          {[
            ["Your share after 10 years", `${Math.round(last.tenantPct * 100)}%`, `${eur(last.tenantEquity)} of equity`],
            ["Monthly rent today", eur(p.annualRent / 12), "on the investors’ share"],
            ["Monthly rent in year 10", eur(last.annualRent / 12), `${Math.round((1 - last.annualRent / p.annualRent) * 100)}% lower`],
          ].map(([k, v, s], i) => (
            <div key={k} className={cn("rounded-2xl border p-5", i === 0 ? "border-emerald bg-emerald text-white" : "border-line bg-card")}>
              <p className={cn("font-sans text-[11px] font-semibold uppercase tracking-[0.1em]", i === 0 ? "text-gold" : "text-muted")}>{k}</p>
              <p className="tabular mt-2 font-serif text-4xl leading-none">{v}</p>
              <p className={cn("mt-2 text-xs", i === 0 ? "text-white/60" : "text-muted")}>{s}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6">
          <h3 className="font-sans text-base font-semibold text-ink">Your share of the home’s company</h3>
          <p className="text-xs text-muted">Percentage owned by the tenant, by year</p>
          <div className="mt-5 h-56" role="img" aria-label="Tenant share rising over ten years">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chart} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                <defs><linearGradient id="ten" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={TENANT} stopOpacity={0.25} /><stop offset="100%" stopColor={TENANT} stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid vertical={false} stroke="#E2E8E4" />
                <XAxis dataKey="year" tick={AXIS} tickLine={false} axisLine={{ stroke: "#E2E8E4" }} />
                <YAxis tick={AXIS} tickLine={false} axisLine={false} width={40} domain={[0, 1]} tickFormatter={(v: number) => `${Math.round(v * 100)}%`} />
                <Tooltip content={<Tip fmt={(v) => `${Math.round(v * 100)}%`} name="Tenant share" />} />
                <Area type="stepAfter" dataKey="tenant" stroke={TENANT} strokeWidth={2} fill="url(#ten)" isAnimationActive={false} dot={false} activeDot={{ r: 4, stroke: "#fff", strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card className="p-6">
          <h3 className="font-sans text-base font-semibold text-ink">Your monthly rent</h3>
          <p className="text-xs text-muted">Rent on the investors’ remaining share, by year</p>
          <div className="mt-5 h-56" role="img" aria-label="Monthly rent falling over ten years">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chart} margin={{ top: 8, right: 8, bottom: 0, left: 0 }} barCategoryGap="25%">
                <CartesianGrid vertical={false} stroke="#E2E8E4" />
                <XAxis dataKey="year" tick={AXIS} tickLine={false} axisLine={{ stroke: "#E2E8E4" }} />
                <YAxis tick={AXIS} tickLine={false} axisLine={false} width={52} tickFormatter={(v: number) => eur(v)} />
                <Tooltip cursor={{ fill: "rgba(13,102,86,0.06)" }} content={<Tip fmt={(v) => eur(v)} name="Monthly rent" />} />
                <Bar dataKey="rent" fill={RENT} radius={[4, 4, 0, 0]} maxBarSize={26} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card className="p-2 sm:p-4">
        <div className="flex flex-wrap items-center justify-between gap-3 p-3">
          <div>
            <h3 className="font-sans text-base font-semibold text-ink">Steps and investor buy-out</h3>
            <p className="text-xs text-muted">Each step transfers units from the investor pool to you on Raya Chain (simulated). Priced here at cost; a live scheme would use an independent valuation.</p>
          </div>
          {nextYear != null ? (
            <Button onClick={() => record(d.investorId, HOME_ID, nextYear, rows[nextYear].tenantPct, payment(nextYear))}>Record year {nextYear} on Raya Chain</Button>
          ) : (
            <span className="flex items-center gap-2 font-sans text-sm font-semibold text-forest"><CheckCircle2 className="h-4 w-4" /> All steps recorded</span>
          )}
        </div>
        <Table>
          <thead><tr><Th>Year</Th><Th className="text-right">Your share</Th><Th className="text-right">You pay</Th><Th className="text-right">Investors receive</Th><Th className="text-right">Rent / month</Th><Th>Raya Chain</Th></tr></thead>
          <tbody>
            {rows.map((r) => {
              const s = recorded.get(r.year);
              return (
                <tr key={r.year} className={cn(s && "bg-mint/30")}>
                  <Td className="tabular">{r.year}</Td>
                  <Td className="tabular text-right font-semibold">{Math.round(r.tenantPct * 100)}%</Td>
                  <Td className="tabular text-right">{eur(payment(r.year))}</Td>
                  <Td className="tabular text-right">{eur(payment(r.year))}</Td>
                  <Td className="tabular text-right">{eur(r.annualRent / 12)}</Td>
                  <Td>{s ? <Link href={`/chain?tx=${s.txId}`} className="inline-flex items-center gap-1 font-mono text-xs text-forest hover:underline">{shortHash(s.txId)} <ArrowUpRight className="h-3 w-3" /></Link> : <span className="text-xs text-muted">{r.year === nextYear ? "next" : "—"}</span>}</Td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </Card>
      <p className="text-xs leading-relaxed text-muted">Illustrative. Rent falls in proportion to the investors’ remaining share; it ignores rent reviews, service charges and financing costs. {RISK_WARNING}</p>
    </div>
  );
}
