export type PropertyStatus = "open" | "coming-soon" | "funded";
export type OfferType = "loan" | "rent-share";
export type Stage = 0 | 1 | 2 | 3 | 4;
export type RiskLevel = "Moderate" | "Elevated" | "High";

export interface Milestone {
  label: string;
  date: string; // indicative month, e.g. "2027-01"
  done: boolean;
}

export interface Property {
  id: string;
  slug: string;
  /** Stage 1 = secured refurbishment loan; Stage 2 = rent-share notes in the property SPV. */
  offerType: OfferType;
  /** Representative photography (not the actual property). */
  images: string[];
  loan?: { ratePct: number; months: number; ltvPct: number; security: string };
  title: string;
  location: string;
  county: string;
  type: string;
  bedrooms: number;
  description: string;
  objectives: string[];
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
  distribution: "Quarterly" | "Monthly";
  riskLevel: RiskLevel;
  spvId: string;
  ber: string; // target BER after works
  berBefore: string; // illustrative pre-works BER survey result
  vacantSince: string; // illustrative year the home became vacant
  palette: { door: string; brick: string; sky: string };
  milestones: Milestone[];
}

export interface Investor {
  id: string;
  name: string;
  email: string;
  county: string;
  classification: "Retail (non-sophisticated)" | "Sophisticated (self-certified)";
  onboarding: { kyc: "Simulated — passed" | "Simulated — pending"; aml: "Simulated — clear" | "Simulated — review"; risk: "Completed" | "Pending"; appropriateness: "Placeholder — passed" | "Placeholder — pending" };
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
  amount: number; // gross amount entered
  entryFee: number;
  netInvested: number;
  participation: number; // 0-1 share of SPV economic interest
  createdAt: string;
  ref: string; // simulated ledger reference
  status: "Simulated" | "Seed" | "Withdrawn";
  txId?: string; // Raya Chain ISSUE tx recording this holding
}

export interface DistributionRun {
  id: string;
  propertyId: string;
  kind: "rent" | "interest"; // Stage 2 rent distribution or Stage 1 loan interest
  period: string; // monthly, e.g. "2026-10"
  rentalIncome: number;
  expenses: number;
  mgmtFee: number;
  distributable: number;
  createdAt: string;
  allocations: { investorId: string; amount: number; txId?: string }[];
}

export type AuditType =
  | "USER_REGISTRATION"
  | "DEMO_LOGIN"
  | "RISK_ACKNOWLEDGEMENT"
  | "INVESTMENT_SIMULATION"
  | "DOCUMENT_GENERATION"
  | "ADMIN_CHANGE"
  | "DISTRIBUTION_SIMULATION"
  | "LEDGER_EVENT"
  | "ONBOARDING_SIMULATION"
  | "KNOWLEDGE_TEST"
  | "EXTRA_WARNING"
  | "REFLECTION_WITHDRAWAL"
  | "EXIT_VOTE"
  | "BULLETIN_POST"
  | "AUTOINVEST_RULE"
  | "STAIRCASING";

export interface AuditEvent {
  id: string;
  type: AuditType;
  actor: string;
  detail: string;
  at: string;
  hash: string;
  prevHash: string;
}

export type ChainTxType = "GENESIS" | "ISSUE" | "TRANSFER" | "DISTRIBUTION" | "REPAYMENT" | "FREEZE" | "CORRECTION" | "ANCHOR" | "REJECTED" | "ATTEST" | "WITHDRAWAL";

export interface ChainTx {
  txId: string;
  type: ChainTxType;
  spvId?: string;
  from?: string; // pseudonymous holder ref
  to?: string;
  units?: number;
  amount?: number; // EUR (simulated)
  memo: string;
  reason?: string; // reason code for FREEZE / CORRECTION / REJECTED
  at: string;
  block: number;
}

export interface ChainBlock {
  height: number;
  at: string;
  prevHash: string;
  merkleRoot: string;
  hash: string;
  txIds: string[];
  anchors: { chain: string; ref: string }[];
}

export type VoteChoice = "for" | "against" | "abstain";

/** ECSPR-style bulletin board post: an expression of interest to sell, never a matched order. */
export interface BulletinPost {
  id: string;
  investorId: string;
  propertyId: string;
  units: number;
  askPerUnit: number;
  at: string;
}

export interface AutoInvestRules {
  enabled: boolean;
  offerTypes: OfferType[];
  maxPerOffer: number;
  monthlyBudget: number;
}

export interface StaircaseStep {
  year: number;
  tenantPct: number;
  payment: number;
  txId: string;
  at: string;
}
