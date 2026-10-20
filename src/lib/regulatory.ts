/**
 * Regulatory content shared by /regulatory-demo, /compliance and the docs. Nothing here answers the
 * classification questions — it sets them out for discussion with counsel and the Innovation Hub.
 */

export interface DecisionPoint {
  id: string;
  question: string;
  why: string;
  pointsFor: string[];
  pointsAgainst: string[];
  demoAssumption: string;
  stage: 1 | 2 | 4;
}

export const DECISION_POINTS: DecisionPoint[] = [
  {
    id: "ecspr",
    question: "Is the proposed structure potentially within ECSPR (Regulation (EU) 2020/1503)?",
    why: "Determines whether an ECSP authorisation (own or via a partner) is the route to market, the €5m per-project-owner cap, the KIIS, the knowledge test, the €1,000 / 5% warning and the 4-day reflection period.",
    pointsFor: ["Stage 1 is lending-based crowdfunding to a project owner — squarely within ECSPR's scope", "Stage 2 notes issued by a per-home company may be 'transferable securities' or 'admitted instruments for crowdfunding purposes'", "Property Bridges (Ireland) and Bricks (France) operate property crowdfunding under ECSPR"],
    pointsAgainst: ["Consumer lending to natural persons is excluded; the borrower must be a project owner (company)", "Whether an Irish DAC note is a 'transferable security' depends on its terms", "ECSPR caps and investor protections constrain scale"],
    demoAssumption: "None — shown as an open question. All ECSPR controls are implemented 'as if' ECSPR applies.",
    stage: 1,
  },
  {
    id: "mifid",
    question: "Could the investment instrument qualify as a MiFID II financial instrument?",
    why: "If the note is a transferable security outside ECSPR's scope, investment-firm authorisation, prospectus thresholds and MiFID conduct rules follow — and MiCA does not apply to any token representing it.",
    pointsFor: ["A profit-participating note that is negotiable on the capital market is a transferable security", "Tokenising a financial instrument keeps it a financial instrument"],
    pointsAgainst: ["Transfer restrictions and a verified-wallet allowlist limit negotiability", "ECSPR provides its own regime for transferable securities offered via a crowdfunding platform"],
    demoAssumption: "Instrument shown as 'proposed: profit-participating note' with no classification selected.",
    stage: 2,
  },
  {
    id: "aif",
    question: "Could the pooled property structure constitute an AIF under AIFMD?",
    why: "An AIF needs an authorised AIFM and a depositary and changes the whole structure and cost base.",
    pointsFor: ["Capital raised from a number of investors to invest for their benefit in accordance with a defined policy", "Multi-property 'funds' (Stake Funds, Arrived SFR Fund) are treated as funds elsewhere"],
    pointsAgainst: ["One company per home with an operating purpose (own, refurbish, let) resembles an operating company rather than a collective investment undertaking", "No pooling across homes; investors choose each home"],
    demoAssumption: "One SPV per property, operating-company framing — an assumption to test with counsel.",
    stage: 2,
  },
  {
    id: "partner",
    question: "Could the platform operate through an appropriately authorised partner?",
    why: "A possible route to market without own authorisation at launch; defines who holds client money, performs KYC/AML and is accountable to the supervisor.",
    pointsFor: ["Licensed ECSPs exist in Ireland; a payment institution can hold client money", "Partner carries authorisation while Meithera builds the technology and operations"],
    pointsAgainst: ["Partner dependency and margin", "Division of responsibilities must be clear to investors and the supervisor", "Raya Chain as an official register (Stage 4) would need its own licence or partner under the DLT Pilot Regime"],
    demoAssumption: "Funds-flow diagram shows an 'authorised financial services provider' placeholder.",
    stage: 1,
  },
];

export interface Control {
  control: string;
  purpose: string;
  implementation: string;
  responsible: string;
  status: "Implemented (demo)" | "Proposed" | "Partner-dependent";
  openQuestion: string;
  stage: 0 | 1 | 2 | 4;
}

