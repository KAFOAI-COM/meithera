import type { Metadata } from "next";
import { FaqList, faqs } from "@/components/site/faq-list";
import { PageHeader, RiskNotice } from "@/components/site/notices";
import { StageBadge } from "@/components/site/stage-badge";

export const metadata: Metadata = { title: "FAQ" };

const more = [
  { q: "What are the five stages?", a: "Stage 0 is this demonstration. Stage 1 is secured lending to refurbish vacant homes (possible under ECSPR via a licensed partner). Stage 2 is rent share: notes in the company that owns a home, with monthly income (possible under ECSPR). Stage 3 lets a tenant buy into their home step by step (requires further authorisation). Stage 4 makes Raya Chain the official register with cross-chain holdings and euro-stablecoin payouts (depends on EU reform). Only Stage 0 exists today." },
  { q: "What is Raya Chain?", a: "A permissioned ledger concept built by Raya Software Limited. One master record of every holding, payout, freeze and correction, under pseudonymous holder IDs, with the compliance rule evaluated on each transaction, and proofs anchored to other chains. In this demonstration it is simulated in your browser; no network exists." },
  { q: "What fees would apply?", a: "As described in the Innovation Hub submission: a 1.5% acquisition fee deducted once from the amount entered and a 0.5% a year administration fee on net invested capital, for rent-share offers. For loans the borrower pays a 1.5% arrangement fee and nothing is deducted from lenders. Every figure is shown gross to net and before investor-level taxes." },
  { q: "Who would hold my money?", a: "Never Meithera. In a live service an authorised payment institution or the licensed ECSP would hold client money in segregated accounts. The exact arrangement is an open regulatory question." },
  { q: "What is the supervisor view?", a: "A read-only dashboard of the kind a licensed platform could give its supervisor: offers against the €5m ECSPR cap, investor classification, test pass rates, warnings, withdrawals, AML alerts, freezes, complaints and the Raya Chain feed. It is illustrative and not a Central Bank system." },
];

export default function FaqPage() {
  return (
    <>
      <PageHeader eyebrow="FAQ" title="Plain answers" intro="Everything here describes a proposal. Where a question is open, we say so.">
        <div className="mt-6"><StageBadge stage={0} /></div>
      </PageHeader>
      <div className="mx-auto max-w-4xl space-y-8 px-4 py-12 sm:px-6">
        <FaqList items={[...faqs, ...more]} />
        <RiskNotice />
      </div>
    </>
  );
}
