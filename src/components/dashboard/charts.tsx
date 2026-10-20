"use client";

import { Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AXIS_TEXT, GRID, PROJECTED, REALISED, homeColor } from "@/lib/chart-colors";
import { eur, pct } from "@/lib/utils";
import type { Holding } from "./use-portfolio";
import { netOperatingYield } from "@/lib/finance";

const tooltipStyle = { borderRadius: 12, border: "1px solid #E2E8E4", boxShadow: "0 4px 16px rgba(6,63,54,0.08)", fontSize: 12, fontFamily: "var(--font-dm-sans)" };
const compact = (v: number) => (v >= 1000 ? `${Math.round(v / 100) / 10}K` : String(Math.round(v)));

/** Part-to-whole: allocation by home (≤ 4 segments). Legend always present; direct labels via tooltip. */
export function AllocationDonut({ holdings }: { holdings: Holding[] }) {
  const byHome = new Map<string, { name: string; value: number; id: string }>();
  for (const h of holdings) byHome.set(h.p.id, { id: h.p.id, name: h.p.location, value: (byHome.get(h.p.id)?.value ?? 0) + h.inv.netInvested });
  const data = Array.from(byHome.values());
  if (!data.length) return <Empty />;
  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={62} outerRadius={92} paddingAngle={2} stroke="#fff" strokeWidth={2}>
          {data.map((d) => <Cell key={d.id} fill={homeColor(d.id)} />)}
        </Pie>
        <Tooltip contentStyle={tooltipStyle} formatter={(v) => eur(Number(v))} />
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, color: AXIS_TEXT }} />
      </PieChart>
    </ResponsiveContainer>
  );
}

/** Monthly income over the next 12 months: realised (solid) vs projected (lighter step of the same hue). */
export function IncomeChart({ calendar }: { calendar: { label: string; projected: number; realised: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={calendar} barGap={2} barCategoryGap="30%" margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke={GRID} strokeWidth={1} />
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: AXIS_TEXT }} axisLine={{ stroke: GRID }} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: AXIS_TEXT }} axisLine={false} tickLine={false} tickFormatter={(v) => `€${compact(v)}`} width={44} />
        <Tooltip contentStyle={tooltipStyle} formatter={(v) => eur(Number(v), 2)} cursor={{ fill: "rgba(6,63,54,0.04)" }} />
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, color: AXIS_TEXT }} />
        <Bar name="Projected (illustrative)" dataKey="projected" fill={PROJECTED} radius={[4, 4, 0, 0]} maxBarSize={18} />
        <Bar name="Realised (simulated)" dataKey="realised" fill={REALISED} radius={[4, 4, 0, 0]} maxBarSize={18} />
      </BarChart>
    </ResponsiveContainer>
  );
}

/** Property performance: property-level yield vs illustrative investor-level yield, per home. */
export function PerformanceChart({ holdings }: { holdings: Holding[] }) {
  const seen = new Set<string>();
  const data = holdings
    .filter((h) => (seen.has(h.p.id) ? false : (seen.add(h.p.id), true)))
    .map((h) => ({ id: h.p.id, name: h.p.location, property: h.p.offerType === "loan" ? h.p.loan!.ratePct / 100 : netOperatingYield(h.p), investor: h.annualIncome / h.inv.amount }));
  if (!data.length) return <Empty />;
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} layout="vertical" barGap={2} margin={{ top: 8, right: 24, left: 8, bottom: 0 }}>
        <CartesianGrid horizontal={false} stroke={GRID} />
        <XAxis type="number" tick={{ fontSize: 11, fill: AXIS_TEXT }} axisLine={false} tickLine={false} tickFormatter={(v) => pct(v, 0)} />
        <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: AXIS_TEXT }} axisLine={false} tickLine={false} width={84} />
        <Tooltip contentStyle={tooltipStyle} formatter={(v) => pct(Number(v))} cursor={{ fill: "rgba(6,63,54,0.04)" }} />
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, color: AXIS_TEXT }} />
        <Bar name="Property-level / loan rate" dataKey="property" fill={PROJECTED} radius={[0, 4, 4, 0]} maxBarSize={14} />
        <Bar name="Investor-level (after fees, before tax)" dataKey="investor" fill={REALISED} radius={[0, 4, 4, 0]} maxBarSize={14} />
      </BarChart>
    </ResponsiveContainer>
  );
}

/** Investment history: cumulative simulated amount entered over time. One series, no legend. */
export function HistoryChart({ holdings }: { holdings: Holding[] }) {
  const sorted = [...holdings].sort((a, b) => a.inv.createdAt.localeCompare(b.inv.createdAt));
  let cum = 0;
  const data = sorted.map((h) => ({ date: new Date(h.inv.createdAt).toLocaleDateString("en-IE", { month: "short", year: "2-digit" }), total: (cum += h.inv.amount), home: h.p.location }));
  if (!data.length) return <Empty />;
  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={data} margin={{ top: 12, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke={GRID} />
        <XAxis dataKey="date" tick={{ fontSize: 11, fill: AXIS_TEXT }} axisLine={{ stroke: GRID }} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: AXIS_TEXT }} axisLine={false} tickLine={false} tickFormatter={(v) => `€${compact(v)}`} width={44} />
        <Tooltip contentStyle={tooltipStyle} formatter={(v) => eur(Number(v))} labelFormatter={(l, p) => `${l} · ${p?.[0]?.payload?.home ?? ""}`} />
        <Line type="stepAfter" dataKey="total" name="Cumulative simulated investment" stroke={REALISED} strokeWidth={2} dot={{ r: 4, fill: REALISED, stroke: "#fff", strokeWidth: 2 }} activeDot={{ r: 6 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

function Empty() {
  return <div className="flex h-[240px] items-center justify-center text-sm text-muted">No simulated holdings yet.</div>;
}
