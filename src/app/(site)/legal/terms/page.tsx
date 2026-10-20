import type { Metadata } from "next";
import { LegalPage } from "@/components/site/legal-page";

export const metadata: Metadata = { title: "Terms of use" };

export default function TermsPage() {
  return (
    <LegalPage
      current="/legal/terms"
      eyebrow="Legal · terms"
      title="Terms of use"
      updated="20 October 2026"
      intro="The terms on which you may use this demonstration website."
      sections={[
        { title: "Demonstration only", body: ["Meithera is a demonstration MVP built by Raya Software Limited. No real investments are available. No money can be transferred, and no securities, notes, loans or tokens are issued.", "Every property, person, figure and transaction is fictional and illustrative. Photographs are representative and do not show the demonstration properties."] },
        { title: "Not an offer or advice", body: ["Nothing on this website is an offer, invitation or solicitation to invest, lend or buy any financial instrument, nor investment, legal or tax advice. Do not rely on it to make any financial decision."] },
        { title: "Regulatory status", body: ["Meithera is not authorised or regulated by the Central Bank of Ireland or any other regulator. The Central Bank has not approved or endorsed this website. References to regulation describe a proposed pathway that is subject to regulatory assessment."] },
        { title: "Simulations", body: ["Calculators, onboarding steps, knowledge tests, distributions and Raya Chain records are simulations that run in your browser. They do not perform identity, AML, suitability or appropriateness checks of any legal effect."] },
        { title: "Intellectual property", body: ["The Meithera name, design and software are owned by Raya Software Limited. Photography is used under the Pexels licence."] },
        { title: "Liability", body: ["The website is provided “as is” for demonstration. To the extent permitted by law, Raya Software Limited is not liable for any loss arising from its use."] },
        { title: "Governing law", body: ["These terms are governed by the laws of Ireland, and the Irish courts have jurisdiction."] },
      ]}
    />
  );
}
