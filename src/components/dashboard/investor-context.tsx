"use client";

import { createContext, useContext, useMemo } from "react";
import { useDemo } from "@/lib/store";
import { holdingsFor, incomeSeries, ledgerFor, payoutsFor } from "@/lib/portfolio";
import { pseudonym } from "@/lib/ledger";

interface Ctx {
  investorId: string;
  displayName: string;
  role: string;
}
const InvestorCtx = createContext<Ctx>({ investorId: "inv-001", displayName: "Demo investor", role: "investor" });

export function InvestorProvider({ value, children }: { value: Ctx; children: React.ReactNode }) {
  return <InvestorCtx.Provider value={value}>{children}</InvestorCtx.Provider>;
}

/** The current investor's holdings, payouts, ledger and 12-month income series, derived from the demo store. */
export function useInvestor() {
  const ctx = useContext(InvestorCtx);
  const investments = useDemo((s) => s.investments);
  const properties = useDemo((s) => s.properties);
  const txs = useDemo((s) => s.chain.txs);
  return useMemo(() => {
    const holdings = holdingsFor(ctx.investorId, investments, properties, txs);
    const payouts = payoutsFor(ctx.investorId, txs);
    const ledger = ledgerFor(ctx.investorId, txs);
    const series = incomeSeries(ctx.investorId, holdings, txs, "2026-07", 12);
    const committed = holdings.reduce((s, h) => s + h.sim.amount, 0);
    const net = holdings.reduce((s, h) => s + h.sim.netInvested, 0);
    const received = payouts.reduce((s, t) => s + (t.amount ?? 0), 0);
    const monthlyNow = holdings.reduce((s, h) => s + h.monthlyNet, 0);
    return { ...ctx, holder: pseudonym(ctx.investorId), holdings, payouts, ledger, series, committed, net, received, monthlyNow, allInvestments: investments.filter((i) => i.investorId === ctx.investorId) };
  }, [ctx, investments, properties, txs]);
}
