import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Search, FileCheck2, PiggyBank, LineChart, Vote, Store, Home, Building2, UserRound, FileText, Link2 } from "lucide-react";
import { Card, buttonVariants } from "@/components/ui";
import { PageHeader, RiskNotice, SectionHeading } from "@/components/site/notices";
import { StageBadge, StageStrip } from "@/components/site/stage-badge";
import { RentShareExample, LoanExample } from "@/components/site/example-walk";
import { STAGE_LIST } from "@/lib/stages";

export const metadata: Metadata = { title: "How it works" };

const steps = [
  { icon: Search, title: "Explore", text: "Browse illustrative vacant-home projects: full cost, rent and risk breakdowns and a digital passport for each home." },
  { icon: FileCheck2, title: "Onboard", text: "Identity, AML, classification, a short knowledge test and a loss-bearing simulation — performed by an authorised provider in a live service." },
  { icon: PiggyBank, title: "Participate", text: "Lend to a refurbishment (Stage 1) or hold notes in the company that owns a home (Stage 2), from €100." },
  { icon: LineChart, title: "Track", text: "Monthly income, documents, the home’s passport and every record on Raya Chain — the same record the supervisor sees." },
];

export default function HowItWorksPage() {
  return (
    <>
      <PageHeader eyebrow="How it works" title="What you would own, and what you would not" intro="Meithera is “blockchain-based fractional ownership of property companies”. You would hold notes in the company that owns a home, or a participation in a loan secured on it — never the house itself. A Raya Chain token records the holding; it is not title.">
        <StageStrip className="mt-6" />
      </PageHeader>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <SectionHeading eyebrow="The journey" title="Four steps, each one transparent" />
        <ol className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <li key={s.title} className="relative rounded-2xl border border-line bg-card p-6">
              <span className="tabular absolute right-5 top-5 font-sans text-sm font-bold text-gold-ink">0{i + 1}</span>
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-mint text-emerald"><s.icon className="h-5 w-5" /></span>
              <h3 className="mt-4 font-sans text-lg font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{s.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="border-y border-line bg-card">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <SectionHeading eyebrow="The structure" title="One company per home" intro="The SPV diagram: what you own versus what the company owns. Legal rights depend on the final instrument and structure, which remain subject to legal and regulatory review." />
          <div className="mt-10 grid gap-4 lg:grid-cols-[1fr_auto_1fr_auto_1fr]">
            <Card className="p-6 text-center">
              <UserRound className="mx-auto h-8 w-8 text-forest" />
              <p className="mt-3 font-sans text-lg font-semibold">You</p>
              <p className="mt-1 text-sm text-muted">Hold notes issued by the home’s company. Economic rights: a share of net rent and sale proceeds, and a vote on selling.</p>
              <StageBadge stage={2} compact className="mt-3" />
            </Card>
            <div className="flex items-center justify-center text-muted"><ArrowRight className="h-6 w-6 rotate-90 lg:rotate-0" /></div>
            <Card className="border-emerald bg-emerald p-6 text-center text-white">
              <Building2 className="mx-auto h-8 w-8 text-gold" />
              <p className="mt-3 font-sans text-lg font-semibold">The home’s company (Irish DAC)</p>
              <p className="mt-1 text-sm text-white/80">Owns the home outright. Holds the tenancy, the insurance and the obligations. Issues the notes. Pays the net rent monthly.</p>
            </Card>
            <div className="flex items-center justify-center text-muted"><ArrowRight className="h-6 w-6 rotate-90 lg:rotate-0" /></div>
            <Card className="p-6 text-center">
              <Home className="mx-auto h-8 w-8 text-forest" />
              <p className="mt-3 font-sans text-lg font-semibold">The home</p>
              <p className="mt-1 text-sm text-muted">Legal title stays with the company. Registered with Tailte Éireann in the company’s name — not yours, not Meithera’s.</p>
            </Card>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <Card className="p-5 text-sm"><p className="flex items-center gap-2 font-sans font-semibold"><FileText className="h-4 w-4 text-forest" /> The note</p><p className="mt-1 text-muted">A profit-participating note (proposed). Transfer-restricted; only to verified holders.</p></Card>
            <Card className="p-5 text-sm"><p className="flex items-center gap-2 font-sans font-semibold"><Link2 className="h-4 w-4 text-forest" /> The token</p><p className="mt-1 text-muted">A Raya Chain record of the note under a pseudonymous holder ID. It mirrors the register (Stage 2); it could become the register (Stage 4).</p></Card>
            <Card className="p-5 text-sm"><p className="flex items-center gap-2 font-sans font-semibold"><Vote className="h-4 w-4 text-forest" /> Exit</p><p className="mt-1 text-muted">An investor vote on sale, or an ECSPR bulletin board where holders may advertise an interest — not a market, no guaranteed buyer.</p></Card>
          </div>
          <p className="mt-6 text-sm text-muted">In <strong>Stage 1</strong> the picture is simpler: you lend to the project owner, secured by a first legal charge held by a security trustee, and receive fixed interest. You do not hold shares or notes.</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <SectionHeading eyebrow="Gross to net" title="The two examples, computed" intro="Both figures come from the same finance engine as the calculators. Nothing on this page is hard-coded." />
        <div className="mt-10 grid gap-6 lg:grid-cols-2"><LoanExample /><RentShareExample /></div>
      </section>

      <section className="border-y border-line bg-card">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <SectionHeading eyebrow="Over time" title="Five stages" intro="The full vision and the staged path. Only Stage 0 exists today." />
          <ol className="mt-8 grid gap-4 md:grid-cols-5">
            {STAGE_LIST.map((s) => <li key={s.n} className="rounded-2xl border border-line bg-surface p-5"><StageBadge stage={s.n} compact /><p className="mt-2 text-sm text-muted">{s.summary}</p></li>)}
          </ol>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/roadmap" className={buttonVariants()}>Roadmap <ArrowRight className="h-4 w-4" /></Link>
            <Link href="/invest" className={buttonVariants({ variant: "secondary" })}><Store className="h-4 w-4" /> Try a simulation</Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6"><RiskNotice /></section>
    </>
  );
}
