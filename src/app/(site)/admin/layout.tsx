import { redirect } from "next/navigation";
import { Settings2 } from "lucide-react";
import { getSession } from "@/lib/auth";
import { AdminNav } from "@/components/admin/admin-nav";
import { StageBadge } from "@/components/site/stage-badge";

/** Server-side role check (middleware also gates /admin). */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/login?next=/admin/overview&error=admin");
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6">
        <div>
          <p className="flex items-center gap-2 font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-gold-ink"><Settings2 className="h-4 w-4" /> Platform administration · demo</p>
          <h1 className="mt-2 font-serif text-4xl tracking-tight text-ink">Operator console</h1>
        </div>
        <StageBadge stage={0} detail />
      </div>
      <div className="mt-8 grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="lg:sticky lg:top-24 lg:self-start"><AdminNav /></aside>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
