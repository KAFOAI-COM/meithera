"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  AlertTriangle, ArrowLeft, ArrowRight, Boxes, Building, CalendarClock, CheckCircle2, Coins, Hammer, Home, Landmark, MapPin, Percent, Receipt, Scale, TrendingDown, Wallet,
} from "lucide-react";
import { useDemo } from "@/lib/store";
import { seedSpvs } from "@/lib/data/seed";
import { grossYield, headlineRate, illustrate, loanFacility, netOperatingYield, noi, offerSize, totalCost } from "@/lib/finance";
import { offerLabel, offerStage } from "@/lib/stages";
import { cn, eur, pct } from "@/lib/utils";
import { buttonVariants, Progress } from "@/components/ui";
import { IllustrativeNotice, RISK_WARNING } from "@/components/site/notices";
import { StageBadge } from "@/components/site/stage-badge";
import { monthlyPer1000, statusMeta } from "@/components/site/property-card";
import { Gallery } from "./gallery";
import { Calculator } from "./calculator";
import { Passport } from "./passport";

const SECTIONS = [
  { id: "overview", label: "Overview" },
  { id: "financials", label: "Financials" },
  { id: "calculator", label: "Calculator" },
  { id: "terms", label: "Investment terms" },
  { id: "risks", label: "Risks" },
  { id: "passport", label: "Home Digital Passport" },
] as const;

function SectionNav() {
  const [active, setActive] = useState<string>("overview");
  useEffect(() => {
    const els = SECTIONS.map((s) => document.getElementById(s.id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (vis[0]) setActive(vis[0].target.id);
      },
      { rootMargin: "-140px 0px -55% 0px" },
    );
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, []);
  return (
    <nav className="sticky top-[72px] z-30 -mx-4 border-b border-line bg-surface/95 px-4 backdrop-blur sm:-mx-6 sm:px-6" aria-label="Property sections">
      <div className="mx-auto flex max-w-7xl gap-1 overflow-x-auto py-2">
        {SECTIONS.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            aria-current={active === s.id ? "true" : undefined}
            className={cn(
              "flex min-h-10 shrink-0 items-center rounded-lg px-3 font-sans text-sm font-semibold transition-colors",
              active === s.id ? "bg-emerald text-white" : "text-muted hover:bg-mint hover:text-emerald",
            )}
          >
            {s.label}
          </a>
        ))}
      </div>
    </nav>
  );
}

function Section({ id, eyebrow, title, intro, badge, children }: { id: string; eyebrow: string; title: string; intro?: string; badge?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-[140px] border-t border-line py-14 first:border-t-0 first:pt-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-2xl">
          <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-gold-ink">{eyebrow}</p>
          <h2 className="mt-2 font-serif text-3xl tracking-tight text-ink sm:text-[34px]">{title}</h2>
          {intro ? <p className="mt-3 text-[15px] leading-relaxed text-muted">{intro}</p> : null}
        </div>
        {badge}
      </div>
      <div className="mt-8">{children}</div>
    </section>
  );
}

function Row({ k, v, strong, minus, hint }: { k: string; v: string; strong?: boolean; minus?: boolean; hint?: string }) {
  return (
    <div className={cn("flex items-baseline justify-between gap-4 border-b border-line py-3 text-sm", strong && "font-semibold")}>
      <span className={strong ? "text-ink" : "text-muted"}>
        {k}
        {hint ? <span className="ml-1.5 text-xs text-muted/80">{hint}</span> : null}
      </span>
      <span className={cn("tabular", minus && "text-risk-ink")}>{minus ? `−${v}` : v}</span>
    </div>
  );
}

