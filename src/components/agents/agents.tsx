"use client";

import { useMemo, useState } from "react";
import { Bot, CheckCircle2, Eye, Languages, ShieldAlert, FileBarChart2, Search, UserCheck } from "lucide-react";
import { useDemo } from "@/lib/store";
import { useHydrated } from "@/components/site/hydrator";
import { amlMonitor, onboardingGuide, scout, supervisoryReporter, type AgentRun } from "@/lib/agents";
import { cn, dateTime } from "@/lib/utils";
import { Badge, Button, Card } from "@/components/ui";
import { Tabs } from "@/components/ui/tabs";
import { StageBadge } from "@/components/site/stage-badge";
import { IllustrativeNotice } from "@/components/site/notices";

const ICONS = { scout: Search, guide: Languages, aml: ShieldAlert, reporter: FileBarChart2 } as const;
const RISK_TONE = { minimal: "mint", limited: "gold", high: "risk" } as const;

export function Agents() {
  const hydrated = useHydrated();
  const { properties, investors, investments, chain, audit, complaints, agentApprovals, approveAgent } = useDemo();
  const [lang, setLang] = useState<"en" | "ga" | "ar">("en");
  const [active, setActive] = useState<string>("scout");
  const runs: AgentRun[] = useMemo(() => [scout(), onboardingGuide(lang), amlMonitor({ properties, investors, investments, chain, audit, complaints }), supervisoryReporter({ properties, investors, investments, chain, audit, complaints })], [lang, properties, investors, investments, chain, audit, complaints]);
  if (!hydrated) return <div className="h-96 animate-pulse rounded-2xl bg-mint/50" />;
  const run = runs.find((r) => r.id === active)!;
  const Icon = ICONS[run.id as keyof typeof ICONS];
  const approvedAt = agentApprovals[run.id];
  return (
    <div className="space-y-6">
      <Tabs tabs={runs.map((r) => ({ id: r.id, label: r.name }))} value={active} onChange={setActive} />
      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <Card className="p-5">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-mint text-emerald"><Icon className="h-5 w-5" /></span>
              <div><p className="font-sans text-lg font-semibold">{run.name}</p><p className="text-xs text-muted">{run.purpose}</p></div>
            </div>
            <div className="flex flex-wrap gap-1"><StageBadge stage={run.stage} compact /><Badge tone={RISK_TONE[run.risk]}>AI Act risk: {run.risk}</Badge></div>
          </div>
          {run.id === "guide" ? (
            <div className="mt-4 flex gap-2">
              {(["en", "ga", "ar"] as const).map((l) => <button key={l} type="button" onClick={() => setLang(l)} className={cn("min-h-9 rounded-full border px-3 font-sans text-xs font-semibold", lang === l ? "border-emerald bg-emerald text-white" : "border-line bg-card text-muted")}>{l === "en" ? "English" : l === "ga" ? "Gaeilge" : "العربية"}</button>)}
            </div>
          ) : null}
          <p className="mt-5 font-sans text-xs font-semibold uppercase tracking-wide text-muted">Inputs</p>
          <dl className="mt-2 space-y-1 text-sm">{run.inputs.map((i) => <div key={i.label} className="grid gap-1 sm:grid-cols-[200px_1fr]"><dt className="text-muted">{i.label}</dt><dd className="text-ink">{i.value}</dd></div>)}</dl>
          <p className="mt-5 flex items-center gap-1 font-sans text-xs font-semibold uppercase tracking-wide text-muted"><Eye className="h-3.5 w-3.5" /> Reasoning trace (deterministic)</p>
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-muted">{run.trace.map((t) => <li key={t}>{t}</li>)}</ol>
        </Card>
        <div className="space-y-4">
          <Card className={cn("p-5", run.id === "guide" && lang === "ar" && "text-right")} dir={run.id === "guide" && lang === "ar" ? "rtl" : undefined}>
            <p className="font-sans text-xs font-semibold uppercase tracking-wide text-muted">Output</p>
            <p className="mt-1 font-sans text-lg font-semibold">{run.output.title}</p>
            <ul className="mt-3 space-y-2 text-sm">{run.output.lines.map((l) => <li key={l} className="rounded-lg bg-surface p-3">{l}</li>)}</ul>
          </Card>
          <Card className="p-5">
            <p className="flex items-center gap-2 font-sans text-sm font-semibold"><UserCheck className="h-4 w-4 text-forest" /> Human approval required</p>
            <p className="mt-1 text-xs text-muted">EU AI Act human oversight: nothing an agent produces takes effect until a named person approves it, and the approval is written to the audit log.</p>
            {approvedAt ? (
              <p className="mt-3 flex items-center gap-2 rounded-xl bg-mint p-3 text-sm text-emerald"><CheckCircle2 className="h-5 w-5" /> Approved {dateTime(approvedAt)} (simulated)</p>
            ) : (
              <Button className="mt-3" onClick={() => approveAgent(run.id)}><UserCheck className="h-4 w-4" /> {run.approvalLabel}</Button>
            )}
          </Card>
        </div>
      </div>
      <IllustrativeNotice><Bot className="mr-1 inline h-3.5 w-3.5" /> No language model is called. Each agent is a fixed function over the demonstration data; traces and outputs are reproducible.</IllustrativeNotice>
    </div>
  );
}
