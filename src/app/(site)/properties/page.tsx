import type { Metadata } from "next";
import { Marketplace } from "@/components/site/marketplace";
import { PageHeader, IllustrativeNotice } from "@/components/site/notices";
import { StageBadge } from "@/components/site/stage-badge";

export const metadata: Metadata = { title: "Properties" };

export default function PropertiesPage() {
  return (
    <>
      <PageHeader
        image="/images/cork-1.webp"
        eyebrow="Property marketplace"
        title="Vacant homes, ready to return to use"
        intro="Fictional refurbishment projects showing how opportunities would be presented: Stage 1 secured loans and Stage 2 rent shares, with full costs, gross-to-net income, simulated funding and risks."
      >
        <div className="mt-7 flex flex-wrap items-center gap-2">
          <StageBadge stage={1} detail />
          <StageBadge stage={2} detail />
        </div>
        <IllustrativeNotice className="mt-6 max-w-xl">All properties are illustrative demonstration properties — not investment offers. None has been acquired. Photos are representative, not the actual homes.</IllustrativeNotice>
      </PageHeader>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <Marketplace />
      </div>
    </>
  );
}
