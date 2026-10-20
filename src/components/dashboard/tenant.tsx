"use client";

import { useMemo, useState } from "react";
import { Home, Link2, RotateCcw, StepForward, TrendingDown } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useDemo } from "@/lib/store";
import { useHydrated } from "@/components/site/hydrator";
import { staircase } from "@/lib/finance";
import { AXIS_TEXT, GRID, PROJECTED, REALISED } from "@/lib/chart-colors";
import { eur, pct } from "@/lib/utils";
import { Button, Card, Input, Label, Stat, Table, Th, Td } from "@/components/ui";
import { StageBadge } from "@/components/site/stage-badge";
import { IllustrativeNotice } from "@/components/site/notices";
import { TxLink } from "@/components/chain/tx-bits";
import { PropertyArt } from "@/components/site/property-art";

const tooltipStyle = { borderRadius: 12, border: "1px solid #E2E8E4", fontSize: 12 };

export function TenantSimulator() {
  const hydrated = useHydrated();
  const { tenant, properties, staircaseStep, resetTenant } = useDemo();
  const p = properties.find((x) => x.id === tenant.propertyId);
  const [startPct, setStartPct] = useState(5);
  const [topUp, setTopUp] = useState(12000);
  const [years, setYears] = useState(10);
  const [growth, setGrowth] = useState(2);

  const marketRent = p ? p.annualRent / 12 : 0;
  const plan = useMemo(() => (p ? staircase({ valuation: p.valuation, marketMonthlyRent: marketRent, startPct: startPct / 100, yearlyTopUp: topUp, years, growthPct: growth / 100 }) : []), [p, marketRent, startPct, topUp, years, growth]);
  const nextYear = tenant.history.length;
  const next = plan[nextYear];
  const totalBuyout = plan[plan.length - 1]?.investorBuyout ?? 0;

  if (!hydrated || !p) return <div className="h-96 animate-pulse rounded-2xl bg-mint/50" />;

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <Card className="p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="flex items-center gap-2 font-sans text-base font-semibold"><Home className="h-5 w-5 text-forest" /> Staircasing simulator — {p.title}</p>
            <StageBadge stage={3} />
          </div>
          <p className="mt-1 text-sm text-muted">You rent this home from its company. Each year you buy more of the company; your rent falls in proportion and investors are bought out at the illustrative valuation. Requires further authorisation or a lending partner — simulated only.</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-4">
            <div className="space-y-1"><Label htmlFor="st-start">Starting share %</Label><Input id="st-start" type="number" min={5} max={10} step={1} value={startPct} onChange={(e) => setStartPct(Math.min(10, Math.max(5, Number(e.target.value) || 5)))} /></div>
            <div className="space-y-1"><Label htmlFor="st-top">Yearly top-up (€)</Label><Input id="st-top" type="number" min={1000} max={60000} step={1000} value={topUp} onChange={(e) => setTopUp(Math.max(1000, Number(e.target.value) || 1000))} /></div>
            <div className="space-y-1"><Label htmlFor="st-years">Years</Label><Input id="st-years" type="number" min={1} max={30} value={years} onChange={(e) => setYears(Math.min(30, Math.max(1, Number(e.target.value) || 1)))} /></div>
            <div className="space-y-1"><Label htmlFor="st-growth">Value growth % p.a.</Label><Input id="st-growth" type="number" min={-5} max={8} step={0.5} value={growth} onChange={(e) => setGrowth(Number(e.target.value) || 0)} /></div>
          </div>
          <div className="mt-5 grid gap-6 md:grid-cols-2">
            <div>
              <p className="font-sans text-xs font-semibold uppercase tracking-wide text-muted">Monthly rent falls as the share grows</p>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={plan} margin={{ top: 12, right: 12, left: 0, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke={GRID} />
                  <XAxis dataKey="year" tick={{ fontSize: 11, fill: AXIS_TEXT }} axisLine={{ stroke: GRID }} tickLine={false} tickFormatter={(v) => `Y${v}`} />
                  <YAxis tick={{ fontSize: 11, fill: AXIS_TEXT }} axisLine={false} tickLine={false} tickFormatter={(v) => `€${Math.round(v)}`} width={48} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v) => eur(Number(v))} labelFormatter={(l) => `Year ${l}`} />
                  <Line type="monotone" dataKey="monthlyRent" name="Monthly rent" stroke={REALISED} strokeWidth={2} dot={{ r: 4, fill: REALISED, stroke: "#fff", strokeWidth: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div>
              <p className="font-sans text-xs font-semibold uppercase tracking-wide text-muted">Tenant share vs investors’ share</p>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={plan.map((s) => ({ year: s.year, tenant: s.sharePct, investors: 1 - s.sharePct }))} stackOffset="expand" barCategoryGap="30%" margin={{ top: 12, right: 12, left: 0, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke={GRID} />
                  <XAxis dataKey="year" tick={{ fontSize: 11, fill: AXIS_TEXT }} axisLine={{ stroke: GRID }} tickLine={false} tickFormatter={(v) => `Y${v}`} />
                  <YAxis tick={{ fontSize: 11, fill: AXIS_TEXT }} axisLine={false} tickLine={false} tickFormatter={(v) => pct(v, 0)} width={40} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v) => pct(Number(v), 1)} labelFormatter={(l) => `Year ${l}`} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, color: AXIS_TEXT }} />
                  <Bar dataKey="tenant" name="Tenant" stackId="a" fill={REALISED} stroke="#fff" strokeWidth={2} maxBarSize={22} />
                  <Bar dataKey="investors" name="Investors" stackId="a" fill={PROJECTED} stroke="#fff" strokeWidth={2} radius={[4, 4, 0, 0]} maxBarSize={22} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>
        <div className="space-y-4">
          <Card className="overflow-hidden">
            <div className="aspect-[16/8]"><PropertyArt palette={p.palette} kind="terrace" variant="interior" label="Illustration of the tenant's home" /></div>
            <div className="grid grid-cols-2 gap-3 p-4">
              <Stat label="Your share now" value={pct(tenant.sharePct, 1)} sub="Simulated" className="p-3 shadow-none" />
              <Stat label="Rent now" value={eur(marketRent * (1 - tenant.sharePct))} sub={`Market ${eur(marketRent)}`} className="p-3 shadow-none" />
            </div>
          </Card>
          <Card className="p-5">
            <p className="flex items-center gap-2 font-sans text-sm font-semibold"><StepForward className="h-4 w-4 text-forest" /> Record the next step</p>
            {next ? (
              <>
                <p className="mt-1 text-sm text-muted">Year {next.year}: top up {eur(next.topUp)} → share {pct(next.sharePct, 1)}, rent {eur(next.monthlyRent)}/month. Written to Raya Chain as a TRANSFER from the company treasury to your wallet.</p>
                <Button className="mt-3 w-full" onClick={() => staircaseStep(next.year, next.sharePct, next.topUp, next.monthlyRent)} disabled={nextYear > years}><Link2 className="h-4 w-4" /> Record year {next.year} on Raya Chain</Button>
              </>
            ) : (
              <p className="mt-1 text-sm text-muted">Plan complete.</p>
            )}
            <Button variant="ghost" size="sm" className="mt-2 w-full" onClick={resetTenant}><RotateCcw className="h-4 w-4" /> Reset tenant position</Button>
          </Card>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="overflow-hidden">
          <div className="p-5 pb-2"><p className="flex items-center gap-2 font-sans text-sm font-semibold"><TrendingDown className="h-4 w-4 text-forest" /> Plan</p><p className="text-xs text-muted">Investors bought out in total: {eur(totalBuyout)} over {plan.length - 1} years (illustrative).</p></div>
          <Table>
            <thead><tr><Th>Year</Th><Th className="text-right">Top-up</Th><Th className="text-right">Share</Th><Th className="text-right">Monthly rent</Th><Th className="text-right">Investors bought out</Th></tr></thead>
            <tbody>{plan.map((s) => <tr key={s.year}><Td className="tabular">{s.year}</Td><Td className="tabular text-right">{eur(s.topUp)}</Td><Td className="tabular text-right">{pct(s.sharePct, 1)}</Td><Td className="tabular text-right">{eur(s.monthlyRent)}</Td><Td className="tabular text-right">{eur(s.investorBuyout)}</Td></tr>)}</tbody>
          </Table>
        </Card>
        <Card className="overflow-hidden">
          <div className="p-5 pb-2"><p className="font-sans text-sm font-semibold">Steps recorded on Raya Chain</p></div>
          <Table>
            <thead><tr><Th>Year</Th><Th className="text-right">Top-up</Th><Th className="text-right">Share</Th><Th className="text-right">Rent</Th><Th>Tx</Th></tr></thead>
            <tbody>
              {tenant.history.map((h) => <tr key={h.year}><Td className="tabular">{h.year}</Td><Td className="tabular text-right">{eur(h.topUp)}</Td><Td className="tabular text-right">{pct(h.sharePct, 1)}</Td><Td className="tabular text-right">{eur(h.monthlyRent)}</Td><Td>{h.txId ? <TxLink id={h.txId} /> : "—"}</Td></tr>)}
              {!tenant.history.length ? <tr><Td colSpan={5} className="text-center text-muted">No steps recorded yet.</Td></tr> : null}
            </tbody>
          </Table>
        </Card>
      </div>
      <IllustrativeNotice>Stage 3 is a proposal that requires further authorisation. The valuation, growth and affordability here are illustrative inputs, not advice. A live version would require affordability checks with human oversight.</IllustrativeNotice>
    </div>
  );
}
