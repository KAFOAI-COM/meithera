"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Building2, Users, Landmark, Coins, ScrollText, Snowflake } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/admin/overview", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/properties", label: "Homes & offers", icon: Building2 },
  { href: "/admin/investors", label: "Investors", icon: Users },
  { href: "/admin/spvs", label: "SPVs & loans", icon: Landmark },
  { href: "/admin/distributions", label: "Distributions", icon: Coins },
  { href: "/admin/ledger", label: "Ledger controls", icon: Snowflake },
  { href: "/admin/audit-log", label: "Audit log", icon: ScrollText },
];

export function AdminNav() {
  const path = usePathname();
  return (
    <nav aria-label="Admin" className="flex gap-1 overflow-x-auto lg:flex-col">
      {items.map((n) => {
        const active = path.startsWith(n.href);
        return (
          <Link key={n.href} href={n.href} className={cn("flex min-h-11 shrink-0 items-center gap-2 rounded-xl px-3 font-sans text-sm font-medium", active ? "bg-emerald text-white" : "text-muted hover:bg-mint hover:text-emerald")} aria-current={active ? "page" : undefined}>
            <n.icon className="h-4 w-4" /> {n.label}
          </Link>
        );
      })}
    </nav>
  );
}
