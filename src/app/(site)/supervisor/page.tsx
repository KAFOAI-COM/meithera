import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { SupervisorView } from "@/components/supervisor/supervisor-view";

export const metadata: Metadata = { title: "Supervisory view" };

export default async function SupervisorPage() {
  const session = await getSession();
  if (!session || (session.role !== "supervisor" && session.role !== "admin")) redirect("/login?next=/supervisor&error=supervisor");
  return <SupervisorView />;
}
