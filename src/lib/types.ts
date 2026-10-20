export type PropertyStatus = "open" | "coming-soon" | "funded";
export type RiskLevel = "Moderate" | "Elevated" | "High";

/** Which staged product an offer belongs to. Stage 1 = secured lending, Stage 2 = rent share (one SPV per home). */
export type OfferType = "loan" | "rent-share";

export interface Milestone {
  label: string;
  date: string; // indicative month, e.g. "2027-01"
  done: boolean;
}

export type PassportKind = "vacancy" | "acquisition" | "works" | "ber" | "tenancy" | "funding" | "payout" | "loan";

/** One entry on a home's digital passport. Every entry is attested by a Raya Chain transaction. */
export interface PassportEntry {
  id: string;
  kind: PassportKind;
  label: string;
  date: string; // ISO date or indicative month
  detail: string;
  done: boolean;
  /** Raya Chain transaction id (simulated). Present once the entry has been attested. */
  txId?: string;
}

export interface LoanTerms {
  /** Illustrative loan principal raised from lenders (≤ 65% of the illustrative valuation). */
  amount: number;
  ratePct: number; // fixed, per annum, e.g. 7.5
  termMonths: number;
  security: string; // e.g. "First legal charge over the property"
  arrangementFeePct: number; // paid by the borrower, not deducted from lenders
}

export interface Property {
  id: string;
  slug: string;
  title: string;
  location: string;
  county: string;
  type: string;
  bedrooms: number;
  description: string;
  objectives: string[];
  offerType: OfferType;
  /** Present for Stage 1 loan offers only. */
  loan?: LoanTerms;
  acquisition: number;
  refurbishment: number;
  legal: number;
  contingency: number;
  annualRent: number;
  annualOpex: number;
  /** Breakdown of annualOpex: maintenance, property management fee, insurance, other (LPT, compliance, service charges). */
  opex: { maintenance: number; management: number; insurance: number; other: number };
  /** Illustrative estimated post-refurbishment valuation (not a professional valuation). */
  valuation: number;
  /** Area centroid (WGS84) — deliberately NOT a building location. Stored as PostGIS geography(Point,4326). */
  geo: { lat: number; lng: number; precision: "area-centroid" };
  vacancyPct: number; // assumed, used in model
  status: PropertyStatus;
  fundedPct: number; // simulated funding progress 0-1
  holdingYears: number;
  distribution: "Monthly" | "Quarterly";
  riskLevel: RiskLevel;
  spvId: string;
  ber: string; // target BER after works
  berBefore: string; // BER (assumed) before works
  vacantSince: string; // indicative year the home became vacant (fictional)
  palette: { door: string; brick: string; sky: string };
  milestones: Milestone[];
  passport: PassportEntry[];
}

export type InvestorClassification = "Retail (non-sophisticated)" | "Sophisticated (self-certified)";

export interface Investor {
  id: string;
  name: string;
  email: string;
  county: string;
  classification: InvestorClassification;
  onboarding: {
    kyc: "Simulated — passed" | "Simulated — pending";
    aml: "Simulated — clear" | "Simulated — review";
    risk: "Completed" | "Pending";
    appropriateness: "Placeholder — passed" | "Placeholder — pending";
  };
  /** ECSPR-style entry knowledge test (simulated). */
  knowledgeTest?: { score: number; total: number; passed: boolean; at: string };
  /** Self-declared, fictional. Used only for the "higher of €1,000 or 5% of net worth" warning. */
  statedNetWorth?: number;
  joined: string;
}

export interface Spv {
  id: string;
  name: string;
  propertyId: string;
  instrument: string;
  jurisdiction: string;
  status: string;
}

export interface SimInvestment {
  id: string;
  investorId: string;
  propertyId: string;
  offerType: OfferType;
  amount: number; // gross amount entered
  entryFee: number; // 0 for loans (borrower pays the arrangement fee)
  netInvested: number;
  participation: number; // 0-1 share of SPV economic interest (or of the loan)
  createdAt: string;
  ref: string; // simulated ledger reference
  /** Raya Chain ISSUE transaction id (simulated). */
  txId?: string;
  status: "Simulated" | "Seed" | "Withdrawn (reflection period)";
  /** True when the (simulated) €1,000 / 5% net-worth warning was shown for this investment. */
  warningShown?: boolean;
}

export interface DistributionRun {
  id: string;
  propertyId: string;
  period: string; // "2027-03"
  kind: "rent" | "interest";
  rentalIncome: number; // or interest due, for loans
  expenses: number;
  adminFee: number;
  distributable: number;
  createdAt: string;
  allocations: { investorId: string; amount: number; txId?: string }[];
}

export type AuditType =
  | "USER_REGISTRATION"
  | "DEMO_LOGIN"
  | "RISK_ACKNOWLEDGEMENT"
  | "WARNING_SHOWN"
  | "KNOWLEDGE_TEST"
  | "INVESTMENT_SIMULATION"
  | "REFLECTION_WITHDRAWAL"
  | "DOCUMENT_GENERATION"
  | "ADMIN_CHANGE"
  | "DISTRIBUTION_SIMULATION"
  | "LEDGER_EVENT"
  | "AML_ALERT"
  | "COMPLAINT"
  | "AGENT_APPROVAL";

export interface AuditEvent {
  id: string;
  type: AuditType;
  actor: string;
  detail: string;
  at: string;
  hash: string;
  prevHash: string;
}

export interface Complaint {
  id: string;
  investorId: string;
  subject: string;
  status: "Open" | "Resolved" | "Escalated";
  openedAt: string;
}

export interface AutoInvestRule {
  id: string;
  monthlyAmount: number;
  counties: string[];
  offerTypes: OfferType[];
  maxPerProperty: number;
  active: boolean;
}

export interface ExitVote {
  propertyId: string;
  investorId: string;
  choice: "sell" | "hold";
  at: string;
}

export interface BulletinListing {
  id: string;
  propertyId: string;
  sellerRef: string; // pseudonym
  units: number;
  askPerUnit: number;
  postedAt: string;
}

export interface TenantPosition {
  propertyId: string;
  sharePct: number; // 0-1 share of the home's company held by the tenant
  history: { year: number; sharePct: number; topUp: number; monthlyRent: number; txId?: string }[];
}
