import type { Metadata } from "next";
import { PageHeader } from "@/components/site/notices";
import { StageBadge } from "@/components/site/stage-badge";
import { Agents } from "@/components/agents/agents";

export const metadata: Metadata = { title: "Agents (simulated)" };

export default function AgentsPage() {
  return (
    <>
      <PageHeader eyebrow="Agentic AI · simulated" title="Four agents, every one under a human" intro="A Vacant-home Scout, an Onboarding Guide, an AML Monitor and a Supervisory Reporter. Each shows its inputs, a deterministic reasoning trace and its output, and nothing takes effect until a person approves it.">
        <div className="mt-6 flex flex-wrap gap-2"><StageBadge stage={0} /><StageBadge stage={1} /></div>
      </PageHeader>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6"><Agents /></div>
    </>
  );
}
