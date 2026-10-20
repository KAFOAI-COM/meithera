"use client";

import { useState } from "react";
import { z } from "zod";
import { Plus } from "lucide-react";
import { useDemo } from "@/lib/store";
import { useHydrated } from "@/components/site/hydrator";
import { pseudonym } from "@/lib/ledger";
import { eur, shortDate } from "@/lib/utils";
import { Badge, Button, Card, Input, Label, Select, Table, Th, Td } from "@/components/ui";
import { StageBadge } from "@/components/site/stage-badge";

const schema = z.object({ firstName: z.string().trim().min(1).max(30), county: z.string().trim().min(2).max(30), classification: z.enum(["Retail (non-sophisticated)", "Sophisticated (self-certified)"]) });

export function AdminInvestors() {
  const hydrated = useHydrated();
  const { investors, investments, addInvestor, log } = useDemo();
  const [f, setF] = useState({ firstName: "", county: "Dublin", classification: "Retail (non-sophisticated)" as z.infer<typeof schema>["classification"] });
  const [err, setErr] = useState("");
  if (!hydrated) return <div className="h-96 animate-pulse rounded-2xl bg-mint/50" />;
  const add = () => {
    const r = schema.safeParse(f);
    if (!r.success) { setErr("Enter a first name (fictional) and a county."); return; }
    const id = `inv-${String(investors.length + 1).padStart(3, "0")}`;
    addInvestor({ id, name: `${r.data.firstName} (fictional)`, email: `${r.data.firstName.toLowerCase()}.demo@example.ie`, county: r.data.county, classification: r.data.classification, onboarding: { kyc: "Simulated — pending", aml: "Simulated — review", risk: "Pending", appropriateness: "Placeholder — pending" }, joined: new Date().toISOString() });
    log("USER_REGISTRATION", "admin", `Fictional investor ${id} created from the admin console`);
    setF({ ...f, firstName: "" }); setErr("");
  };
  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <div className="flex items-center justify-between p-5 pb-2"><p className="font-sans text-sm font-semibold">Fictional investors</p><StageBadge stage={1} compact /></div>
        <Table>
          <thead><tr><Th>Investor</Th><Th>Holder ID</Th><Th>Classification</Th><Th>KYC</Th><Th>AML</Th><Th>Test</Th><Th className="text-right">Holdings</Th><Th>Joined</Th></tr></thead>
          <tbody>
            {investors.map((i) => {
              const mine = investments.filter((x) => x.investorId === i.id && x.status !== "Withdrawn (reflection period)");
              return (
                <tr key={i.id}>
                  <Td><span className="font-medium">{i.name}</span><span className="block text-xs text-muted">{i.id} · {i.county}</span></Td>
                  <Td className="font-mono text-xs">{pseudonym(i.id)}</Td>
                  <Td className="text-xs">{i.classification}</Td>
                  <Td>{i.onboarding.kyc === "Simulated — passed" ? <Badge tone="mint">passed</Badge> : <Badge tone="gold">pending</Badge>}</Td>
                  <Td>{i.onboarding.aml === "Simulated — clear" ? <Badge tone="mint">clear</Badge> : <Badge tone="risk">review</Badge>}</Td>
                  <Td className="tabular text-xs">{i.knowledgeTest ? `${i.knowledgeTest.score}/${i.knowledgeTest.total}` : "—"}</Td>
                  <Td className="tabular text-right">{mine.length} · {eur(mine.reduce((s, x) => s + x.amount, 0))}</Td>
                  <Td className="text-xs text-muted">{shortDate(i.joined)}</Td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </Card>
      <Card className="p-5">
        <p className="font-sans text-sm font-semibold">Add a fictional investor</p>
        <p className="mt-1 text-xs text-muted">Onboarding starts as pending; the investor’s wallet is not on the allowlist until KYC passes (simulated).</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-end">
          <div className="space-y-1"><Label htmlFor="ai-name">First name (fictional)</Label><Input id="ai-name" value={f.firstName} onChange={(e) => setF({ ...f, firstName: e.target.value })} maxLength={30} /></div>
          <div className="space-y-1"><Label htmlFor="ai-county">County</Label><Input id="ai-county" value={f.county} onChange={(e) => setF({ ...f, county: e.target.value })} maxLength={30} /></div>
          <div className="space-y-1"><Label htmlFor="ai-class">Classification</Label><Select id="ai-class" value={f.classification} onChange={(e) => setF({ ...f, classification: e.target.value as typeof f.classification })}><option>Retail (non-sophisticated)</option><option>Sophisticated (self-certified)</option></Select></div>
          <Button onClick={add}><Plus className="h-4 w-4" /> Add</Button>
        </div>
        {err ? <p className="mt-2 text-sm text-risk-ink">{err}</p> : null}
      </Card>
      <Card className="overflow-hidden">
        <div className="p-5 pb-2"><p className="font-sans text-sm font-semibold">Investment records</p></div>
        <Table>
          <thead><tr><Th>Ref</Th><Th>Investor</Th><Th>Home</Th><Th className="text-right">Amount</Th><Th className="text-right">Net</Th><Th>Status</Th><Th>Chain</Th></tr></thead>
          <tbody>{[...investments].reverse().map((x) => <tr key={x.id}><Td className="font-mono text-xs">{x.id}</Td><Td className="text-xs">{x.investorId}</Td><Td className="text-xs">{x.propertyId}</Td><Td className="tabular text-right">{eur(x.amount)}</Td><Td className="tabular text-right">{eur(x.netInvested, 2)}</Td><Td><Badge tone={x.status === "Withdrawn (reflection period)" ? "gold" : "mint"}>{x.status}</Badge></Td><Td className="font-mono text-xs">{x.txId ?? "—"}</Td></tr>)}</tbody>
        </Table>
      </Card>
    </div>
  );
}
