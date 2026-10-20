"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import { FileText, Printer } from "lucide-react";
import { useInvestor } from "@/components/dashboard/investor-context";
import { useDemo } from "@/lib/store";
import { seedSpvs } from "@/lib/data/seed";
import { FEES, headlineRate, netOperatingYield, totalCost } from "@/lib/finance";
import { offerLabel } from "@/lib/stages";
import { cn, dateTime, eur, pct, shortDate } from "@/lib/utils";
import { Button, Table, Td, Th } from "@/components/ui";
import { RISK_WARNING } from "@/components/site/notices";

const DOCS = [
  { id: "summary", title: "Investment summary" },
  { id: "kiis", title: "Key investment information sheet" },
  { id: "risk", title: "Risk disclosure" },
  { id: "spv", title: "Property company (SPV) information" },
  { id: "assumptions", title: "Assumptions" },
  { id: "statement", title: "Distribution statement" },
] as const;
type DocId = (typeof DOCS)[number]["id"];

function DocBody({ id }: { id: DocId }) {
  const d = useInvestor();
  const properties = useDemo((s) => s.properties);
  const mine = [...new Set(d.holdings.map((h) => h.property.id))].map((pid) => properties.find((p) => p.id === pid)!);
  const name = (spvId?: string) => properties.find((p) => p.spvId === spvId)?.location ?? "—";
  switch (id) {
    case "summary":
      return (
        <Table>
          <thead><tr><Th>Holding</Th><Th>Offer</Th><Th className="text-right">Amount</Th><Th className="text-right">Net</Th><Th className="text-right">Net / month</Th></tr></thead>
          <tbody>
            {d.holdings.map((h) => (
              <tr key={h.sim.id}><Td>{h.property.location}<span className="block text-xs text-muted">{h.sim.id} · {shortDate(h.sim.createdAt)}</span></Td><Td>{offerLabel(h.property)}</Td><Td className="tabular text-right">{eur(h.sim.amount)}</Td><Td className="tabular text-right">{eur(h.sim.netInvested, 2)}</Td><Td className="tabular text-right">{eur(h.monthlyNet, 2)}</Td></tr>
            ))}
            <tr className="font-semibold"><Td>Total</Td><Td /><Td className="tabular text-right">{eur(d.committed)}</Td><Td className="tabular text-right">{eur(d.net, 2)}</Td><Td className="tabular text-right">{eur(d.monthlyNow, 2)}</Td></tr>
          </tbody>
        </Table>
      );
    case "kiis":
      return (
        <div className="space-y-6">
          {mine.map((p) => (
            <section key={p.id} className="rounded-xl border border-line p-5">
              <h3 className="font-serif text-xl text-ink">{p.title}</h3>
              <dl className="mt-3 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
                {[["Offer", offerLabel(p)], ["Issuer / borrower", seedSpvs.find((s) => s.id === p.spvId)?.name ?? "—"], ["Instrument", seedSpvs.find((s) => s.id === p.spvId)?.instrument ?? "—"], [p.loan ? "Interest" : "Property yield", `${pct(headlineRate(p))}${p.loan ? " fixed p.a." : " (not your return)"}`], ["Term / holding", p.loan ? `${p.loan.months} months` : `${p.holdingYears} years`], ["Fees", "1.5% one-off acquisition · 0.5% a year administration"], ["Payouts", "Monthly"], ["Main risks", p.loan ? "Capital loss, borrower default, delay, illiquidity" : "Capital loss, vacancy, valuation, illiquidity"]].map(([k, v]) => (
                  <div key={k}><dt className="text-[11px] uppercase tracking-wide text-muted">{k}</dt><dd className="text-ink">{v}</dd></div>
                ))}
              </dl>
            </section>
          ))}
          <p className="text-sm text-muted">A live key investment information sheet would follow the ECSPR template and be provided before any commitment.</p>
        </div>
      );
    case "risk":
      return (
        <div className="space-y-3 text-sm leading-relaxed text-ink">
          <p className="font-semibold">{RISK_WARNING}</p>
          <p>You could lose some or all of your money. Loans may not be repaid on time or at all; recovery depends on enforcing security. Rental income can fall or stop; values can fall; works can overrun. You should expect to hold until maturity or sale. Figures are before investor-level taxes. Offers would not be covered by the Deposit Guarantee Scheme or the Investor Compensation Scheme.</p>
        </div>
      );
    case "spv":
      return (
        <Table>
          <thead><tr><Th>Company (proposed)</Th><Th>Home</Th><Th>Instrument</Th><Th>Status</Th></tr></thead>
          <tbody>
            {mine.map((p) => {
              const s = seedSpvs.find((x) => x.id === p.spvId)!;
              return <tr key={p.id}><Td>{s.name}</Td><Td>{p.location}</Td><Td className="text-xs">{s.instrument}</Td><Td className="text-xs">{s.status}</Td></tr>;
            })}
          </tbody>
        </Table>
      );
    case "assumptions":
      return (
        <Table>
          <thead><tr><Th>Home</Th><Th className="text-right">Total cost</Th><Th className="text-right">Rent / yr</Th><Th className="text-right">Opex / yr</Th><Th className="text-right">Vacancy</Th><Th className="text-right">NOI yield</Th></tr></thead>
          <tbody>
            {mine.map((p) => (
              <tr key={p.id}><Td>{p.location}</Td><Td className="tabular text-right">{eur(totalCost(p))}</Td><Td className="tabular text-right">{eur(p.annualRent)}</Td><Td className="tabular text-right">{eur(p.annualOpex)}</Td><Td className="tabular text-right">{pct(p.vacancyPct, 0)}</Td><Td className="tabular text-right">{pct(netOperatingYield(p))}</Td></tr>
            ))}
            <tr><Td colSpan={6} className="text-xs text-muted">Fees: acquisition {pct(FEES.entryFeePct, 1)} of amount entered; administration {pct(FEES.annualAdminPct, 1)} a year of net invested. Valuations are illustrative, not professional valuations.</Td></tr>
          </tbody>
        </Table>
      );
    case "statement":
      return d.payouts.length ? (
        <Table>
          <thead><tr><Th>Date</Th><Th>Home</Th><Th>Type</Th><Th className="text-right">Net amount</Th><Th>Raya Chain tx</Th></tr></thead>
          <tbody>
            {d.payouts.map((t) => <tr key={t.txId}><Td className="tabular">{shortDate(t.at)}</Td><Td>{name(t.spvId)}</Td><Td>{t.type === "REPAYMENT" ? "Loan interest" : "Rent distribution"}</Td><Td className="tabular text-right">{eur(t.amount ?? 0, 2)}</Td><Td className="font-mono text-xs">{t.txId.slice(0, 18)}…</Td></tr>)}
            <tr className="font-semibold"><Td>Total</Td><Td /><Td /><Td className="tabular text-right">{eur(d.received, 2)}</Td><Td /></tr>
          </tbody>
        </Table>
      ) : (
        <p className="text-sm text-muted">No distributions have been paid on your holdings yet.</p>
      );
  }
}

