"use client";

import { useState } from "react";
import { z } from "zod";
import { Pencil, Plus, Save, X, Link2, CheckCircle2, Circle } from "lucide-react";
import { useDemo } from "@/lib/store";
import { useHydrated } from "@/components/site/hydrator";
import type { Property, PropertyStatus } from "@/lib/types";
import { netOperatingYield, raiseTarget, totalCost } from "@/lib/finance";
import { cn, eur, pct } from "@/lib/utils";
import { Badge, Button, Card, Input, Label, Select, Table, Th, Td } from "@/components/ui";
import { StageBadge } from "@/components/site/stage-badge";
import { TxLink } from "@/components/chain/tx-bits";

const schema = z.object({
  title: z.string().trim().min(3).max(80),
  location: z.string().trim().min(2).max(40),
  county: z.string().trim().min(2).max(30),
  type: z.string().trim().min(2).max(60),
  acquisition: z.number().min(0).max(5_000_000),
  refurbishment: z.number().min(0).max(2_000_000),
  legal: z.number().min(0).max(200_000),
  contingency: z.number().min(0).max(500_000),
  annualRent: z.number().min(0).max(500_000),
  maintenance: z.number().min(0).max(100_000),
  management: z.number().min(0).max(100_000),
  insurance: z.number().min(0).max(50_000),
  other: z.number().min(0).max(50_000),
  valuation: z.number().min(0).max(10_000_000),
  vacancyPct: z.number().min(0).max(50),
  status: z.enum(["open", "coming-soon", "funded"]),
  fundedPct: z.number().min(0).max(100),
  offerType: z.enum(["loan", "rent-share"]),
  loanAmount: z.number().min(0).max(5_000_000),
  loanRate: z.number().min(0).max(20),
  loanMonths: z.number().min(6).max(36),
});
type Form = z.infer<typeof schema>;

const toForm = (p: Property): Form => ({
  title: p.title, location: p.location, county: p.county, type: p.type, acquisition: p.acquisition, refurbishment: p.refurbishment, legal: p.legal, contingency: p.contingency, annualRent: p.annualRent,
  maintenance: p.opex.maintenance, management: p.opex.management, insurance: p.opex.insurance, other: p.opex.other, valuation: p.valuation, vacancyPct: Math.round(p.vacancyPct * 1000) / 10, status: p.status, fundedPct: Math.round(p.fundedPct * 100),
  offerType: p.offerType, loanAmount: p.loan?.amount ?? Math.round(p.valuation * 0.6), loanRate: p.loan?.ratePct ?? 7.5, loanMonths: p.loan?.termMonths ?? 18,
});

const blank: Form = { title: "Illustrative home", location: "Waterford City", county: "Waterford", type: "Mid-terrace house", acquisition: 150000, refurbishment: 45000, legal: 6000, contingency: 14000, annualRent: 18000, maintenance: 1800, management: 1800, insurance: 500, other: 600, valuation: 230000, vacancyPct: 5, status: "coming-soon", fundedPct: 0, offerType: "rent-share", loanAmount: 130000, loanRate: 7.5, loanMonths: 18 };

function fromForm(f: Form, base?: Property): Property {
  const id = base?.id ?? `prop-${f.location.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now().toString(36).slice(-4)}`;
  const slug = base?.slug ?? `${f.location.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${id.slice(-4)}`;
  const loanOk = f.loanAmount <= f.valuation * 0.65 ? f.loanAmount : Math.floor(f.valuation * 0.65);
  return {
    ...(base ?? { id, slug, bedrooms: 3, description: `An illustrative ${f.type.toLowerCase()} in ${f.location}, added from the admin console. Fictional.`, objectives: ["Return a vacant home to use", "Energy retrofit", "Long-term letting"], geo: { lat: 52.2593, lng: -7.1101, precision: "area-centroid" as const }, holdingYears: 7, distribution: "Monthly" as const, riskLevel: "Moderate" as const, spvId: `spv-${id.replace("prop-", "")}`, ber: "Target B2", berBefore: "E1 (assumed)", vacantSince: "2022", palette: { door: "#0d6656", brick: "#a65a43", sky: "#ddf3e8" }, milestones: [{ label: "Illustrative acquisition", date: "2027-06", done: false }, { label: "Refurbishment works", date: "2027-09", done: false }, { label: "Tenancy begins", date: "2027-12", done: false }], passport: [{ id: `pp-${id}-1`, kind: "vacancy" as const, label: "Recorded as vacant", date: "2022-05", detail: "Illustrative vacancy record.", done: false }, { id: `pp-${id}-2`, kind: "acquisition" as const, label: "Acquisition", date: "2027-06", detail: "Illustrative purchase.", done: false }, { id: `pp-${id}-3`, kind: "tenancy" as const, label: "Tenancy begins", date: "2027-12", detail: "Long-term letting.", done: false }] }),
    title: f.title, location: f.location, county: f.county, type: f.type, acquisition: f.acquisition, refurbishment: f.refurbishment, legal: f.legal, contingency: f.contingency, annualRent: f.annualRent,
    annualOpex: f.maintenance + f.management + f.insurance + f.other, opex: { maintenance: f.maintenance, management: f.management, insurance: f.insurance, other: f.other }, valuation: f.valuation, vacancyPct: f.vacancyPct / 100,
    status: f.status as PropertyStatus, fundedPct: f.fundedPct / 100, offerType: f.offerType,
    loan: f.offerType === "loan" ? { amount: loanOk, ratePct: f.loanRate, termMonths: f.loanMonths, security: "First legal charge over the property", arrangementFeePct: 0.015 } : undefined,
  };
}

