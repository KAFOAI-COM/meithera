import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { DemoBanner } from "@/components/site/notices";

/** Full-screen presentation shell: demo banner always visible; admin or supervisor only. */
export default async function PresentationLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login?next=/presentation");
  if (session.role !== "admin" && session.role !== "supervisor") redirect("/login?next=/presentation&error=role&need=admin");
  return (
    <>
      <DemoBanner />
      {children}
    </>
  );
}
