import type { Metadata } from "next";
import Link from "next/link";
import { Presentation } from "lucide-react";
import { PageHeader } from "@/components/site/notices";
import { StageStrip } from "@/components/site/stage-badge";
import { RegulatoryDemo } from "@/components/regulatory/demo";
import { buttonVariants } from "@/components/ui";

export const metadata: Metadata = { title: "Regulatory demonstration" };

export default function RegulatoryDemoPage() {
  return (
    <>
      <PageHeader eyebrow="Regulatory demonstration · for the Central Bank of Ireland Innovation Hub" title="How Meithera proposes to build investor protection, transparency and supervision into its architecture" intro="Nine sections: the investor lifecycle, the structure, funds and distribution flows, the simulated ledger, the four open classification questions, the control matrix, the financial model and a market comparison. Nothing here claims or implies authorisation.">
        <StageStrip className="mt-6" />
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/presentation" className={buttonVariants()}><Presentation className="h-4 w-4" /> Full-vision presentation</Link>
          <Link href="/supervisor" className={buttonVariants({ variant: "secondary" })}>Supervisor view</Link>
          <Link href="/roadmap" className={buttonVariants({ variant: "ghost" })}>Roadmap</Link>
        </div>
      </PageHeader>
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6"><RegulatoryDemo /></div>
    </>
  );
}
