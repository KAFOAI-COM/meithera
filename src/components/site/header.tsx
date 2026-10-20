"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, LayoutDashboard, ShieldCheck, LogOut, Link2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui";
import { logout } from "@/app/actions";
import { HOME_FOR_ROLE, type SessionInfo } from "@/lib/auth-types";
import { Logo } from "./logo";

const nav = [
  { href: "/properties", label: "Homes" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/roadmap", label: "Roadmap" },
  { href: "/chain", label: "Raya Chain" },
  { href: "/impact", label: "Impact" },
  { href: "/compliance", label: "Regulatory readiness" },
  { href: "/faq", label: "FAQ" },
];

const roleLabel: Record<SessionInfo["role"], string> = { investor: "Dashboard", tenant: "My home", supervisor: "Supervisor view", admin: "Admin" };

export function Header({ session }: { session: SessionInfo | null }) {
  const [open, setOpen] = useState(false);
  const path = usePathname();
  const home = session ? HOME_FOR_ROLE[session.role] : "/login";
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="shrink-0" aria-label="Meithera home">
          <Logo />
        </Link>
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
          {nav.map((n) => (
            <Link key={n.href} href={n.href} className={cn("rounded-lg px-3 py-2 font-sans text-sm font-medium text-muted hover:bg-mint hover:text-emerald", path.startsWith(n.href) && "text-emerald")}>
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-2 lg:flex">
          <Link href="/regulatory-demo" className={buttonVariants({ variant: "ghost", size: "sm" })}>
            <ShieldCheck className="h-4 w-4" /> Regulatory demo
          </Link>
          {session ? (
            <>
              <Link href={home} className={buttonVariants({ variant: "primary", size: "sm" })}>
                <LayoutDashboard className="h-4 w-4" /> {roleLabel[session.role]}
              </Link>
              <form action={logout}>
                <button className={buttonVariants({ variant: "secondary", size: "sm" })} aria-label="Log out">
                  <LogOut className="h-4 w-4" />
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className={buttonVariants({ variant: "secondary", size: "sm" })}>Log in</Link>
              <Link href="/register" className={buttonVariants({ variant: "primary", size: "sm" })}>Try the demo</Link>
            </>
          )}
        </div>
        <button className="flex h-11 w-11 items-center justify-center rounded-lg lg:hidden" onClick={() => setOpen(!open)} aria-expanded={open} aria-label="Toggle menu">
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>
      {open ? (
        <nav className="border-t border-line bg-card px-4 pb-4 lg:hidden" aria-label="Mobile">
          {[...nav, { href: "/regulatory-demo", label: "Regulatory demo" }, { href: "/about", label: "About" }].map((n) => (
            <Link key={n.href} href={n.href} onClick={() => setOpen(false)} className="block border-b border-line py-3 font-sans text-base font-medium text-ink">
              {n.label}
            </Link>
          ))}
          <div className="mt-4 flex gap-2">
            {session ? (
              <>
                <Link href={home} onClick={() => setOpen(false)} className={cn(buttonVariants(), "flex-1")}><Link2 className="h-4 w-4" /> {roleLabel[session.role]}</Link>
                <form action={logout}><button className={buttonVariants({ variant: "secondary" })}>Log out</button></form>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setOpen(false)} className={cn(buttonVariants({ variant: "secondary" }), "flex-1")}>Log in</Link>
                <Link href="/register" onClick={() => setOpen(false)} className={cn(buttonVariants(), "flex-1")}>Try the demo</Link>
              </>
            )}
          </div>
        </nav>
      ) : null}
    </header>
  );
}
