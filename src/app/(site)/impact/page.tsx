import type { Metadata } from "next";
import { PageHeader, SectionHeading } from "@/components/site/notices";
import { ImpactView } from "@/components/site/impact-view";
import { StageBadge } from "@/components/site/stage-badge";

export const metadata: Metadata = { title: "Impact" };

export default function ImpactPage() {
  return (
    <>
      <PageHeader
        image="/images/cork-1.webp"
        eyebrow="Impact"
        title="Homes back in use. Energy bills down. Projected, not promised."
        intro="What the four illustrative projects would deliver if they proceed as modelled. Nothing on this page has been achieved — Meithera has not acquired or refurbished any home."
      >
        <div className="mt-7 flex flex-wrap gap-2"><StageBadge stage={0} detail /></div>
      </PageHeader>
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <SectionHeading eyebrow="Projected impact" title="From the demo pipeline" />
        <div className="mt-10"><ImpactView /></div>
      </section>
    </>
  );
}
