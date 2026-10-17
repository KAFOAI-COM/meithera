import Link from "next/link";
import {
  ArrowRight, Building2, Home, Users, FileBarChart2, Search, FileCheck2, PiggyBank, LineChart, ShieldCheck, Lock, Database, Fingerprint, Landmark, ScrollText,
} from "lucide-react";
import { buttonVariants, Card } from "@/components/ui";
import { HeroArt } from "@/components/site/hero-art";
import { FeaturedProperties } from "@/components/site/live-properties";
import { FaqList, faqs } from "@/components/site/faq-list";
import { RegisterInterest } from "@/components/site/register-interest";
import { RiskNotice, SectionHeading } from "@/components/site/notices";

const steps = [
  { icon: Search, title: "Explore", text: "Browse illustrative refurbishment projects with full cost, rent and risk breakdowns." },
  { icon: FileCheck2, title: "Onboard", text: "Complete (simulated) identity, AML and appropriateness steps before any investment." },
  { icon: PiggyBank, title: "Participate", text: "Simulate an investment from €100 into the SPV that would hold the property." },
  { icon: LineChart, title: "Track", text: "Follow illustrative rental distributions, documents and project milestones." },
];

const impact = [
  { icon: Home, title: "Restore Vacant Homes", text: "Support investment models aimed at returning unused properties to residential use." },
  { icon: Users, title: "Accessible Participation", text: "Explore property investments without purchasing an entire property." },
  { icon: FileBarChart2, title: "Transparent Reporting", text: "Understand investment costs, risks, projected income and performance." },
];

const why = [
  ["Persistent demand", "Ireland’s rental market has experienced sustained demand relative to supply."],
  ["Under-used stock", "Vacant and derelict homes represent housing that could return to use with refurbishment finance."],
  ["Income-focused", "Residential property can generate rental income — though it can fall, and properties can sit empty."],
  ["Real assets, real risks", "Values can fall, works can overrun and your money may be tied up for years."],
];

