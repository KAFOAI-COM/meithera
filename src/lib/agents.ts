/**
 * Simulated, deterministic "agents". No model is called; each agent is a pure function over the
 * demo state that returns its inputs, a reasoning trace, an output and a human-approval requirement
 * (EU AI Act human oversight). Nothing an agent produces takes effect until a person approves it.
 */
import { capTable, type ChainState } from "./chain/raya";
import type { AuditEvent, Complaint, Investor, Property, SimInvestment } from "./types";
import { pseudonym } from "./ledger";
import { ECSPR, illustrate, netOperatingYield, offerSize as raiseTarget, totalCost } from "./finance";
import { eur, pct } from "./utils";

/** Holders across every property company, with frozen flags (derived from Raya Chain cap tables). */
function wallets(ctx: AgentContext) {
  return ctx.properties.flatMap((p) => capTable(ctx.chain.txs, p.spvId));
}

export interface AgentRun {
  id: string;
  name: string;
  purpose: string;
  stage: 0 | 1 | 2 | 3 | 4;
  risk: "minimal" | "limited" | "high";
  inputs: { label: string; value: string }[];
  trace: string[];
  output: { title: string; lines: string[] };
  approvalLabel: string;
}

export interface AgentContext {
  properties: Property[];
  investors: Investor[];
  investments: SimInvestment[];
  chain: ChainState;
  audit: AuditEvent[];
  complaints: Complaint[];
}

/** Fictional vacant homes the Scout ranks. Areas only; no addresses. */
export const SCOUT_CANDIDATES = [
  { area: "Waterford City", type: "Mid-terrace, 3 bed", refurb: 48000, rent: 1450, berBefore: "F", berAfter: "B2", vacantYears: 4 },
  { area: "Sligo Town", type: "End-terrace, 2 bed", refurb: 36000, rent: 1150, berBefore: "E2", berAfter: "B2", vacantYears: 2 },
  { area: "Kilkenny City", type: "Townhouse, 3 bed", refurb: 62000, rent: 1550, berBefore: "G", berAfter: "B1", vacantYears: 7 },
  { area: "Drogheda", type: "Semi-detached, 3 bed", refurb: 41000, rent: 1650, berBefore: "D2", berAfter: "B2", vacantYears: 1 },
  { area: "Athlone", type: "Cottage, 2 bed", refurb: 55000, rent: 1050, berBefore: "G", berAfter: "B2", vacantYears: 9 },
];

const berScore: Record<string, number> = { A1: 15, A2: 14, A3: 13, B1: 12, B2: 11, B3: 10, C1: 9, C2: 8, C3: 7, D1: 6, D2: 5, E1: 4, E2: 3, F: 2, G: 1 };

export function scout(): AgentRun {
  const scored = SCOUT_CANDIDATES.map((c) => {
    const annualRent = c.rent * 12;
    const rentPerRefurbEuro = annualRent / c.refurb;
    const berUplift = berScore[c.berAfter] - berScore[c.berBefore];
    const vacancyWeight = Math.min(1, c.vacantYears / 5);
    const score = rentPerRefurbEuro * 100 * 0.5 + berUplift * 2 * 0.3 + vacancyWeight * 10 * 0.2;
    return { ...c, annualRent, rentPerRefurbEuro, berUplift, score };
  }).sort((a, b) => b.score - a.score);
  return {
    id: "scout",
    name: "Vacant-home Scout",
    purpose: "Rank fictional vacant homes by refurbishment cost, achievable rent and BER uplift so a human can decide which to survey.",
    stage: 1,
    risk: "limited",
    inputs: SCOUT_CANDIDATES.map((c) => ({ label: `${c.area} · ${c.type}`, value: `refurb ${eur(c.refurb)} · rent ${eur(c.rent)}/mo · BER ${c.berBefore}→${c.berAfter} · vacant ${c.vacantYears}y` })),
    trace: [
      "Score = 50% annual rent per € of refurbishment + 30% BER uplift (steps) + 20% vacancy duration (capped at 5 years).",
      ...scored.map((s, i) => `${i + 1}. ${s.area}: rent/refurb ${(s.rentPerRefurbEuro * 100).toFixed(1)}c per €, BER +${s.berUplift} steps, vacancy weight ${(Math.min(1, s.vacantYears / 5)).toFixed(2)} → score ${s.score.toFixed(1)}`),
      "No external data was used. Figures are fictional inputs chosen for the demonstration.",
    ],
    output: { title: `Recommend surveying ${scored[0].area} first`, lines: scored.slice(0, 3).map((s, i) => `${i + 1}. ${s.area} — ${s.type}, score ${s.score.toFixed(1)}`) },
    approvalLabel: "Approve survey shortlist (human decision)",
  };
}

