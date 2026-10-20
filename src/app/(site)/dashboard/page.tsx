import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { DashboardOverview } from "@/components/dashboard/overview";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login?next=/dashboard");
  if (session.role === "tenant") redirect("/dashboard/tenant");
  if (session.role === "supervisor") redirect("/supervisor");
  return <DashboardOverview userId={session.userId === "admin" ? "inv-001" : session.userId} />;
}
