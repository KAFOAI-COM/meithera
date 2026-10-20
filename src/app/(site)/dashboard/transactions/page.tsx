import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { Transactions } from "@/components/dashboard/transactions";

export const metadata: Metadata = { title: "Transactions" };

export default async function TransactionsPage() {
  const session = await getSession();
  if (!session) redirect("/login?next=/dashboard/transactions");
  return <Transactions userId={session.userId === "admin" ? "inv-001" : session.userId} />;
}
