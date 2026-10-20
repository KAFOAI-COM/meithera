"use client";

import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, ComposedChart, Line, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { MonthPoint } from "@/lib/portfolio";
import { eur } from "@/lib/utils";

/** Chart tokens: recessive grid/axes, text in ink tokens (never series colour). */
const AXIS = { fontSize: 11, fill: "#65736D", fontFamily: "var(--font-dm-sans)" };
const GRID = "#E2E8E4";
export const REALISED = "#00826A";
export const PROJECTED = "#B8892E";

function TipBox({ title, rows }: { title: string; rows: { label: string; value: string; color?: string; dashed?: boolean }[] }) {
  return (
    <div className="min-w-44 rounded-xl border border-line bg-card px-3.5 py-3 text-xs shadow-raised">
      <p className="font-sans font-semibold text-ink">{title}</p>
      <ul className="mt-2 space-y-1.5">
        {rows.map((r) => (
          <li key={r.label} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-2 text-muted">
              {r.color ? <span className="inline-block h-2 w-3 rounded-sm" style={r.dashed ? { borderTop: `2px dashed ${r.color}` } : { background: r.color }} /> : null}
              {r.label}
            </span>
            <span className="tabular font-sans font-semibold text-ink">{r.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Legend({ items }: { items: { label: string; color: string; dashed?: boolean }[] }) {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted">
      {items.map((i) => (
        <li key={i.label} className="flex items-center gap-2">
          <span className="inline-block h-2.5 w-4 rounded-sm" style={i.dashed ? { borderTop: `2px dashed ${i.color}`, height: 0 } : { background: i.color }} aria-hidden />
          {i.label}
        </li>
      ))}
    </ul>
  );
}

/** Monthly income: realised payouts (bars, from Raya Chain) vs projected (dashed line). One axis, one unit. */
export function IncomeChart({ data, height = 260 }: { data: MonthPoint[]; height?: number }) {
  return (
    <div style={{ height }} role="img" aria-label="Monthly income: realised versus projected">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }} barCategoryGap="28%">
          <CartesianGrid vertical={false} stroke={GRID} />
          <XAxis dataKey="label" tick={AXIS} tickLine={false} axisLine={{ stroke: GRID }} />
          <YAxis tick={AXIS} tickLine={false} axisLine={false} width={48} tickFormatter={(v: number) => eur(v)} />
          <Tooltip
            cursor={{ fill: "rgba(13,102,86,0.06)" }}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const d = payload[0].payload as MonthPoint;
              return <TipBox title={d.month} rows={[{ label: "Realised", value: eur(d.realised, 2), color: REALISED }, { label: "Projected", value: eur(d.projected, 2), color: PROJECTED, dashed: true }]} />;
            }}
          />
          <Bar dataKey="realised" fill={REALISED} radius={[4, 4, 0, 0]} maxBarSize={28} isAnimationActive={false} />
          <Line dataKey="projected" type="stepAfter" stroke={PROJECTED} strokeWidth={2} strokeDasharray="5 4" isAnimationActive={false} dot={false} activeDot={{ r: 4, stroke: "#fff", strokeWidth: 2 }} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Allocation by home. Fixed colour per property; 2px surface gap between segments. */
export function AllocationDonut({ data, total }: { data: { id: string; name: string; value: number; color: string }[]; total: number }) {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[220px]" role="img" aria-label="Allocation by home">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius="68%" outerRadius="100%" paddingAngle={data.length > 1 ? 2 : 0} stroke="#fff" strokeWidth={2} startAngle={90} endAngle={-270} isAnimationActive={false}>
            {data.map((d) => <Cell key={d.id} fill={d.color} />)}
          </Pie>
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const d = payload[0].payload as (typeof data)[0];
              return <TipBox title={d.name} rows={[{ label: "Committed", value: eur(d.value), color: d.color }, { label: "Share", value: `${Math.round((d.value / total) * 100)}%` }]} />;
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <p className="tabular font-serif text-2xl text-ink">{eur(total)}</p>
        <p className="text-[11px] text-muted">committed</p>
      </div>
    </div>
  );
}

/** Illustrative net yield on amount entered, per holding — horizontal bars, one series. */
export function PerformanceBars({ data }: { data: { id: string; name: string; value: number; color: string }[] }) {
  return (
    <div style={{ height: Math.max(120, data.length * 48) }} role="img" aria-label="Illustrative net yield by home">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 48, bottom: 0, left: 0 }} barCategoryGap="30%">
          <CartesianGrid horizontal={false} stroke={GRID} />
          <XAxis type="number" tick={AXIS} tickLine={false} axisLine={false} tickFormatter={(v: number) => `${(v * 100).toFixed(0)}%`} domain={[0, "dataMax"]} />
          <YAxis type="category" dataKey="name" tick={AXIS} tickLine={false} axisLine={false} width={96} />
          <Tooltip
            cursor={{ fill: "rgba(13,102,86,0.06)" }}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const d = payload[0].payload as (typeof data)[0];
              return <TipBox title={d.name} rows={[{ label: "Net yield (illustrative)", value: `${(d.value * 100).toFixed(2)}%`, color: d.color }]} />;
            }}
          />
          <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={20} label={{ position: "right", fontSize: 11, fill: "#172521", formatter: (v: unknown) => `${(Number(v) * 100).toFixed(2)}%` }}>
            {data.map((d) => <Cell key={d.id} fill={d.color} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Cumulative amount committed over time (step), single series. */
export function HistoryChart({ data }: { data: { label: string; total: number; at: string }[] }) {
  return (
    <div style={{ height: 200 }} role="img" aria-label="Investment history: cumulative amount committed">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="hist" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={REALISED} stopOpacity={0.22} />
              <stop offset="100%" stopColor={REALISED} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke={GRID} />
          <XAxis dataKey="label" tick={AXIS} tickLine={false} axisLine={{ stroke: GRID }} />
          <YAxis tick={AXIS} tickLine={false} axisLine={false} width={56} tickFormatter={(v: number) => eur(v)} />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const d = payload[0].payload as (typeof data)[0];
              return <TipBox title={d.label} rows={[{ label: "Total committed", value: eur(d.total), color: REALISED }]} />;
            }}
          />
          <Area type="stepAfter" dataKey="total" stroke={REALISED} strokeWidth={2} fill="url(#hist)" isAnimationActive={false} dot={{ r: 4, fill: REALISED, stroke: "#fff", strokeWidth: 2 }} activeDot={{ r: 5, stroke: "#fff", strokeWidth: 2 }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
