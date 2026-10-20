import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { AdminNav } from "@/components/admin/nav";
import { IllustrativeNotice } from "@/components/site/notices";
import { StageBadge } from "@/components/site/stage-badge";

/** Server-side admin check in addition to middleware. */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login?next=/admin/overview");
  if (session.role !== "admin") redirect("/login?next=/admin/overview&error=role&need=admin");
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-sans text-xs font-semibold uppercase tracking-[0.08em] text-gold-ink">Administrator console · demonstration</p>
          <h1 className="mt-1 font-serif text-3xl font-medium tracking-tight sm:text-4xl">Platform operations</h1>
        </div>
        <StageBadge stage={0} />
      </div>
      <IllustrativeNotice className="mt-4 max-w-2xl">Every action here is simulated and written to the audit log and the Raya Chain simulator. No real homes, investors, money or securities are involved.</IllustrativeNotice>
      <div className="mt-8 grid gap-8 lg:grid-cols-[220px_1fr]">
        <aside className="lg:sticky lg:top-24 lg:self-start"><AdminNav /></aside>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
