import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export const INVEST_STEPS = ["Choose an offer", "Amount", "Onboarding", "Risk acknowledgement", "Review", "Confirmation"] as const;

export function Stepper({ current }: { current: number }) {
  return (
    <ol className="flex flex-wrap gap-2 sm:gap-3" aria-label="Investment simulation steps">
      {INVEST_STEPS.map((label, i) => {
        const n = i + 1;
        const state = n < current ? "done" : n === current ? "current" : "todo";
        return (
          <li key={label} className="flex items-center gap-2 text-xs sm:text-sm" aria-current={state === "current" ? "step" : undefined}>
            <span
              className={cn(
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-sans text-xs font-bold",
                state === "done" && "bg-forest text-white",
                state === "current" && "bg-emerald text-white ring-4 ring-mint",
                state === "todo" && "border border-line-strong text-muted",
              )}
            >
              {state === "done" ? <Check className="h-4 w-4" /> : n}
            </span>
            <span className={cn("font-sans font-medium", state === "current" ? "text-ink" : "text-muted", state === "todo" && "hidden sm:inline")}>{label}</span>
            {n < INVEST_STEPS.length ? <span className="mx-1 hidden h-px w-6 bg-line sm:block" aria-hidden /> : null}
          </li>
        );
      })}
    </ol>
  );
}
