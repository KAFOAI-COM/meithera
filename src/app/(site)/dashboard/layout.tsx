import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { DashboardNav } from "@/components/dashboard/nav";
import { IllustrativeNotice } from "@/components/site/notices";
import { StageBadge } from "@/components/site/stage-badge";

/** Server layout: verifies the signed session before rendering any dashboard page. */
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login?next=/dashboard");
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-sans text-xs font-semibold uppercase tracking-[0.08em] text-gold-ink">{session.role === "tenant" ? "Tenant dashboard" : "Investor dashboard"} · demonstration</p>
          <h1 className="mt-1 font-serif text-3xl font-medium tracking-tight sm:text-4xl">{session.name}</h1>
        </div>
        <StageBadge stage={session.role === "tenant" ? 3 : 0} />
      </div>
      <IllustrativeNotice className="mt-4 max-w-2xl">Everything here is simulated. No money has been invested, no income has been paid, no securities or tokens exist. Figures are before investor-level taxes.</IllustrativeNotice>
      <div className="mt-8 grid gap-8 lg:grid-cols-[220px_1fr]">
        <aside className="lg:sticky lg:top-24 lg:self-start"><DashboardNav role={session.role} /></aside>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
