import type { Metadata } from "next";
import Link from "next/link";
import { FaqList, faqs, type Faq } from "@/components/site/faq-list";
import { PageHeader, RiskNotice } from "@/components/site/notices";

export const metadata: Metadata = { title: "FAQ" };

const TOPICS: Faq["topic"][] = ["Basics", "Investing", "Risk", "Raya Chain", "Regulation"];

export default function FaqPage() {
  return (
    <>
      <PageHeader eyebrow="Frequently asked questions" title="Plain answers" intro="What Meithera would be, what it would not be, and what can go wrong." />
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[220px_1fr]">
        <nav className="lg:sticky lg:top-28 lg:self-start" aria-label="FAQ topics">
          <ul className="flex flex-wrap gap-2 lg:flex-col lg:gap-1">
            {TOPICS.map((t) => (
              <li key={t}>
                <a href={`#${t.toLowerCase().replace(/\s/g, "-")}`} className="flex min-h-10 items-center rounded-lg px-3 font-sans text-sm font-semibold text-muted hover:bg-mint hover:text-emerald">{t}</a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="space-y-12">
          {TOPICS.map((t) => (
            <section key={t} id={t.toLowerCase().replace(/\s/g, "-")} className="scroll-mt-28">
              <h2 className="font-serif text-3xl text-ink">{t}</h2>
              <div className="mt-5"><FaqList items={faqs.filter((f) => f.topic === t)} /></div>
            </section>
          ))}
          <RiskNotice />
          <p className="text-sm text-muted">Still unsure? Read the <Link href="/legal/risk-disclosure" className="font-semibold text-forest underline-offset-2 hover:underline">risk disclosure</Link> or <Link href="/how-it-works" className="font-semibold text-forest underline-offset-2 hover:underline">how it works</Link>.</p>
        </div>
      </div>
    </>
  );
}
