import Link from "next/link";
import { ArrowUpRight, ShieldCheck, Landmark, Link2, Coins, Globe2, CircleHelp } from "lucide-react";
import { STAGE_LIST, STAGES } from "@/lib/stages";
import { ROADMAP } from "@/lib/roadmap";
import { ECSPR, FEES, illustrate, illustrateLoan, staircase } from "@/lib/finance";
import { seedProperties } from "@/lib/data/properties";
import { eur, pct } from "@/lib/utils";
import { StageStrip } from "@/components/site/stage-badge";
import { RISK_WARNING } from "@/components/site/notices";

export interface Slide {
  id: string;
  title: string;
  kicker: string;
  stage: 0 | 1 | 2 | 3 | 4;
  body: React.ReactNode;
  notes: string;
  deepLink?: { href: string; label: string };
}

function DeepLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} target="_blank" rel="noopener" className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-gold px-5 font-sans text-base font-semibold text-emerald hover:bg-gold/85">
      {label} <ArrowUpRight className="h-5 w-5" />
    </Link>
  );
}

function Stat({ big, small }: { big: string; small: string }) {
  return (
    <div className="rounded-2xl bg-white/8 p-6 ring-1 ring-white/15">
      <p className="font-serif text-4xl text-white sm:text-5xl">{big}</p>
      <p className="mt-2 text-sm text-white/75">{small}</p>
    </div>
  );
}

const d8 = seedProperties.find((p) => p.id === "prop-d8")!;
const cork = seedProperties.find((p) => p.id === "prop-cork")!;
const ex = illustrate(d8, 1000);
const loan = illustrateLoan(1000, cork.loan!.ratePct, cork.loan!.termMonths);
const stairs = staircase({ valuation: d8.valuation, marketMonthlyRent: d8.annualRent / 12, startPct: 0.05, yearlyTopUp: 12000, years: 5 });

