"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Briefcase, CalendarDays, ListOrdered, FileText, Settings, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Role } from "@/lib/auth-types";

const investorNav = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/portfolio", label: "Portfolio", icon: Briefcase },
  { href: "/dashboard/income", label: "Income", icon: CalendarDays },
  { href: "/dashboard/transactions", label: "Transactions", icon: ListOrdered },
  { href: "/dashboard/documents", label: "Documents", icon: FileText },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];
const tenantNav = [{ href: "/dashboard/tenant", label: "My home (Stage 3)", icon: Home }];

export function DashboardNav({ role }: { role: Role }) {
  const path = usePathname();
  const items = role === "tenant" ? [...tenantNav, { href: "/dashboard/settings", label: "Settings", icon: Settings }] : role === "admin" ? [...investorNav, ...tenantNav] : investorNav;
  return (
    <nav aria-label="Dashboard" className="flex gap-1 overflow-x-auto lg:flex-col">
      {items.map((n) => {
        const active = n.href === "/dashboard" ? path === "/dashboard" : path.startsWith(n.href);
        return (
          <Link key={n.href} href={n.href} className={cn("flex min-h-11 shrink-0 items-center gap-2 rounded-xl px-3 font-sans text-sm font-medium", active ? "bg-emerald text-white" : "text-muted hover:bg-mint hover:text-emerald")} aria-current={active ? "page" : undefined}>
            <n.icon className="h-4 w-4" /> {n.label}
          </Link>
        );
      })}
    </nav>
  );
}
