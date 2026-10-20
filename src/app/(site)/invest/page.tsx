import type { Metadata } from "next";
import { PageHeader, IllustrativeNotice } from "@/components/site/notices";
import { OfferPicker } from "@/components/invest/offer-picker";
import { StageStrip } from "@/components/site/stage-badge";

export const metadata: Metadata = { title: "Simulate an investment" };

export default function InvestPage() {
  return (
    <>
      <PageHeader eyebrow="Investment simulation · step 1 of 6" title="Choose an offer" intro="Pick a Stage 1 loan or a Stage 2 rent-share offer. Both journeys share the same onboarding, risk acknowledgement and review steps, and both end with a record on the simulated Raya Chain.">
        <StageStrip className="mt-6" />
        <IllustrativeNotice className="mt-4 max-w-xl">No money, securities or tokens are involved. Every offer is fictional.</IllustrativeNotice>
      </PageHeader>
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <OfferPicker />
      </div>
    </>
  );
}
