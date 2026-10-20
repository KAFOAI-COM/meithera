import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getSession } from "@/lib/auth";
import { buttonVariants } from "@/components/ui";
import { DemoBanner } from "@/components/site/notices";
import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";

/** Branded 404. Rendered in the root layout, so it brings its own banner, header and footer. */
export default async function NotFound() {
  const session = await getSession();
  return (
    <>
      <DemoBanner />
      <Header session={session ? { role: session.role, name: session.name } : null} />
      <main id="main" className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24">
        <div>
          <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-gold-ink">Error 404</p>
          <h1 className="mt-4 font-serif text-5xl leading-[1.05] tracking-tight text-ink sm:text-6xl">This door doesn’t lead anywhere — yet.</h1>
          <p className="mt-5 max-w-md text-lg text-muted">The page you asked for isn’t part of the demonstration. Like the homes we hope to fund, it may simply be empty for now.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/" className={buttonVariants({ size: "lg" })}>Back to the start <ArrowRight className="h-4 w-4" /></Link>
            <Link href="/properties" className={buttonVariants({ size: "lg", variant: "secondary" })}>Browse properties</Link>
          </div>
        </div>
        <div className="relative aspect-[4/5] max-h-[560px] overflow-hidden rounded-3xl">
          <Image src="/images/lim-1.webp" alt="" fill sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-emerald/70 to-transparent" />
        </div>
      </main>
      <Footer />
    </>
  );
}
