import type { Metadata } from "next";
import { PageHeader } from "@/components/site/notices";
import { StageBadge } from "@/components/site/stage-badge";
import { Card } from "@/components/ui";

export const metadata: Metadata = { title: "Terms of use" };

export default function TermsPage() {
  return (
    <>
      <PageHeader eyebrow="Legal" title="Terms of use" intro="Demonstration terms for this website only. They are not the terms of any investment service.">
        <div className="mt-6"><StageBadge stage={0} /></div>
      </PageHeader>
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        <Card className="p-6 text-sm leading-relaxed text-muted">
          <ol className="list-decimal space-y-3 pl-5">
            <li><strong className="text-ink">Demonstration only.</strong> This website is a demonstration of a proposed platform. Nothing on it is an offer, invitation, recommendation or advice to invest, lend or borrow. No real investments are available.</li>
            <li><strong className="text-ink">No authorisation.</strong> Raya Software Limited and Meithera are not authorised or regulated by the Central Bank of Ireland. The Central Bank has not approved or endorsed this platform. References to ECSPR, MiFID II, AIFMD and the DLT Pilot Regime describe questions under consideration, not conclusions.</li>
            <li><strong className="text-ink">Fictional content.</strong> All homes, people, companies, figures, transactions and ledger records are fictional and illustrative. Any resemblance to real homes or people is unintended.</li>
            <li><strong className="text-ink">No reliance.</strong> Figures are computed from stated assumptions for illustration and may contain errors. Do not rely on them for any decision.</li>
            <li><strong className="text-ink">Simulated ledger.</strong> “Raya Chain” on this site is a browser simulation. No blockchain, wallet, token or smart contract exists or is used.</li>
            <li><strong className="text-ink">Personal data.</strong> Do not enter personal information. See the Privacy notice.</li>
            <li><strong className="text-ink">Intellectual property.</strong> The design, text and code are owned by Raya Software Limited unless stated otherwise.</li>
            <li><strong className="text-ink">Governing law.</strong> Ireland.</li>
          </ol>
          <p className="mt-6 text-xs">Demonstration terms. A live service would publish full terms, a key investment information sheet per offer and a complaints procedure.</p>
        </Card>
      </div>
    </>
  );
}
