import { Layers } from "lucide-react";
import { STAGES, type StageNumber } from "@/lib/stages";
import { cn } from "@/lib/utils";

const tones: Record<string, string> = {
  demo: "bg-demo text-demo-ink",
  ecspr: "bg-mint text-emerald",
  authorisation: "bg-gold/30 text-gold-ink",
  "eu-reform": "bg-surface text-muted border border-line",
};

/**
 * Stage badge. Every feature, screen and slide carries one. Stages 1–4 are never presented as live:
 * the badge always shows the legal basis label ("Possible under ECSPR", "Requires further
 * authorisation", "Future — depends on EU reform").
 */
export function StageBadge({ stage, className, compact }: { stage: StageNumber; className?: string; compact?: boolean }) {
  const s = STAGES[stage];
  return (
    <span className={cn("inline-flex max-w-full items-center gap-1.5 rounded-full px-2.5 py-0.5 font-sans text-xs font-semibold", tones[s.basis], className)} title={s.summary}>
      <Layers className="h-3.5 w-3.5 shrink-0" aria-hidden />
      <span className="truncate">{s.short}</span>
      {!compact ? <span className="hidden font-normal opacity-80 sm:inline">· {s.basisLabel}</span> : null}
    </span>
  );
}

export function StageStrip({ active, className }: { active?: StageNumber; className?: string }) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {([0, 1, 2, 3, 4] as StageNumber[]).map((n) => (
        <StageBadge key={n} stage={n} compact className={cn(active !== undefined && active !== n && "opacity-50")} />
      ))}
    </div>
  );
}
