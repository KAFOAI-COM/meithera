"use client";

import { CheckCircle2, Clock } from "lucide-react";
import { useDemo } from "@/lib/store";
import { pseudonym } from "@/lib/ledger";
import { cn, eur, shortDate } from "@/lib/utils";
import { Button, Card, Table, Td, Th } from "@/components/ui";

const ok = (v: string) => /passed|clear|Completed/.test(v);

export default function AdminInvestors() {
  const investors = useDemo((s) => s.investors);
  const investments = useDemo((s) => s.investments);
  const audit = useDemo((s) => s.audit);
  const update = useDemo((s) => s.updateInvestor);
  const log = useDemo((s) => s.log);
  const approve = (id: string, name: string) => {
    update(id, { onboarding: { kyc: "Simulated — passed", aml: "Simulated — clear", risk: "Completed", appropriateness: "Placeholder — passed" } });
    log("ADMIN_CHANGE", "admin", `Simulated onboarding approved for ${name} (${pseudonym(id)}) after human review — wallet added to the Raya Chain allowlist`);
  };
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-3xl text-ink">Investors</h2>
        <p className="mt-1 text-sm text-muted">Five fictional investors. Onboarding results are simulated; approval here is the human-in-the-loop step a live service would require.</p>
      </div>
      <Card className="p-2 sm:p-4">
        <Table>
          <thead><tr><Th>Investor</Th><Th>Classification</Th><Th>KYC</Th><Th>AML</Th><Th>Knowledge test</Th><Th className="text-right">Committed</Th><Th /></tr></thead>
          <tbody>
            {investors.map((i) => {
              const pending = !ok(i.onboarding.kyc) || !ok(i.onboarding.aml);
              const tests = audit.filter((e) => e.type === "KNOWLEDGE_TEST" && e.actor === i.id);
              const last = tests.at(-1);
              const committed = investments.filter((x) => x.investorId === i.id && x.status !== "Withdrawn").reduce((s, x) => s + x.amount, 0);
              return (
                <tr key={i.id}>
                  <Td><span className="font-sans font-semibold text-ink">{i.name}</span><span className="block font-mono text-[11px] text-muted">{pseudonym(i.id)} · joined {shortDate(i.joined)}</span></Td>
                  <Td className="text-xs">{i.classification}</Td>
                  {[i.onboarding.kyc, i.onboarding.aml].map((v, n) => (
                    <Td key={n}><span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-sans text-[11px] font-semibold", ok(v) ? "bg-mint text-emerald" : "bg-demo text-demo-ink")}>{ok(v) ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}{v.replace("Simulated — ", "")}</span></Td>
                  ))}
                  <Td className="text-xs">{last ? last.detail.replace(" (simulated)", "") : "—"}{tests.length > 1 ? <span className="block text-muted">{tests.length} attempts</span> : null}</Td>
                  <Td className="tabular text-right">{eur(committed)}</Td>
                  <Td>{pending ? <Button size="sm" onClick={() => approve(i.id, i.name)}>Approve</Button> : null}</Td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </Card>
    </div>
  );
}
