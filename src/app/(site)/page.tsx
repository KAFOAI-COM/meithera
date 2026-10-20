import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight, Home, Users, FileBarChart2, Search, FileCheck2, PiggyBank, LineChart, ShieldCheck, Lock, Fingerprint, Landmark, ScrollText, AlertTriangle, Boxes,
} from "lucide-react";
import { buttonVariants, Card } from "@/components/ui";
import { FeaturedProperties } from "@/components/site/live-properties";
import { FaqList, faqs } from "@/components/site/faq-list";
import { RegisterInterest } from "@/components/site/register-interest";
import { RISK_WARNING, SectionHeading } from "@/components/site/notices";
import { StageBadge } from "@/components/site/stage-badge";
import { LiveChainCard, LiveStats } from "@/components/site/landing-live";
import { seedProperties } from "@/lib/data/properties";
import { FEES, illustrate, illustrateLoan, netOperatingYield } from "@/lib/finance";
import { STAGES, VARIANT_LABEL } from "@/lib/stages";
import { cn, eur, pct } from "@/lib/utils";

const steps = [
  { icon: Search, title: "Explore", text: "Browse illustrative vacant-home projects with full cost, rent and risk breakdowns." },
  { icon: FileCheck2, title: "Onboard", text: "Complete (simulated) identity, AML, knowledge-test and loss-bearing steps first." },
  { icon: PiggyBank, title: "Participate", text: "Simulate from €100 — a secured loan (Stage 1) or notes in the property company (Stage 2)." },
  { icon: LineChart, title: "Track", text: "Follow monthly interest or rent, documents and milestones — each payout on Raya Chain." },
];

const impact = [
  { icon: Home, title: "Restore vacant homes", text: "Finance aimed at returning unused and derelict properties to residential use." },
  { icon: Users, title: "Accessible participation", text: "Fund new supply from €100 without buying a whole property." },
  { icon: FileBarChart2, title: "Transparent reporting", text: "Costs, risks, projected income and performance — gross to net, every time." },
];

const why = [
  ["Persistent demand", "Ireland’s rental market has seen sustained demand relative to supply."],
  ["Under-used stock", "Vacant and derelict homes could return to use with refurbishment finance."],
  ["Income-focused", "Residential property can generate income — though rent can fall and homes can sit empty."],
  ["Real assets, real risks", "Values can fall, works can overrun and your money may be tied up for years."],
];

const tech = [
  { icon: Fingerprint, title: "Identity-first onboarding", text: "Verification by an authorised partner before any participation. Simulated here." },
  { icon: Boxes, title: "One master record", text: "Raya Chain mirrors the SPV register. Other chains get proofs (Merkle roots), not copies." },
  { icon: Lock, title: "Compliance travels with the asset", text: "Verified-wallet allowlist, lock-ups, freeze and court-ordered correction built in." },
  { icon: ScrollText, title: "Tamper-evident audit", text: "Every material action is hash-chained, and the supervisor can verify the chain." },
];

function Row({ k, v, strong, minus }: { k: string; v: string; strong?: boolean; minus?: boolean }) {
  return (
    <div className={cn("flex justify-between gap-4 border-b border-line py-2.5", strong && "font-semibold text-ink")}>
      <span className={strong ? "" : "text-muted"}>{k}</span>
      <span className={cn("tabular font-medium", minus && "text-risk-ink")}>{minus ? `−${v}` : v}</span>
    </div>
  );
}

