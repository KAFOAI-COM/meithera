"use client";

import Link from "next/link";
import { useEffect } from "react";
import { RotateCcw } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui";
import { useDemo } from "@/lib/store";

/** Branded error boundary for site pages. Offers a retry and a demo reset (clears sessionStorage state). */
export default function SiteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const resetDemo = useDemo((s) => s.reset);
  useEffect(() => {
    console.warn("[Meithera] page error", error.digest ?? error.message);
  }, [error]);
  return (
    <div className="mx-auto max-w-2xl px-4 py-24 text-center sm:px-6">
      <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-gold-ink">Something went wrong</p>
      <h1 className="mt-4 font-serif text-5xl tracking-tight text-ink">The demonstration hit a snag</h1>
      <p className="mt-4 text-lg text-muted">No real money or data is involved. Try again, or reset the demo to its starting state.</p>
      {error.digest ? <p className="mt-3 font-mono text-xs text-muted">ref {error.digest}</p> : null}
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button size="lg" onClick={reset}>Try again</Button>
        <Button
          size="lg"
          variant="secondary"
          onClick={() => {
            resetDemo();
            reset();
          }}
        >
          <RotateCcw className="h-4 w-4" /> Reset demo
        </Button>
        <Link href="/" className={buttonVariants({ size: "lg", variant: "ghost" })}>Home</Link>
      </div>
    </div>
  );
}