function Field({ k, label, form, setForm, step = 1 }: { k: keyof Form; label: string; form: Form; setForm: (f: Form) => void; step?: number }) {
  const v = form[k];
  return (
    <div className="space-y-1">
      <Label htmlFor={`f-${k}`}>{label}</Label>
      {typeof v === "number" ? <Input id={`f-${k}`} type="number" step={step} value={v} onChange={(e) => setForm({ ...form, [k]: Number(e.target.value) })} /> : <Input id={`f-${k}`} value={v} onChange={(e) => setForm({ ...form, [k]: e.target.value })} />}
    </div>
  );
}

export function AdminProperties() {
  const hydrated = useHydrated();
  const { properties, updateProperty, addProperty, attestPassport, log } = useDemo();
  const [editing, setEditing] = useState<string | "new" | null>(null);
  const [form, setForm] = useState<Form>(blank);
  const [errors, setErrors] = useState<string[]>([]);
  if (!hydrated) return <div className="h-96 animate-pulse rounded-2xl bg-mint/50" />;

  const start = (p?: Property) => { setEditing(p ? p.id : "new"); setForm(p ? toForm(p) : blank); setErrors([]); };
  const save = () => {
    const r = schema.safeParse(form);
    if (!r.success) { setErrors(r.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`)); return; }
    if (editing === "new") { const p = fromForm(r.data); addProperty(p); log("ADMIN_CHANGE", "admin", `Illustrative home created: ${p.title}`); }
    else { const base = properties.find((p) => p.id === editing)!; const p = fromForm(r.data, base); updateProperty(base.id, p); log("ADMIN_CHANGE", "admin", `Illustrative home updated: ${p.title} (budget ${eur(totalCost(p))}, ${Math.round(p.fundedPct * 100)}% funded, ${p.status})`); }
    setEditing(null);
  };

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <div className="flex items-center justify-between p-5 pb-2"><p className="font-sans text-sm font-semibold">Homes and offers</p><Button size="sm" onClick={() => start()}><Plus className="h-4 w-4" /> New illustrative home</Button></div>
        <Table>
          <thead><tr><Th>Home</Th><Th>Stage</Th><Th className="text-right">Budget</Th><Th className="text-right">Raise</Th><Th className="text-right">Funded</Th><Th>Yield / rate</Th><Th>Status</Th><Th></Th></tr></thead>
          <tbody>
            {properties.map((p) => (
              <tr key={p.id}>
                <Td><span className="font-medium">{p.title}</span><span className="block font-mono text-xs text-muted">{p.id}</span></Td>
                <Td><StageBadge stage={p.offerType === "loan" ? 1 : 2} compact /></Td>
                <Td className="tabular text-right">{eur(totalCost(p))}</Td>
                <Td className="tabular text-right">{eur(raiseTarget(p))}</Td>
                <Td className="tabular text-right">{Math.round(p.fundedPct * 100)}%</Td>
                <Td className="tabular">{p.offerType === "loan" ? `${p.loan!.ratePct}% · ${p.loan!.termMonths}m` : pct(netOperatingYield(p))}</Td>
                <Td><Badge tone={p.status === "open" ? "mint" : p.status === "funded" ? "emerald" : "neutral"}>{p.status}</Badge></Td>
                <Td><Button size="sm" variant="ghost" onClick={() => start(p)} aria-label={`Edit ${p.title}`}><Pencil className="h-4 w-4" /></Button></Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>

      {editing ? (
        <Card className="p-5">
          <div className="flex items-center justify-between"><p className="font-sans text-base font-semibold">{editing === "new" ? "New illustrative home" : "Edit home"}</p><Button size="sm" variant="ghost" onClick={() => setEditing(null)} aria-label="Close"><X className="h-4 w-4" /></Button></div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Field k="title" label="Title" form={form} setForm={setForm} />
            <Field k="location" label="Area (never an address)" form={form} setForm={setForm} />
            <Field k="county" label="County" form={form} setForm={setForm} />
            <Field k="type" label="Type" form={form} setForm={setForm} />
            <div className="space-y-1"><Label htmlFor="f-offer">Offer type</Label><Select id="f-offer" value={form.offerType} onChange={(e) => setForm({ ...form, offerType: e.target.value as Form["offerType"] })}><option value="rent-share">Rent share (Stage 2)</option><option value="loan">Secured loan (Stage 1)</option></Select></div>
            <div className="space-y-1"><Label htmlFor="f-status">Status</Label><Select id="f-status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as Form["status"] })}><option value="coming-soon">Coming soon</option><option value="open">Open (simulated)</option><option value="funded">Funded (simulated)</option></Select></div>
            <Field k="fundedPct" label="Funded %" form={form} setForm={setForm} />
            <Field k="valuation" label="Illustrative valuation (€)" form={form} setForm={setForm} step={1000} />
            <Field k="acquisition" label="Acquisition (€)" form={form} setForm={setForm} step={1000} />
            <Field k="refurbishment" label="Refurbishment (€)" form={form} setForm={setForm} step={1000} />
            <Field k="legal" label="Legal (€)" form={form} setForm={setForm} step={500} />
            <Field k="contingency" label="Contingency (€)" form={form} setForm={setForm} step={500} />
            <Field k="annualRent" label="Annual rent (€)" form={form} setForm={setForm} step={100} />
            <Field k="vacancyPct" label="Vacancy %" form={form} setForm={setForm} step={0.5} />
            <Field k="maintenance" label="Maintenance (€/yr)" form={form} setForm={setForm} step={100} />
            <Field k="management" label="Management (€/yr)" form={form} setForm={setForm} step={100} />
            <Field k="insurance" label="Insurance (€/yr)" form={form} setForm={setForm} step={50} />
            <Field k="other" label="Other (€/yr)" form={form} setForm={setForm} step={50} />
            {form.offerType === "loan" ? (<><Field k="loanAmount" label="Loan amount (€, ≤ 65% LTV)" form={form} setForm={setForm} step={1000} /><Field k="loanRate" label="Rate % p.a." form={form} setForm={setForm} step={0.25} /><Field k="loanMonths" label="Term (months)" form={form} setForm={setForm} /></>) : null}
          </div>
          {errors.length ? <ul className="mt-3 list-disc rounded-xl bg-risk p-3 pl-7 text-sm text-risk-ink">{errors.map((e) => <li key={e}>{e}</li>)}</ul> : null}
          <div className="mt-4 flex gap-2"><Button onClick={save}><Save className="h-4 w-4" /> Save (Zod-validated)</Button><Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button></div>
        </Card>
      ) : null}

      <Card className="p-5">
        <p className="font-sans text-sm font-semibold">Milestones and passport attestations</p>
        <p className="mt-1 text-xs text-muted">Marking a passport entry done writes an ATTEST transaction to Raya Chain and completes the matching milestone.</p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {properties.map((p) => (
            <div key={p.id} className="rounded-xl border border-line p-4">
              <p className="font-sans text-sm font-semibold">{p.location}</p>
              <ul className="mt-2 space-y-1.5 text-sm">
                {p.passport.map((e) => (
                  <li key={e.id} className="flex flex-wrap items-center justify-between gap-2">
                    <span className={cn("flex items-center gap-2", !e.done && "text-muted")}>{e.done ? <CheckCircle2 className="h-4 w-4 text-forest" /> : <Circle className="h-4 w-4" />} {e.label} <span className="tabular text-xs text-muted">{e.date}</span></span>
                    {e.done ? (e.txId ? <TxLink id={e.txId} /> : <span className="text-xs text-muted">done</span>) : <Button size="sm" variant="secondary" onClick={() => attestPassport(p.id, e.id)}><Link2 className="h-3.5 w-3.5" /> Attest</Button>}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
