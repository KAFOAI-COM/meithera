import Link from "next/link";
import { MapPin, ArrowRight } from "lucide-react";
import type { Property } from "@/lib/types";
import { eur, pct } from "@/lib/utils";
import { loanToValue, netOperatingYield, raiseTarget, totalCost } from "@/lib/finance";
import { Badge, Progress, buttonVariants } from "@/components/ui";
import { PropertyArt } from "./property-art";
import { IllustrativeNotice } from "./notices";
import { StageBadge } from "./stage-badge";

export const statusMeta = {
  open: { label: "Open (simulated)", tone: "mint" as const },
  "coming-soon": { label: "Coming soon", tone: "neutral" as const },
  funded: { label: "Fully subscribed (simulated)", tone: "emerald" as const },
};

export function PropertyCard({ p }: { p: Property }) {
  const s = statusMeta[p.status];
  const isLoan = p.offerType === "loan" && p.loan;
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-card shadow-card transition-shadow hover:shadow-raised">
      <div className="relative aspect-[16/10] overflow-hidden">
        <PropertyArt palette={p.palette} kind={p.type.includes("apartment") ? "apartment" : "terrace"} label={`Illustration of ${p.title}`} />
        <Badge tone={s.tone} className="absolute left-3 top-3 shadow-sm">{s.label}</Badge>
        <StageBadge stage={isLoan ? 1 : 2} compact className="absolute right-3 top-3 shadow-sm" />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="flex items-center gap-1 text-xs font-medium text-muted"><MapPin className="h-3.5 w-3.5" /> {p.location}</p>
        <h3 className="mt-1 font-sans text-lg font-semibold text-ink">{p.type}</h3>
        <p className="mt-0.5 text-xs text-muted">{isLoan ? "Secured refurbishment loan" : "Rent share — notes in the home's company"}</p>
        {isLoan ? (
          <dl className="tabular mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <dt className="text-muted">Loan amount</dt><dd className="text-right font-semibold">{eur(p.loan!.amount)}</dd>
            <dt className="text-muted">Fixed rate</dt><dd className="text-right font-semibold text-forest">{p.loan!.ratePct}% p.a.*</dd>
            <dt className="text-muted">Term</dt><dd className="text-right font-medium">{p.loan!.termMonths} months</dd>
            <dt className="text-muted">Loan-to-value</dt><dd className="text-right font-medium">{pct(loanToValue(p), 0)} (≤ 65%)</dd>
            <dt className="text-muted">Illustrative minimum</dt><dd className="text-right font-medium">{eur(100)}</dd>
          </dl>
        ) : (
          <dl className="tabular mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <dt className="text-muted">Acquisition</dt><dd className="text-right font-medium">{eur(p.acquisition)}</dd>
            <dt className="text-muted">Refurbishment</dt><dd className="text-right font-medium">{eur(p.refurbishment)}</dd>
            <dt className="text-muted">Total project cost</dt><dd className="text-right font-semibold">{eur(totalCost(p))}</dd>
            <dt className="text-muted">Indicative net yield*</dt><dd className="text-right font-semibold text-forest">{pct(netOperatingYield(p))}</dd>
            <dt className="text-muted">Illustrative minimum</dt><dd className="text-right font-medium">{eur(100)}</dd>
          </dl>
        )}
        <div className="mt-4">
          <div className="mb-1 flex justify-between text-xs text-muted"><span>Simulated funding of {eur(raiseTarget(p))}</span><span className="tabular">{Math.round(p.fundedPct * 100)}%</span></div>
          <Progress value={p.fundedPct} label={`Simulated funding ${Math.round(p.fundedPct * 100)}%`} />
        </div>
        <p className="mt-3 text-[11px] leading-snug text-muted">
          {isLoan ? "*Fixed interest before investor-level taxes; assumes no borrower default. Capital at risk." : "*Property-level net operating yield before platform fees and investor-level taxes. Not an investor return."}
        </p>
        <IllustrativeNotice className="mt-3" />
        <Link href={`/properties/${p.slug}`} className={buttonVariants({ variant: "secondary", className: "mt-4 w-full" })}>
          View details <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}
