import type { Metadata } from "next";
import { getSession } from "@/lib/auth";
import { DEMO_INVESTOR_ID } from "@/lib/data/seed";
import { InvestWizard } from "@/components/invest/wizard";

export const metadata: Metadata = { title: "Simulate an investment" };

export default async function InvestPropertyPage({ params }: { params: Promise<{ propertyId: string }> }) {
  const { propertyId } = await params;
  const session = await getSession();
  // Only the investor persona has its own holdings; other personas act for the fictional demo investor.
  const asInvestor = session?.role === "investor";
  return (
    <InvestWizard
      propertyId={propertyId}
      investorId={asInvestor ? session.userId : DEMO_INVESTOR_ID}
      personaName={session?.name ?? "Demo investor"}
      actingAsDemo={!asInvestor}
    />
  );
}
