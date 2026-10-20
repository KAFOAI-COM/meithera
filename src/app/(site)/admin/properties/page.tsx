"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { CheckCircle2, Plus, Save } from "lucide-react";
import { useDemo } from "@/lib/store";
import { applyEdit, buildProperty, COUNTY_CENTROIDS, propertyCreateSchema, propertyEditSchema, toEdit, type PropertyEdit } from "@/lib/property-schema";
import { netOperatingYield, offerSize, totalCost } from "@/lib/finance";
import { offerLabel } from "@/lib/stages";
import { cn, eur, pct } from "@/lib/utils";
import { Button, Card, Input, Label, Progress, Select } from "@/components/ui";

type Errors = Record<string, string>;
const issuesToErrors = (issues: { path: PropertyKey[]; message: string }[]) => Object.fromEntries(issues.map((i) => [String(i.path[0] ?? "form"), i.message]));

function Field({ id, label, value, onChange, error, type = "text", suffix }: { id: string; label: string; value: string; onChange: (v: string) => void; error?: string; type?: string; suffix?: string }) {
  return (
    <div className="space-y-1">
      <Label htmlFor={id} className="text-xs">{label}{suffix ? <span className="font-normal text-muted"> · {suffix}</span> : null}</Label>
      <Input id={id} type={type} inputMode={type === "number" ? "numeric" : undefined} value={value} onChange={(e) => onChange(e.target.value)} aria-invalid={!!error} aria-describedby={error ? `${id}-err` : undefined} className={cn("h-10", error && "border-risk-ink")} />
      {error ? <p id={`${id}-err`} className="text-xs text-risk-ink">{error}</p> : null}
    </div>
  );
}

