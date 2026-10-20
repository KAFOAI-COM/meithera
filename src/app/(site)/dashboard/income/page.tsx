import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { Income } from "@/components/dashboard/income";

export const metadata: Metadata = { title: "Income" };

export default async function IncomePage() {
  const session = await getSession();
  if (!session) redirect("/login?next=/dashboard/income");
  return <Income userId={session.userId === "admin" ? "inv-001" : session.userId} />;
}
