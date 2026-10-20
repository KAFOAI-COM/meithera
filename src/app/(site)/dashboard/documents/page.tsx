import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { Documents } from "@/components/dashboard/documents";

export const metadata: Metadata = { title: "Documents" };

export default async function DocumentsPage() {
  const session = await getSession();
  if (!session) redirect("/login?next=/dashboard/documents");
  return <Documents userId={session.userId === "admin" ? "inv-001" : session.userId} userName={session.name} />;
}