function Documents() {
  const q = useSearchParams();
  const router = useRouter();
  const d = useInvestor();
  const log = useDemo((s) => s.log);
  const current = (DOCS.find((x) => x.id === q.get("doc"))?.id ?? "summary") as DocId;
  const doc = DOCS.find((x) => x.id === current)!;
  useEffect(() => {
    log("DOCUMENT_GENERATION", d.investorId, `Demo document generated: ${doc.title}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current]);
  return (
    <div className="grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)]">
      <nav className="no-print space-y-1" aria-label="Documents">
        {DOCS.map((x) => (
          <button key={x.id} type="button" onClick={() => router.replace(`/dashboard/documents?doc=${x.id}`, { scroll: false })} aria-current={x.id === current ? "page" : undefined} className={cn("flex min-h-11 w-full items-center gap-2.5 rounded-xl px-3 text-left font-sans text-sm font-semibold", x.id === current ? "bg-emerald text-white" : "text-muted hover:bg-mint hover:text-emerald")}>
            <FileText className="h-4 w-4 shrink-0" /> {x.title}
          </button>
        ))}
      </nav>
      <article className="watermark overflow-hidden rounded-2xl border border-line bg-card p-6 shadow-card sm:p-10">
        <header className="flex flex-wrap items-start justify-between gap-4 border-b border-line pb-6">
          <div>
            <p className="font-serif text-lg text-emerald">Meithera</p>
            <h2 className="mt-2 font-serif text-3xl text-ink">{doc.title}</h2>
            <p className="mt-1 text-xs text-muted">Prepared for {d.displayName} · holder {d.holder} · {dateTime(new Date().toISOString())}</p>
          </div>
          <Button variant="secondary" size="sm" className="no-print" onClick={() => window.print()}><Printer className="h-4 w-4" /> Print</Button>
        </header>
        <div className="relative z-10 mt-6"><DocBody id={current} /></div>
        <footer className="mt-10 border-t border-line pt-4 text-[11px] leading-relaxed text-muted">
          Demonstration document — not a real document, offer or contract. All figures are illustrative and simulated, before investor-level taxes. Meithera is not authorised or regulated by the Central Bank of Ireland. {RISK_WARNING}
        </footer>
      </article>
    </div>
  );
}

export default function DocumentsPage() {
  return <Suspense fallback={null}><Documents /></Suspense>;
}