function Editor({ id }: { id: string }) {
  const p = useDemo((s) => s.properties.find((x) => x.id === id))!;
  const update = useDemo((s) => s.updateProperty);
  const commitTxs = useDemo((s) => s.commitTxs);
  const log = useDemo((s) => s.log);
  const [form, setForm] = useState(() => toEdit(p));
  const [errors, setErrors] = useState<Errors>({});
  const [saved, setSaved] = useState(false);
  const set = (k: keyof PropertyEdit) => (v: string) => { setForm({ ...form, [k]: v }); setSaved(false); };

  const save = () => {
    const r = propertyEditSchema.safeParse(form);
    if (!r.success) return setErrors(issuesToErrors(r.error.issues));
    setErrors({});
    update(p.id, applyEdit(r.data));
    log("ADMIN_CHANGE", "admin", `Property ${p.location} updated (budgets, rent, status, funding ${r.data.fundedPct}%)`);
    setSaved(true);
  };

  const toggleMilestone = (label: string) => {
    const m = p.milestones.find((x) => x.label === label)!;
    const done = !m.done;
    update(p.id, { milestones: p.milestones.map((x) => (x.label === label ? { ...x, done } : x)) });
    if (done) {
      const [tx] = commitTxs([{ type: "ATTEST", spvId: p.spvId, reason: "MILESTONE", memo: `${p.location} · passport · ${label.toLowerCase()} completed (illustrative)` }]);
      log("ADMIN_CHANGE", "admin", `${p.location} milestone '${label}' marked complete — attested in Raya Chain ${tx.txId.slice(0, 12)}…`);
    } else {
      log("ADMIN_CHANGE", "admin", `${p.location} milestone '${label}' re-opened (the earlier attestation stays on the chain)`);
    }
  };

  const nums: [keyof PropertyEdit, string][] = [["acquisition", "Acquisition €"], ["refurbishment", "Refurbishment €"], ["legal", "Legal €"], ["contingency", "Contingency €"], ["valuation", "Valuation €"], ["annualRent", "Annual rent €"], ["maintenance", "Maintenance €"], ["management", "Management €"], ["insurance", "Insurance €"], ["other", "Other €"]];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="f-title" label="Title" value={form.title} onChange={set("title")} error={errors.title} />
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label htmlFor="f-status" className="text-xs">Status</Label>
            <Select id="f-status" value={form.status} onChange={(e) => set("status")(e.target.value)} className="h-10">
              <option value="open">Open (simulated)</option>
              <option value="coming-soon">Coming soon</option>
              <option value="funded">Fully subscribed</option>
            </Select>
          </div>
          <Field id="f-funded" label="Funded" suffix="%" type="number" value={form.fundedPct} onChange={set("fundedPct")} error={errors.fundedPct} />
        </div>
      </div>
      <div className="space-y-1">
        <Label htmlFor="f-desc" className="text-xs">Description</Label>
        <textarea id="f-desc" rows={3} value={form.description} onChange={(e) => set("description")(e.target.value)} className={cn("w-full rounded-lg border border-line-strong bg-card p-3 text-sm", errors.description && "border-risk-ink")} />
        {errors.description ? <p className="text-xs text-risk-ink">{errors.description}</p> : null}
      </div>
      <fieldset>
        <legend className="font-sans text-sm font-semibold text-ink">Budget & income</legend>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-5">
          {nums.map(([k, l]) => <Field key={k} id={`f-${k}`} label={l} type="number" value={form[k]} onChange={set(k)} error={errors[k]} />)}
        </div>
      </fieldset>
      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={save}><Save className="h-4 w-4" /> Save changes</Button>
        {saved ? <span className="flex items-center gap-1.5 text-sm font-medium text-forest"><CheckCircle2 className="h-4 w-4" /> Saved to the demo store and logged</span> : null}
        {Object.keys(errors).length ? <span className="text-sm text-risk-ink">Fix {Object.keys(errors).length} field{Object.keys(errors).length === 1 ? "" : "s"}</span> : null}
      </div>
      <fieldset>
        <legend className="font-sans text-sm font-semibold text-ink">Milestones</legend>
        <p className="text-xs text-muted">Completing a milestone attests it on Raya Chain and adds it to the home’s passport.</p>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {p.milestones.map((m) => (
            <li key={m.label}>
              <label className={cn("flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border px-4 text-sm", m.done ? "border-forest/30 bg-mint/40" : "border-line bg-card")}>
                <input type="checkbox" checked={m.done} onChange={() => toggleMilestone(m.label)} className="h-5 w-5 accent-[#063f36]" />
                <span className="flex-1 text-ink">{m.label}</span>
                <span className="tabular text-xs text-muted">{m.date}</span>
              </label>
            </li>
          ))}
        </ul>
      </fieldset>
    </div>
  );
}

