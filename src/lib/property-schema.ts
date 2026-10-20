import { z } from "zod";
import type { Property } from "./types";

const money = (label: string, max = 5_000_000) => z.coerce.number({ error: `${label} must be a number` }).int(`${label} must be whole euro`).min(0, `${label} cannot be negative`).max(max, `${label} looks too large`);

/** Editable fields for an illustrative property (admin). Validation runs client-side; nothing is sent anywhere. */
export const propertyEditSchema = z
  .object({
    title: z.string().trim().min(5, "Title is too short").max(90),
    description: z.string().trim().min(20, "Description is too short").max(600),
    acquisition: money("Acquisition"),
    refurbishment: money("Refurbishment"),
    legal: money("Legal costs", 200_000),
    contingency: money("Contingency", 500_000),
    valuation: money("Valuation"),
    annualRent: money("Annual rent", 500_000),
    maintenance: money("Maintenance", 100_000),
    management: money("Management", 100_000),
    insurance: money("Insurance", 50_000),
    other: money("Other costs", 100_000),
    status: z.enum(["open", "coming-soon", "funded"]),
    fundedPct: z.coerce.number().min(0, "Funding must be 0–100%").max(100, "Funding must be 0–100%"),
  })
  .refine((v) => v.maintenance + v.management + v.insurance + v.other < v.annualRent, { message: "Operating costs must be below rent", path: ["annualRent"] });

export type PropertyEdit = z.infer<typeof propertyEditSchema>;

export function toEdit(p: Property): Record<keyof PropertyEdit, string> {
  return {
    title: p.title,
    description: p.description,
    acquisition: String(p.acquisition),
    refurbishment: String(p.refurbishment),
    legal: String(p.legal),
    contingency: String(p.contingency),
    valuation: String(p.valuation),
    annualRent: String(p.annualRent),
    maintenance: String(p.opex.maintenance),
    management: String(p.opex.management),
    insurance: String(p.opex.insurance),
    other: String(p.opex.other),
    status: p.status,
    fundedPct: String(Math.round(p.fundedPct * 100)),
  };
}

export function applyEdit(v: PropertyEdit): Partial<Property> {
  const opex = { maintenance: v.maintenance, management: v.management, insurance: v.insurance, other: v.other };
  return {
    title: v.title,
    description: v.description,
    acquisition: v.acquisition,
    refurbishment: v.refurbishment,
    legal: v.legal,
    contingency: v.contingency,
    valuation: v.valuation,
    annualRent: v.annualRent,
    opex,
    annualOpex: opex.maintenance + opex.management + opex.insurance + opex.other,
    status: v.status,
    fundedPct: v.fundedPct / 100,
  };
}

/** Area centroids (WGS84) for counties offered in the demo — never building locations. */
export const COUNTY_CENTROIDS: Record<string, { lat: number; lng: number }> = {
  Dublin: { lat: 53.35, lng: -6.26 },
  Cork: { lat: 51.9, lng: -8.47 },
  Galway: { lat: 53.27, lng: -9.05 },
  Limerick: { lat: 52.66, lng: -8.63 },
  Waterford: { lat: 52.26, lng: -7.11 },
  Kilkenny: { lat: 52.65, lng: -7.25 },
  Sligo: { lat: 54.27, lng: -8.47 },
};

export const propertyCreateSchema = z.object({
  location: z.string().trim().min(3, "Area name is too short").max(40),
  county: z.enum(Object.keys(COUNTY_CENTROIDS) as [string, ...string[]]),
  offerType: z.enum(["loan", "rent-share"]),
  type: z.string().trim().min(3, "Describe the property type").max(60),
  bedrooms: z.coerce.number().int().min(1).max(8),
  acquisition: money("Acquisition"),
  refurbishment: money("Refurbishment"),
  annualRent: money("Annual rent", 500_000),
  valuation: money("Valuation"),
});
export type PropertyCreate = z.infer<typeof propertyCreateSchema>;

/** Build a full illustrative Property from the short create form, with conservative defaults. */
export function buildProperty(v: PropertyCreate, template: Property, n: number): Property {
  const slug = `${v.location.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${n}`;
  const legal = Math.round(v.acquisition * 0.04);
  const contingency = Math.round(v.refurbishment * 0.3);
  const opex = { maintenance: Math.round(v.annualRent * 0.09), management: Math.round(v.annualRent * 0.1), insurance: Math.round(v.annualRent * 0.03), other: Math.round(v.annualRent * 0.03) };
  return {
    ...template,
    id: `prop-${slug}`,
    slug,
    offerType: v.offerType,
    loan: v.offerType === "loan" ? { ratePct: 7.5, months: 18, ltvPct: 60, security: "First legal charge (proposed)" } : undefined,
    title: `${v.location} — ${v.type}`,
    location: v.location,
    county: v.county,
    type: v.type,
    bedrooms: v.bedrooms,
    description: `An illustrative ${v.bedrooms}-bedroom ${v.type.toLowerCase()} in the ${v.location} area, added by the operator for the demonstration.`,
    acquisition: v.acquisition,
    refurbishment: v.refurbishment,
    legal,
    contingency,
    annualRent: v.annualRent,
    opex,
    annualOpex: opex.maintenance + opex.management + opex.insurance + opex.other,
    valuation: v.valuation,
    geo: { ...COUNTY_CENTROIDS[v.county], precision: "area-centroid" },
    status: "coming-soon",
    fundedPct: 0,
    spvId: `spv-${slug}`,
    milestones: [
      { label: "Opportunity review", date: "2027-03", done: false },
      { label: "Illustrative acquisition", date: "2027-05", done: false },
      { label: "Refurbishment works", date: "2027-08", done: false },
      { label: "Tenancy begins", date: "2027-10", done: false },
    ],
  };
}