export default function HomePage() {
  const d8 = seedProperties.find((p) => p.id === "prop-d8")!;
  const cork = seedProperties.find((p) => p.id === "prop-cork")!;
  const rs = illustrate(d8, 1000);
  const ln = illustrateLoan(1000, cork.loan!.ratePct, cork.loan!.months);
  const entryPct = pct(FEES.entryFeePct, 1);
  const adminPct = pct(FEES.annualAdminPct, 1);

  return (
    <>
      {/* Hero — full-bleed photography under the floating header */}
      <section className="relative -mt-[72px] overflow-hidden bg-emerald text-white">
        <div className="absolute inset-0 lg:left-auto lg:w-[62%]">
          <Image src="/images/hero-door.webp" alt="" fill priority sizes="(min-width: 1024px) 62vw, 100vw" className="object-cover object-[60%_30%]" />
          <div className="absolute inset-0 bg-gradient-to-b from-emerald/75 via-emerald/85 to-emerald lg:bg-gradient-to-r lg:from-emerald lg:via-emerald/55 lg:to-emerald/5" />
          <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-emerald to-transparent" />
        </div>
        <div className="pointer-events-none absolute -left-32 top-24 h-[420px] w-[420px] rounded-full bg-forest/50 blur-3xl" aria-hidden />
        <div className="relative mx-auto max-w-7xl px-4 pb-12 pt-[124px] sm:px-6 lg:pb-16 lg:pt-[176px]">
          <div className="grid items-end gap-12 lg:grid-cols-[1.2fr_1fr]">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="h-px w-10 bg-gold" aria-hidden />
                <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-gold">Fractional ownership of property companies</p>
              </div>
              <h1 className="mt-6 max-w-2xl font-serif text-[44px] leading-[1.02] tracking-tight sm:text-6xl lg:text-[76px]">
                Fund the return of Ireland’s <em className="text-gold not-italic">vacant homes.</em>
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/80">
                Rents are punishing and thousands of homes sit empty. Meithera lets ordinary people fund their refurbishment from €100 — with every euro, holder and payout recorded on Raya Chain and visible to the supervisor.
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <Link href="/properties" className={buttonVariants({ variant: "gold", size: "lg" })}>Explore properties <ArrowRight className="h-4 w-4" /></Link>
                <Link href="/how-it-works" className={cn(buttonVariants({ variant: "secondary", size: "lg" }), "border-white/30 bg-white/5 text-white hover:bg-white/15")}>How it works</Link>
              </div>
              <p className="mt-8 flex max-w-xl gap-2.5 text-[13px] leading-relaxed text-white/65">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden />
                <span>{RISK_WARNING}</span>
              </p>
            </div>
            <div className="flex lg:justify-end">
              <LiveChainCard />
            </div>
          </div>
          <div className="mt-12 lg:mt-20">
            <LiveStats />
            <p className="mt-3 text-[11px] text-white/45">Live from the demonstration store. All figures are illustrative and simulated.</p>
          </div>
        </div>
      </section>

      {/* Five stages */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:py-28">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading
            eyebrow="The full vision"
            title="Five stages to the Internet of Value"
            intro="Today everything is simulated. Stage 1 — secured lending through a licensed crowdfunding partner — is what we propose to launch first. Nothing beyond Stage 0 is live."
          />
          <Link href="/roadmap" className={buttonVariants({ variant: "secondary" })}>See the roadmap <ArrowRight className="h-4 w-4" /></Link>
        </div>
        <div className="relative mt-12">
          <div className="absolute left-0 right-0 top-5 hidden h-px bg-gradient-to-r from-gold via-gold/60 to-line lg:block" aria-hidden />
          <ol className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 pb-4 pt-1 sm:-mx-6 sm:scroll-px-6 sm:px-6 lg:mx-0 lg:grid lg:grid-cols-5 lg:gap-5 lg:overflow-visible lg:px-0 lg:pb-0">
            {STAGES.map((s) => (
              <li key={s.stage} className="w-[78%] shrink-0 snap-start sm:w-[44%] lg:w-auto">
                <div className="relative z-10 flex items-center gap-3">
                  <span
                    className={cn(
                      "tabular flex h-10 w-10 items-center justify-center rounded-full font-serif text-lg",
                      s.stage === 0 ? "bg-emerald text-gold ring-4 ring-mint" : s.stage === 1 ? "bg-gold text-emerald ring-4 ring-surface" : "bg-card text-emerald ring-1 ring-line-strong",
                    )}
                  >
                    {s.stage}
                  </span>
                  {s.stage === 0 ? <span className="bg-surface pr-2 font-sans text-[11px] font-semibold uppercase tracking-[0.12em] text-forest">You are here</span> : null}
                  {s.stage === 1 ? <span className="bg-surface pr-2 font-sans text-[11px] font-semibold uppercase tracking-[0.12em] text-gold-ink">Proposed first launch</span> : null}
                </div>
                <article className="mt-5 flex h-[calc(100%-3.75rem)] flex-col overflow-hidden rounded-2xl border border-line bg-card shadow-card">
                  <div className="relative aspect-[5/3] overflow-hidden">
                    <Image src={s.image} alt="" fill sizes="(min-width: 1024px) 240px, 78vw" className={cn("object-cover", s.stage >= 3 && "grayscale-[35%]")} />
                    <div className="absolute inset-0 bg-gradient-to-t from-emerald/50 to-transparent" />
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <StageBadge stage={s.stage} className="self-start" />
                    <h3 className="mt-3 font-serif text-xl leading-snug text-ink">{s.headline}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted">{s.summary}</p>
                    <p className="mt-auto pt-4 font-sans text-[11px] font-semibold uppercase tracking-[0.1em] text-muted">
                      {VARIANT_LABEL[s.variant]}
                    </p>
                  </div>
                </article>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Featured */}
      <section className="border-y border-line bg-card">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionHeading eyebrow="Illustrative opportunities" title="Vacant homes, ready for refurbishment" intro="Four fictional projects in Dublin, Cork, Galway and Limerick: two Stage 1 secured loans and two Stage 2 rent shares. None has been acquired and none is an offer." />
            <Link href="/properties" className={buttonVariants({ variant: "secondary" })}>View all properties <ArrowRight className="h-4 w-4" /></Link>
          </div>
          <div className="mt-12"><FeaturedProperties /></div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <SectionHeading eyebrow="How Meithera works" title="Four steps, each one transparent" intro="A proposed journey from discovery to reporting. In this demonstration every step is simulated." />
        <ol className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <li key={s.title} className="bg-card p-7">
              <div className="flex items-center justify-between">
                <s.icon className="h-5 w-5 text-forest" />
                <span className="tabular font-serif text-3xl text-gold">0{i + 1}</span>
              </div>
              <h3 className="mt-6 font-sans text-lg font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{s.text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Transparency — computed from finance.ts */}
      <section className="border-y border-line bg-card">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
          <div className="grid gap-12 lg:grid-cols-[0.9fr_1.6fr]">
            <div>
              <SectionHeading eyebrow="Gross to net, every time" title="What €1,000 could do — before investor-level taxes" intro={`Every opportunity walks from gross to net. The fees are the same everywhere: a ${entryPct} one-off acquisition fee and a ${adminPct} annual administration fee.`} />
              <p className="mt-6 rounded-xl border border-line bg-surface p-4 text-sm leading-relaxed text-muted">
                Property-level net operating yield (Dublin 8: <strong className="tabular text-ink">{pct(netOperatingYield(d8))}</strong>) is not your return. Fees reduce what an investor receives, and actual rent and costs may differ. Figures are illustrative and not guaranteed.
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="tabular p-6 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.1em] text-muted">{d8.location} · rent share</p>
                  <StageBadge stage={2} />
                </div>
                <div className="mt-4">
                  <Row k="Amount entered" v={eur(rs.amount, 2)} />
                  <Row k={`Acquisition fee (${entryPct})`} v={eur(rs.entryFee, 2)} minus />
                  <Row k="Net invested in the company" v={eur(rs.netInvested, 2)} strong />
                  <Row k="Share of gross rent" v={eur(rs.grossRentShare, 2)} />
                  <Row k="Share of operating costs" v={eur(rs.opexShare, 2)} minus />
                  <Row k="Share of net operating income" v={eur(rs.noiShare, 2)} />
                  <Row k={`Administration fee (${adminPct} p.a.)`} v={eur(rs.adminFee, 2)} minus />
                </div>
                <div className="flex items-baseline justify-between pt-4">
                  <span className="font-sans font-semibold text-emerald">Illustrative annual income</span>
                  <span className="font-serif text-3xl text-emerald">{eur(rs.annualIncome, 2)}</span>
                </div>
                <p className="mt-1 text-right text-xs text-muted">≈ {eur(rs.monthlyIncome, 2)} a month, paid monthly</p>
              </Card>
              <Card className="tabular p-6 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.1em] text-muted">{cork.location} · secured loan</p>
                  <StageBadge stage={1} />
                </div>
                <div className="mt-4">
                  <Row k="Amount entered" v={eur(ln.amount, 2)} />
                  <Row k={`Acquisition fee (${entryPct})`} v={eur(ln.entryFee, 2)} minus />
                  <Row k="Net lent" v={eur(ln.netLent, 2)} strong />
                  <Row k={`Interest at ${ln.ratePct}% p.a.`} v={eur(ln.monthlyInterest * 12, 2)} />
                  <Row k={`Administration fee (${adminPct} p.a.)`} v={eur(ln.adminFeeMonthly * 12, 2)} minus />
                  <Row k="Term" v={`${ln.months} months`} />
                  <Row k="Principal returned at maturity" v={eur(ln.netLent, 2)} />
                </div>
                <div className="flex items-baseline justify-between pt-4">
                  <span className="font-sans font-semibold text-emerald">Illustrative annual interest</span>
                  <span className="font-serif text-3xl text-emerald">{eur(ln.monthlyNet * 12, 2)}</span>
                </div>
                <p className="mt-1 text-right text-xs text-muted">≈ {eur(ln.monthlyNet, 2)} a month · {eur(ln.totalNet, 2)} over the term</p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Why Irish property */}
      <section className="relative overflow-hidden bg-emerald text-white">
        <div className="absolute inset-y-0 right-0 hidden w-[38%] lg:block">
          <Image src="/images/street.webp" alt="" fill sizes="38vw" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-emerald via-emerald/40 to-transparent" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:py-24">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3"><span className="h-px w-10 bg-gold" aria-hidden /><p className="font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-gold">Why Irish property?</p></div>
            <h2 className="mt-4 font-serif text-4xl leading-tight sm:text-5xl">The case — and the caveats.</h2>
            <p className="mt-4 max-w-xl text-white/75">We present both sides. Property can provide income, but it is illiquid, can lose value and returns are never guaranteed.</p>
            <div className="mt-10 grid gap-px overflow-hidden rounded-2xl bg-white/10 sm:grid-cols-2">
              {why.map(([t, d], i) => (
                <div key={t} className="bg-emerald/90 p-6">
                  <span className="tabular font-serif text-xl text-gold">0{i + 1}</span>
                  <h3 className="mt-2 font-sans font-semibold">{t}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-white/70">{d}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Impact */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <SectionHeading eyebrow="Supporting Ireland’s housing future" title="Finance aimed at bringing homes back into use" intro="The goals below describe what the proposed model is designed to support. They are projections, not achieved results." />
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {impact.map((c) => (
            <Card key={c.title} className="p-7">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-mint text-emerald"><c.icon className="h-5 w-5" /></span>
              <h3 className="mt-5 font-sans text-lg font-semibold">{c.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{c.text}</p>
            </Card>
          ))}
        </div>
        <Link href="/impact" className={buttonVariants({ variant: "ghost", className: "mt-6" })}>Read about impact <ArrowRight className="h-4 w-4" /></Link>
      </section>

      {/* Raya Chain & protections */}
      <section className="border-y border-line bg-card">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
          <SectionHeading eyebrow="Raya Chain · recordkeeping" title="Built for investor protection from the first line of code" intro="A token records the holding — it is not legal title. Raya Chain mirrors the register today and could become the official register only at Stage 4." />
          <div className="mt-5 flex flex-wrap gap-2">
            <StageBadge stage={0} detail />
            <StageBadge stage={4} detail />
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {tech.map((t) => (
              <div key={t.title} className="rounded-2xl border border-line bg-surface p-6">
                <t.icon className="h-6 w-6 text-forest" />
                <h3 className="mt-4 font-sans font-semibold">{t.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{t.text}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/chain" className={buttonVariants()}><Boxes className="h-4 w-4" /> Open the Raya Chain explorer</Link>
            <Link href="/regulatory-demo" className={buttonVariants({ variant: "secondary" })}><ShieldCheck className="h-4 w-4" /> Regulatory demonstration</Link>
            <Link href="/compliance" className={buttonVariants({ variant: "ghost" })}><Landmark className="h-4 w-4" /> Regulatory readiness</Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-4xl px-4 pb-8 pt-20 sm:px-6">
        <SectionHeading eyebrow="Frequently asked questions" title="Plain answers" center />
        <div className="mt-8"><FaqList items={faqs.slice(0, 5)} /></div>
        <div className="mt-4 text-center"><Link href="/faq" className={buttonVariants({ variant: "ghost" })}>All questions <ArrowRight className="h-4 w-4" /></Link></div>
      </section>

      {/* Register */}
      <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        <Card className="p-6 sm:p-10">
          <SectionHeading eyebrow="Register interest" title="Follow Meithera’s progress" intro="Tell us which group you belong to. This demonstration form does not send or store anything." />
          <div className="mt-6"><RegisterInterest /></div>
        </Card>
      </section>
    </>
  );
}
