"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, ArrowDown, Building2, Landmark, UserRound, FileText, Home, Coins, Wallet, Scale, Link2, CheckCircle2, CircleHelp } from "lucide-react";
import { useDemo } from "@/lib/store";
import { useHydrated } from "@/components/site/hydrator";
import { CONTROLS, COMPETITORS, COMPETITOR_LESSONS, DECISION_POINTS, LIFECYCLE } from "@/lib/regulatory";
import { FEES, illustrate } from "@/lib/finance";
import { capTable } from "@/lib/chain/raya";
import { cn, eur, pct, dateTime } from "@/lib/utils";
import { Badge, Card, Table, Th, Td, buttonVariants } from "@/components/ui";
import { StageBadge } from "@/components/site/stage-badge";
import { IllustrativeNotice } from "@/components/site/notices";
import { TxRow } from "@/components/chain/tx-bits";
import { FinancialModel } from "./financial-model";

const SECTIONS = [
  ["A", "lifecycle", "Investor lifecycle"],
  ["B", "structure", "Investment structure"],
  ["C", "funds", "Funds flow"],
  ["D", "distribution", "Rental distribution flow"],
  ["E", "ledger", "Blockchain recordkeeping"],
  ["F", "decisions", "Regulatory decision points"],
  ["G", "controls", "Compliance control matrix"],
  ["H", "model", "Financial model"],
  ["I", "compare", "How Meithera compares"],
] as const;

function Section({ id, letter, title, intro, stage, children }: { id: string; letter: string; title: string; intro: string; stage: 0 | 1 | 2 | 4; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-sans text-xs font-semibold uppercase tracking-[0.08em] text-gold-ink">Section {letter}</p>
          <h2 className="mt-1 font-serif text-3xl font-medium tracking-tight">{title}</h2>
          <p className="mt-2 max-w-3xl text-sm text-muted">{intro}</p>
        </div>
        <StageBadge stage={stage} />
      </div>
      <div className="mt-6">{children}</div>
    </section>
  );
}

function FlowBox({ icon: Icon, title, sub, tone = "card" }: { icon: typeof Home; title: string; sub: string; tone?: "card" | "emerald" | "gold" }) {
  return (
    <div className={cn("flex min-w-0 flex-1 flex-col items-center rounded-2xl border p-4 text-center", tone === "emerald" && "border-emerald bg-emerald text-white", tone === "gold" && "border-gold/60 bg-demo text-demo-ink", tone === "card" && "border-line bg-card")}>
      <Icon className={cn("h-6 w-6", tone === "card" && "text-forest")} />
      <p className="mt-2 font-sans text-sm font-semibold">{title}</p>
      <p className={cn("mt-1 text-xs", tone === "card" ? "text-muted" : "opacity-80")}>{sub}</p>
    </div>
  );
}
function Arrow() {
  return <span className="flex items-center justify-center text-muted" aria-hidden><ArrowRight className="hidden h-5 w-5 lg:block" /><ArrowDown className="h-5 w-5 lg:hidden" /></span>;
}

