import type { Metadata } from "next";
import { getSession } from "@/lib/auth";
import { PageHeader } from "@/components/site/notices";
import { InvestWizard } from "@/components/invest/wizard";

export const metadata: Metadata = { title: "Investment simulation" };

export default async function InvestPropertyPage({ params }: { params: Promise<{ propertyId: string }> }) {
  const { propertyId } = await params;
  const session = await getSession();
  return (
    <>
      <PageHeader eyebrow="Investment simulation" title="Simulate an investment" intro="Six steps, each one simulated: amount → onboarding → risk acknowledgement → review → confirmation on Raya Chain." />
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <InvestWizard propertyId={propertyId} userId={session?.userId ?? "inv-001"} />
      </div>
    </>
  );
}
