import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BadgeCheck, Banknote, Boxes, FileWarning, Fingerprint, GraduationCap, Hourglass, Lock, MessageSquareWarning, Scale, ServerCog, ShieldAlert, Users } from "lucide-react";
import { buttonVariants } from "@/components/ui";
import { PageHeader, RiskNotice, SectionHeading } from "@/components/site/notices";
import { StageBadge } from "@/components/site/stage-badge";

export const metadata: Metadata = { title: "Regulatory readiness" };

type Status = "demo" | "proposed" | "partner";
const STATUS: Record<Status, { label: string; cls: string }> = {
  demo: { label: "Simulated in this demo", cls: "bg-mint text-emerald" },
  proposed: { label: "Proposed design", cls: "bg-surface text-muted ring-1 ring-line" },
  partner: { label: "Requires authorised partner", cls: "bg-[#f4ecdc] text-gold-ink" },
};

const safeguards: { icon: typeof Lock; title: string; text: string; status: Status }[] = [
  { icon: FileWarning, title: "Key investment information sheet", text: "A KIIS-style summary for every offer before any commitment: costs, risks, rights and the issuer.", status: "demo" },
  { icon: GraduationCap, title: "Entry knowledge test", text: "Non-sophisticated investors take a short knowledge test and a loss-bearing simulation before investing.", status: "demo" },
  { icon: ShieldAlert, title: "Risk warnings and limits", text: "The same risk warning everywhere. An extra warning above the higher of €1,000 or 5% of stated net worth.", status: "demo" },
  { icon: Hourglass, title: "4-day reflection period", text: "Investors can withdraw without penalty during a pre-contractual reflection period.", status: "demo" },
  { icon: Banknote, title: "Client money", text: "Investor funds held only by an authorised payment institution in segregated accounts — never by Meithera.", status: "partner" },
  { icon: Fingerprint, title: "KYC and AML/CFT", text: "Identity verification, sanctions and PEP screening, and ongoing transaction monitoring by a regulated provider.", status: "partner" },
  { icon: Scale, title: "One company per home", text: "Each home in its own property company, ring-fencing assets and liabilities from other homes and from the platform.", status: "proposed" },
  { icon: Boxes, title: "Register on Raya Chain", text: "Pseudonymous, hash-chained record mirroring the official register; freeze and court-ordered correction built in.", status: "demo" },
  { icon: Lock, title: "Data protection", text: "No personal data on-chain. GDPR-aligned processing with data minimisation; this demo stores nothing personal.", status: "proposed" },
  { icon: ServerCog, title: "Operational resilience", text: "DORA-aligned ICT risk management, incident reporting and third-party oversight for critical providers.", status: "proposed" },
  { icon: MessageSquareWarning, title: "Complaints", text: "A documented complaints process with timelines and a route to the Financial Services and Pensions Ombudsman.", status: "proposed" },
  { icon: Users, title: "Conflicts and governance", text: "No platform investment in its own offers without disclosure; independent oversight of valuations and pricing.", status: "proposed" },
];

const questions = [
  "Is a Stage 1 secured refurbishment loan best offered under ECSPR through a licensed partner, or does it raise other permissions?",
  "Could Stage 2 notes in a single-asset property company fall within MiFID II, AIFMD or ECSPR — and what would decide it?",
  "What does the Central Bank expect from an authorised payment or custody partner in this model?",
  "Would a live, read-only supervisory view of the register be useful to the Central Bank?",
];

export default function CompliancePage() {
  return (
    <>
      <PageHeader
        image="/images/fanlight.webp"
        eyebrow="Regulatory readiness"
        title="Investor protection designed in, not bolted on"
        intro="The safeguards we propose to operate, and which of them this demonstration simulates. Meithera is not authorised or regulated by the Central Bank of Ireland; nothing here implies approval."
      >
        <div className="mt-7 flex flex-wrap gap-2"><StageBadge stage={0} detail /><StageBadge stage={1} detail /></div>
      </PageHeader>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading eyebrow="Safeguards" title="Twelve controls, honestly labelled" intro="Each control is marked as simulated in this demo, a proposed design, or dependent on an authorised partner." />
          <ul className="flex flex-wrap gap-2">
            {(Object.keys(STATUS) as Status[]).map((s) => <li key={s} className={`rounded-full px-3 py-1 font-sans text-[11px] font-semibold ${STATUS[s].cls}`}>{STATUS[s].label}</li>)}
          </ul>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {safeguards.map((g) => (
            <article key={g.title} className="flex flex-col rounded-2xl border border-line bg-card p-6">
              <div className="flex items-start justify-between gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-mint text-emerald"><g.icon className="h-5 w-5" /></span>
                <span className={`rounded-full px-2.5 py-1 font-sans text-[10px] font-semibold ${STATUS[g.status].cls}`}>{STATUS[g.status].label}</span>
              </div>
              <h3 className="mt-5 font-sans text-base font-semibold text-ink">{g.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{g.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-emerald text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[1fr_1.3fr]">
          <div>
            <div className="flex items-center gap-3"><span className="h-px w-10 bg-gold" /><p className="font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-gold">Open questions</p></div>
            <h2 className="mt-4 font-serif text-4xl leading-tight">What we are asking the Innovation Hub</h2>
            <p className="mt-4 text-white/70">We present these as questions, not conclusions. The answers decide the legal basis for each stage.</p>
          </div>
          <ol className="space-y-3">
            {questions.map((q, i) => (
              <li key={q} className="flex gap-4 rounded-2xl bg-white/[0.06] p-5 ring-1 ring-white/10">
                <span className="tabular font-serif text-2xl text-gold">{i + 1}</span>
                <p className="text-sm leading-relaxed text-white/85">{q}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <RiskNotice className="max-w-2xl" />
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/regulatory-demo" className={buttonVariants()}><BadgeCheck className="h-4 w-4" /> Open the regulatory demonstration</Link>
          <Link href="/legal/risk-disclosure" className={buttonVariants({ variant: "secondary" })}>Risk disclosure <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </section>
    </>
  );
}