export const CONTROLS: Control[] = [
  { control: "Customer identification (KYC)", purpose: "Know who holds each instrument; prevent impersonation", implementation: "Simulated ID check in onboarding; verified-wallet allowlist on Raya Chain", responsible: "Authorised partner / ECSP", status: "Partner-dependent", openQuestion: "Which entity is the designated person under the CJA 2010?", stage: 1 },
  { control: "AML / sanctions monitoring", purpose: "Detect and report suspicious activity", implementation: "Simulated screening; AML Monitor agent flags; FREEZE tx with reason code", responsible: "Authorised partner; Meithera (tooling)", status: "Partner-dependent", openQuestion: "Thresholds and reporting lines for a €100-minimum platform", stage: 1 },
  { control: "Investor classification", purpose: "Apply the right protections (sophisticated vs non-sophisticated)", implementation: "Self-declaration in onboarding; classification shown to supervisor", responsible: "ECSP", status: "Implemented (demo)", openQuestion: "Evidence standard for self-certification (ECSPR Annex II)", stage: 1 },
  { control: "Entry knowledge test & loss simulation", purpose: "ECSPR Art. 21 — understanding and ability to bear loss", implementation: "5-question test (pass 4/5), loss-bearing simulation, results in audit log", responsible: "ECSP", status: "Implemented (demo)", openQuestion: "Retake policy and frequency of re-assessment", stage: 1 },
  { control: "Investor risk disclosures", purpose: "Fair, clear, not misleading; specific warning above €1,000 / 5%", implementation: "Exact risk warning everywhere; threshold warning with express consent; KIIS card", responsible: "ECSP; Meithera (content)", status: "Implemented (demo)", openQuestion: "Approval process for marketing communications (ECSPR Art. 27)", stage: 1 },
  { control: "Reflection period", purpose: "ECSPR Art. 22 — 4-day pre-contractual withdrawal", implementation: "Withdrawal button on confirmation; CORRECTION tx returns units", responsible: "ECSP", status: "Implemented (demo)", openQuestion: "Treatment of funds during the period", stage: 1 },
  { control: "Client money handling", purpose: "Investor funds never at platform risk", implementation: "Funds-flow diagram: payment institution with segregated accounts; Meithera never holds money", responsible: "Payment institution", status: "Proposed", openQuestion: "Which payment institution; safeguarding arrangements", stage: 1 },
  { control: "Investment recordkeeping", purpose: "Accurate register of holders and entitlements", implementation: "Off-chain register authoritative; Raya Chain mirror with hash-chained blocks and anchors", responsible: "Meithera; SPV company secretary", status: "Implemented (demo)", openQuestion: "Legal status of the on-chain record (Stage 4)", stage: 2 },
  { control: "Asset custody", purpose: "Safekeeping of instruments and the property", implementation: "Property held by the SPV; notes registered; custodian needed for Stage 4", responsible: "SPV; custodian (Stage 4)", status: "Proposed", openQuestion: "Custody model for tokenised notes", stage: 2 },
  { control: "Transfer restrictions", purpose: "No transfers to unverified or frozen holders", implementation: "Allowlist rule evaluated on every TRANSFER; rejected tx recorded with reason", responsible: "Meithera (tooling); ECSP (policy)", status: "Implemented (demo)", openQuestion: "Bulletin-board settlement under ECSPR Art. 25", stage: 2 },
  { control: "Complaints management", purpose: "ECSPR Art. 7 — effective and transparent handling", implementation: "Simulated complaints register visible to supervisor", responsible: "ECSP", status: "Implemented (demo)", openQuestion: "FSPO access depends on the authorised entity", stage: 1 },
  { control: "Business continuity & wind-down", purpose: "ECSPR Art. 12 — continuity of service to investors", implementation: "Documented per-SPV exit; ring-fenced companies", responsible: "ECSP; Meithera", status: "Proposed", openQuestion: "Who administers SPVs if the platform ceases", stage: 2 },
  { control: "Data protection (GDPR)", purpose: "Lawful processing; minimisation", implementation: "No personal data in demo; pseudonymous holder IDs on chain; DPIA for production", responsible: "Meithera; partner", status: "Implemented (demo)", openQuestion: "Right-to-erasure vs immutable ledger (mapping lives off-chain)", stage: 0 },
  { control: "Human oversight of AI", purpose: "EU AI Act — no automated decision without a person", implementation: "Every agent output requires approval; approvals in audit log", responsible: "Meithera", status: "Implemented (demo)", openQuestion: "Risk classification of the AML Monitor", stage: 0 },
  { control: "Supervisory reporting", purpose: "Timely, accurate information to the supervisor", implementation: "Read-only supervisor view; CSV/JSON export; monthly report draft", responsible: "ECSP", status: "Implemented (demo)", openQuestion: "Format and cadence the Central Bank would want", stage: 1 },
];

export interface LifecycleStep {
  id: string;
  label: string;
  what: string;
  controls: string[];
  route: string;
}

