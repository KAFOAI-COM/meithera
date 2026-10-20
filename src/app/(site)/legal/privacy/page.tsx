import type { Metadata } from "next";
import { LegalPage } from "@/components/site/legal-page";

export const metadata: Metadata = { title: "Privacy" };

export default function PrivacyPage() {
  return (
    <LegalPage
      current="/legal/privacy"
      eyebrow="Legal · privacy"
      title="Privacy notice"
      updated="20 October 2026"
      intro="This demonstration is built to collect nothing personal. Here is exactly what it stores, and how a live service would differ."
      sections={[
        { title: "What this demonstration stores", body: ["A signed session cookie naming the demo persona you chose (for example “Investor”), so the site knows which pages to show. It expires after eight hours and contains no personal data.", "Fictional demo state — properties, simulated investments, Raya Chain blocks — in your browser’s sessionStorage. It never leaves your device and is cleared when you close the tab or press “Reset demo”."] },
        { title: "What it never collects", body: ["No identity documents, dates of birth, addresses, bank details, email addresses or financial information. The registration form asks for a first name and county only, and they are used only to label your demo session.", "No analytics, advertising or third-party tracking scripts."] },
        { title: "Raya Chain and personal data", body: ["Holders appear on Raya Chain only as salted pseudonyms. In a live service, identity data would stay with the regulated onboarding provider, off-chain, so that personal data could be corrected or erased under the GDPR without rewriting the chain."] },
        { title: "A live service", body: ["A live service would publish a full privacy notice naming the data controller, the lawful basis for each purpose (including anti-money-laundering obligations), retention periods, international transfers and your rights to access, rectify, erase, restrict and port your data and to complain to the Data Protection Commission."] },
        { title: "Contact", body: ["Raya Software Limited, Ireland. This is a demonstration; please do not send personal data."] },
      ]}
    />
  );
}