function riskList(isLoan: boolean) {
  const r = [
    { icon: TrendingDown, t: "Capital at risk", d: "You could lose some or all of the money you put in. Nothing here is guaranteed or covered by a deposit guarantee or investor compensation scheme." },
    { icon: Home, t: "Rental vacancy", d: "Homes can sit empty between tenancies, or tenants may fall into arrears, reducing or stopping income." },
    { icon: Scale, t: "Property valuation", d: "Values can fall. The illustrative valuation is not a professional valuation and may not be achieved on sale." },
    { icon: Hammer, t: "Refurbishment overruns", d: "Works on vacant and derelict homes can cost more and take longer than planned; the contingency may not be enough." },
    { icon: CalendarClock, t: "Illiquidity", d: isLoan ? "You cannot exit before the loan matures. Repayment can be delayed." : "There is no guaranteed way to sell early. You may have to hold for the full period or longer." },
    { icon: Landmark, t: "Regulatory uncertainty", d: "The structure, permissions and partners are proposed and subject to regulatory assessment. Rules may change." },
    { icon: Receipt, t: "Tax", d: "Figures are before investor-level taxes. Your tax position depends on your circumstances; take independent advice." },
  ];
  if (isLoan) r.splice(1, 0, { icon: Wallet, t: "Borrower default", d: "If the borrower cannot repay, recovery depends on enforcing the first legal charge. That can take time and may not recover the full amount." });
  return r;
}

