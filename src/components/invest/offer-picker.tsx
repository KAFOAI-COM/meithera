"use client";

import Link from "next/link";
import { ArrowRight, Lock } from "lucide-react";
import { useDemo } from "@/lib/store";
import { useHydrated } from "@/components/site/hydrator";
import { eur, pct } from "@/lib/utils";
import { loanToValue, netOperatingYield, raiseTarget } from "@/lib/finance";
import { Badge, Card, Progress, buttonVariants } from "@/components/ui";
import { PropertyArt } from "@/components/site/property-art";
import { StageBadge } from "@/components/site/stage-badge";
import { statusMeta } from "@/components/site/property-card";
import { Stepper } from "./stepper";

export function OfferPicker() {
  const properties = useDemo((s) => s.properties);
  const hydrated = useHydrated();
  return (
    <div className="space-y-8">
      <Stepper current={1} />
      <div className="grid gap-6 sm:grid-cols-2">
        {(hydrated ? properties : []).map((p) => {
          const isLoan = p.offerType === "loan" && p.loan;
          const open = p.status === "open";
          return (
            <Card key={p.id} className="flex flex-col overflow-hidden">
              <div className="relative aspect-[16/7] overflow-hidden">
                <PropertyArt palette={p.palette} kind={p.type.includes("apartment") ? "apartment" : "terrace"} variant="street" label={`Illustration of ${p.title}`} />
                <Badge tone={statusMeta[p.status].tone} className="absolute left-3 top-3">{statusMeta[p.status].label}</Badge>
                <StageBadge stage={isLoan ? 1 : 2} compact className="absolute right-3 top-3" />
              </div>
              <div className="flex flex-1 flex-col p-5">
                <h3 className="font-sans text-lg font-semibold">{p.title}</h3>
                <p className="mt-1 text-sm text-muted">{isLoan ? `Secured loan · ${p.loan!.ratePct}% fixed · ${p.loan!.termMonths} months · LTV ${pct(loanToValue(p), 0)}` : `Rent share · NOI yield ${pct(netOperatingYield(p))} · monthly income`}</p>
                <div className="mt-4">
                  <div className="mb-1 flex justify-between text-xs text-muted"><span>Simulated funding of {eur(raiseTarget(p))}</span><span className="tabular">{Math.round(p.fundedPct * 100)}%</span></div>
                  <Progress value={p.fundedPct} label={`Simulated funding ${Math.round(p.fundedPct * 100)}%`} />
                </div>
                <div className="mt-auto pt-5">
                  {open ? (
                    <Link href={`/invest/${p.id}`} className={buttonVariants({ className: "w-full" })}>Simulate {isLoan ? "a loan" : "an investment"} <ArrowRight className="h-4 w-4" /></Link>
                  ) : (
                    <span className={buttonVariants({ variant: "secondary", className: "w-full cursor-not-allowed opacity-70" })}><Lock className="h-4 w-4" /> {p.status === "funded" ? "Fully subscribed (simulated)" : "Not yet open"}</span>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
        {!hydrated ? [0, 1, 2, 3].map((i) => <div key={i} className="h-72 animate-pulse rounded-2xl bg-mint/50" />) : null}
      </div>
    </div>
  );
}
