import { cn } from "@/lib/utils";
import type { Stage } from "@/lib/types";
import { stageInfo, VARIANT_LABEL, type StageVariant } from "@/lib/stages";

const tone: Record<StageVariant, string> = {
  demo: "bg-demo text-demo-ink ring-demo-ink/15",
  ecspr: "bg-mint text-emerald ring-forest/20",
  authorisation: "bg-[#f4ecdc] text-gold-ink ring-gold/40",
  future: "bg-surface text-muted ring-line-strong/40",
};

const dot: Record<StageVariant, string> = {
  demo: "bg-demo-ink",
  ecspr: "bg-forest",
  authorisation: "bg-gold",
  future: "bg-line-strong",
};

/**
 * Stage badge carried by every feature. Variants follow the brief: "Possible under ECSPR" (mint),
 * "Requires further authorisation" (gold), "Future — depends on EU reform" (neutral).
 */
export function StageBadge({
  stage,
  variant,
  detail = false,
  className,
}: {
  stage: Stage;
  /** Override the stage's default legal-basis variant. */
  variant?: StageVariant;
  /** Also show the legal-basis label, e.g. "Possible under ECSPR". */
  detail?: boolean;
  className?: string;
}) {
  const info = stageInfo(stage);
  const v = variant ?? info.variant;
  return (
    <span
      className={cn("inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 font-sans text-[11px] font-semibold leading-none ring-1 ring-inset", tone[v], className)}
      title={VARIANT_LABEL[v]}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", dot[v])} aria-hidden />
      Stage {stage} · {info.name}
      {detail ? <span className="font-medium opacity-80">· {VARIANT_LABEL[v]}</span> : null}
    </span>
  );
}
