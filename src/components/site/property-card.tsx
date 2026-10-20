import Image from "next/image";
import Link from "next/link";
import { MapPin, ArrowRight, Info } from "lucide-react";
import type { Property } from "@/lib/types";
import { cn, eur, pct } from "@/lib/utils";
import { headlineRate, illustrate, illustrateLoan, loanFacility, totalCost } from "@/lib/finance";
import { offerLabel } from "@/lib/stages";
import { Progress } from "@/components/ui";

export const statusMeta = {
  open: { label: "Open (simulated)", tone: "mint" as const },
  "coming-soon": { label: "Coming soon", tone: "neutral" as const },
  funded: { label: "Fully subscribed (simulated)", tone: "emerald" as const },
};

/** Illustrative net monthly income per €1,000 entered, after fees and before investor-level taxes. */
export function monthlyPer1000(p: Property) {
  return p.offerType === "loan" && p.loan ? illustrateLoan(1000, p.loan.ratePct, p.loan.months).monthlyNet : illustrate(p, 1000).monthlyIncome;
}

export function PropertyCard({ p, priority }: { p: Property; priority?: boolean }) {
  const s = statusMeta[p.status];
  const isLoan = p.offerType === "loan" && !!p.loan;
  const facts: [string, string][] = isLoan
    ? [
        ["Loan facility", eur(loanFacility(p))],
        ["Term", `${p.loan!.months} months`],
        ["Loan-to-value", `≤ ${p.loan!.ltvPct}%`],
        ["Security", "First legal charge"],
      ]
    : [
        ["Total project cost", eur(totalCost(p))],
        ["Holding period", `${p.holdingYears} years`],
        ["Distributions", p.distribution],
        ["Energy rating", p.ber],
      ];
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-card shadow-card transition-[box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:shadow-raised">
      <Link href={`/properties/${p.slug}`} className="relative block aspect-[4/3] overflow-hidden" aria-label={`View ${p.title}`}>
        <Image
          src={p.images[0]}
          alt={`Representative photograph for ${p.location} (not the actual property)`}
          fill
          priority={priority}
          sizes="(min-width: 1280px) 400px, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.06]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-emerald/85 via-emerald/10 to-transparent" aria-hidden />
        <div className="absolute inset-x-3 top-3 flex flex-wrap items-start justify-between gap-2">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-sans text-[11px] font-semibold shadow-sm backdrop-blur-md",
              isLoan ? "bg-white/90 text-emerald" : "bg-emerald/80 text-white ring-1 ring-white/20",
            )}
          >
            <span className={cn("h-1.5 w-1.5 rounded-full", isLoan ? "bg-forest" : "bg-gold")} aria-hidden />
            {offerLabel(p)}
          </span>
          <span className="rounded-full bg-black/35 px-2.5 py-1 font-sans text-[11px] font-medium text-white backdrop-blur-md">{s.label}</span>
        </div>
        <div className="absolute inset-x-4 bottom-3 flex items-end justify-between gap-3 text-white">
          <div>
            <p className="flex items-center gap-1 font-sans text-xs font-medium text-white/80"><MapPin className="h-3.5 w-3.5" /> {p.location} · Co. {p.county}</p>
            <h3 className="mt-0.5 font-serif text-[22px] leading-tight">{p.type}</h3>
          </div>
        </div>
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-end justify-between gap-4 border-b border-line pb-4">
          <div>
            <p className="tabular font-serif text-[40px] leading-none text-emerald">{pct(headlineRate(p))}</p>
            <p className="mt-1.5 font-sans text-[11px] font-semibold uppercase tracking-[0.1em] text-muted">
              {isLoan ? "Fixed interest p.a." : "Property net yield*"}
            </p>
          </div>
          <div className="text-right">
            <p className="tabular font-sans text-lg font-bold text-ink">{eur(monthlyPer1000(p), 2)}</p>
            <p className="text-[11px] leading-tight text-muted">per €1,000 / month<br />after fees, before tax</p>
          </div>
        </div>
        <dl className="tabular mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
          {facts.map(([k, v]) => (
            <div key={k}>
              <dt className="text-[11px] font-medium uppercase tracking-wide text-muted">{k}</dt>
              <dd className="mt-0.5 font-sans font-semibold text-ink">{v}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-5">
          <div className="mb-1.5 flex justify-between font-sans text-xs text-muted"><span>Simulated funding</span><span className="tabular font-semibold text-ink">{Math.round(p.fundedPct * 100)}%</span></div>
          <Progress value={p.fundedPct} label={`Simulated funding ${Math.round(p.fundedPct * 100)}%`} />
        </div>
        <p className="mt-4 flex gap-1.5 text-[11px] leading-snug text-muted">
          <Info className="mt-px h-3.5 w-3.5 shrink-0 text-gold-ink" aria-hidden />
          <span>
            Illustrative demonstration property — not an investment offer.{" "}
            {isLoan ? "Interest is illustrative and not guaranteed." : "*Property-level yield before fees and investor-level taxes; not an investor return."}
          </span>
        </p>
        <Link href={`/properties/${p.slug}`} className="mt-auto inline-flex items-center justify-between gap-2 pt-5 font-sans text-sm font-semibold text-forest">
          <span className="border-b border-transparent transition-colors group-hover:border-forest">View {isLoan ? "loan" : "property"} details</span>
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </article>
  );
}