export function onboardingGuide(lang: "en" | "ga" | "ar" = "en"): AgentRun {
  const terms: Record<string, Record<"en" | "ga" | "ar", string>> = {
    "Notes in the home's company": {
      en: "You would hold a note issued by the company that owns the home. You do not own the house. The note gives you a share of the net rent and a vote on a sale.",
      ga: "Bheadh nóta agat arna eisiúint ag an gcomhlacht ar leis an teach. Ní leat an teach féin. Tugann an nóta sciar den chíos glan duit agus vóta ar dhíol.",
      ar: "ستحمل سنداً تصدره الشركة المالكة للمنزل. أنت لا تملك المنزل. يمنحك السند حصة من صافي الإيجار وصوتاً عند البيع.",
    },
    "First legal charge": {
      en: "Security over the property for lenders. If the borrower cannot repay, the property can be sold to repay the loan first — but it may not cover everything.",
      ga: "Urrús thar an réadmhaoin do na hiasachtóirí. Mura féidir leis an iasachtaí aisíoc, is féidir an réadmhaoin a dhíol chun an iasacht a aisíoc ar dtús — ach seans nach gclúdóidh sé gach rud.",
      ar: "ضمان على العقار للمقرضين. إذا لم يستطع المقترض السداد، يمكن بيع العقار لسداد القرض أولاً — لكنه قد لا يغطي كل شيء.",
    },
    "Reflection period": {
      en: `You have ${ECSPR.reflectionDays} calendar days to change your mind without cost after you commit.`,
      ga: `Tá ${ECSPR.reflectionDays} lá féilire agat chun d’intinn a athrú gan chostas i ndiaidh dul i gceangal.`,
      ar: `لديك ${ECSPR.reflectionDays} أيام تقويمية لتغيير رأيك دون تكلفة بعد الالتزام.`,
    },
    "Before investor-level taxes": {
      en: "Every income figure is shown before any tax you might owe. Tax is not modelled.",
      ga: "Taispeántar gach figiúr ioncaim roimh aon cháin a d’fhéadfadh a bheith dlite ort. Ní dhéantar cáin a shamhaltú.",
      ar: "تُعرض كل أرقام الدخل قبل أي ضريبة قد تدين بها. الضرائب غير مشمولة في النموذج.",
    },
  };
  return {
    id: "guide",
    name: "Onboarding Guide",
    purpose: "Explain the terms on an offer page in plain language, with Irish and Arabic toggles. Content is a fixed glossary — not generated.",
    stage: 1,
    risk: "minimal",
    inputs: [{ label: "Language", value: lang === "en" ? "English" : lang === "ga" ? "Gaeilge" : "العربية" }, { label: "Source", value: "Fixed glossary reviewed by a human; no model call" }],
    trace: ["Glossary entries selected for the terms on the current offer page.", "Translations are pre-written, not machine-generated at runtime.", "The guide never gives advice; it explains terms."],
    output: { title: "Plain-language glossary", lines: Object.entries(terms).map(([k, v]) => `${k}: ${v[lang]}`) },
    approvalLabel: "Approve glossary text for publication",
  };
}

export function amlMonitor(ctx: AgentContext): AgentRun {
  const flags: string[] = [];
  const trace: string[] = [];
  const byHolder = new Map<string, number>();
  for (const t of ctx.chain.txs) if (t.type === "ISSUE" && t.to) byHolder.set(t.to, (byHolder.get(t.to) ?? 0) + (t.amount ?? 0));
  trace.push(`Scanned ${ctx.chain.txs.length} Raya Chain transactions.`);
  const rejected = ctx.chain.txs.filter((t) => t.type === "REJECTED");
  if (rejected.length) flags.push(`${rejected.length} transfer(s) rejected by the allowlist (${Array.from(new Set(rejected.map((t) => t.reason))).join(", ")})`);
  trace.push(`Rule 1 — rejected transfers: ${rejected.length}.`);
  const big = Array.from(byHolder.entries()).filter(([, v]) => v >= 10000);
  for (const [h, v] of big) flags.push(`Holder ${h} has ${eur(v)} issued across offers — above the €10,000 single-holder review line`);
  trace.push(`Rule 2 — cumulative issuance ≥ €10,000 per holder: ${big.length} holder(s).`);
  const pending = ctx.investors.filter((i) => i.onboarding.aml === "Simulated — review");
  for (const i of pending) flags.push(`Investor ${pseudonym(i.id)} has an open AML review and must not be issued units`);
  trace.push(`Rule 3 — open AML reviews: ${pending.length}.`);
  const frozen = wallets(ctx).filter((w) => w.frozen);
  trace.push(`Rule 4 — frozen wallets with holdings: ${frozen.length}.`);
  const dayCounts = new Map<string, number>();
  for (const t of ctx.chain.txs) if (t.type === "ISSUE") dayCounts.set(t.at.slice(0, 10), (dayCounts.get(t.at.slice(0, 10)) ?? 0) + 1);
  const burst = Array.from(dayCounts.entries()).filter(([, n]) => n >= 3);
  for (const [d, n] of burst) flags.push(`${n} issuances on ${d} — velocity check`);
  trace.push(`Rule 5 — ≥ 3 issuances in one day: ${burst.length} day(s).`);
  return {
    id: "aml",
    name: "AML Monitor",
    purpose: "Flag unusual patterns in the simulated transaction feed for a compliance officer to review. Flags never freeze anything by themselves.",
    stage: 1,
    risk: "high",
    inputs: [{ label: "Transactions", value: String(ctx.chain.txs.length) }, { label: "Wallets", value: `${new Set(wallets(ctx).map((w) => w.holder)).size} (${frozen.length} frozen)` }, { label: "Rules", value: "5 deterministic rules; thresholds fixed in code" }],
    trace,
    output: { title: flags.length ? `${flags.length} item(s) for review` : "No items for review", lines: flags.length ? flags : ["All rules clear."] },
    approvalLabel: "Compliance officer: acknowledge review items",
  };
}

