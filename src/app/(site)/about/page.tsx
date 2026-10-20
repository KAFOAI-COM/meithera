import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Building2, Landmark, Code2, HeartHandshake } from "lucide-react";
import { Card, buttonVariants } from "@/components/ui";
import { PageHeader, SectionHeading } from "@/components/site/notices";
import { StageBadge } from "@/components/site/stage-badge";

export const metadata: Metadata = { title: "About" };

export default function AboutPage() {
  return (
    <>
      <PageHeader eyebrow="About" title="Raya Software Limited and the Meithera proposal" intro="Meithera is the proposed consumer brand of Raya Software Limited, a company incorporated in Ireland (CRO). Meithera is not authorised or regulated by the Central Bank of Ireland; this website is a demonstration built for discussion with the Central Bank's Innovation Hub.">
        <div className="mt-6"><StageBadge stage={0} /></div>
      </PageHeader>
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <SectionHeading eyebrow="Mission" title="Let ordinary people fund new housing supply, in small amounts, with every euro visible." intro="Irish people can't afford to buy, rents are punishing, and thousands of homes sit vacant. Meithera lets ordinary people fund new supply — refurbishing vacant homes — in small amounts, through an EU crowdfunding licence (ECSPR), with every euro, holder and payout recorded on Raya Chain and visible to the supervisor. Over time, tenants can buy into the home they live in." />
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[
            [Building2, "The company", "Raya Software Limited, incorporated in Ireland and registered with the Companies Registration Office. Builds the platform and the Raya Chain technology."],
            [Landmark, "Regulatory posture", "No financial service is offered today. The Stage 1 proposal is to launch under a licensed ECSP partner and seek our own authorisation later. The Innovation Hub provides guidance, not approval."],
            [Code2, "Raya Chain", "A permissioned ledger concept: one master record, pseudonymous holders, compliance rules that travel with the asset, proofs anchored to other chains. Simulated here."],
            [HeartHandshake, "Meithera", "From meitheal — neighbours gathering to bring in the harvest. Many small contributions, one home brought back to life."],
          ].map(([Icon, t, d]) => {
            const I = Icon as typeof Building2;
            return <Card key={t as string} className="p-6"><I className="h-6 w-6 text-forest" /><h3 className="mt-3 font-sans font-semibold">{t as string}</h3><p className="mt-2 text-sm text-muted">{d as string}</p></Card>;
          })}
        </div>
      </section>
      <section className="border-y border-line bg-card">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <SectionHeading eyebrow="What this site is" title="A demonstration, not an offer" intro="Every home, person, figure and transaction is fictional and labelled illustrative. No money can be moved, no securities or tokens are issued, no personal data is collected. The purpose is to show regulators, partners and prospective investors how the proposed platform would work and what controls it would carry." />
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/compliance" className={buttonVariants()}>Regulatory readiness <ArrowRight className="h-4 w-4" /></Link>
            <Link href="/roadmap" className={buttonVariants({ variant: "secondary" })}>Roadmap</Link>
            <Link href="/legal/risk-disclosure" className={buttonVariants({ variant: "ghost" })}>Risk disclosure</Link>
          </div>
        </div>
      </section>
    </>
  );
}