const tech = [
  { icon: Fingerprint, title: "Identity-first onboarding", text: "Designed around verification by an authorised partner before any participation." },
  { icon: Database, title: "Off-chain legal register", text: "The official investor register stays off-chain; any ledger is a reconciled mirror." },
  { icon: Lock, title: "Transfer restrictions", text: "Entitlement records carry lock-ups and verified-recipient checks by design." },
  { icon: ScrollText, title: "Tamper-evident audit", text: "Every material action is written to a hash-chained audit log." },
];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:py-20">
          <div>
            <p className="font-sans text-xs font-semibold uppercase tracking-[0.08em] text-gold-ink">Own a Share. Build Ireland’s Future.</p>
            <h1 className="mt-4 font-serif text-5xl font-medium leading-[1.05] tracking-tight text-ink sm:text-6xl">
              Property Investment. <span className="text-forest">Made More Accessible.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
              Explore a new approach to investing in Irish property, designed to make participation more accessible while supporting the refurbishment of vacant homes.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/properties" className={buttonVariants({ size: "lg" })}>Explore Properties <ArrowRight className="h-4 w-4" /></Link>
              <Link href="/how-it-works" className={buttonVariants({ variant: "secondary", size: "lg" })}>How It Works</Link>
            </div>
            <RiskNotice className="mt-8 max-w-xl" />
          </div>
          <div className="relative">
            <div className="aspect-[56/46] overflow-hidden rounded-3xl shadow-raised">
              <HeroArt />
            </div>
            <Card className="absolute -bottom-6 left-4 hidden w-64 p-4 sm:block">
              <p className="font-sans text-xs font-semibold uppercase tracking-[0.08em] text-muted">Illustrative participation</p>
              <p className="tabular mt-1 font-sans text-2xl font-bold text-emerald">from €100</p>
              <p className="text-xs text-muted">Demonstration figure only</p>
            </Card>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-y border-line bg-card">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <SectionHeading eyebrow="How Meithera works" title="Four steps, each one transparent" intro="A proposed journey from discovery to reporting. In this demonstration every step is simulated." />
          <ol className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s, i) => (
              <li key={s.title} className="relative rounded-2xl border border-line bg-surface p-6">
                <span className="tabular absolute right-5 top-5 font-sans text-sm font-bold text-gold-ink">0{i + 1}</span>
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-mint text-emerald"><s.icon className="h-5 w-5" /></span>
                <h3 className="mt-4 font-sans text-lg font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{s.text}</p>
              </li>
            ))}
          </ol>
          <Link href="/how-it-works" className={buttonVariants({ variant: "ghost", className: "mt-6" })}>See the full structure <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </section>

      {/* Featured */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading eyebrow="Featured investment opportunities" title="Illustrative refurbishment projects" intro="Four fictional properties across Dublin, Cork, Galway and Limerick. None has been acquired; none is an offer." />
          <Link href="/properties" className={buttonVariants({ variant: "secondary" })}>View all properties <ArrowRight className="h-4 w-4" /></Link>
        </div>
        <div className="mt-10"><FeaturedProperties /></div>
      </section>

      {/* Why Irish property */}
      <section className="bg-emerald text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_1.4fr]">
          <div>
            <p className="font-sans text-xs font-semibold uppercase tracking-[0.08em] text-gold">Why invest in Irish property?</p>
            <h2 className="mt-2 font-serif text-4xl font-medium">The case — and the caveats</h2>
            <p className="mt-4 text-white/80">We present both sides. Property can provide income, but it is illiquid, can lose value and returns are never guaranteed.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {why.map(([t, d]) => (
              <div key={t} className="rounded-2xl bg-white/8 p-6 ring-1 ring-white/15">
                <Building2 className="h-5 w-5 text-gold" />
                <h3 className="mt-3 font-sans font-semibold">{t}</h3>
                <p className="mt-2 text-sm text-white/75">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <SectionHeading eyebrow="Supporting Ireland’s housing future" title="Finance aimed at bringing homes back into use" intro="The goals below describe what the proposed model is designed to support. They are not achieved results." />
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {impact.map((c) => (
            <Card key={c.title} className="p-6">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-mint text-emerald"><c.icon className="h-5 w-5" /></span>
              <h3 className="mt-4 font-sans text-lg font-semibold">{c.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{c.text}</p>
            </Card>
          ))}
        </div>
        <Link href="/impact" className={buttonVariants({ variant: "ghost", className: "mt-6" })}>Read about impact <ArrowRight className="h-4 w-4" /></Link>
      </section>

      {/* Transparency */}
      <section className="border-y border-line bg-card">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2">
          <SectionHeading eyebrow="Investment transparency" title="Every euro accounted for, gross to net" intro="Each opportunity shows acquisition, refurbishment, legal costs and contingency, and walks from gross rent to the illustrative amount an investor might receive — before investor-level taxes." />
          <Card className="tabular p-6 text-sm">
            <p className="font-sans text-xs font-semibold uppercase tracking-[0.08em] text-muted">Example — Dublin 8, per €1,000 entered</p>
            {[
              ["Amount entered", "€1,000.00"],
              ["Less illustrative entry fee (1.5%)", "−€15.00"],
              ["Net invested in SPV", "€985.00"],
              ["Share of gross rent", "€81.52"],
              ["Less share of operating costs", "−€20.38"],
              ["Share of net operating income", "€61.14"],
              ["Less illustrative management fee (1%)", "−€9.85"],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between border-b border-line py-2"><span className="text-muted">{k}</span><span className="font-medium">{v}</span></div>
            ))}
            <div className="flex justify-between py-3 font-sans text-base font-bold text-emerald"><span>Illustrative annual income*</span><span>€51.29</span></div>
            <p className="text-xs text-muted">*Before investor-level taxes. Not guaranteed. Figures are illustrative.</p>
          </Card>
        </div>
      </section>

      {/* Technology */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <SectionHeading eyebrow="Technology and security" title="Built for investor protection from the first line of code" />
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {tech.map((t) => (
            <Card key={t.title} className="p-6">
              <t.icon className="h-6 w-6 text-forest" />
              <h3 className="mt-3 font-sans font-semibold">{t.title}</h3>
              <p className="mt-2 text-sm text-muted">{t.text}</p>
            </Card>
          ))}
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/regulatory-demo" className={buttonVariants()}><ShieldCheck className="h-4 w-4" /> Open the regulatory demonstration</Link>
          <Link href="/compliance" className={buttonVariants({ variant: "secondary" })}><Landmark className="h-4 w-4" /> Regulatory readiness</Link>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
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
