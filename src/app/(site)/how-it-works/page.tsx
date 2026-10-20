import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, X } from "lucide-react";
import { buttonVariants } from "@/components/ui";
import { PageHeader, SectionHeading, RiskNotice } from "@/components/site/notices";
import { FlowDiagram } from "@/components/site/flow-diagram";
import { StageBadge } from "@/components/site/stage-badge";
import { FEES } from "@/lib/finance";
import { pct } from "@/lib/utils";

export const metadata: Metadata = { title: "How it works" };

const youOwn = [
  "Notes (Stage 2) or a loan participation (Stage 1) issued by the property company",
  "A right to a share of net rental income, or to fixed interest and repayment",
  "A vote on selling the home at the end of the holding period (Stage 2, proposed)",
  "A pseudonymous holding recorded on Raya Chain, mirroring the official register",
];
const companyOwns = [
  "Legal title to the home",
  "The tenancy, insurance, maintenance and compliance obligations",
  "The bank account that receives rent, run by an authorised partner",
  "The contracts with builders, managers and service providers",
];
const notYours = ["You do not own part of the house", "You cannot live in or use the home", "A token is a record of a holding — not title to property"];

const compare: [string, string, string][] = [
  ["What you hold", "A share of one secured loan", "Notes in the company that owns the home"],
  ["Income", "Fixed interest, paid monthly", "Share of net rent, paid monthly"],
  ["Term", "12–24 months", "5–8 years (indicative)"],
  ["Security", "First legal charge over the home", "No charge — you share in the company’s results"],
  ["Upside if values rise", "None — interest is fixed", "Share of sale proceeds (after costs)"],
  ["Main risks", "Borrower default, delay, enforcement", "Vacancy, costs, valuation, long hold"],
  ["Exit", "Repaid at maturity", "Vote on sale; ECSPR bulletin board before then"],
  ["Legal basis (proposed)", "ECSPR, via a licensed partner", "ECSPR, subject to structure review"],
];

const lifecycle = [
  ["Find", "A vacant or derelict home is sourced, surveyed and costed. Its passport begins on Raya Chain."],
  ["Fund", "Investors complete onboarding and a knowledge test, read the key information sheet and wait out a 4-day reflection period."],
  ["Refurbish", "Works are milestone-tracked; contingency is held for overruns; the energy rating is re-certified."],
  ["Let", "The home is let on a standard residential tenancy, managed by a professional property manager."],
  ["Pay out", "Monthly interest or net rent goes to holders, net of fees, each payment recorded on the chain."],
  ["Exit", "Loans are repaid at maturity. Rent-share holders vote on a sale — or, at Stage 3, the tenant buys them out."],
];

export default function HowItWorksPage() {
  return (
    <>
      <PageHeader
        image="/images/reno.webp"
        eyebrow="How it works"
        title="Ordinary people funding real homes — through a company, not a deed"
        intro="Each home sits in its own property company. You fund the company, by lending to it or holding its notes, and the company owns, refurbishes and lets the home."
      >
        <div className="mt-7 flex flex-wrap gap-2"><StageBadge stage={1} detail /><StageBadge stage={2} detail /></div>
      </PageHeader>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <SectionHeading eyebrow="The structure" title="Where the money goes, and how it comes back" intro="Gold shows money going in; green shows income coming back. Switch between the two offer types." />
        <div className="mt-10"><FlowDiagram /></div>
      </section>

      <section className="border-y border-line bg-card">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
          <SectionHeading eyebrow="Ownership, precisely" title="What you own vs what the company owns" intro="Blockchain-based fractional ownership of property companies — not of houses." />
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-gold/50 bg-[#fbf7ef] p-7">
              <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-gold-ink">You hold</p>
              <ul className="mt-5 space-y-3.5">{youOwn.map((t) => <li key={t} className="flex gap-3 text-sm leading-relaxed text-ink"><Check className="mt-0.5 h-4 w-4 shrink-0 text-forest" />{t}</li>)}</ul>
            </div>
            <div className="rounded-2xl bg-emerald p-7 text-white">
              <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-gold">The property company holds</p>
              <ul className="mt-5 space-y-3.5">{companyOwns.map((t) => <li key={t} className="flex gap-3 text-sm leading-relaxed text-white/85"><Check className="mt-0.5 h-4 w-4 shrink-0 text-gold" />{t}</li>)}</ul>
            </div>
          </div>
          <ul className="mt-6 flex flex-wrap gap-3">
            {notYours.map((t) => <li key={t} className="inline-flex items-center gap-2 rounded-full bg-risk px-4 py-2 text-sm font-medium text-risk-ink"><X className="h-4 w-4" />{t}</li>)}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <SectionHeading eyebrow="Two ways in" title="Secured loan or rent share" intro={`Both carry the same fees: ${pct(FEES.entryFeePct, 1)} one-off acquisition fee and ${pct(FEES.annualAdminPct, 1)} annual administration fee. Both pay monthly. Both can lose money.`} />
        <div className="mt-10 overflow-x-auto rounded-2xl border border-line bg-card">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-line">
                <th className="w-1/4 p-5 text-left font-sans text-[11px] font-semibold uppercase tracking-[0.1em] text-muted" />
                <th className="p-5 text-left"><StageBadge stage={1} /><p className="mt-2 font-serif text-xl text-ink">Secured loan</p></th>
                <th className="p-5 text-left"><StageBadge stage={2} /><p className="mt-2 font-serif text-xl text-ink">Rent share</p></th>
              </tr>
            </thead>
            <tbody>
              {compare.map(([k, a, b]) => (
                <tr key={k} className="border-b border-line last:border-0">
                  <th className="p-5 text-left align-top font-sans text-xs font-semibold uppercase tracking-wide text-muted">{k}</th>
                  <td className="p-5 align-top text-ink">{a}</td>
                  <td className="p-5 align-top text-ink">{b}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="border-y border-line bg-card">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
          <SectionHeading eyebrow="The lifecycle" title="From vacant to lived-in" />
          <ol className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
            {lifecycle.map(([t, d], i) => (
              <li key={t} className="bg-surface p-7">
                <span className="tabular font-serif text-3xl text-gold">0{i + 1}</span>
                <h3 className="mt-3 font-sans text-lg font-semibold text-ink">{t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{d}</p>
              </li>
            ))}
          </ol>
          <RiskNotice className="mt-8 max-w-2xl" />
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/properties" className={buttonVariants()}>Explore properties <ArrowRight className="h-4 w-4" /></Link>
            <Link href="/roadmap" className={buttonVariants({ variant: "secondary" })}>The five-stage roadmap</Link>
          </div>
        </div>
      </section>
    </>
  );
}
