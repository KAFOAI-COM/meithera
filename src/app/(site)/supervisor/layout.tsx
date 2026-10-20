import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

/** Server-side role check in addition to middleware: supervisor or admin only. */
export default async function SupervisorLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login?next=/supervisor");
  if (session.role !== "supervisor" && session.role !== "admin") redirect("/login?next=/supervisor&error=role&need=supervisor");
  return <>{children}</>;
}
