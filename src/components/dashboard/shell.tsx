"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Coins } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui";
import { useInvestor } from "./investor-context";

const TABS = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/portfolio", label: "Portfolio" },
  { href: "/dashboard/income", label: "Income" },
  { href: "/dashboard/transactions", label: "Transactions" },
  { href: "/dashboard/documents", label: "Documents" },
  { href: "/dashboard/settings", label: "Settings" },
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const { displayName, holder, role } = useInvestor();
  const tabs = role === "tenant" ? [{ href: "/dashboard/tenant", label: "My home" }, ...TABS.filter((t) => t.href === "/dashboard/settings")] : [...TABS, ...(role === "admin" ? [{ href: "/dashboard/tenant", label: "Tenant view" }] : [])];
  return (
    <>
      <div className="no-print border-b border-line bg-emerald text-white">
        <div className="mx-auto max-w-7xl px-4 pt-10 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-gold">{role === "tenant" ? "Tenant dashboard" : "Investor dashboard"} · simulated</p>
              <h1 className="mt-2 font-serif text-4xl tracking-tight sm:text-5xl">Welcome back, {displayName.split(" ")[0]}</h1>
              <p className="mt-2 font-mono text-xs text-white/50">Raya Chain holder {holder}</p>
            </div>
            {role !== "tenant" ? <Link href="/invest" className={buttonVariants({ variant: "gold" })}><Coins className="h-4 w-4" /> Simulate an investment</Link> : null}
          </div>
          <nav className="-mx-4 mt-8 flex gap-1 overflow-x-auto px-4 sm:-mx-6 sm:px-6" aria-label="Dashboard">
            {tabs.map((t) => {
              const active = t.href === "/dashboard" ? path === t.href : path.startsWith(t.href);
              return (
                <Link key={t.href} href={t.href} aria-current={active ? "page" : undefined} className={cn("relative flex min-h-12 shrink-0 items-center px-3 font-sans text-sm font-semibold transition-colors", active ? "text-white" : "text-white/60 hover:text-white")}>
                  {t.label}
                  {active ? <span className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-gold" /> : null}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">{children}</div>
    </>
  );
}
