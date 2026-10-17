import Link from "next/link";
import { Logo } from "./logo";
import { RISK_WARNING } from "./notices";

const cols = [
  { title: "Platform", links: [["/properties", "Properties"], ["/how-it-works", "How it works"], ["/impact", "Impact"], ["/faq", "FAQ"]] },
  { title: "Regulatory", links: [["/compliance", "Regulatory readiness"], ["/regulatory-demo", "Regulatory demonstration"], ["/legal/risk-disclosure", "Risk disclosure"]] },
  { title: "Company", links: [["/about", "About Stake Ireland"], ["/legal/privacy", "Privacy"], ["/legal/terms", "Terms of use"]] },
];

export function Footer() {
  return (
    <footer className="mt-24 bg-emerald text-white/85">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Logo inverse />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/75">
              Own a share. Build Ireland’s future. A proposed platform from Stake Ireland for accessible participation in the refurbishment of vacant Irish homes.
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
          <p><strong className="text-white">Demonstration platform.</strong> Meithera is a demonstration MVP. No real investments are available, no money can be transferred and no securities or tokens are issued. All properties, investors and figures are fictional and illustrative.</p>
          <p>Meithera / Stake Ireland is not authorised or regulated by the Central Bank of Ireland. The Central Bank has not approved or endorsed this platform. {RISK_WARNING}</p>
          <p>© 2026 Stake Ireland (proposed). Demonstration build.</p>
        </div>
      </div>
    </footer>
  );
}
