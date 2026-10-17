import { getSession } from "@/lib/auth";
import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { DemoBanner } from "@/components/site/notices";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  return (
    <>
      <DemoBanner />
      <Header session={session ? { role: session.role, name: session.name } : null} />
      <main id="main" className="min-h-[60vh]">{children}</main>
      <Footer />
    </>
  );
}