export const LIFECYCLE: LifecycleStep[] = [
  { id: "registration", label: "Registration", what: "A person creates an account. In the demo: a first name and a county; nothing personal.", controls: ["Terms and risk warning shown", "No marketing claims of return"], route: "/register" },
  { id: "verification", label: "Verification", what: "Identity and AML screening by the authorised provider; wallet added to the allowlist.", controls: ["KYC", "AML / sanctions", "Allowlist entry"], route: "/invest/prop-cork" },
  { id: "assessment", label: "Risk assessment", what: "Classification, knowledge test, loss-bearing simulation.", controls: ["Classification", "Knowledge test 4/5", "10% net-worth guidance"], route: "/invest/prop-cork" },
  { id: "review", label: "Investment review", what: "Fees, instrument, participation, income and the KIIS; the specific warning above €1,000 / 5%.", controls: ["Exact risk warning", "Threshold warning", "KIIS"], route: "/invest/prop-cork" },
  { id: "simulate", label: "Simulated investment", what: "Units issued on Raya Chain to a pseudonymous holder; 4-day reflection period opens.", controls: ["ISSUE tx", "Reflection withdrawal"], route: "/chain" },
  { id: "reporting", label: "Reporting", what: "Dashboard, documents, monthly statements; supervisor sees the same record.", controls: ["Audit log", "Supervisor view", "Complaints"], route: "/supervisor" },
];

export interface Competitor {
  name: string;
  market: string;
  basis: string;
  holds: string;
  min: string;
  income: string;
  exit: string;
  fees: string;
}

export const COMPETITORS: Competitor[] = [
  { name: "Meithera (proposed)", market: "Ireland / EU", basis: "ECSPR (partner first, own licence later) — subject to regulatory assessment", holds: "Stage 1: secured loan participation · Stage 2: notes in a per-home company", min: "€100 (illustrative)", income: "Monthly (illustrative)", exit: "Investor vote; ECSPR bulletin board; no promised liquidity", fees: "1.5% acquisition + 0.5%/yr administration; loans: borrower pays 1.5%" },
  { name: "Stake", market: "UAE, KSA", basis: "DFSA property crowdfunding operator", holds: "Shares in a per-property SPV registered with Dubai Land Department", min: "AED 500", income: "Rental dividends", exit: "Exit windows + investor votes", fees: "Not published on review page" },
  { name: "PRYPCO Mint", market: "UAE", basis: "With Dubai Land Department; VARA-licensed", holds: "Tokenised title deed registered by DLD", min: "AED 2,000", income: "Monthly rent", exit: "Marketplace; majority vote to sell", fees: "2% entry, 1% exit, 0.5%/yr, 15% of appreciation" },
  { name: "Arrived", market: "US", basis: "SEC Reg A+, series LLC per property", holds: "LLC series shares", min: "$100", income: "Rental dividends", exit: "Monthly P2P windows after 6 months; 5–7 yr hold", fees: "Up to 3.5% sourcing, ~0.6%/yr, 8% of rent PM" },
  { name: "Lofty", market: "US", basis: "No published exemption — untested", holds: "Wyoming LLC tokens on Algorand", min: "~$50", income: "Daily USDC", exit: "Order book + AMM", fees: "2.5% buy / 3% sell" },
  { name: "Bricks.co", market: "France / EU", basis: "AMF ECSP licence; Lemonway payment agent", holds: "Bonds / SPV interests", min: "€10", income: "Monthly", exit: "None advertised", fees: "€0 to investors" },
  { name: "Property Bridges", market: "Ireland / EU", basis: "Central Bank of Ireland ECSP authorisation", holds: "Loans to Irish homebuilders", min: "—", income: "Interest", exit: "—", fees: "—" },
];

export const COMPETITOR_LESSONS: { who: string; lesson: string }[] = [
  { who: "Lex Markets (US)", lesson: "Liquidity is a platform service, not a property of the instrument. Never promise a secondary market; document wind-down." },
  { who: "RealT (US)", lesson: "Tokenisation does not remove landlord obligations. Property management, RTB and tenant welfare are first-class." },
  { who: "Lofty (US)", lesson: "Regulatory-first, not token-first. Show realised vs projected separately." },
  { who: "Arrived (US)", lesson: "One-screen fee stack, gross → net walk, plain illiquidity warnings." },
  { who: "UK wind-downs (Property Partner, British Pearl, Bricklane)", lesson: "Ring-fenced SPVs, independent custody of client money, a documented exit for every SPV." },
];
