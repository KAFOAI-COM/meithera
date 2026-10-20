import type { Metadata } from "next";
import { PageHeader } from "@/components/site/notices";
import { StageBadge } from "@/components/site/stage-badge";
import { Card } from "@/components/ui";

export const metadata: Metadata = { title: "Privacy" };

export default function PrivacyPage() {
  return (
    <>
      <PageHeader eyebrow="Legal" title="Privacy" intro="This demonstration collects no personal data. This notice explains what the demo stores and how a live service would differ.">
        <div className="mt-6"><StageBadge stage={0} /></div>
      </PageHeader>
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        <Card className="p-6 text-sm leading-relaxed text-muted">
          <h2 className="font-sans text-lg font-semibold text-ink">What the demonstration stores</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>A signed, httpOnly cookie recording which fictional persona you chose, for up to eight hours. It contains no personal data.</li>
            <li>Fictional demo state (simulated holdings, the simulated Raya Chain, the audit log) in your browser’s sessionStorage. It disappears when the tab closes and is never sent to a server.</li>
            <li>No analytics, no third-party scripts, no network calls after the page loads. Fonts are self-hosted at build time.</li>
          </ul>
          <h2 className="mt-6 font-sans text-lg font-semibold text-ink">Please do not enter personal information</h2>
          <p className="mt-2">The register form asks only for a first name and a county and maps to the fictional demo investor. Do not enter your real name, email address or any identity information anywhere on this site.</p>
          <h2 className="mt-6 font-sans text-lg font-semibold text-ink">How a live service would differ</h2>
          <p className="mt-2">A live service would process personal data for identity verification, AML screening and investor classification under GDPR and the Criminal Justice (Money Laundering and Terrorist Financing) Act 2010, with an authorised partner as controller or joint controller, a data protection impact assessment, and retention limits. Holder identifiers on Raya Chain would remain pseudonymous; the mapping to a person would live only in the authorised entity’s identity store so that erasure rights can be honoured without altering the ledger.</p>
          <p className="mt-6 text-xs">Raya Software Limited · Ireland. Demonstration notice; not a published privacy policy.</p>
        </Card>
      </div>
    </>
  );
}
