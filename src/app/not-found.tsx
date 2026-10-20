import Link from "next/link";
import { DemoBanner } from "@/components/site/notices";
import { Logo } from "@/components/site/logo";
import { buttonVariants } from "@/components/ui";

export default function NotFound() {
  return (
    <>
      <DemoBanner />
      <main className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center px-4 py-20 text-center sm:px-6">
        <Logo />
        <p className="mt-8 font-sans text-xs font-semibold uppercase tracking-[0.08em] text-gold-ink">404</p>
        <h1 className="mt-2 font-serif text-4xl font-medium tracking-tight">This page does not exist in the demonstration</h1>
        <p className="mt-3 max-w-md text-muted">The address may be wrong, or the page is not part of this build. Nothing has been lost; the demo keeps its state in this tab.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/" className={buttonVariants()}>Home</Link>
          <Link href="/properties" className={buttonVariants({ variant: "secondary" })}>Homes</Link>
          <Link href="/roadmap" className={buttonVariants({ variant: "ghost" })}>Roadmap</Link>
        </div>
      </main>
    </>
  );
}
