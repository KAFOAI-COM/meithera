import type { Metadata } from "next";
import { PageHeader } from "@/components/site/notices";
import { StageBadge } from "@/components/site/stage-badge";
import { SupervisorView } from "@/components/supervisor/view";

export const metadata: Metadata = { title: "Supervisor view (demonstration)" };

export default function SupervisorPage() {
  return (
    <>
      <PageHeader eyebrow="Supervisor view · demonstration" title="What a supervisor could see, live" intro="A read-only dashboard of the kind an authorised crowdfunding service provider could give its supervisor: offers against the ECSPR cap, investor classification and tests, warnings, withdrawals, AML alerts, freezes, complaints, the audit chain and the Raya Chain feed.">
        <div className="mt-6 flex flex-wrap gap-2"><StageBadge stage={0} /><StageBadge stage={2} /></div>
      </PageHeader>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <SupervisorView />
      </div>
    </>
  );
}
