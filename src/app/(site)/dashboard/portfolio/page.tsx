import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { Portfolio } from "@/components/dashboard/portfolio";

export const metadata: Metadata = { title: "Portfolio" };

export default async function PortfolioPage() {
  const session = await getSession();
  if (!session) redirect("/login?next=/dashboard/portfolio");
  return <Portfolio userId={session.userId === "admin" ? "inv-001" : session.userId} />;
}
