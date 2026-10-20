"use client";

import Link from "next/link";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui";

/** Route error boundary. Never shows stack traces; offers retry and reset. */
export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center px-4 py-20 text-center sm:px-6">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-risk text-risk-ink"><AlertTriangle className="h-7 w-7" /></span>
      <h1 className="mt-6 font-serif text-4xl font-medium tracking-tight">Something went wrong in the demonstration</h1>
      <p className="mt-3 max-w-md text-muted">No real data is involved, so nothing is at risk. Try again, or reset the demo from the dashboard settings if the problem persists.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button onClick={reset}><RotateCcw className="h-4 w-4" /> Try again</Button>
        <Link href="/" className={buttonVariants({ variant: "secondary" })}>Home</Link>
      </div>
    </main>
  );
}