export function PropertyDetail({ slug }: { slug: string }) {
  const p = useDemo((s) => s.properties.find((x) => x.slug === slug));
  if (!p)
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6">
        <h1 className="font-serif text-4xl text-ink">Property not found</h1>
        <p className="mt-3 text-muted">This illustrative property is not in the current demo session.</p>
        <Link href="/properties" className={buttonVariants({ className: "mt-8" })}>Back to properties</Link>
      </div>
    );

  const isLoan = p.offerType === "loan" && !!p.loan;
  const s = statusMeta[p.status];
  const spv = seedSpvs.find((x) => x.id === p.spvId);
  const size = offerSize(p);
  const tc = totalCost(p);
  const per1000 = illustrate(p, 1000);
  const costParts = [
    { k: "Acquisition", v: p.acquisition, c: "bg-emerald" },
    { k: "Refurbishment", v: p.refurbishment, c: "bg-forest" },
    { k: "Legal & transaction", v: p.legal, c: "bg-gold" },
    { k: "Contingency", v: p.contingency, c: "bg-chart4" },
  ];

  const terms: [string, string][] = isLoan
    ? [
        ["Borrower", spv?.name ?? "Proposed property company"],
        ["Instrument", spv?.instrument ?? "Proposed secured loan participation"],
        ["Security", p.loan!.security],
        ["Interest", `${p.loan!.ratePct}% p.a. fixed, paid monthly (illustrative)`],
        ["Term", `${p.loan!.months} months; principal repaid at maturity`],
        ["Loan facility", `${eur(loanFacility(p))} · ${pct(loanFacility(p) / p.valuation, 0)} of the illustrative valuation (cap ${p.loan!.ltvPct}%)`],
        ["Your participation", `€1,000 ≈ ${pct(985 / loanFacility(p), 4)} of the facility`],
        ["Arrangement fee", "Paid by the borrower, not by lenders"],
        ["Exit", "No early exit. If the borrower defaults, recovery depends on enforcing the charge and may take time."],
      ]
    : [
        ["Property company", spv?.name ?? "Proposed property company (SPV)"],
        ["Instrument", spv?.instrument ?? "Proposed note in the property company"],
        ["What you hold", "Notes in the company that owns the home — not the home itself. Legal title stays with the company."],
        ["Your participation", `€1,000 ≈ ${pct(per1000.participation, 4)} of the company’s economic interest`],
        ["Distributions", `${p.distribution}, from net rental income (illustrative)`],
        ["Holding period", `${p.holdingYears} years (indicative)`],
        ["Voting", "Holders vote on a sale at the end of the holding period (proposed)"],
        ["Early exit", "No guaranteed exit. Interest to sell can be posted on an ECSPR bulletin board — no order matching."],
        ["Register", "Company register mirrored on Raya Chain (simulated)"],
      ];

  return (
    <>
      <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6">
        <Link href="/properties" className="inline-flex min-h-10 items-center gap-1.5 font-sans text-sm font-semibold text-muted hover:text-emerald">
          <ArrowLeft className="h-4 w-4" /> All properties
        </Link>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <StageBadge stage={offerStage(p)} detail />
              <span className="rounded-full border border-line bg-card px-2.5 py-1 font-sans text-[11px] font-semibold text-muted">{s.label}</span>
            </div>
            <h1 className="mt-4 max-w-3xl font-serif text-4xl leading-[1.05] tracking-tight text-ink sm:text-5xl">{p.title}</h1>
            <p className="mt-3 flex items-center gap-1.5 text-sm text-muted"><MapPin className="h-4 w-4" /> {p.location}, Co. {p.county} · area centroid only, no address</p>
          </div>
          <div className="text-left sm:text-right">
            <p className="tabular font-serif text-5xl leading-none text-emerald">{pct(headlineRate(p))}</p>
            <p className="mt-1.5 font-sans text-[11px] font-semibold uppercase tracking-[0.1em] text-muted">{isLoan ? "Fixed interest p.a. · illustrative" : "Property net yield · not your return"}</p>
          </div>
        </div>
        <div className="mt-8"><Gallery images={p.images} title={p.title} /></div>
        <div className="mt-8"><SectionNav /></div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0">
          <Section id="overview" eyebrow="Overview" title={isLoan ? "A secured loan to refurbish a vacant home" : "Notes in the company that owns this home"} intro={p.description}>
            <div className="grid gap-8 md:grid-cols-2">
              <div>
                <h3 className="font-sans text-sm font-semibold text-ink">Refurbishment objectives</h3>
                <ul className="mt-4 space-y-3">
                  {p.objectives.map((o) => (
                    <li key={o} className="flex gap-3 text-sm leading-relaxed text-muted"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-forest" /> {o}</li>
                  ))}
                </ul>
                <dl className="tabular mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line text-sm">
                  {[["Type", p.type], ["Bedrooms", String(p.bedrooms)], ["Vacant since", p.vacantSince], ["Energy rating", `${p.berBefore} → ${p.ber.replace(/^Target\s*/i, "")}`], ["Risk level", p.riskLevel], ["County", p.county]].map(([k, v]) => (
                    <div key={k} className="bg-card p-3.5">
                      <dt className="text-[11px] font-medium uppercase tracking-wide text-muted">{k}</dt>
                      <dd className="mt-0.5 font-sans font-semibold text-ink">{v}</dd>
                    </div>
                  ))}
                </dl>
              </div>
              <div>
                <h3 className="font-sans text-sm font-semibold text-ink">Project timeline <span className="font-normal text-muted">· indicative</span></h3>
                <ol className="mt-4">
                  {p.milestones.map((m, i) => (
                    <li key={m.label} className="relative grid grid-cols-[1.5rem_1fr_auto] gap-3 pb-5 last:pb-0">
                      {i < p.milestones.length - 1 ? <span className="absolute left-[11px] top-6 h-[calc(100%-1rem)] w-px bg-line" aria-hidden /> : null}
                      <span className={cn("relative z-10 mt-0.5 flex h-6 w-6 items-center justify-center rounded-full font-sans text-[11px] font-bold", m.done ? "bg-forest text-white" : "bg-card text-muted ring-1 ring-line-strong/50")}>{i + 1}</span>
                      <span className={cn("text-sm", m.done ? "font-semibold text-ink" : "text-muted")}>{m.label}{m.done ? " · done" : ""}</span>
                      <span className="tabular text-xs text-muted">{m.date}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </Section>

          <Section id="financials" eyebrow="Financial breakdown" title="Every cost, and the income it supports" intro="Property-level figures, before platform fees and investor-level taxes. The property’s yield is not an investor return.">
            <div className="grid gap-10 md:grid-cols-2">
              <div>
                <h3 className="font-sans text-sm font-semibold text-ink">Project cost</h3>
                <div className="mt-4 flex h-3 overflow-hidden rounded-full" aria-hidden>
                  {costParts.map((c) => <span key={c.k} className={c.c} style={{ width: `${(c.v / tc) * 100}%` }} />)}
                </div>
                <div className="mt-3">
                  {costParts.map((c) => (
                    <div key={c.k} className="flex items-baseline justify-between gap-4 border-b border-line py-3 text-sm">
                      <span className="flex items-center gap-2 text-muted"><span className={cn("h-2.5 w-2.5 rounded-sm", c.c)} />{c.k}</span>
                      <span className="tabular">{eur(c.v)} <span className="ml-1 text-xs text-muted">{pct(c.v / tc, 0)}</span></span>
                    </div>
                  ))}
                  <Row k="Total project cost" v={eur(tc)} strong />
                  <Row k="Illustrative valuation after works" hint="not a professional valuation" v={eur(p.valuation)} />
                  {isLoan ? <Row k="Loan facility" hint={`LTV cap ${p.loan!.ltvPct}%`} v={eur(loanFacility(p))} strong /> : null}
                </div>
              </div>
              <div>
                <h3 className="font-sans text-sm font-semibold text-ink">Annual income <span className="font-normal text-muted">· after works, illustrative</span></h3>
                <div className="mt-4">
                  <Row k="Estimated gross rent" v={eur(p.annualRent)} />
                  <Row k="Maintenance" v={eur(p.opex.maintenance)} minus />
                  <Row k="Property management" v={eur(p.opex.management)} minus />
                  <Row k="Insurance" v={eur(p.opex.insurance)} minus />
                  <Row k="Other" hint="LPT, compliance, service charges" v={eur(p.opex.other)} minus />
                  <Row k="Net operating income" v={eur(noi(p))} strong />
                  <Row k="Gross yield" hint="rent ÷ total cost" v={pct(grossYield(p))} />
                  <Row k="Property net operating yield" hint="NOI ÷ total cost" v={pct(netOperatingYield(p))} strong />
                  <Row k="Vacancy allowance in the model" v={pct(p.vacancyPct, 0)} />
                </div>
                {isLoan ? (
                  <p className="mt-4 rounded-xl bg-surface p-4 text-xs leading-relaxed text-muted">For a Stage 1 loan, lenders are paid fixed interest by the borrower, not a share of rent. Rental income is shown because it supports the borrower’s ability to repay.</p>
                ) : null}
              </div>
            </div>
          </Section>

          <Section id="calculator" eyebrow="Interactive calculator" title="See it gross to net" intro={isLoan ? "Enter €100 to €10,000 to see illustrative monthly interest and the repayment schedule." : "Enter €100 to €10,000 to see your illustrative share of rent, costs and fees."}>
            <Calculator p={p} />
          </Section>

          <Section id="terms" eyebrow="Investment information" title={isLoan ? "Proposed loan terms" : "Proposed investment terms"} intro="Proposed structure, subject to legal and regulatory assessment. Final rights depend on the instrument." badge={<StageBadge stage={offerStage(p)} detail />}>
            <dl className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2">
              {terms.map(([k, v]) => (
                <div key={k} className="bg-card p-5">
                  <dt className="font-sans text-[11px] font-semibold uppercase tracking-[0.1em] text-muted">{k}</dt>
                  <dd className="mt-1.5 text-sm leading-relaxed text-ink">{v}</dd>
                </div>
              ))}
            </dl>
          </Section>

          <Section id="risks" eyebrow="Risks" title="What could go wrong" intro={RISK_WARNING}>
            <div className="grid gap-4 sm:grid-cols-2">
              {riskList(isLoan).map((r) => (
                <div key={r.t} className="flex gap-4 rounded-2xl border border-line bg-card p-5">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-risk text-risk-ink"><r.icon className="h-5 w-5" /></span>
                  <div>
                    <h3 className="font-sans text-sm font-semibold text-ink">{r.t}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted">{r.d}</p>
                  </div>
                </div>
              ))}
            </div>
            <Link href="/legal/risk-disclosure" className={buttonVariants({ variant: "ghost", className: "mt-6" })}>Read the full risk disclosure <ArrowRight className="h-4 w-4" /></Link>
          </Section>

          <Section id="passport" eyebrow="Home Digital Passport" title="This home’s history, on the record" intro="Vacancy, works, energy rating, funders and payouts — each recorded entry links to its Raya Chain transaction." badge={<StageBadge stage={0} detail />}>
            <Passport p={p} />
          </Section>
        </div>

        <aside className="pb-10 lg:pt-10">
          <div className="space-y-4 lg:sticky lg:top-[150px]">
            <div className="overflow-hidden rounded-2xl border border-line bg-card shadow-card">
              <div className="bg-emerald p-5 text-white">
                <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-gold">{offerLabel(p)}</p>
                <div className="mt-3 flex items-end justify-between gap-3">
                  <div>
                    <p className="tabular font-serif text-4xl leading-none">{pct(headlineRate(p))}</p>
                    <p className="mt-1.5 text-[11px] text-white/60">{isLoan ? "fixed interest p.a." : "property net yield*"}</p>
                  </div>
                  <div className="text-right">
                    <p className="tabular font-sans text-lg font-bold">{eur(monthlyPer1000(p), 2)}</p>
                    <p className="text-[11px] text-white/60">per €1,000 / month, net</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4 p-5">
                <div>
                  <div className="mb-1.5 flex justify-between font-sans text-xs text-muted"><span>Simulated funding</span><span className="tabular font-semibold text-ink">{Math.round(p.fundedPct * 100)}%</span></div>
                  <Progress value={p.fundedPct} label={`Simulated funding ${Math.round(p.fundedPct * 100)}%`} />
                  <p className="tabular mt-1.5 text-xs text-muted">{eur(size * p.fundedPct)} of {eur(size)} {isLoan ? "facility" : "project cost"}</p>
                </div>
                <dl className="tabular grid grid-cols-2 gap-3 text-sm">
                  <div><dt className="text-[11px] uppercase tracking-wide text-muted">Minimum</dt><dd className="font-sans font-semibold">{eur(100)}</dd></div>
                  <div><dt className="text-[11px] uppercase tracking-wide text-muted">{isLoan ? "Term" : "Holding"}</dt><dd className="font-sans font-semibold">{isLoan ? `${p.loan!.months} months` : `${p.holdingYears} years`}</dd></div>
                  <div><dt className="text-[11px] uppercase tracking-wide text-muted">Payouts</dt><dd className="font-sans font-semibold">Monthly</dd></div>
                  <div><dt className="text-[11px] uppercase tracking-wide text-muted">Risk</dt><dd className="font-sans font-semibold">{p.riskLevel}</dd></div>
                </dl>
                {p.status === "open" ? (
                  <Link href={`/invest/${p.id}`} className={buttonVariants({ size: "lg", className: "w-full" })}>
                    <Coins className="h-4 w-4" /> Simulate {isLoan ? "a loan" : "an investment"}
                  </Link>
                ) : (
                  <span className={buttonVariants({ size: "lg", variant: "secondary", className: "pointer-events-none w-full opacity-70" })}>
                    {p.status === "funded" ? "Fully subscribed (simulated)" : "Opens soon (simulated)"}
                  </span>
                )}
                <Link href={`/chain?spv=${p.spvId}`} className={buttonVariants({ variant: "ghost", size: "sm", className: "w-full" })}>
                  <Boxes className="h-4 w-4" /> View the register on Raya Chain
                </Link>
                <p className="flex gap-2 text-[11px] leading-snug text-muted"><AlertTriangle className="h-3.5 w-3.5 shrink-0 text-risk-ink" /> {RISK_WARNING}</p>
              </div>
            </div>
            <IllustrativeNotice>
              Illustrative demonstration property — not an investment offer. {isLoan ? "" : "*Property-level yield before fees and investor-level taxes."}
            </IllustrativeNotice>
            <div className="flex items-center gap-3 rounded-2xl border border-line bg-card p-4 text-xs text-muted">
              {isLoan ? <Percent className="h-5 w-5 shrink-0 text-forest" /> : <Building className="h-5 w-5 shrink-0 text-forest" />}
              <span>Fees: 1.5% one-off acquisition fee and 0.5% annual administration fee — the same on every opportunity.</span>
            </div>
          </div>
        </aside>
      </div>

      {/* Mobile: keep the headline figure and the call to action in reach. */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-card/95 px-4 py-3 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-xl items-center justify-between gap-4">
          <div>
            <p className="tabular font-serif text-2xl leading-none text-emerald">{pct(headlineRate(p))}</p>
            <p className="mt-1 text-[11px] text-muted">{eur(monthlyPer1000(p), 2)} per €1,000 / month, net</p>
          </div>
          {p.status === "open" ? (
            <Link href={`/invest/${p.id}`} className={buttonVariants({ className: "shrink-0" })}><Coins className="h-4 w-4" /> Simulate</Link>
          ) : (
            <span className="shrink-0 rounded-full bg-surface px-3 py-1.5 font-sans text-xs font-semibold text-muted ring-1 ring-line">{s.label}</span>
          )}
        </div>
      </div>
      <div className="h-16 lg:hidden" aria-hidden />
    </>
  );
}
