import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { TenantSimulator } from "@/components/dashboard/tenant";

export const metadata: Metadata = { title: "My home — staircasing (Stage 3)" };

export default async function TenantPage() {
  const session = await getSession();
  if (!session) redirect("/login?next=/dashboard/tenant");
  if (session.role !== "tenant" && session.role !== "admin") redirect("/login?next=/dashboard/tenant&error=role&need=tenant");
  return <TenantSimulator />;
}
