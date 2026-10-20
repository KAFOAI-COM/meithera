import type { Property, Stage } from "./types";

/** Legal-basis badge styles from the brief. */
export type StageVariant = "demo" | "ecspr" | "authorisation" | "future";

export const VARIANT_LABEL: Record<StageVariant, string> = {
  demo: "Simulated today",
  ecspr: "Possible under ECSPR",
  authorisation: "Requires further authorisation",
  future: "Future — depends on EU reform",
};

export interface StageInfo {
  stage: Stage;
  name: string;
  variant: StageVariant;
  headline: string;
  summary: string;
  image: string;
}

/** The five stages from demonstration to the Internet of Value. Only Stage 0 exists today, and it is simulated. */
export const STAGES: StageInfo[] = [
  {
    stage: 0,
    name: "Demo",
    variant: "demo",
    headline: "Everything simulated",
    summary: "This demonstration. Fictional homes, people and figures; no money, KYC or tokens.",
    image: "/images/fanlight.webp",
  },
  {
    stage: 1,
    name: "Lending",
    variant: "ecspr",
    headline: "Fund a vacant home’s refurbishment",
    summary: "Lend from €100, secured by a first legal charge, at fixed interest over 12–24 months, through a licensed crowdfunding partner.",
    image: "/images/reno.webp",
  },
  {
    stage: 2,
    name: "Rent share",
    variant: "ecspr",
    headline: "Notes in the company that owns the home",
    summary: "One property company per home. Monthly rental income, an investor vote on sale and an ECSPR bulletin board for early exit.",
    image: "/images/d8-1.webp",
  },
  {
    stage: 3,
    name: "Tenant to owner",
    variant: "authorisation",
    headline: "Tenants buy in, step by step",
    summary: "The tenant buys shares in their home’s company over time. Rent falls as their share grows; investors are bought out.",
    image: "/images/cork-1.webp",
  },
  {
    stage: 4,
    name: "Internet of Value",
    variant: "future",
    headline: "Raya Chain as the official register",
    summary: "Holdings move across chains with their compliance rules, payouts in a regulated euro stablecoin, settlement in central bank money.",
    image: "/images/street.webp",
  },
];

export const stageInfo = (s: Stage) => STAGES[s];

/** Offer badge text and stage for a property: Stage 1 secured loan or Stage 2 rent share. */
export const offerStage = (p: Pick<Property, "offerType">): Stage => (p.offerType === "loan" ? 1 : 2);
export const offerLabel = (p: Pick<Property, "offerType">) => (p.offerType === "loan" ? "Stage 1 · Secured loan" : "Stage 2 · Rent share");
