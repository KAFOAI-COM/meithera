"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X, LayoutDashboard, ShieldCheck, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { ROLE_HOME, ROLE_LABEL, type Role } from "@/lib/roles";
import { buttonVariants } from "@/components/ui";
import { logout } from "@/app/actions";
import { Logo } from "./logo";

const nav = [
  { href: "/properties", label: "Properties" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/chain", label: "Raya Chain" },
  { href: "/roadmap", label: "Roadmap" },
  { href: "/compliance", label: "Regulatory readiness" },
  { href: "/about", label: "About" },
];

/** Pages whose first section is a full-bleed dark hero the header can float over. */
const OVERLAY_PATHS = ["/"];

export function Header({ session }: { session: { role: Role; name: string } | null }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const path = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const overlay = OVERLAY_PATHS.includes(path) && !scrolled && !open;
  const home = session ? ROLE_HOME[session.role] : "/login";

  return (
    <header
      className={cn(
        "sticky top-0 z-40 transition-[background-color,box-shadow,color] duration-300",
        overlay ? "bg-transparent text-white" : "bg-surface/90 text-ink shadow-[0_1px_0_rgba(6,63,54,0.06)] backdrop-blur-md",
      )}
    >
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="shrink-0" aria-label="Meithera home">
          <Logo inverse={overlay} />
        </Link>
        <nav className="hidden items-center gap-0.5 xl:flex" aria-label="Main">
          {nav.map((n) => {
            const active = path === n.href || path.startsWith(`${n.href}/`);
            return (
              <Link
                key={n.href}
                href={n.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative rounded-lg px-3 py-2 font-sans text-[13.5px] font-medium transition-colors",
                  overlay ? "text-white/80 hover:text-white" : "text-muted hover:text-emerald",
                  active && (overlay ? "text-white" : "text-emerald"),
                )}
              >
                {n.label}
                {active ? <span className="absolute inset-x-3 -bottom-0.5 h-px bg-gold" aria-hidden /> : null}
              </Link>
            );
          })}
        </nav>
        <div className="hidden items-center gap-2 xl:flex">
          <Link
            href="/regulatory-demo"
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }), overlay && "text-white hover:bg-white/10")}
          >
            <ShieldCheck className="h-4 w-4" /> Regulatory demo
          </Link>
          {session ? (
            <>
              <Link href={home} className={buttonVariants({ variant: overlay ? "inverse" : "primary", size: "sm" })}>
                <LayoutDashboard className="h-4 w-4" /> {ROLE_LABEL[session.role]}
              </Link>
              <form action={logout}>
                <button
                  className={cn(buttonVariants({ variant: "secondary", size: "sm" }), overlay && "border-white/30 bg-white/5 text-white hover:bg-white/15")}
                  aria-label="Log out"
                  title={`Log out ${session.name}`}
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className={cn(buttonVariants({ variant: "secondary", size: "sm" }), overlay && "border-white/30 bg-white/5 text-white hover:bg-white/15")}
              >
                Log in
              </Link>
              <Link href="/register" className={buttonVariants({ variant: overlay ? "gold" : "primary", size: "sm" })}>
                Try the demo
              </Link>
            </>
          )}
        </div>
        <button
          className={cn("flex h-11 w-11 items-center justify-center rounded-lg xl:hidden", overlay ? "text-white hover:bg-white/10" : "hover:bg-mint")}
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>
      {!overlay ? <div className="pointer-events-none absolute inset-x-0 top-[71px] h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent" aria-hidden /> : null}
      {open ? (
        <nav className="max-h-[calc(100dvh-72px)] overflow-y-auto border-t border-line bg-card px-4 pb-6 xl:hidden" aria-label="Mobile">
          {[...nav, { href: "/regulatory-demo", label: "Regulatory demo" }, { href: "/faq", label: "FAQ" }].map((n) => (
            <Link key={n.href} href={n.href} onClick={() => setOpen(false)} className="flex min-h-12 items-center border-b border-line font-sans text-base font-medium text-ink">
              {n.label}
            </Link>
          ))}
          <div className="mt-5 flex gap-2">
            {session ? (
              <>
                <Link href={home} onClick={() => setOpen(false)} className={cn(buttonVariants(), "flex-1")}>{ROLE_LABEL[session.role]}</Link>
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
