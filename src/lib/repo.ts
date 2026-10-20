/**
 * Repository abstraction. The demonstration uses LocalRepository (seed data, no I/O) by default.
 * When DATABASE_URL is set and @prisma/client has been generated, PrismaRepository reads the same
 * shapes from PostgreSQL + PostGIS. Server components can call getRepository(); the browser demo
 * state (Zustand) is unaffected, so the app always runs with no database.
 */
import "server-only";
import type { Investor, Property, SimInvestment, Spv } from "./types";
import { seedInvestments, seedInvestors, seedProperties, seedSpvs } from "./data/seed";
import { seedProperties as baseProperties } from "./data/properties";

export interface Repository {
  readonly mode: "local" | "prisma";
  properties(): Promise<Property[]>;
  property(slug: string): Promise<Property | null>;
  investors(): Promise<Investor[]>;
  investments(): Promise<SimInvestment[]>;
  spvs(): Promise<Spv[]>;
  /** Homes whose area centroid is within `metres` of a point (PostGIS ST_DWithin; haversine locally). */
  nearby(lat: number, lng: number, metres: number): Promise<Property[]>;
}

function haversine(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export class LocalRepository implements Repository {
  readonly mode = "local" as const;
  async properties() {
    return seedProperties;
  }
  async property(slug: string) {
    return seedProperties.find((p) => p.slug === slug) ?? null;
  }
  async investors() {
    return seedInvestors;
  }
  async investments() {
    return seedInvestments;
  }
  async spvs() {
    return seedSpvs;
  }
  async nearby(lat: number, lng: number, metres: number) {
    return seedProperties.filter((p) => haversine({ lat, lng }, p.geo) <= metres);
  }
}

/**
 * Prisma-backed repository. Loaded lazily so the build never requires the generated client.
 * Maps database rows back to the domain `Property` shape used throughout the UI.
 */
export class PrismaRepository implements Repository {
  readonly mode = "prisma" as const;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(private readonly prisma: any) {}

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private toProperty(r: any): Property {
    return {
      id: r.id,
      slug: r.slug,
      title: r.title,
      location: r.location,
      county: r.county?.name ?? "",
      type: r.type,
      bedrooms: r.bedrooms,
      description: r.description,
      objectives: r.objectives,
      offerType: r.offerType === "LOAN" ? "loan" : "rent-share",
      loan: r.loan ? { amount: r.loan.amount, ratePct: Number(r.loan.ratePct), termMonths: r.loan.termMonths, security: r.loan.security, arrangementFeePct: Number(r.loan.arrangementFeePct) } : undefined,
      acquisition: r.acquisition,
      refurbishment: r.refurbishment,
      legal: r.legal,
      contingency: r.contingency,
      annualRent: r.annualRent,
      annualOpex: r.opexMaintenance + r.opexManagement + r.opexInsurance + r.opexOther,
      opex: { maintenance: r.opexMaintenance, management: r.opexManagement, insurance: r.opexInsurance, other: r.opexOther },
      valuation: r.valuation,
      geo: { lat: r.lat ?? 0, lng: r.lng ?? 0, precision: "area-centroid" },
      vacancyPct: Number(r.vacancyPct),
      status: r.status === "OPEN" ? "open" : r.status === "FUNDED" ? "funded" : "coming-soon",
      fundedPct: Number(r.fundedPct),
      holdingYears: Number(r.holdingYears),
      distribution: "Monthly",
      riskLevel: r.riskLevel,
      spvId: r.spv?.id ?? "",
      ber: r.ber,
      berBefore: r.berBefore,
      vacantSince: r.vacantSince,
      palette: baseProperties.find((p: Property) => p.id === r.id)?.palette ?? { door: "#0d6656", brick: "#a65a43", sky: "#ddf3e8" },
      milestones: baseProperties.find((p: Property) => p.id === r.id)?.milestones ?? [],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      passport: (r.passport ?? []).map((e: any) => ({ id: e.id, kind: e.kind, label: e.label, date: e.date, detail: e.detail, done: e.done, txId: e.txId ?? undefined })),
    };
  }

  private async withGeo() {
    // Pull lat/lng out of the geography column with raw SQL; Prisma cannot select Unsupported types.
    const rows: { id: string; lat: number; lng: number }[] = await this.prisma.$queryRaw`SELECT "id", ST_Y("geo"::geometry) AS lat, ST_X("geo"::geometry) AS lng FROM "Property"`;
    return new Map(rows.map((r) => [r.id, r]));
  }

  async properties(): Promise<Property[]> {
    const [rows, geo] = await Promise.all([this.prisma.property.findMany({ include: { county: true, loan: true, spv: true, passport: true } }), this.withGeo()]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return rows.map((r: any) => this.toProperty({ ...r, ...geo.get(r.id) }));
  }
  async property(slug: string): Promise<Property | null> {
    const all = await this.properties();
    return all.find((p) => p.slug === slug) ?? null;
  }
  async investors(): Promise<Investor[]> {
    const rows = await this.prisma.investor.findMany();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return rows.map((r: any): Investor => ({ id: r.id, name: r.name, email: r.email, county: r.county, classification: r.classification === "RETAIL" ? "Retail (non-sophisticated)" : "Sophisticated (self-certified)", onboarding: { kyc: r.kyc, aml: r.aml, risk: r.risk, appropriateness: r.appropriateness }, knowledgeTest: r.knowledgeScore != null ? { score: r.knowledgeScore, total: r.knowledgeTotal, passed: !!r.knowledgePassed, at: r.joined.toISOString() } : undefined, statedNetWorth: r.statedNetWorth ?? undefined, joined: r.joined.toISOString() }));
  }
  async investments(): Promise<SimInvestment[]> {
    const rows = await this.prisma.investment.findMany();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return rows.map((r: any): SimInvestment => ({ id: r.id, investorId: r.investorId, propertyId: r.propertyId, offerType: r.offerType === "LOAN" ? "loan" : "rent-share", amount: Number(r.amount), entryFee: Number(r.entryFee), netInvested: Number(r.netInvested), participation: Number(r.participation), createdAt: r.createdAt.toISOString(), ref: r.ref, txId: r.txId ?? undefined, status: r.status, warningShown: r.warningShown }));
  }
  async spvs(): Promise<Spv[]> {
    const rows = await this.prisma.spv.findMany();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return rows.map((r: any): Spv => ({ id: r.id, name: r.name, propertyId: r.propertyId, instrument: r.instrument, jurisdiction: r.jurisdiction, status: r.status }));
  }
  async nearby(lat: number, lng: number, metres: number): Promise<Property[]> {
    const rows: { id: string }[] = await this.prisma.$queryRaw`SELECT "id" FROM "Property" WHERE ST_DWithin("geo", ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography, ${metres})`;
    const ids = new Set(rows.map((r) => r.id));
    return (await this.properties()).filter((p) => ids.has(p.id));
  }
}

let cached: Repository | null = null;

/** LocalRepository unless DATABASE_URL is set and the Prisma client is available. */
export async function getRepository(): Promise<Repository> {
  if (cached) return cached;
  if (process.env.DATABASE_URL) {
    try {
      // Resolved at runtime so a build without `prisma generate` still succeeds.
      const mod = "@prisma/client";
      const { PrismaClient } = await import(/* webpackIgnore: true */ mod);
      cached = new PrismaRepository(new PrismaClient());
      return cached;
    } catch {
      // fall through to local mode
    }
  }
  cached = new LocalRepository();
  return cached;
}