function Creator({ onCreated }: { onCreated: (id: string) => void }) {
  const properties = useDemo((s) => s.properties);
  const add = useDemo((s) => s.addProperty);
  const log = useDemo((s) => s.log);
  const commitTxs = useDemo((s) => s.commitTxs);
  const [form, setForm] = useState({ location: "", county: "Waterford", offerType: "loan", type: "Vacant terraced house", bedrooms: "3", acquisition: "150000", refurbishment: "50000", annualRent: "18000", valuation: "240000" });
  const [errors, setErrors] = useState<Errors>({});
  const set = (k: keyof typeof form) => (v: string) => setForm({ ...form, [k]: v });
  const create = () => {
    const r = propertyCreateSchema.safeParse(form);
    if (!r.success) return setErrors(issuesToErrors(r.error.issues));
    const template = properties.find((p) => p.offerType === r.data.offerType) ?? properties[0];
    const p = buildProperty(r.data, template, properties.length + 1);
    add(p);
    commitTxs([{ type: "ATTEST", spvId: p.spvId, reason: "VACANCY", memo: `${p.location} · passport · added to the pipeline as a vacant home (illustrative)` }]);
    log("ADMIN_CHANGE", "admin", `Illustrative property ${p.title} created (${offerLabel(p)})`);
    onCreated(p.id);
  };
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <Field id="c-loc" label="Area (not an address)" value={form.location} onChange={set("location")} error={errors.location} />
        <div className="space-y-1"><Label htmlFor="c-county" className="text-xs">County</Label><Select id="c-county" className="h-10" value={form.county} onChange={(e) => set("county")(e.target.value)}>{Object.keys(COUNTY_CENTROIDS).map((c) => <option key={c}>{c}</option>)}</Select></div>
        <div className="space-y-1"><Label htmlFor="c-offer" className="text-xs">Offer</Label><Select id="c-offer" className="h-10" value={form.offerType} onChange={(e) => set("offerType")(e.target.value)}><option value="loan">Stage 1 · Secured loan</option><option value="rent-share">Stage 2 · Rent share</option></Select></div>
        <Field id="c-type" label="Property type" value={form.type} onChange={set("type")} error={errors.type} />
        <Field id="c-beds" label="Bedrooms" type="number" value={form.bedrooms} onChange={set("bedrooms")} error={errors.bedrooms} />
        <Field id="c-acq" label="Acquisition €" type="number" value={form.acquisition} onChange={set("acquisition")} error={errors.acquisition} />
        <Field id="c-ref" label="Refurbishment €" type="number" value={form.refurbishment} onChange={set("refurbishment")} error={errors.refurbishment} />
        <Field id="c-rent" label="Annual rent €" type="number" value={form.annualRent} onChange={set("annualRent")} error={errors.annualRent} />
        <Field id="c-val" label="Valuation €" type="number" value={form.valuation} onChange={set("valuation")} error={errors.valuation} />
      </div>
      <p className="text-xs text-muted">Legal (4%), contingency (30% of works), operating costs (25% of rent) and milestones are defaulted; the geo point is the county’s area centroid.</p>
      <Button onClick={create}><Plus className="h-4 w-4" /> Create illustrative property</Button>
    </div>
  );
}

export default function AdminProperties() {
  const properties = useDemo((s) => s.properties);
  const [sel, setSel] = useState<string>(properties[0].id);
  const [creating, setCreating] = useState(false);
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-serif text-3xl text-ink">Properties</h2>
          <p className="mt-1 text-sm text-muted">Budgets, milestones and funding status. Changes apply to this demo session only.</p>
        </div>
        <Button variant={creating ? "secondary" : "primary"} onClick={() => setCreating(!creating)}><Plus className="h-4 w-4" /> {creating ? "Cancel" : "New property"}</Button>
      </div>
      {creating ? <Card className="p-6"><h3 className="mb-4 font-sans text-base font-semibold text-ink">New illustrative property</h3><Creator onCreated={(id) => { setSel(id); setCreating(false); }} /></Card> : null}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {properties.map((p) => (
          <button key={p.id} type="button" onClick={() => setSel(p.id)} aria-pressed={sel === p.id} className={cn("overflow-hidden rounded-2xl border bg-card text-left transition-shadow", sel === p.id ? "border-emerald shadow-raised ring-2 ring-emerald/20" : "border-line hover:shadow-card")}>
            <div className="relative h-24"><Image src={p.images[0]} alt="" fill sizes="25vw" className="object-cover" /></div>
            <div className="p-4">
              <p className="font-sans text-[11px] font-semibold text-gold-ink">{offerLabel(p)}</p>
              <p className="font-sans text-sm font-semibold text-ink">{p.location}</p>
              <p className="tabular mt-1 text-xs text-muted">{eur(totalCost(p))} · NOI {pct(netOperatingYield(p))}</p>
              <Progress value={p.fundedPct} className="mt-2" label={`Funding ${Math.round(p.fundedPct * 100)}%`} />
              <p className="tabular mt-1 text-[11px] text-muted">{eur(p.fundedPct * offerSize(p))} of {eur(offerSize(p))}</p>
            </div>
          </button>
        ))}
      </div>
      <Card className="p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-sans text-base font-semibold text-ink">Edit {properties.find((p) => p.id === sel)?.location}</h3>
          <Link href={`/properties/${properties.find((p) => p.id === sel)?.slug}`} className="font-sans text-sm font-semibold text-forest hover:underline">View public page</Link>
        </div>
        <Editor key={sel} id={sel} />
      </Card>
    </div>
  );
}
