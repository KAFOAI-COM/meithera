import Link from "next/link";
import { PageHeader } from "./notices";

export interface LegalSection {
  title: string;
  body: string[];
}

const LEGAL_NAV = [
  ["/legal/risk-disclosure", "Risk disclosure"],
  ["/legal/privacy", "Privacy"],
  ["/legal/terms", "Terms of use"],
];

/** Shared layout for the demonstration legal pages: numbered sections with a contents rail. */
export function LegalPage({ eyebrow, title, intro, updated, sections, current, lead }: { eyebrow: string; title: string; intro: string; updated: string; sections: LegalSection[]; current: string; lead?: React.ReactNode }) {
  const slug = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return (
    <>
      <PageHeader eyebrow={eyebrow} title={title} intro={intro}>
        <p className="mt-5 text-xs text-muted">Demonstration document · last updated {updated} · not legal advice and not a binding agreement</p>
      </PageHeader>
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <nav aria-label="Legal documents" className="flex flex-wrap gap-2 lg:flex-col lg:gap-1">
            {LEGAL_NAV.map(([href, label]) => (
              <Link key={href} href={href} aria-current={href === current ? "page" : undefined} className={`flex min-h-10 items-center rounded-lg px-3 font-sans text-sm font-semibold ${href === current ? "bg-emerald text-white" : "text-muted hover:bg-mint hover:text-emerald"}`}>{label}</Link>
            ))}
          </nav>
          <ol className="mt-8 hidden space-y-2 border-l border-line pl-4 text-sm lg:block">
            {sections.map((s, i) => <li key={s.title}><a href={`#${slug(s.title)}`} className="text-muted hover:text-emerald">{i + 1}. {s.title}</a></li>)}
          </ol>
        </aside>
        <article className="max-w-3xl">
          {lead}
          {sections.map((s, i) => (
            <section key={s.title} id={slug(s.title)} className="scroll-mt-28 border-b border-line py-8 first:pt-0 last:border-0">
              <h2 className="flex items-baseline gap-3 font-serif text-2xl text-ink"><span className="tabular text-gold-ink">{i + 1}.</span>{s.title}</h2>
              <div className="mt-4 space-y-3 text-[15px] leading-relaxed text-muted">{s.body.map((b) => <p key={b}>{b}</p>)}</div>
            </section>
          ))}
        </article>
      </div>
    </>
  );
}