export function RegulatoryDemo() {
  const hydrated = useHydrated();
  const { chain, properties, audit, investments } = useDemo();
  const [life, setLife] = useState(LIFECYCLE[0].id);
  const [structure, setStructure] = useState<"rent-share" | "loan">("rent-share");
  const d8 = properties.find((p) => p.id === "prop-d8") ?? properties[0];
  const step = LIFECYCLE.find((l) => l.id === life)!;
  const monthly = d8 ? { rent: (d8.annualRent * (1 - d8.vacancyPct)) / 12, opex: d8.annualOpex / 12 } : { rent: 0, opex: 0 };
  const ex = d8 ? illustrate(d8, 1000) : null;

  return (
    <div className="grid gap-10 lg:grid-cols-[200px_1fr]">
      <nav aria-label="Sections" className="top-24 flex gap-1 overflow-x-auto lg:sticky lg:flex-col lg:self-start">
        {SECTIONS.map(([l, id, t]) => <a key={id} href={`#${id}`} className="flex min-h-11 shrink-0 items-center gap-2 rounded-xl px-3 font-sans text-sm font-medium text-muted hover:bg-mint hover:text-emerald"><span className="font-bold text-gold-ink">{l}</span> {t}</a>)}
      </nav>
      <div className="space-y-20">
        <Section id="lifecycle" letter="A" title="Investor lifecycle" intro="Registration → Verification → Risk assessment → Investment review → Simulated investment → Reporting. Click a stage to see the controls that apply and where the demo shows them." stage={1}>
          <ol className="flex flex-wrap gap-2">
            {LIFECYCLE.map((l, i) => <li key={l.id}><button type="button" onClick={() => setLife(l.id)} className={cn("min-h-11 rounded-xl border px-3 font-sans text-sm font-semibold", life === l.id ? "border-emerald bg-emerald text-white" : "border-line bg-card text-ink hover:bg-mint")}>{i + 1}. {l.label}</button></li>)}
          </ol>
          <Card className="mt-4 grid gap-4 p-5 sm:grid-cols-[1fr_280px]">
            <div><p className="font-sans text-lg font-semibold">{step.label}</p><p className="mt-1 text-sm text-muted">{step.what}</p><Link href={step.route} className={buttonVariants({ variant: "secondary", size: "sm", className: "mt-4" })}>See it in the demo <ArrowRight className="h-4 w-4" /></Link></div>
            <div className="rounded-xl bg-surface p-4"><p className="font-sans text-xs font-semibold uppercase tracking-wide text-muted">Controls at this stage</p><ul className="mt-2 space-y-1 text-sm">{step.controls.map((c) => <li key={c} className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-forest" /> {c}</li>)}</ul></div>
          </Card>
        </Section>

        <Section id="structure" letter="B" title="Investment structure" intro="What an investor holds, and what they do not. Legal rights depend on the final instrument and structure, which remain subject to legal and regulatory review." stage={2}>
          <div className="mb-4 flex gap-2">
            {(["rent-share", "loan"] as const).map((s) => <button key={s} type="button" onClick={() => setStructure(s)} className={cn("min-h-11 rounded-xl border px-3 font-sans text-sm font-semibold", structure === s ? "border-emerald bg-emerald text-white" : "border-line bg-card")}>{s === "rent-share" ? "Stage 2 · Rent share" : "Stage 1 · Loan"}</button>)}
          </div>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-stretch">
            <FlowBox icon={UserRound} title="Investor" sub={structure === "loan" ? "Lends from €100" : "Invests from €100"} />
            <Arrow />
            <FlowBox icon={FileText} title={structure === "loan" ? "Secured loan note" : "Profit-participating note"} sub={structure === "loan" ? "Fixed interest; first legal charge via a security trustee" : "Share of net rent; vote on sale; transfer-restricted"} tone="gold" />
            <Arrow />
            <FlowBox icon={Building2} title={structure === "loan" ? "Borrower (project owner)" : "Home's company (Irish DAC)"} sub={structure === "loan" ? "Owns the home; owes the loan" : "Owns the home; issues the notes"} tone="emerald" />
            <Arrow />
            <FlowBox icon={Home} title="The home" sub="Legal title stays with the company or borrower" />
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Card className="p-4 text-sm"><p className="font-sans font-semibold text-emerald">What you own</p><p className="mt-1 text-muted">{structure === "loan" ? "A participation in a loan secured on the home. Rights to interest and repayment under the loan terms." : "A note issued by the company that owns the home: economic rights to a share of net rent and the sale proceeds, and a vote. A Raya Chain token records the holding."}</p></Card>
            <Card className="p-4 text-sm"><p className="font-sans font-semibold text-risk-ink">What you do not own</p><p className="mt-1 text-muted">The house, or any part of its legal title. The token is a record of the note, not ownership of bricks. “Blockchain-based fractional ownership of property companies” — never “own part of the house”.</p></Card>
          </div>
        </Section>

        <Section id="funds" letter="C" title="Funds flow" intro="Meithera never holds client money. The involvement and responsibilities of authorised providers are subject to regulatory and commercial assessment." stage={1}>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-stretch">
            <FlowBox icon={UserRound} title="Investor" sub="Pays from their own bank account" />
            <Arrow />
            <FlowBox icon={Landmark} title="Authorised financial services provider" sub="Payment institution or ECSP: KYC/AML, segregated client account, safeguarding" tone="gold" />
            <Arrow />
            <FlowBox icon={Building2} title="Home's company / borrower" sub="Receives subscription or loan proceeds at completion" tone="emerald" />
            <Arrow />
            <FlowBox icon={Home} title="Acquisition & refurbishment" sub="Solicitor's client account; contractor stage payments" />
          </div>
          <IllustrativeNotice className="mt-4">In this demonstration no funds flow at all. The diagram is the proposed architecture.</IllustrativeNotice>
        </Section>

        <Section id="distribution" letter="D" title="Rental distribution flow" intro="Property → rental income → operating costs → company → investor entitlements → monthly distribution. Live numbers for the Dublin 8 illustration." stage={2}>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-stretch">
            <FlowBox icon={Home} title="Rent collected (month)" sub={eur(monthly.rent, 2)} />
            <Arrow />
            <FlowBox icon={Wallet} title="Operating costs" sub={`−${eur(monthly.opex, 2)} (maintenance, management, insurance, other)`} />
            <Arrow />
            <FlowBox icon={Building2} title="Company net income" sub={eur(monthly.rent - monthly.opex, 2)} tone="emerald" />
            <Arrow />
            <FlowBox icon={Coins} title="Entitlements" sub={`By participation; less ${pct(FEES.annualAdminPct, 1)} p.a. ÷ 12`} tone="gold" />
            <Arrow />
            <FlowBox icon={UserRound} title="Per €1,000 investor" sub={ex ? `${eur(ex.monthlyIncome, 2)} / month, before tax` : "—"} />
          </div>
          <p className="mt-3 text-xs text-muted">Each payout is a DISTRIBUTION transaction on Raya Chain to the holder’s pseudonym. Administrators run a month from the admin console; investors see it in Income.</p>
        </Section>

        <Section id="ledger" letter="E" title="Blockchain recordkeeping" intro="Entitlement records, the tokenisation concept, transaction references, audit events, distribution records and transfer restrictions — all simulated, all live from this browser's demo state." stage={2}>
          {hydrated ? (
            <div className="grid gap-4 lg:grid-cols-2">
              <Card className="overflow-hidden"><p className="p-4 pb-1 font-sans text-sm font-semibold">Latest Raya Chain transactions</p><div>{[...chain.txs].reverse().slice(0, 6).map((t) => <TxRow key={t.id} t={t} propertyName={properties.find((p) => p.id === t.propertyId)?.location} />)}</div><Link href="/chain" className="block p-3 text-center font-sans text-sm font-semibold text-forest">Open the explorer →</Link></Card>
              <div className="space-y-4">
                <Card className="p-4"><p className="font-sans text-sm font-semibold">Entitlement records — {d8?.location}</p><Table className="mt-2"><thead><tr><Th>Holder</Th><Th className="text-right">Units</Th><Th className="text-right">Share</Th></tr></thead><tbody>{capTable(chain, d8.id).map((r) => <tr key={r.holder}><Td className="font-mono text-xs">{r.holder}</Td><Td className="tabular text-right">{r.units.toLocaleString("en-IE")}</Td><Td className="tabular text-right">{pct(r.share, 1)}</Td></tr>)}</tbody></Table></Card>
                <Card className="p-4 text-sm"><p className="font-sans font-semibold">Transfer restrictions</p><ul className="mt-2 space-y-1 text-muted"><li>· Recipient must be a verified, unfrozen wallet (allowlist)</li><li>· Sender must hold the units and not be frozen</li><li>· Rejections are recorded with a reason code</li><li>· Freeze and correction carry reason codes and an off-chain order reference</li></ul></Card>
                <Card className="p-4 text-sm"><p className="font-sans font-semibold">Audit events (hash-chained)</p><ul className="mt-2 space-y-1 text-xs text-muted">{[...audit].reverse().slice(0, 5).map((e) => <li key={e.id}><span className="font-mono">{e.id}</span> · {e.type} · {dateTime(e.at)}</li>)}</ul><p className="mt-2 text-xs text-muted">{investments.length} investment records · {audit.length} audit events · {chain.blocks.length} blocks</p></Card>
              </div>
            </div>
          ) : <div className="h-64 animate-pulse rounded-2xl bg-mint/50" />}
        </Section>

        <Section id="decisions" letter="F" title="Regulatory decision points" intro="Four questions we are not answering ourselves. Each shows why it matters, points either way, and the assumption the demonstration makes meanwhile." stage={1}>
          <div className="grid gap-4 lg:grid-cols-2">
            {DECISION_POINTS.map((d, i) => (
              <Card key={d.id} className="p-5">
                <div className="flex items-start justify-between gap-2"><p className="flex gap-2 font-sans text-base font-semibold"><span className="text-gold-ink">{i + 1}.</span> {d.question}</p><StageBadge stage={d.stage} compact /></div>
                <p className="mt-2 text-sm text-muted">{d.why}</p>
                <div className="mt-3 grid gap-3 sm:grid-cols-2 text-xs">
                  <div className="rounded-lg bg-mint/50 p-3"><p className="font-sans font-semibold text-emerald">Points towards “yes”</p><ul className="mt-1 space-y-1 text-ink">{d.pointsFor.map((p) => <li key={p}>· {p}</li>)}</ul></div>
                  <div className="rounded-lg bg-surface p-3"><p className="font-sans font-semibold">Points towards “no / depends”</p><ul className="mt-1 space-y-1 text-ink">{d.pointsAgainst.map((p) => <li key={p}>· {p}</li>)}</ul></div>
                </div>
                <p className="mt-3 flex items-start gap-2 rounded-lg bg-demo p-3 text-xs text-demo-ink"><CircleHelp className="mt-0.5 h-4 w-4 shrink-0" /> <span><strong>Not selected.</strong> Demo assumption: {d.demoAssumption}</span></p>
              </Card>
            ))}
          </div>
        </Section>

        <Section id="controls" letter="G" title="Compliance control matrix" intro="Proposed controls distinguished from those implemented in the demonstration. Responsible party and the open question for each." stage={1}>
          <Card className="overflow-hidden">
            <Table>
              <thead><tr><Th>Control</Th><Th>Purpose</Th><Th>Proposed implementation</Th><Th>Responsible</Th><Th>Status</Th><Th>Open question</Th></tr></thead>
              <tbody>
                {CONTROLS.map((c) => (
                  <tr key={c.control}>
                    <Td className="font-medium">{c.control}<span className="mt-1 block"><StageBadge stage={c.stage} compact /></span></Td>
                    <Td className="text-xs text-muted">{c.purpose}</Td>
                    <Td className="text-xs">{c.implementation}</Td>
                    <Td className="text-xs">{c.responsible}</Td>
                    <Td><Badge tone={c.status === "Implemented (demo)" ? "mint" : c.status === "Proposed" ? "neutral" : "gold"}>{c.status}</Badge></Td>
                    <Td className="text-xs text-muted">{c.openQuestion}</Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card>
        </Section>

        <Section id="model" letter="H" title="Financial model" intro="Base, optimistic and downside cases from the same engine that powers every figure on the site." stage={2}>
          <FinancialModel />
        </Section>

        <Section id="compare" letter="I" title="How Meithera compares" intro="From docs/competitor-analysis.md. Figures are self-reported by platforms or third-party reviews and may be out of date." stage={2}>
          <Card className="overflow-hidden">
            <Table>
              <thead><tr><Th>Platform</Th><Th>Market</Th><Th>Regulatory basis</Th><Th>Investor holds</Th><Th>Min.</Th><Th>Income</Th><Th>Exit</Th><Th>Fees</Th></tr></thead>
              <tbody>{COMPETITORS.map((c) => <tr key={c.name} className={cn(c.name.startsWith("Meithera") && "bg-mint/40")}><Td className="font-medium">{c.name}</Td><Td className="text-xs">{c.market}</Td><Td className="text-xs">{c.basis}</Td><Td className="text-xs">{c.holds}</Td><Td className="text-xs">{c.min}</Td><Td className="text-xs">{c.income}</Td><Td className="text-xs">{c.exit}</Td><Td className="text-xs">{c.fees}</Td></tr>)}</tbody>
            </Table>
          </Card>
          <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {COMPETITOR_LESSONS.map((l) => <Card key={l.who} className="p-4 text-sm"><p className="flex items-center gap-2 font-sans font-semibold"><Scale className="h-4 w-4 text-forest" /> {l.who}</p><p className="mt-1 text-muted">{l.lesson}</p></Card>)}
          </div>
          <p className="mt-4 flex items-center gap-2 text-xs text-muted"><Link2 className="h-3.5 w-3.5" /> Differentiators: realised vs projected always separate; full ECSPR protection UX; impact reporting (projected, not achieved); a supervisor view; Raya Chain audit record.</p>
        </Section>
      </div>
    </div>
  );
}
