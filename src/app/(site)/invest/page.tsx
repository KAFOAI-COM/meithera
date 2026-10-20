import type { Metadata } from "next";
import { OfferPicker } from "@/components/invest/offer-picker";
import { PageHeader } from "@/components/site/notices";
import { StageBadge } from "@/components/site/stage-badge";

export const metadata: Metadata = { title: "Simulate an investment" };

export default function InvestPage() {
  return (
    <>
      <PageHeader eyebrow="Step 1 · Choose an offer" title="Which home would you like to help fund?" intro="Pick an open, illustrative offer. You’ll set an amount, complete simulated onboarding and acknowledge the risks — nothing real happens at any step.">
        <div className="mt-6 flex flex-wrap gap-2"><StageBadge stage={1} detail /><StageBadge stage={2} detail /></div>
      </PageHeader>
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6"><OfferPicker /></div>
    </>
  );
}
