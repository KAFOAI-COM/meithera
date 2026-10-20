"use client";

import { useMemo } from "react";
import { useDemo } from "@/lib/store";
import { annualIncomeFor, monthlyIncomeFor } from "@/lib/finance";
import { pseudonym } from "@/lib/ledger";
import type { Property, SimInvestment } from "@/lib/types";

export interface Holding {
  inv: SimInvestment;
  p: Property;
  annualIncome: number;
  monthlyIncome: number;
  realised: number;
  /** ISO month (YYYY-MM) from which illustrative income is projected to start. */
  incomeFrom: string;
}

function addMonths(ym: string, n: number) {
  const [y, m] = ym.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1 + n, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

export function monthKey(iso: string) {
  return iso.slice(0, 7);
}

export function monthLabel(ym: string) {
  const [y, m] = ym.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString("en-IE", { month: "short", year: "2-digit", timeZone: "UTC" });
}

/** When a holding starts paying: loans from the month after issue; rent share from the month after the tenancy begins. */
export function incomeStart(p: Property, inv: SimInvestment) {
  if (p.offerType === "loan") return addMonths(monthKey(inv.createdAt), 1);
  const tenancy = p.passport.find((e) => e.kind === "tenancy")?.date ?? p.milestones.find((m) => /tenancy/i.test(m.label))?.date;
  return tenancy ? addMonths(tenancy.slice(0, 7), 1) : addMonths(monthKey(inv.createdAt), 12);
}

export function usePortfolio(userId: string) {
  const { investments, properties, chain, distributions } = useDemo();
  return useMemo(() => {
    const me = pseudonym(userId);
    const mine = investments.filter((i) => i.investorId === userId && i.status !== "Withdrawn (reflection period)");
    const payoutTxs = chain.txs.filter((t) => t.to === me && t.status === "confirmed" && (t.type === "DISTRIBUTION" || t.type === "REPAYMENT"));
    const holdings: Holding[] = mine
      .map((inv) => {
        const p = properties.find((x) => x.id === inv.propertyId);
        if (!p) return null;
        return {
          inv,
          p,
          annualIncome: annualIncomeFor(p, inv.amount),
          monthlyIncome: monthlyIncomeFor(p, inv.amount),
          realised: payoutTxs.filter((t) => t.propertyId === p.id).reduce((s, t) => s + (t.amountEur ?? 0), 0),
          incomeFrom: incomeStart(p, inv),
        };
      })
      .filter((h): h is Holding => !!h);
    const totalInvested = holdings.reduce((s, h) => s + h.inv.amount, 0);
    const netInvested = holdings.reduce((s, h) => s + h.inv.netInvested, 0);
    const annualIncome = holdings.reduce((s, h) => s + h.annualIncome, 0);
    const realised = payoutTxs.reduce((s, t) => s + (t.amountEur ?? 0), 0);
    const homes = new Set(holdings.map((h) => h.p.id)).size;
    const withdrawn = investments.filter((i) => i.investorId === userId && i.status === "Withdrawn (reflection period)");
    const myDistributions = distributions.filter((d) => d.allocations.some((a) => a.investorId === userId));
    // 12-month calendar from the current month.
    const now = new Date();
    const start = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
    const calendar = Array.from({ length: 12 }, (_, i) => {
      const ym = addMonths(start, i);
      const projected = holdings.filter((h) => h.incomeFrom <= ym).reduce((s, h) => s + h.monthlyIncome, 0);
      const realisedM = payoutTxs.filter((t) => monthKey(t.at) === ym).reduce((s, t) => s + (t.amountEur ?? 0), 0);
      const paying = holdings.filter((h) => h.incomeFrom <= ym).map((h) => h.p.location);
      return { ym, label: monthLabel(ym), projected, realised: realisedM, paying };
    });
    return { me, holdings, totalInvested, netInvested, annualIncome, monthlyIncome: annualIncome / 12, realised, homes, payoutTxs, withdrawn, myDistributions, calendar };
  }, [investments, properties, chain, distributions, userId]);
}
