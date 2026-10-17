"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export function Tabs<T extends string>({ tabs, value, onChange, className }: { tabs: { id: T; label: string }[]; value: T; onChange: (v: T) => void; className?: string }) {
  return (
    <div role="tablist" className={cn("inline-flex flex-wrap gap-1 rounded-xl border border-line bg-card p-1", className)}>
      {tabs.map((t) => (
        <button
          key={t.id}
          role="tab"
          aria-selected={value === t.id}
          onClick={() => onChange(t.id)}
          className={cn(
            "rounded-lg px-3 py-1.5 font-sans text-sm font-semibold transition-colors cursor-pointer",
            value === t.id ? "bg-emerald text-white" : "text-muted hover:bg-mint hover:text-emerald",
          )}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

export function Checkbox({ id, checked, onChange, children }: { id: string; checked: boolean; onChange: (v: boolean) => void; children: React.ReactNode }) {
  return (
    <label htmlFor={id} className="flex cursor-pointer items-start gap-3 rounded-xl border border-line bg-card p-4 text-sm">
      <input id={id} type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-0.5 h-5 w-5 shrink-0 accent-[#063f36]" />
      <span className="text-ink">{children}</span>
    </label>
  );
}
