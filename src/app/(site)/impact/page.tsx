import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Home, Zap, Users, Coins } from "lucide-react";
import { seedProperties } from "@/lib/data/properties";
import { totalCost } from "@/lib/finance";
import { eur } from "@/lib/utils";
import { Card, Stat } from "@/components/ui";
import { PageHeader, IllustrativeNotice, SectionHeading } from "@/components/site/notices";
import { StageBadge } from "@/components/site/stage-badge";

export const metadata: Metadata = { title: "Impact (projected)" };

export default function ImpactPage() {
  const homes = seedProperties.length;
  const beds = seedProperties.reduce((s, p) => s + p.bedrooms, 0);
  const refurb = seedProperties.reduce((s, p) => s + p.refurbishment, 0);
  const total = seedProperties.reduce((s, p) => s + totalCost(p), 0);
  const years = seedProperties.reduce((s, p) => s + (2026 - Number(p.vacantSince)), 0);
  return (
    <>
      <PageHeader eyebrow="Impact · projected, not achieved" title="Finance aimed at bringing homes back into use" intro="The figures below describe what the four illustrative projects would deliver if they were real and went to plan. None has been acquired; nothing has been achieved. They show how Meithera would report impact: projected and realised, always in separate columns.">
        <div className="mt-6 flex flex-wrap gap-2"><StageBadge stage={1} /><StageBadge stage={2} /></div>
      </PageHeader>
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Homes returned to use (projected)" value={homes} sub="Realised: 0" />
          <Stat label="Bedrooms (projected)" value={beds} sub="Realised: 0" />
          <Stat label="Refurbishment spend (projected)" value={eur(refurb)} sub={`of ${eur(total)} total project cost`} />
          <Stat label="Years of vacancy ended (projected)" value={years} sub="Sum across the four homes" />
        </div>
        <IllustrativeNotice className="mt-6 max-w-2xl">Projected figures from fictional projects. Do not read as outcomes.</IllustrativeNotice>
      </section>
      <section className="border-y border-line bg-card">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <SectionHeading eyebrow="How impact would be measured" title="Four measures on every home's passport" />
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              [Home, "Vacancy ended", "Years vacant before works; date of first tenancy. From the passport's vacancy and tenancy entries."],
              [Zap, "BER uplift", "Energy rating before and after works, attested on Raya Chain. Dublin 8: F → B1 (target)."],
              [Users, "Funders", "How many people funded the home and the median amount — the breadth of participation, not just the total."],
              [Coins, "Income shared", "Realised rent or interest paid to holders, from Raya Chain payout transactions. Never projected income presented as paid."],
            ].map(([Icon, t, d]) => {
              const I = Icon as typeof Home;
              return <Card key={t as string} className="p-6"><I className="h-6 w-6 text-forest" /><h3 className="mt-3 font-sans font-semibold">{t as string}</h3><p className="mt-2 text-sm text-muted">{d as string}</p></Card>;
            })}
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <SectionHeading eyebrow="Per home" title="The illustrative projects" />
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {seedProperties.map((p) => (
            <Card key={p.id} className="p-5">
              <div className="flex flex-wrap items-center justify-between gap-2"><p className="font-sans font-semibold">{p.title}</p><StageBadge stage={p.offerType === "loan" ? 1 : 2} compact /></div>
              <dl className="tabular mt-3 grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
                <div><dt className="text-muted">Vacant since</dt><dd className="font-semibold">{p.vacantSince}</dd></div>
                <div><dt className="text-muted">BER</dt><dd className="font-semibold">{p.berBefore.split(" ")[0]} → {p.ber.replace("Target ", "")}</dd></div>
                <div><dt className="text-muted">Refurbishment</dt><dd className="font-semibold">{eur(p.refurbishment)}</dd></div>
                <div><dt className="text-muted">Bedrooms</dt><dd className="font-semibold">{p.bedrooms}</dd></div>
              </dl>
              <Link href={`/properties/${p.slug}?tab=passport`} className="mt-3 inline-flex items-center gap-1 font-sans text-sm font-semibold text-forest">Home passport <ArrowRight className="h-4 w-4" /></Link>
            </Card>
          ))}
        </div>
        <p className="mt-6 text-xs text-muted">Any interaction with public schemes (for example the Vacant Property Refurbishment Grant) is not assumed and would need separate review. Social impact is not a reason to accept financial risk you cannot bear.</p>
      </section>
    </>
  );
}
