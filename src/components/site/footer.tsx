import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { STAGES, VARIANT_LABEL } from "@/lib/stages";
import { Logo } from "./logo";
import { RISK_WARNING } from "./notices";

const cols = [
  { title: "Platform", links: [["/properties", "Properties"], ["/how-it-works", "How it works"], ["/chain", "Raya Chain explorer"], ["/impact", "Impact"], ["/agents", "AI agents (simulated)"], ["/faq", "FAQ"]] },
  { title: "Regulatory", links: [["/compliance", "Regulatory readiness"], ["/regulatory-demo", "Regulatory demonstration"], ["/roadmap", "Five-stage roadmap"], ["/legal/risk-disclosure", "Risk disclosure"]] },
  { title: "Company", links: [["/about", "About Raya Software"], ["/legal/privacy", "Privacy"], ["/legal/terms", "Terms of use"], ["/login", "Demo log in"]] },
];

export function Footer() {
  return (
    <footer className="relative mt-24 overflow-hidden bg-emerald text-white/85">
      <div className="h-px bg-gradient-to-r from-transparent via-gold to-transparent" aria-hidden />
      <div className="pointer-events-none absolute -right-40 -top-40 h-[480px] w-[480px] rounded-full bg-forest/40 blur-3xl" aria-hidden />
      <div className="relative mx-auto max-w-7xl px-4 pb-10 pt-16 sm:px-6">
        <div className="grid gap-10 border-b border-white/10 pb-12 lg:grid-cols-[1.3fr_1fr] lg:items-end">
          <p className="max-w-xl font-serif text-3xl leading-tight text-white sm:text-4xl">
            Ordinary people funding the return of Ireland’s vacant homes — <span className="text-gold">every euro on the record.</span>
          </p>
          <ul className="divide-y divide-white/10 border-y border-white/10" aria-label="Five-stage roadmap">
            {STAGES.map((s) => (
              <li key={s.stage} className="grid grid-cols-[2rem_1fr_auto] items-baseline gap-3 py-2 text-xs">
                <span className="tabular font-serif text-sm text-gold">0{s.stage}</span>
                <span className="font-sans font-semibold text-white">{s.name}</span>
                <span className="text-right text-white/50">{VARIANT_LABEL[s.variant]}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 pt-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="col-span-2 md:col-span-1">
            <Logo inverse />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/70">
              Blockchain-based fractional ownership of property companies. A proposed platform by Raya Software Limited, incorporated in Ireland.
            </p>
          </div>
          {cols.map((c) => (
            <div key={c.title}>
              <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-gold">{c.title}</p>
              <ul className="mt-4 space-y-2.5 text-sm">
                {c.links.map(([href, label]) => (
                  <li key={href}>
                    <Link href={href} className="group inline-flex items-center gap-1 text-white/75 transition-colors hover:text-white">
                      {label}
                      <ArrowUpRight className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-60" aria-hidden />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-14 space-y-3 border-t border-white/10 pt-6 text-xs leading-relaxed text-white/60">
          <p><strong className="text-white">Demonstration platform.</strong> Meithera is a demonstration MVP. No real investments are available, no money can be transferred and no securities or tokens are issued. All properties, investors and figures are fictional and illustrative. Raya Chain is simulated in your browser.</p>
          <p>Meithera is not authorised or regulated by the Central Bank of Ireland. The Central Bank has not approved or endorsed this platform; engagement with the Innovation Hub is for guidance only. {RISK_WARNING}</p>
          <p>© 2026 Raya Software Limited. Demonstration build.</p>
        </div>
      </div>
    </footer>
  );
}
