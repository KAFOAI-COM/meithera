"use client";

import { useMemo, useState } from "react";
import { applyScenario, propertyToModel, runModel, SCENARIOS, type ModelInputs, type Scenario } from "@/lib/finance";
import { seedProperties } from "@/lib/data/properties";
import { eur, pct } from "@/lib/utils";
import { Card, Input, Label, Select } from "@/components/ui";
import { Tabs } from "@/components/ui/tabs";
import { StageBadge } from "@/components/site/stage-badge";

const FIELDS: { key: keyof ModelInputs; label: string; step: number; isPct?: boolean }[] = [
  { key: "acquisition", label: "Acquisition (€)", step: 1000 },
  { key: "refurbishment", label: "Refurbishment (€)", step: 1000 },
  { key: "transaction", label: "Legal & transaction (€)", step: 500 },
  { key: "contingency", label: "Contingency (€)", step: 500 },
  { key: "rent", label: "Gross annual rent (€)", step: 100 },
  { key: "vacancyPct", label: "Vacancy (%)", step: 0.5, isPct: true },
  { key: "maintenance", label: "Maintenance & other (€/yr)", step: 100 },
  { key: "insurance", label: "Insurance (€/yr)", step: 50 },
  { key: "managementPct", label: "Property management (% of rent)", step: 0.5, isPct: true },
  { key: "platformFeePct", label: "Administration fee (% p.a.)", step: 0.1, isPct: true },
  { key: "investment", label: "Investment (€)", step: 100 },
];

export function FinancialModel() {
  const rentShare = seedProperties.filter((p) => p.offerType === "rent-share");
  const [preset, setPreset] = useState(rentShare[0].id);
  const [inputs, setInputs] = useState<ModelInputs>(() => propertyToModel(rentShare[0], 1000));
  const [scenario, setScenario] = useState<Scenario>("base");
  const out = useMemo(() => runModel(applyScenario(inputs, scenario)), [inputs, scenario]);
  const all = useMemo(() => (Object.keys(SCENARIOS) as Scenario[]).map((s) => ({ s, o: runModel(applyScenario(inputs, s)) })), [inputs]);
  const set = (k: keyof ModelInputs, v: number, isPct?: boolean) => setInputs({ ...inputs, [k]: isPct ? v / 100 : v });

  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><p className="font-sans text-base font-semibold">Interactive financial model</p><p className="text-xs text-muted">Edit any input. Every output is recomputed by runModel(); scenarios adjust rent, vacancy and costs.</p></div>
        <StageBadge stage={2} compact />
      </div>
      <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <div>
          <div className="space-y-1"><Label htmlFor="fm-preset">Start from</Label><Select id="fm-preset" value={preset} onChange={(e) => { setPreset(e.target.value); const p = rentShare.find((x) => x.id === e.target.value)!; setInputs(propertyToModel(p, inputs.investment)); }}>{rentShare.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}</Select></div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {FIELDS.map((f) => (
              <div key={f.key} className="space-y-1">
                <Label htmlFor={`fm-${f.key}`}>{f.label}</Label>
                <Input id={`fm-${f.key}`} type="number" step={f.step} value={f.isPct ? Math.round(inputs[f.key] * 10000) / 100 : inputs[f.key]} onChange={(e) => set(f.key, Number(e.target.value) || 0, f.isPct)} />
              </div>
            ))}
          </div>
        </div>
        <div>
          <Tabs tabs={(Object.keys(SCENARIOS) as Scenario[]).map((s) => ({ id: s, label: SCENARIOS[s].label }))} value={scenario} onChange={setScenario} />
          <p className="mt-2 text-xs text-muted">{SCENARIOS[scenario].note}</p>
          <dl className="tabular mt-4 grid gap-y-1.5 text-sm sm:grid-cols-[1fr_auto]">
            {[
              ["Total project cost", eur(out.totalCost)],
              ["Gross yield", pct(out.grossYield)],
              ["Collected rent (after vacancy)", eur(out.collectedRent)],
              ["Operating costs incl. management", `−${eur(out.opex)}`],
              ["Net operating income", eur(out.noi)],
              ["Property-level NOI yield", pct(out.noiYield)],
              ["Participation", pct(out.participation, 3)],
              ["Investor share of NOI", eur(out.investorNoiShare, 2)],
              ["Administration fee", `−${eur(out.platformFee, 2)}`],
            ].map(([k, v]) => <div key={k} className="contents"><dt className="text-muted">{k}</dt><dd className="text-right font-medium">{v}</dd></div>)}
            <div className="contents font-sans text-base font-bold text-emerald"><dt>Investor income (before taxes)</dt><dd className="text-right">{eur(out.investorIncome, 2)} · {pct(out.investorYield)}</dd></div>
          </dl>
          <table className="tabular mt-5 w-full text-xs">
            <thead><tr className="text-left text-muted"><th className="py-1">Scenario</th><th className="text-right">NOI yield</th><th className="text-right">Investor income</th><th className="text-right">Investor yield</th></tr></thead>
            <tbody>{all.map(({ s, o }) => <tr key={s} className="border-t border-line"><td className="py-1">{SCENARIOS[s].label}</td><td className="text-right">{pct(o.noiYield)}</td><td className="text-right">{eur(o.investorIncome, 2)}</td><td className="text-right font-semibold">{pct(o.investorYield)}</td></tr>)}</tbody>
          </table>
          <p className="mt-3 text-xs text-muted">Illustrative. The downside case can produce a negative investor income: that is the point of showing it.</p>
        </div>
      </div>
    </Card>
  );
}
