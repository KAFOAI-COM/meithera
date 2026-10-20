"use client";

import { useState } from "react";
import { FileText, Printer, X } from "lucide-react";
import { useHydrated } from "@/components/site/hydrator";
import { useDemo } from "@/lib/store";
import { seedSpvs } from "@/lib/data/seed";
import { FEES, ECSPR, illustrate, illustrateLoan, netOperatingYield, totalCost } from "@/lib/finance";
import { cn, dateTime, eur, pct, shortDate } from "@/lib/utils";
import { Button, Card } from "@/components/ui";
import { RISK_WARNING } from "@/components/site/notices";
import { StageBadge } from "@/components/site/stage-badge";
import { KiisCard, RISK_FACTORS, LOAN_RISK_FACTORS } from "@/components/invest/kiis-card";
import { usePortfolio } from "./use-portfolio";

type DocId = "summary" | "risk" | "spv" | "assumptions" | "distribution" | "kiis";
const DOCS: { id: DocId; title: string; blurb: string }[] = [
  { id: "summary", title: "Investment summary", blurb: "Your simulated holdings, participation and illustrative income." },
  { id: "risk", title: "Risk disclosure", blurb: "The risk warning and principal risk factors." },
  { id: "spv", title: "SPV and loan information", blurb: "The companies and borrowers behind each offer." },
  { id: "assumptions", title: "Financial assumptions", blurb: "Fees, vacancy, costs and how every figure is computed." },
  { id: "distribution", title: "Distribution statement", blurb: "Simulated payouts received, with Raya Chain references." },
  { id: "kiis", title: "Key Investment Information Sheets", blurb: "One per holding, ECSPR Annex I style." },
];

