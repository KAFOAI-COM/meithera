import { cn } from "@/lib/utils";

export function Logo({ className, inverse }: { className?: string; inverse?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden>
        <rect width="28" height="28" rx="8" fill={inverse ? "#ddf3e8" : "#063f36"} />
        <path d="M8 23 V13 a6 6 0 0 1 12 0 V23 Z" fill={inverse ? "#063f36" : "#ddf3e8"} />
        <path d="M11 13 a3 3 0 0 1 6 0 Z" fill="#c7a86d" />
      </svg>
      <span className={cn("font-serif text-[22px] font-medium tracking-tight", inverse ? "text-white" : "text-emerald")}>Meithera</span>
    </span>
  );
}
