import type { Metadata } from "next";
import { LegalPage } from "@/components/site/legal-page";
import { RiskNotice } from "@/components/site/notices";

export const metadata: Metadata = { title: "Risk disclosure" };

export default function RiskDisclosurePage() {
  return (
    <LegalPage
      current="/legal/risk-disclosure"
      eyebrow="Legal · risk disclosure"
      title="Risk disclosure"
      updated="20 October 2026"
      intro="The principal risks of the proposed Meithera offers. Read this in full before using any calculator or simulation."
      lead={<RiskNotice className="mb-10" />}
      sections={[
        { title: "Capital at risk", body: ["You could lose some or all of the money you invest or lend. Past or illustrative performance is not a reliable indicator of future results.", "Offers would not be covered by the Deposit Guarantee Scheme or the Investor Compensation Scheme."] },
        { title: "Secured loans (Stage 1)", body: ["Interest is fixed and is payable only if the borrower can pay it. If the borrower defaults, recovery depends on enforcing a first legal charge over the property, which can take a long time and may not recover the full amount owed.", "You would not benefit from any increase in the value of the property."] },
        { title: "Rent shares (Stage 2)", body: ["Income depends on the home being let, tenants paying, and costs staying as modelled. Income can fall or stop.", "The value of the property company depends on the value of the home, which can fall. You would hold notes in a company, not the property itself."] },
        { title: "Refurbishment and development", body: ["Works on vacant and derelict homes can uncover problems, cost more than budgeted and take longer than planned. The contingency may not be enough, and delays defer income."] },
        { title: "Illiquidity", body: ["You should expect to hold for the full term or holding period. There is no guaranteed secondary market; any bulletin board would not match orders or guarantee a buyer.", "The timing and price of any sale of the home are uncertain."] },
        { title: "Concentration", body: ["Each offer relates to a single home. Spreading small amounts across several homes reduces, but does not remove, this risk."] },
        { title: "Platform and partners", body: ["The proposed service relies on third parties — a licensed crowdfunding service provider, a payment institution, property managers and builders. Their failure could cause delay or loss."] },
        { title: "Technology and records", body: ["Raya Chain is proposed as a tamper-evident mirror of the official register. Technology can fail or be compromised; the official register, not the chain, would determine your rights until any future reform permits otherwise."] },
        { title: "Regulatory and legal", body: ["The structure is proposed and subject to regulatory assessment. Laws, regulations and tax treatment can change and may affect the offers or end them."] },
        { title: "Tax", body: ["All figures are shown before investor-level taxes. Your tax position depends on your personal circumstances. Seek independent tax advice."] },
      ]}
    />
  );
}
