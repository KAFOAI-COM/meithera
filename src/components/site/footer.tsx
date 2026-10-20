import Link from "next/link";
import { Logo } from "./logo";
import { RISK_WARNING } from "./notices";

const cols = [
  { title: "Platform", links: [["/properties", "Homes"], ["/how-it-works", "How it works"], ["/roadmap", "Roadmap"], ["/chain", "Raya Chain explorer"], ["/agents", "Agents (simulated)"], ["/impact", "Impact"], ["/faq", "FAQ"]] },
  { title: "Regulatory", links: [["/compliance", "Regulatory readiness"], ["/regulatory-demo", "Regulatory demonstration"], ["/supervisor", "Supervisor view"], ["/legal/risk-disclosure", "Risk disclosure"]] },
  { title: "Company", links: [["/about", "About Raya Software"], ["/legal/privacy", "Privacy"], ["/legal/terms", "Terms of use"], ["/login", "Log in (personas)"]] },
];

export function Footer() {
  return (
    <footer className="mt-24 bg-emerald text-white/85">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Logo inverse />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/75">
              Own a share. Build Ireland’s future. Blockchain-based fractional ownership of property companies — a proposal from Raya Software Limited to fund the refurbishment of vacant Irish homes in small amounts.
            </p>
          </div>
          {cols.map((c) => (
            <div key={c.title}>
              <p className="font-sans text-xs font-semibold uppercase tracking-[0.08em] text-gold">{c.title}</p>
              <ul className="mt-4 space-y-2 text-sm">
                {c.links.map(([href, label]) => (
                  <li key={href}>
                    <Link href={href} className="text-white/80 hover:text-white">{label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 space-y-3 border-t border-white/15 pt-6 text-xs leading-relaxed text-white/70">
          <p><strong className="text-white">Demonstration platform.</strong> Meithera is a demonstration MVP. No real investments are available, no money can be transferred and no securities or tokens are issued. All homes, investors, figures and ledger records are fictional and illustrative. Raya Chain is simulated.</p>
          <p>Meithera / Raya Software Limited is not authorised or regulated by the Central Bank of Ireland. The Central Bank has not approved or endorsed this platform; the Innovation Hub provides guidance, not approval. {RISK_WARNING}</p>
          <p>© 2026 Raya Software Limited (incorporated in Ireland). Demonstration build.</p>
        </div>
      </div>
    </footer>
  );
}