export function supervisoryReporter(ctx: AgentContext, period = "2026-10"): AgentRun {
  const live = ctx.investments.filter((i) => i.status !== "Withdrawn");
  const raised = live.reduce((s, i) => s + i.netInvested, 0);
  const perOffer = ctx.properties.map((p) => ({ p, raised: live.filter((i) => i.propertyId === p.id).reduce((s, i) => s + i.netInvested, 0) }));
  const warnings = ctx.audit.filter((a) => a.type === "EXTRA_WARNING").length;
  const withdrawals = ctx.investments.filter((i) => i.status === "Withdrawn").length;
  const tests = ctx.audit.filter((a) => a.type === "KNOWLEDGE_TEST");
  const passRate = tests.length ? tests.filter((a) => /passed/.test(a.detail)).length / tests.length : 0;
  const open = ctx.complaints.filter((c) => c.status !== "Resolved").length;
  const d8 = ctx.properties.find((p) => p.id === "prop-d8");
  return {
    id: "reporter",
    name: "Supervisory Reporter",
    purpose: "Draft the monthly report an ECSP would send its supervisor, from the store. A compliance officer must approve before anything is sent.",
    stage: 1,
    risk: "limited",
    inputs: [{ label: "Period", value: period }, { label: "Offers", value: String(ctx.properties.length) }, { label: "Investors", value: String(ctx.investors.length) }, { label: "Audit events", value: String(ctx.audit.length) }],
    trace: [
      "Aggregate net invested per offer from live investments.",
      `Compare total raised ${eur(raised)} with the €5m per-project-owner cap → ${pct(raised / ECSPR.offerCapEur, 2)} used.`,
      `Count investor-protection events: ${warnings} warnings, ${withdrawals} reflection withdrawals, test pass rate ${pct(passRate, 0)}.`,
      `Count complaints open: ${open}. Frozen wallets: ${wallets(ctx).filter((w) => w.frozen).length}.`,
      "Draft text; no figures are generated — every number comes from the store.",
    ],
    output: {
      title: `Draft monthly report — ${period} (simulated)`,
      lines: [
        `Offers live: ${ctx.properties.filter((p) => p.status === "open").length}; funded: ${ctx.properties.filter((p) => p.status === "funded").length}.`,
        ...perOffer.map(({ p, raised: r }) => `${p.title}: ${eur(r)} of ${eur(raiseTarget(p))} (${pct(r / raiseTarget(p), 0)})${p.offerType === "rent-share" ? `; NOI yield ${pct(netOperatingYield(p))}` : `; ${p.loan!.ratePct}% fixed`}`),
        `Total raised ${eur(raised)} — ${pct(raised / ECSPR.offerCapEur, 2)} of the €5m cap.`,
        `Investor protection: ${warnings} €1,000/5% warnings; ${withdrawals} reflection-period withdrawals; knowledge-test pass rate ${pct(passRate, 0)}.`,
        `Complaints open: ${open}. Frozen holdings: ${wallets(ctx).filter((w) => w.frozen).length}. Rejected transfers: ${ctx.chain.txs.filter((t) => t.type === "REJECTED").length}.`,
        d8 ? `Illustrative per-€1,000 figure for ${d8.location}: ${eur(illustrate(d8, 1000).annualIncome, 2)} a year before tax (total cost ${eur(totalCost(d8))}).` : "",
        "All figures fictional and simulated; before investor-level taxes.",
      ].filter(Boolean),
    },
    approvalLabel: "Compliance officer: approve draft for review",
  };
}
