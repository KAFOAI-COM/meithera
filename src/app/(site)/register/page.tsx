import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { demoRegister } from "@/app/actions";
import { Card, Input, Label, Select } from "@/components/ui";
import { PageHeader, IllustrativeNotice, RiskNotice } from "@/components/site/notices";
import { StageBadge } from "@/components/site/stage-badge";

export const metadata: Metadata = { title: "Register (demo)" };

const counties = ["Carlow", "Cavan", "Clare", "Cork", "Donegal", "Dublin", "Galway", "Kerry", "Kildare", "Kilkenny", "Laois", "Leitrim", "Limerick", "Longford", "Louth", "Mayo", "Meath", "Monaghan", "Offaly", "Roscommon", "Sligo", "Tipperary", "Waterford", "Westmeath", "Wexford", "Wicklow"];

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const sp = await searchParams;
  return (
    <>
      <PageHeader eyebrow="Demonstration registration" title="Create a fictional investor" intro="Only a first name and a county — no email, no identity documents, no bank details. The account maps to the demonstration investor and lives only in a signed cookie for eight hours.">
        <div className="mt-6"><StageBadge stage={0} /></div>
      </PageHeader>
      <div className="mx-auto max-w-xl px-4 py-10 sm:px-6">
        <Card className="p-6 sm:p-8">
          {sp.error ? (
            <div className="mb-5 flex gap-3 rounded-xl bg-risk p-4 text-sm text-risk-ink" role="alert"><AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" /><p>Please complete all fields and confirm this is a demonstration.</p></div>
          ) : null}
          <form action={demoRegister} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="firstName">First name (fictional)</Label>
              <Input id="firstName" name="firstName" required maxLength={40} placeholder="e.g. Aoife" autoComplete="off" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="county">County</Label>
              <Select id="county" name="county" defaultValue="Dublin" required>
                {counties.map((c) => <option key={c} value={c}>{c}</option>)}
              </Select>
            </div>
            <label htmlFor="confirmFictional" className="flex cursor-pointer items-start gap-3 rounded-xl border border-line bg-surface p-4 text-sm">
              <input id="confirmFictional" name="confirmFictional" type="checkbox" required className="mt-0.5 h-5 w-5 shrink-0 accent-[#063f36]" />
              <span>I confirm this is a demonstration. I understand no real investment, payment or account is being created and that I should not enter personal information.</span>
            </label>
            <RiskNotice />
            <button className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-emerald px-6 font-sans text-base font-semibold text-white hover:bg-forest">Create demo investor</button>
          </form>
          <IllustrativeNotice className="mt-5">Registration is simulated. In a live service, onboarding would be performed by an authorised provider.</IllustrativeNotice>
          <p className="mt-5 text-center text-sm text-muted">Or <Link href="/login" className="font-semibold text-forest underline-offset-2 hover:underline">choose a ready-made persona</Link>.</p>
        </Card>
      </div>
    </>
  );
}