export const SLIDES: Slide[] = [
  {
    id: "problem",
    kicker: "1 · The problem",
    title: "Irish people can’t buy, rents punish, and homes sit empty.",
    stage: 0,
    body: (
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat big="~166,000" small="vacant dwellings counted in Census 2022 (CSO) — homes that exist but house nobody." />
        <Stat big="Record rents" small="Standardised rents at historic highs (RTB rent index); affordability for first-time buyers at a low." />
        <Stat big="Small savers" small="Property wealth is built by those who can already buy. Everyone else pays rent to them." />
      </div>
    ),
    notes: "Open on the human problem. Three facts, no jargon. We are not here to sell a token; we are here to add housing supply and let ordinary people take part. Cite the Census figure and the RTB index; do not quote precise rent euros.",
  },
  {
    id: "mission",
    kicker: "2 · The mission",
    title: "Let ordinary people fund new supply, in small amounts, with every euro visible.",
    stage: 0,
    body: (
      <div className="space-y-6">
        <p className="max-w-3xl text-xl leading-relaxed text-white/85">
          Meithera lets people fund the refurbishment of vacant homes from <strong className="text-white">€100</strong>, through an EU crowdfunding licence (ECSPR), with every euro, holder and payout recorded on <strong className="text-white">Raya Chain</strong> and visible to the supervisor. Over time, tenants can buy into the home they live in.
        </p>
        <div className="flex flex-wrap gap-3 text-sm text-white/75">
          <span className="rounded-full bg-white/10 px-3 py-1">Raya Software Limited · incorporated in Ireland (CRO)</span>
          <span className="rounded-full bg-white/10 px-3 py-1">Blockchain-based fractional ownership of property companies</span>
          <span className="rounded-full bg-white/10 px-3 py-1">Not authorised or regulated by the Central Bank of Ireland</span>
        </div>
      </div>
    ),
    notes: "Read the mission once, slowly. Emphasise 'property companies' — investors hold notes in the company that owns the home, never the house. Say plainly that nothing here is authorised and that we're seeking guidance on the route.",
  },
  {
    id: "vision",
    kicker: "3 · The full vision",
    title: "Five stages on one journey.",
    stage: 4,
    body: (
      <div className="space-y-5">
        <StageStrip className="[&_span]:!bg-white/15 [&_span]:!text-white" />
        <ol className="grid gap-3 md:grid-cols-5">
          {STAGE_LIST.map((s) => (
            <li key={s.n} className="rounded-2xl bg-white/8 p-4 ring-1 ring-white/15">
              <p className="font-sans text-xs font-semibold uppercase tracking-wide text-gold">Stage {s.n}</p>
              <p className="mt-1 font-sans text-lg font-semibold text-white">{s.name}</p>
              <p className="mt-1 text-xs text-white/70">{s.basisLabel}</p>
              <p className="mt-2 text-sm leading-snug text-white/80">{s.summary}</p>
            </li>
          ))}
        </ol>
      </div>
    ),
    notes: "Walk left to right in 60 seconds: Demo today → Lending (launchable under ECSPR via a partner) → Rent share (Bricks/Stake model) → Tenant to owner (needs more permissions) → Internet of Value (depends on the DLT Pilot reform). Then say: now we walk back down to what can launch first.",
  },
  {
    id: "live-invest",
    kicker: "4 · Live",
    title: "An investor funds a vacant home.",
    stage: 1,
    deepLink: { href: "/invest/prop-cork", label: "Open the Cork loan simulation" },
    body: (
      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <div className="space-y-3 text-white/85">
          <p className="text-lg">Cork City terrace, vacant since 2019. A secured refurbishment loan of {eur(cork.loan!.amount)} at {cork.loan!.ratePct}% fixed over {cork.loan!.termMonths} months, first legal charge, borrower pays the arrangement fee.</p>
          <ul className="space-y-1.5 text-sm">
            <li>· Amount → simulated onboarding (ID, AML, classification, 5-question test, loss simulation)</li>
            <li>· Risk acknowledgement with the exact warning, plus the €1,000 / 5% warning when triggered</li>
            <li>· Review with a KIIS-style sheet and the 4-day reflection period</li>
            <li>· Confirmation: “No real money has been transferred. No securities or tokens have been issued.”</li>
          </ul>
        </div>
        <div className="rounded-2xl bg-white/8 p-5 ring-1 ring-white/15">
          <p className="font-sans text-xs font-semibold uppercase tracking-wide text-gold">Per €1,000 lent (illustrative)</p>
          <dl className="tabular mt-3 space-y-2 text-sm text-white/85">
            <div className="flex justify-between"><dt>Monthly interest</dt><dd className="font-semibold text-white">{eur(loan.monthlyInterest, 2)}</dd></div>
            <div className="flex justify-between"><dt>Total interest, {loan.months} months</dt><dd className="font-semibold text-white">{eur(loan.totalInterest, 2)}</dd></div>
            <div className="flex justify-between"><dt>Principal at term</dt><dd className="font-semibold text-white">{eur(loan.amount, 2)}</dd></div>
            <div className="flex justify-between"><dt>Lender fee</dt><dd className="font-semibold text-white">€0.00</dd></div>
          </dl>
          <p className="mt-3 text-xs text-white/60">Before investor-level taxes; assumes no default. Capital at risk.</p>
        </div>
      </div>
    ),
    notes: "Click the gold button (opens a new tab, already logged in as Administrator). Enter €2,500 so the €1,000/5% warning fires. Run the ID and AML buttons, answer the test, tick the loss acknowledgement. Show the KIIS card and the reflection notice. Complete. Point at the Raya Chain tx id. Come back to this tab.",
  },
  {
    id: "live-chain",
    kicker: "5 · Live",
    title: "The Raya Chain record.",
    stage: 2,
    deepLink: { href: "/chain", label: "Open the Raya Chain explorer" },
    body: (
      <div className="grid gap-6 lg:grid-cols-3">
        {[
          [Link2, "One master record", "Blocks, Merkle roots, hash links. Every investment, payout, repayment, freeze and correction is a transaction with the compliance rule it passed or failed."],
          [ShieldCheck, "Rules travel with the asset", "Verified-wallet allowlist: a transfer to an unverified wallet is rejected and recorded with its reason code. Freeze and court-ordered correction have reason codes too."],
          [Globe2, "Proofs travel, the record doesn’t", "Every third block’s root is anchored to illustrative Chain B and Chain C and acknowledged back. ‘Verify chain’ recomputes everything in the browser."],
        ].map(([Icon, t, d]) => {
          const I = Icon as typeof Link2;
          return (
            <div key={t as string} className="rounded-2xl bg-white/8 p-5 ring-1 ring-white/15">
              <I className="h-6 w-6 text-gold" />
              <p className="mt-3 font-sans text-lg font-semibold text-white">{t as string}</p>
              <p className="mt-2 text-sm text-white/80">{d as string}</p>
            </div>
          );
        })}
      </div>
    ),
    notes: "Open the explorer. The new ISSUE tx is at the top of the feed. Click it: pseudonymous holder, units, rule evaluated, hash. Go to Verify & controls: click Verify chain (green), then 'Try a transfer to an unverified wallet' (red, reason code RECIPIENT_UNVERIFIED). Show Anchors. Say: this is a bank's audit console, not a trading explorer.",
  },
  {
    id: "live-supervisor",
    kicker: "6 · Live",
    title: "What a supervisor could see.",
    stage: 2,
    deepLink: { href: "/supervisor", label: "Open the supervisor view" },
    body: (
      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <ul className="grid gap-2 text-sm text-white/85 sm:grid-cols-2">
          {["Raised per SPV against the €5m ECSPR cap", "Investors by classification; knowledge-test pass rate", "€1,000 / 5% warnings shown", "Reflection-period withdrawals", "AML alerts and frozen holdings", "Complaints and their status", "Audit log hash-chain status", "Raya Chain transaction feed", "CSV / JSON export"].map((t) => (
            <li key={t} className="rounded-xl bg-white/8 px-3 py-2 ring-1 ring-white/15">· {t}</li>
          ))}
        </ul>
        <div className="rounded-2xl border border-gold/50 bg-gold/15 p-5 text-white/90">
          <p className="font-sans font-semibold text-gold">Illustrative supervisory view — not a Central Bank system</p>
          <p className="mt-2 text-sm">A read-only window an authorised ECSP could give its supervisor. The question for the Hub: is this the kind of transparency that would make a small-ticket, high-volume platform easier to supervise?</p>
        </div>
      </div>
    ),
    notes: "Open the supervisor view. Point at: the cap bar (tiny — €5m is a long way off), the warning count that just went up by one, the frozen Cork holding, the two complaints, the audit chain tick. Export JSON to show it is all data. Ask the question on the slide.",
  },
  {
    id: "rent-share",
    kicker: "7 · Stage 2",
    title: "Rent share and monthly payouts.",
    stage: 2,
    body: (
      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <div className="space-y-3 text-white/85">
          <p className="text-lg">One company per home. Investors hold notes in it and share the net rent monthly. An investor vote decides on a sale; an ECSPR bulletin board allows early exit without promising liquidity.</p>
          <p className="text-sm text-white/70">Fees as submitted to the Innovation Hub: {pct(FEES.entryFeePct, 1)} acquisition (one-off) and {pct(FEES.annualAdminPct, 1)} a year administration. Always shown gross → net, before investor-level taxes.</p>
        </div>
        <div className="rounded-2xl bg-white/8 p-5 ring-1 ring-white/15">
          <p className="font-sans text-xs font-semibold uppercase tracking-wide text-gold">Dublin 8, per €1,000 entered (computed)</p>
          <dl className="tabular mt-3 space-y-1.5 text-sm text-white/85">
            <div className="flex justify-between"><dt>Net invested after {pct(FEES.entryFeePct, 1)}</dt><dd>{eur(ex.netInvested, 2)}</dd></div>
            <div className="flex justify-between"><dt>Share of net operating income</dt><dd>{eur(ex.noiShare, 2)}</dd></div>
            <div className="flex justify-between"><dt>Less {pct(FEES.annualAdminPct, 1)} administration</dt><dd>−{eur(ex.adminFee, 2)}</dd></div>
            <div className="flex justify-between border-t border-white/20 pt-2 font-semibold text-white"><dt>Annual income*</dt><dd>{eur(ex.annualIncome, 2)} · {eur(ex.monthlyIncome, 2)}/month</dd></div>
            <div className="flex justify-between text-xs text-white/60"><dt>Property NOI yield → investor yield</dt><dd>{pct(ex.propertyYield)} → {pct(ex.investorYield)}</dd></div>
          </dl>
          <p className="mt-3 text-xs text-white/60">*Before investor-level taxes. Not guaranteed. Property-level yield is not the investor’s return.</p>
        </div>
      </div>
    ),
    notes: "The fee stack is the honesty test: 6.21% property yield becomes 5.62% for the investor before tax. The two open legal questions are whether a per-home company is an AIF, and whether the note is a MiFID instrument. We are not pre-judging either.",
  },
  {
    id: "tenant",
    kicker: "8 · Stage 3",
    title: "Tenant to owner.",
    stage: 3,
    body: (
      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <div className="space-y-3 text-white/85">
          <p className="text-lg">The tenant buys shares in their own home’s company step by step. Rent falls as their share grows; investors are bought out with a return. Every step is a Raya Chain transaction.</p>
          <p className="text-sm text-white/70">Requires further authorisation (or a lending partner) and affordability checks with human oversight.</p>
        </div>
        <div className="rounded-2xl bg-white/8 p-5 ring-1 ring-white/15">
          <p className="font-sans text-xs font-semibold uppercase tracking-wide text-gold">Illustration · Dublin 8 · {eur(12000)} a year</p>
          <table className="tabular mt-3 w-full text-sm text-white/85">
            <thead><tr className="text-left text-xs text-white/60"><th className="py-1">Year</th><th>Share</th><th>Monthly rent</th><th>Investors bought out</th></tr></thead>
            <tbody>
              {stairs.map((s) => (
                <tr key={s.year} className="border-t border-white/10"><td className="py-1">{s.year}</td><td>{pct(s.sharePct, 1)}</td><td>{eur(s.monthlyRent)}</td><td>{eur(s.investorBuyout)}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    ),
    notes: "This is the social promise and the hardest legal step. We show the mechanics only. The tenant persona on /login opens the simulator if asked.",
  },
  {
    id: "iov",
    kicker: "9 · Stage 4",
    title: "Internet of Value and the EU direction.",
    stage: 4,
    body: (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          [Landmark, "Official register", "Raya Chain becomes the register of notes, not a mirror — only once EU law recognises it."],
          [Globe2, "Layer Zero", "Holdings move across chains with their compliance rules; the master record stays single."],
          [Coins, "Regulated euro", "Payouts in a MiCA-regulated euro stablecoin; settlement in central bank money."],
          [CircleHelp, "Depends on reform", "Commission proposal of 4 Dec 2025 extends the DLT Pilot Regime to all MiFID instruments."],
        ].map(([Icon, t, d]) => {
          const I = Icon as typeof Landmark;
          return (
            <div key={t as string} className="rounded-2xl bg-white/8 p-5 ring-1 ring-white/15">
              <I className="h-6 w-6 text-gold" />
              <p className="mt-3 font-sans text-lg font-semibold text-white">{t as string}</p>
              <p className="mt-2 text-sm text-white/80">{d as string}</p>
            </div>
          );
        })}
      </div>
    ),
    notes: "Be explicit: this stage is a direction, not a plan with a date. We want to know how the Central Bank sees Irish participation in the reformed Pilot Regime and in Eurosystem settlement work.",
  },
  {
    id: "roadmap",
    kicker: "10 · Roadmap",
    title: "What we have and what we need, per stage.",
    stage: 1,
    body: (
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-white/85">
          <thead><tr className="text-xs uppercase tracking-wide text-gold"><th className="py-2 pr-3">Stage</th><th className="py-2 pr-3">Legal basis</th><th className="py-2 pr-3">We have</th><th className="py-2">We need</th></tr></thead>
          <tbody>
            {ROADMAP.map((r) => (
              <tr key={r.stage} className="border-t border-white/15 align-top">
                <td className="py-2 pr-3 font-sans font-semibold text-white">{STAGES[r.stage].short}</td>
                <td className="py-2 pr-3 text-xs">{STAGES[r.stage].basisLabel}</td>
                <td className="py-2 pr-3 text-xs">{r.have.slice(0, 3).join(" · ")}</td>
                <td className="py-2 text-xs">{r.need.slice(0, 3).join(" · ")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ),
    notes: "We have: a company, the Hub engagement, this MVP, the Raya Chain concept. Stage 1 needs: an ECSP partner or own licence, a payment institution, the first home, a property manager. Full table at /roadmap.",
  },
  {
    id: "protections",
    kicker: "11 · Investor protections",
    title: "ECSPR controls, built into the product.",
    stage: 1,
    body: (
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {[
          ["Entry knowledge test", `5 questions, pass at ${ECSPR.knowledgeTestPass}/5; failures recorded and retakeable`],
          ["Loss-bearing simulation", "Investment as a share of stated net worth; 10% guidance level"],
          ["Specific risk warning", `Above the higher of €1,000 or ${pct(ECSPR.warningNetWorthPct, 0)} of net worth — express consent`],
          ["Reflection period", `${ECSPR.reflectionDays} calendar days to withdraw without cost`],
          ["Key Investment Information Sheet", "Per offer, in the Annex I style"],
          ["€5m project-owner cap", "Tracked per SPV on the supervisor view"],
          ["Verified-wallet allowlist", "No transfer to an unverified holder, ever"],
          ["Freeze and correction", "Reason-coded, dual-approved, visible to the supervisor"],
          ["Client money", "Held only by an authorised payment institution — never by Meithera"],
        ].map(([t, d]) => (
          <div key={t} className="rounded-xl bg-white/8 p-4 ring-1 ring-white/15">
            <p className="font-sans font-semibold text-white">{t}</p>
            <p className="mt-1 text-sm text-white/75">{d}</p>
          </div>
        ))}
        <p className="rounded-xl bg-risk/90 p-4 text-sm text-risk-ink sm:col-span-2 lg:col-span-3">{RISK_WARNING}</p>
      </div>
    ),
    notes: "Each of these is live in the simulation you just saw. The risk warning text is used verbatim everywhere. Ask whether the Hub sees gaps against ECSPR Articles 19–22.",
  },
  {
    id: "questions",
    kicker: "12 · Questions and the proposed pilot",
    title: "What we would like the Innovation Hub’s guidance on.",
    stage: 1,
    body: (
      <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        <ol className="space-y-2 text-white/85">
          {[
            "Is Stage 1 (secured lending from €100) best launched under a licensed ECSP partner, or should Raya seek its own ECSP authorisation from the outset?",
            "For Stage 2, is a per-home company issuing profit-participating notes within ECSPR’s scope, or does it risk AIF classification?",
            "Could the note be a MiFID financial instrument, and what would that change?",
            "How should client money and custody be arranged so that Meithera never holds funds?",
            "Does a supervisory view of this kind help, and what would the Central Bank want on it?",
            "How does the Central Bank see Irish participation in the reformed DLT Pilot Regime?",
          ].map((q, i) => (
            <li key={q} className="flex gap-3 rounded-xl bg-white/8 p-3 ring-1 ring-white/15"><span className="font-sans font-bold text-gold">{i + 1}</span><span className="text-sm">{q}</span></li>
          ))}
        </ol>
        <div className="rounded-2xl border border-gold/50 bg-gold/15 p-5 text-white/90">
          <p className="font-sans text-xs font-semibold uppercase tracking-wide text-gold">Proposed Stage 1 pilot</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>· One vacant home; one secured refurbishment loan of about {eur(cork.loan!.amount)}</li>
            <li>· Offered through a licensed ECSP partner; client money with a payment institution</li>
            <li>· Minimum €100; all ECSPR investor-protection steps as demonstrated</li>
            <li>· Raya Chain mirror of the lender register, with the supervisory view available to the Central Bank</li>
            <li>· Report back to the Innovation Hub at completion</li>
          </ul>
          <p className="mt-4 text-xs text-white/70">The Innovation Hub provides guidance, not approval. Nothing on these slides is or implies authorisation.</p>
        </div>
      </div>
    ),
    notes: "Close on the ask: guidance on the Stage 1 route and the Stage 2 instrument. Offer the pilot. Thank them. Leave the roadmap and regulatory-demo URLs.",
  },
];

export { DeepLink };