export function Documents({ userId, userName }: { userId: string; userName: string }) {
  const hydrated = useHydrated();
  const pf = usePortfolio(userId);
  const { log, properties } = useDemo();
  const [open, setOpen] = useState<DocId | null>(null);
  if (!hydrated) return <div className="h-96 animate-pulse rounded-2xl bg-mint/50" />;

  const openDoc = (id: DocId) => {
    setOpen(id);
    log("DOCUMENT_GENERATION", userId, `Demo document "${DOCS.find((d) => d.id === id)?.title}" generated (watermarked)`);
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {DOCS.map((d) => (
          <button key={d.id} type="button" onClick={() => openDoc(d.id)} className={cn("rounded-2xl border bg-card p-5 text-left shadow-card hover:shadow-raised", open === d.id ? "border-emerald" : "border-line")}>
            <FileText className="h-6 w-6 text-forest" />
            <p className="mt-3 font-sans font-semibold">{d.title}</p>
            <p className="mt-1 text-sm text-muted">{d.blurb}</p>
            <p className="mt-3 text-xs font-semibold text-gold-ink">Demonstration — watermarked</p>
          </button>
        ))}
      </div>

      {open ? (
        <Card className="p-0">
          <div className="no-print flex flex-wrap items-center justify-between gap-2 border-b border-line p-4">
            <p className="font-sans text-sm font-semibold">{DOCS.find((d) => d.id === open)?.title}</p>
            <div className="flex gap-2">
              <Button size="sm" variant="secondary" onClick={() => window.print()}><Printer className="h-4 w-4" /> Print</Button>
              <Button size="sm" variant="ghost" onClick={() => setOpen(null)} aria-label="Close document"><X className="h-4 w-4" /></Button>
            </div>
          </div>
          <article className="watermark p-6 text-sm sm:p-10" id="print-area">
            <header className="flex flex-wrap items-start justify-between gap-3 border-b border-line pb-4">
              <div>
                <p className="font-serif text-2xl text-emerald">Meithera</p>
                <p className="text-xs text-muted">Demonstration document · generated {dateTime(new Date().toISOString())} · for {userName}</p>
              </div>
              <StageBadge stage={0} compact />
            </header>

            {open === "summary" ? (
              <section className="mt-5 space-y-4">
                <h2 className="font-sans text-lg font-semibold">Investment summary (simulated)</h2>
                <dl className="tabular grid gap-y-1 sm:grid-cols-[240px_1fr]">
                  <dt className="text-muted">Total entered</dt><dd>{eur(pf.totalInvested, 2)}</dd>
                  <dt className="text-muted">Fees deducted</dt><dd>{eur(pf.totalInvested - pf.netInvested, 2)}</dd>
                  <dt className="text-muted">Net invested / lent</dt><dd>{eur(pf.netInvested, 2)}</dd>
                  <dt className="text-muted">Illustrative annual income*</dt><dd>{eur(pf.annualIncome, 2)}</dd>
                  <dt className="text-muted">Realised to date (simulated)</dt><dd>{eur(pf.realised, 2)}</dd>
                </dl>
                <table className="tabular w-full text-xs">
                  <thead><tr className="text-left text-muted"><th className="py-1">Home</th><th>Date</th><th>Amount</th><th>Participation</th><th>Income / yr*</th><th>Chain tx</th></tr></thead>
                  <tbody>{pf.holdings.map((h) => <tr key={h.inv.id} className="border-t border-line"><td className="py-1">{h.p.title}</td><td>{shortDate(h.inv.createdAt)}</td><td>{eur(h.inv.amount, 2)}</td><td>{pct(h.inv.participation, 3)}</td><td>{eur(h.annualIncome, 2)}</td><td className="font-mono">{h.inv.txId}</td></tr>)}</tbody>
                </table>
                <p className="text-xs text-muted">*Before investor-level taxes. Illustrative; not guaranteed. No real investment exists.</p>
              </section>
            ) : null}

            {open === "risk" ? (
              <section className="mt-5 space-y-4">
                <h2 className="font-sans text-lg font-semibold">Risk disclosure</h2>
                <p className="rounded-lg bg-risk p-3 text-risk-ink">{RISK_WARNING}</p>
                <h3 className="font-sans font-semibold">Rent-share offers (Stage 2)</h3>
                <ul className="list-disc space-y-1 pl-5 text-muted">{RISK_FACTORS.map((r) => <li key={r}>{r}</li>)}</ul>
                <h3 className="font-sans font-semibold">Loan offers (Stage 1)</h3>
                <ul className="list-disc space-y-1 pl-5 text-muted">{LOAN_RISK_FACTORS.map((r) => <li key={r}>{r}</li>)}</ul>
                <p className="text-xs text-muted">Meithera is not authorised or regulated by the Central Bank of Ireland. The proposed structure is subject to regulatory assessment. Investors would hold an instrument issued by a company or a participation in a loan — never legal title to a home.</p>
              </section>
            ) : null}

            {open === "spv" ? (
              <section className="mt-5 space-y-4">
                <h2 className="font-sans text-lg font-semibold">SPV and loan information</h2>
                {seedSpvs.map((s) => {
                  const p = properties.find((x) => x.id === s.propertyId)!;
                  return (
                    <div key={s.id} className="rounded-lg border border-line p-3">
                      <div className="flex flex-wrap items-center justify-between gap-2"><p className="font-sans font-semibold">{s.name}</p><StageBadge stage={p.offerType === "loan" ? 1 : 2} compact /></div>
                      <dl className="tabular mt-2 grid gap-y-1 text-xs sm:grid-cols-[200px_1fr]">
                        <dt className="text-muted">Home</dt><dd>{p.title}</dd>
                        <dt className="text-muted">Instrument</dt><dd>{s.instrument}</dd>
                        <dt className="text-muted">Jurisdiction</dt><dd>{s.jurisdiction}</dd>
                        <dt className="text-muted">Status</dt><dd>{s.status}</dd>
                        <dt className="text-muted">{p.offerType === "loan" ? "Loan" : "Total project cost"}</dt><dd>{p.offerType === "loan" ? `${eur(p.loan!.amount)} · ${p.loan!.ratePct}% · ${p.loan!.termMonths} months · ${p.loan!.security}` : eur(totalCost(p))}</dd>
                        <dt className="text-muted">What investors hold</dt><dd>{p.offerType === "loan" ? "A participation in a secured loan" : "Notes in the company that owns the home — not the home"}</dd>
                      </dl>
                    </div>
                  );
                })}
              </section>
            ) : null}

            {open === "assumptions" ? (
              <section className="mt-5 space-y-4">
                <h2 className="font-sans text-lg font-semibold">Financial assumptions</h2>
                <dl className="tabular grid gap-y-1 sm:grid-cols-[280px_1fr]">
                  <dt className="text-muted">Acquisition fee (rent share, one-off)</dt><dd>{pct(FEES.entryFeePct, 1)} of the amount entered</dd>
                  <dt className="text-muted">Administration fee (rent share)</dt><dd>{pct(FEES.annualAdminPct, 1)} p.a. on net invested capital</dd>
                  <dt className="text-muted">Loan arrangement fee</dt><dd>{pct(FEES.loanArrangementPct, 1)}, paid by the borrower</dd>
                  <dt className="text-muted">Maximum loan-to-value</dt><dd>{pct(FEES.maxLtv, 0)} of the illustrative valuation</dd>
                  <dt className="text-muted">Distribution frequency</dt><dd>Monthly (illustrative)</dd>
                  <dt className="text-muted">ECSPR thresholds used</dt><dd>€5m cap · €1,000 / 5% warning · {ECSPR.reflectionDays}-day reflection · test pass {ECSPR.knowledgeTestPass}/5</dd>
                  <dt className="text-muted">Taxes</dt><dd>Not modelled. All income is before investor-level taxes.</dd>
                  <dt className="text-muted">Valuation changes</dt><dd>Not modelled. Capital shown at net invested.</dd>
                </dl>
                <table className="tabular w-full text-xs">
                  <thead><tr className="text-left text-muted"><th className="py-1">Home</th><th>Vacancy</th><th>Gross rent</th><th>Opex</th><th>NOI yield</th><th>Per €1,000 (annual, net)*</th></tr></thead>
                  <tbody>{properties.map((p) => <tr key={p.id} className="border-t border-line"><td className="py-1">{p.location}</td><td>{pct(p.vacancyPct, 0)}</td><td>{eur(p.annualRent)}</td><td>{eur(p.annualOpex)}</td><td>{pct(netOperatingYield(p))}</td><td>{p.offerType === "loan" ? `${eur(illustrateLoan(1000, p.loan!.ratePct, 12).totalInterest, 2)} interest` : eur(illustrate(p, 1000).annualIncome, 2)}</td></tr>)}</tbody>
                </table>
                <p className="text-xs text-muted">*Computed by src/lib/finance.ts. Illustrative only.</p>
              </section>
            ) : null}

            {open === "distribution" ? (
              <section className="mt-5 space-y-4">
                <h2 className="font-sans text-lg font-semibold">Distribution statement (simulated)</h2>
                <table className="tabular w-full text-xs">
                  <thead><tr className="text-left text-muted"><th className="py-1">Period</th><th>Home</th><th>Kind</th><th>Amount</th><th>Raya Chain</th></tr></thead>
                  <tbody>
                    {pf.myDistributions.map((d) => {
                      const a = d.allocations.find((x) => x.investorId === userId)!;
                      return <tr key={d.id} className="border-t border-line"><td className="py-1">{d.period}</td><td>{properties.find((p) => p.id === d.propertyId)?.location}</td><td>{d.kind}</td><td>{eur(a.amount, 2)}</td><td className="font-mono">{a.txId}</td></tr>;
                    })}
                    {!pf.myDistributions.length ? <tr><td colSpan={5} className="py-2 text-muted">No simulated distributions yet.</td></tr> : null}
                  </tbody>
                </table>
                <p>Total received (simulated): <strong>{eur(pf.realised, 2)}</strong>. No money has been paid. Before investor-level taxes.</p>
              </section>
            ) : null}

            {open === "kiis" ? (
              <section className="mt-5 space-y-4">
                <h2 className="font-sans text-lg font-semibold">Key Investment Information Sheets</h2>
                {Array.from(new Set(pf.holdings.map((h) => h.p.id))).map((pid) => {
                  const p = properties.find((x) => x.id === pid)!;
                  return <KiisCard key={pid} p={p} spv={seedSpvs.find((s) => s.propertyId === pid)} />;
                })}
                {!pf.holdings.length ? <p className="text-muted">No holdings — no sheets.</p> : null}
              </section>
            ) : null}

            <footer className="mt-8 border-t border-line pt-3 text-xs text-muted">Demonstration document. Not a real financial document, statement or offer. Meithera is not authorised or regulated by the Central Bank of Ireland.</footer>
          </article>
        </Card>
      ) : null}
    </div>
  );
}
