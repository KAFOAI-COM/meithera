import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, CircleDashed } from "lucide-react";
import { buttonVariants } from "@/components/ui";
import { PageHeader, SectionHeading } from "@/components/site/notices";
import { StageBadge } from "@/components/site/stage-badge";

export const metadata: Metadata = { title: "About" };

const principles = [
  ["Supply first", "Every euro goes to bringing vacant and derelict homes back into use — new supply, not bidding up existing homes."],
  ["Gross to net, always", "Every figure walks from gross to net with fees shown. A property’s yield is never presented as your return."],
  ["The supervisor can see it", "The register, holdings and payouts are recorded so that a supervisor could be given a live, read-only view."],
  ["Plain about risk", "Property is illiquid and can lose value. We say so on every page, in the same words."],
];

const have = [
  "Raya Software Limited, incorporated in Ireland (CRO)",
  "Engagement with the Central Bank of Ireland Innovation Hub — for guidance, not approval",
  "This demonstration MVP: journeys, finance engine, supervisory view",
  "The Raya Chain concept: one master record, proofs that travel, compliance built into the asset",
];
const need = [
  "A licensed crowdfunding service provider partner, or our own ECSPR licence",
  "An authorised payment institution for client money",
  "The first vacant home and a professional property manager",
  "Legal sign-off on the property-company and note structure",
];

export default function AboutPage() {
  return (
    <>
      <PageHeader
        image="/images/fanlight.webp"
        eyebrow="About Meithera"
        title="Built in Ireland, for the homes standing empty in it"
        intro="Meithera is a proposed platform by Raya Software Limited. It lets ordinary people fund the refurbishment of vacant homes in small amounts, with every euro, holder and payout on the record."
      />

      <section className="mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:items-center">
        <div>
          <SectionHeading eyebrow="Our mission" title="Turn vacancy into homes — and tenants into owners" />
          <div className="mt-6 space-y-4 text-[15px] leading-relaxed text-muted">
            <p>Irish people can’t afford to buy, rents are punishing, and thousands of homes sit vacant. The capital to fix them is usually locked inside institutions; the people who most want more homes rarely get a stake in building them.</p>
            <p>Meithera starts small: secured loans, from €100, to refurbish one vacant home at a time, through an EU crowdfunding licence. Over time it adds rent-share notes, then a path for tenants to buy into the home they live in — with Raya Chain keeping one tamper-evident record the supervisor can see.</p>
            <p className="font-medium text-ink">The name comes from <em>meitheal</em> — the Irish tradition of neighbours working together on a shared task.</p>
          </div>
        </div>
        <div className="relative aspect-[4/5] overflow-hidden rounded-3xl">
          <Image src="/images/street.webp" alt="Representative photograph of an Irish street" fill sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover" />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-emerald/90 to-transparent p-6 text-sm text-white/85">Representative photography. Meithera has not acquired or funded any property.</div>
        </div>
      </section>

      <section className="border-y border-line bg-card">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
          <SectionHeading eyebrow="Principles" title="How we intend to operate" />
          <div className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
            {principles.map(([t, d], i) => (
              <div key={t} className="bg-surface p-7">
                <span className="tabular font-serif text-3xl text-gold">0{i + 1}</span>
                <h3 className="mt-3 font-sans text-lg font-semibold">{t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading eyebrow="Where we are" title="What we have, and what Stage 1 needs" />
          <StageBadge stage={1} detail />
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl bg-emerald p-7 text-white">
            <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-gold">Have</p>
            <ul className="mt-5 space-y-3.5">{have.map((t) => <li key={t} className="flex gap-3 text-sm leading-relaxed text-white/85"><Check className="mt-0.5 h-4 w-4 shrink-0 text-gold" />{t}</li>)}</ul>
          </div>
          <div className="rounded-2xl border border-line bg-card p-7">
            <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-gold-ink">Need</p>
            <ul className="mt-5 space-y-3.5">{need.map((t) => <li key={t} className="flex gap-3 text-sm leading-relaxed text-ink"><CircleDashed className="mt-0.5 h-4 w-4 shrink-0 text-muted" />{t}</li>)}</ul>
          </div>
        </div>
        <p className="mt-6 max-w-3xl text-sm leading-relaxed text-muted">Meithera is not authorised or regulated by the Central Bank of Ireland, and the Central Bank has not approved or endorsed it. The Innovation Hub provides informal guidance only.</p>
        <Link href="/roadmap" className={buttonVariants({ className: "mt-8" })}>See the full roadmap <ArrowRight className="h-4 w-4" /></Link>
      </section>
    </>
  );
}
