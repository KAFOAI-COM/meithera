import type { Metadata } from "next";
import { Marketplace } from "@/components/site/marketplace";
import { PageHeader, IllustrativeNotice } from "@/components/site/notices";

export const metadata: Metadata = { title: "Properties" };

export default function PropertiesPage() {
  return (
    <>
      <PageHeader eyebrow="Property marketplace" title="Illustrative investment opportunities" intro="Fictional refurbishment projects showing how opportunities would be presented: full costs, indicative income, simulated funding and risks.">
        <IllustrativeNotice className="mt-6 max-w-xl">All properties are illustrative demonstration properties — not investment offers. None has been acquired.</IllustrativeNotice>
      </PageHeader>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <Marketplace />
      </div>
    </>
  );
}
