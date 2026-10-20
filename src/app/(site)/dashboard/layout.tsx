import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { DEMO_INVESTOR_ID } from "@/lib/data/seed";
import { InvestorProvider } from "@/components/dashboard/investor-context";
import { DashboardShell } from "@/components/dashboard/shell";

/** Server-side session check (middleware also gates /dashboard). Non-investor personas view the fictional demo investor. */
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login?next=/dashboard");
  const investorId = session.role === "investor" ? session.userId : session.role === "tenant" ? session.userId : DEMO_INVESTOR_ID;
  return (
    <InvestorProvider value={{ investorId, displayName: session.name, role: session.role }}>
      <DashboardShell>{children}</DashboardShell>
    </InvestorProvider>
  );
}
