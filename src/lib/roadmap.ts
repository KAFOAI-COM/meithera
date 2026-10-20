import type { StageNumber } from "./stages";

export interface RoadmapRow {
  stage: StageNumber;
  goal: string;
  product: string;
  legalBasis: string;
  partner: string;
  have: string[];
  need: string[];
  risks: string[];
  timing: string;
}

/** What we have and what we need, per stage. Timing is indicative and assumes regulatory engagement goes well. */
export const ROADMAP: RoadmapRow[] = [
  {
    stage: 0,
    goal: "Show the full vision and the staged path to the Innovation Hub; agree the right regulatory route.",
    product: "This demonstration: marketplace, simulated journeys, Raya Chain simulator, supervisor view.",
    legalBasis: "None required — no financial service is provided. No real investments, payments or tokens.",
    partner: "Central Bank of Ireland Innovation Hub (guidance, not approval).",
    have: ["Raya Software Limited (incorporated in Ireland, CRO)", "Innovation Hub engagement", "This MVP, offline-capable", "The Raya Chain concept and simulator"],
    need: ["Feedback on the Stage 1 route (own ECSP licence vs licensed partner)", "View on the Stage 2 instrument (notes vs shares; fund-rules risk)", "Irish regulatory counsel engaged"],
    risks: ["Misreading what each stage requires", "Over-promising Stages 3–4"],
    timing: "Now — Oct/Nov 2026",
  },
  {
    stage: 1,
    goal: "Fund the refurbishment of vacant homes with secured loans from €100.",
    product: "Loan offers: first legal charge, fixed interest over 12–24 months, monthly interest, borrower pays the arrangement fee. Raya Chain records lenders, repayments and the charge.",
    legalBasis: "ECSPR (Regulation (EU) 2020/1503) — lending-based crowdfunding. €5m per project owner in 12 months; KIIS; knowledge test; €1,000/5% warning; 4-day reflection period.",
    partner: "A licensed ECSP such as Property Bridges first; Meithera's own ECSP authorisation later. A payment institution for client money.",
    have: ["Loan maths and journeys (simulated)", "Supervisor view and audit chain", "Vacant-home pipeline concept"],
    need: ["ECSP partner agreement or own authorisation", "Payment institution / client-money arrangement", "The first vacant home and a borrower (project owner)", "A property manager and a security trustee", "Business-continuity plan"],
    risks: ["Borrower default and security shortfall", "Partner dependency and margin", "Refurbishment overruns delaying repayment"],
    timing: "First loan 2027 H1, subject to partner and regulatory engagement",
  },
  {
    stage: 2,
    goal: "Let people hold notes in the company that owns a refurbished home and share its rent, monthly.",
    product: "One company (SPV) per home; profit-participating notes; monthly distributions; investor vote on sale; ECSPR bulletin board for early exit; Raya Chain mirrors the register.",
    legalBasis: "ECSPR — investment-based crowdfunding of transferable securities or admitted instruments. Open question: whether a per-home SPV could be an AIF; whether the note is a MiFID financial instrument.",
    partner: "ECSP (partner or own licence); corporate services provider for the SPVs; property manager; payment institution.",
    have: ["Rent-share journeys and distributions (simulated)", "Cap tables and exit vote / bulletin board (simulated)", "Competitor study (Bricks, Stake, Arrived)"],
    need: ["SPV structure and the note instrument, with legal sign-off on fund-rules (AIFMD) risk", "Tax treatment of the SPV and distributions", "RTB and tenancy operations", "Secondary-transfer rules consistent with ECSPR"],
    risks: ["AIF classification", "Illiquidity expectations", "Operating-cost drift reducing distributions"],
    timing: "After Stage 1 proves operations — 2027 H2 / 2028",
  },
  {
    stage: 3,
    goal: "Let a tenant buy into the home they live in, step by step, with rent falling as their share grows.",
    product: "Staircasing: tenant purchases notes/shares yearly; investors bought out at valuation with a return; every step on Raya Chain.",
    legalBasis: "Requires further authorisation: consumer credit / mortgage-type permissions if any lending is involved; affordability checks; possible shared-equity framework.",
    partner: "A regulated lender or an approved housing body; valuers; legal.",
    have: ["Staircasing simulator (illustrative)", "Valuation and buy-out maths"],
    need: ["Lending permissions or a lending partner", "Affordability assessment with human oversight", "A tenancy-to-ownership legal template", "Clarity on tax and stamp duty"],
    risks: ["Affordability and arrears", "Valuation disputes at each step", "Investor exit expectations vs tenant pace"],
    timing: "2028+, after Stage 2",
  },
  {
    stage: 4,
    goal: "Make Raya Chain the official register of notes; move holdings across chains; pay out in regulated euro stablecoin; settle in central bank money.",
    product: "Raya Chain as a Layer Zero: master record with anchors to other chains, compliance rules travelling with the asset, programmable payouts, wholesale CBDC settlement.",
    legalBasis: "Depends on EU reform: the reformed DLT Pilot Regime (Commission proposal of 4 Dec 2025 extending it to all MiFID instruments), MiCA for any e-money token, and Eurosystem settlement initiatives.",
    partner: "A DLT Pilot Regime licensee or partner; a custodian; a regulated euro stablecoin issuer; a settlement bank or the Eurosystem.",
    have: ["Raya Chain architecture and simulator", "Cross-chain anchor design"],
    need: ["DLT Pilot Regime licence or partner", "Custodian", "Regulated euro stablecoin", "Raya Chain cross-chain controls audited", "Legal recognition of the on-chain register"],
    risks: ["Regime timing and scope", "Technology and key-management risk", "Interoperability without losing the single master record"],
    timing: "Dependent on EU legislation — not before 2028",
  },
];
