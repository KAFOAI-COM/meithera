"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Building2, FileText, Home, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";
import { StageBadge } from "./stage-badge";

type Mode = "rent-share" | "loan";

const COPY: Record<Mode, { nodes: [string, string][]; out: string[]; back: string[] }> = {
  "rent-share": {
    nodes: [
      ["Investor", "Enters from €100 through an authorised payment partner"],
      ["Notes", "Profit-participating notes, recorded on Raya Chain"],
      ["Property company", "One SPV per home; holds legal title"],
      ["Home", "Vacant home refurbished and let"],
    ],
    out: ["Funds", "Subscription", "Purchase & works"],
    back: ["Monthly income", "Net rent", "Rent"],
  },
  loan: {
    nodes: [
      ["Lender", "Lends from €100 through a licensed crowdfunding partner"],
      ["Loan participation", "Share of one secured loan, recorded on Raya Chain"],
      ["Borrower company", "Owns the home; grants a first legal charge"],
      ["Home", "Security for the loan; refurbished and let"],
    ],
    out: ["Funds", "Loan drawdown", "Works"],
    back: ["Monthly interest", "Interest", "Rent supports repayment"],
  },
};

const ICONS = [UserRound, FileText, Building2, Home];

function Connector({ out, back, vertical }: { out: string; back: string; vertical?: boolean }) {
  const reduce = useReducedMotion();
  const dot = (dir: 1 | -1, delay: number) =>
    reduce ? null : (
      <motion.span
        className={cn("absolute h-2 w-2 rounded-full", dir === 1 ? "bg-gold" : "bg-[#5fd3a5]", vertical ? (dir === 1 ? "left-[calc(50%-14px)]" : "left-[calc(50%+6px)]") : dir === 1 ? "top-[calc(50%-12px)]" : "top-[calc(50%+4px)]")}
        initial={vertical ? { top: dir === 1 ? "0%" : "100%" } : { left: dir === 1 ? "0%" : "100%" }}
        animate={vertical ? { top: dir === 1 ? ["0%", "100%"] : ["100%", "0%"] } : { left: dir === 1 ? ["0%", "100%"] : ["100%", "0%"] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "linear", delay }}
      />
    );
  return (
    <div className={cn("relative flex items-center justify-center", vertical ? "h-20 w-full" : "h-full min-w-16 flex-1")} aria-hidden>
      <span className={cn("absolute bg-gold/50", vertical ? "left-[calc(50%-11px)] top-0 h-full w-px" : "left-0 right-0 top-[calc(50%-9px)] h-px")} />
      <span className={cn("absolute bg-[#5fd3a5]/50", vertical ? "left-[calc(50%+9px)] top-0 h-full w-px" : "left-0 right-0 top-[calc(50%+7px)] h-px")} />
      {dot(1, 0)}
      {dot(1, 1.2)}
      {dot(-1, 0.6)}
      <span className={cn("absolute whitespace-nowrap font-sans text-[10px] font-semibold uppercase tracking-[0.08em] text-gold", vertical ? "right-[calc(50%+20px)] top-1/2 -translate-y-1/2" : "top-[calc(50%-32px)] left-1/2 -translate-x-1/2")}>{out}</span>
      <span className={cn("absolute whitespace-nowrap font-sans text-[10px] font-semibold uppercase tracking-[0.08em] text-[#5fd3a5]", vertical ? "left-[calc(50%+20px)] top-1/2 -translate-y-1/2" : "top-[calc(50%+16px)] left-1/2 -translate-x-1/2")}>{back}</span>
    </div>
  );
}

/** Investor → notes → property company (SPV) → home, with money flowing in and income flowing back. */
export function FlowDiagram() {
  const [mode, setMode] = useState<Mode>("rent-share");
  const c = COPY[mode];
  return (
    <div className="rounded-3xl bg-emerald p-5 text-white sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div role="tablist" className="inline-flex rounded-xl bg-white/10 p-1" aria-label="Offer type">
          {(["rent-share", "loan"] as Mode[]).map((m) => (
            <button
              key={m}
              role="tab"
              aria-selected={mode === m}
              onClick={() => setMode(m)}
              className={cn("min-h-10 rounded-lg px-4 font-sans text-sm font-semibold transition-colors", mode === m ? "bg-white text-emerald" : "text-white/70 hover:text-white")}
            >
              {m === "rent-share" ? "Rent share" : "Secured loan"}
            </button>
          ))}
        </div>
        <StageBadge stage={mode === "loan" ? 1 : 2} detail />
      </div>
      <div className="mt-10 flex flex-col items-stretch lg:h-56 lg:flex-row">
        {c.nodes.map(([title, sub], i) => {
          const Icon = ICONS[i];
          return (
            <div key={title} className="contents">
              <motion.div
                key={`${mode}-${i}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className={cn("flex flex-col items-center justify-center rounded-2xl p-5 text-center ring-1 lg:h-full lg:w-48 lg:shrink-0", i === 2 ? "bg-white text-emerald ring-white" : "bg-white/[0.06] ring-white/15")}
              >
                <span className={cn("flex h-11 w-11 items-center justify-center rounded-xl", i === 2 ? "bg-mint" : "bg-white/10")}><Icon className="h-5 w-5" /></span>
                <p className="mt-3 font-serif text-xl leading-tight">{title}</p>
                <p className={cn("mt-1.5 text-xs leading-snug", i === 2 ? "text-muted" : "text-white/60")}>{sub}</p>
              </motion.div>
              {i < c.nodes.length - 1 ? (
                <>
                  <div className="hidden flex-1 lg:flex"><Connector out={c.out[i]} back={c.back[i]} /></div>
                  <div className="lg:hidden"><Connector out={c.out[i]} back={c.back[i]} vertical /></div>
                </>
              ) : null}
            </div>
          );
        })}
      </div>
      <p className="mt-8 text-xs text-white/50">Illustrative. In a live service, money would move only through an authorised payment or custody partner — never through Meithera. Nothing moves in this demonstration.</p>
    </div>
  );
}
