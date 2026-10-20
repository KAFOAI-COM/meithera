"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, Coins, LayoutDashboard, Network, ScrollText, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin/overview", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/properties", label: "Properties", icon: Building2 },
  { href: "/admin/investors", label: "Investors", icon: Users },
  { href: "/admin/spvs", label: "Property companies", icon: Network },
  { href: "/admin/distributions", label: "Distributions", icon: Coins },
  { href: "/admin/audit-log", label: "Audit log", icon: ScrollText },
];

export function AdminNav() {
  const path = usePathname();
  return (
    <nav aria-label="Admin" className="-mx-4 flex gap-1 overflow-x-auto px-4 lg:mx-0 lg:flex-col lg:px-0">
      {NAV.map((n) => {
        const active = path.startsWith(n.href);
        return (
          <Link key={n.href} href={n.href} aria-current={active ? "page" : undefined} className={cn("flex min-h-11 shrink-0 items-center gap-2.5 rounded-xl px-3 font-sans text-sm font-semibold transition-colors", active ? "bg-emerald text-white" : "text-muted hover:bg-mint hover:text-emerald")}>
            <n.icon className="h-4 w-4" /> {n.label}
          </Link>
        );
      })}
    </nav>
  );
}
