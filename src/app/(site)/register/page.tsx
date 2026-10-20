import type { Metadata } from "next";
import { StageBadge } from "@/components/site/stage-badge";
import Link from "next/link";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { demoRegister } from "@/app/actions";
import { AuthShell } from "@/components/site/auth-shell";
import { Input, Label, Select, buttonVariants } from "@/components/ui";
import { RiskNotice } from "@/components/site/notices";

export const metadata: Metadata = { title: "Register" };

const COUNTIES = [
  "Carlow", "Cavan", "Clare", "Cork", "Donegal", "Dublin", "Galway", "Kerry", "Kildare", "Kilkenny", "Laois", "Leitrim", "Limerick",
  "Longford", "Louth", "Mayo", "Meath", "Monaghan", "Offaly", "Roscommon", "Sligo", "Tipperary", "Waterford", "Westmeath", "Wexford", "Wicklow",
];

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return (
    <AuthShell quote="A demo profile takes ten seconds. We ask for a first name and a county — and nothing else.">
      <div className="flex flex-wrap items-center gap-3"><p className="font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-gold-ink">Try the demo</p><StageBadge stage={0} detail /></div>
      <h1 className="mt-3 font-serif text-4xl tracking-tight text-ink sm:text-5xl">Create a demo profile</h1>
      <p className="mt-3 max-w-lg text-muted">You’ll join as a fictional investor. Nothing is sent anywhere or stored on a server; your first name only labels this browser session.</p>
      {error ? (
        <p role="alert" className="mt-6 flex items-start gap-2 rounded-xl bg-risk p-4 text-sm font-medium text-risk-ink"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> Please add a first name, choose a county and confirm this is a demonstration.</p>
      ) : null}
      <form action={demoRegister} className="mt-8 max-w-lg space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="firstName">First name</Label>
          <Input id="firstName" name="firstName" required maxLength={40} autoComplete="off" placeholder="e.g. Aoife" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="county">County</Label>
          <Select id="county" name="county" required defaultValue="">
            <option value="" disabled>Choose a county</option>
            {COUNTIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </Select>
        </div>
        <label htmlFor="confirmFictional" className="flex cursor-pointer items-start gap-3 rounded-xl border border-line bg-card p-4 text-sm">
          <input id="confirmFictional" name="confirmFictional" type="checkbox" required className="mt-0.5 h-5 w-5 shrink-0 accent-[#063f36]" />
          <span className="text-ink">I confirm this is a demonstration. No real money, investment or personal data is involved.</span>
        </label>
        <button type="submit" className={buttonVariants({ size: "lg", className: "w-full" })}>Enter the demo <ArrowRight className="h-4 w-4" /></button>
        <RiskNotice />
      </form>
      <p className="mt-8 text-sm text-muted">Prefer a ready-made persona? <Link href="/login" className="font-semibold text-forest hover:underline">Log in as investor, tenant, supervisor or administrator</Link>.</p>
    </AuthShell>
  );
}
