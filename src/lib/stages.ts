/**
 * The five Meithera stages. Every feature, screen and slide carries one of these badges.
 * Stages 1–4 are proposals; only Stage 0 (the demonstration) exists today.
 */
export type StageNumber = 0 | 1 | 2 | 3 | 4;

export type StageBasis = "demo" | "ecspr" | "authorisation" | "eu-reform";

export interface Stage {
  n: StageNumber;
  name: string;
  short: string;
  basis: StageBasis;
  basisLabel: string;
  summary: string;
}

export const STAGES: Record<StageNumber, Stage> = {
  0: {
    n: 0,
    name: "Demo",
    short: "Stage 0 · Demo",
    basis: "demo",
    basisLabel: "Demonstration — everything simulated",
    summary: "Everything on this platform today is simulated. No money, securities, tokens or personal data are involved.",
  },
  1: {
    n: 1,
    name: "Lending",
    short: "Stage 1 · Lending",
    basis: "ecspr",
    basisLabel: "Possible under ECSPR",
    summary:
      "Investors lend from €100 to refurbish a vacant home. Secured by a first legal charge, fixed interest over 12–24 months, borrower pays the arrangement fee. Via a licensed ECSP partner first, Meithera's own licence later.",
  },
  2: {
    n: 2,
    name: "Rent share",
    short: "Stage 2 · Rent share",
    basis: "ecspr",
    basisLabel: "Possible under ECSPR",
    summary:
      "One company (SPV) per home; investors hold notes in it; monthly rental income; an investor vote on selling; an ECSPR bulletin board for early exit; Raya Chain mirrors the register.",
  },
  3: {
    n: 3,
    name: "Tenant to owner",
    short: "Stage 3 · Tenant to owner",
    basis: "authorisation",
    basisLabel: "Requires further authorisation",
    summary:
      "The tenant buys shares in their own home's company step by step. Rent falls as the share grows and investors are bought out with a return. Needs additional permissions or a lending partner.",
  },
  4: {
    n: 4,
    name: "Internet of Value",
    short: "Stage 4 · Internet of Value",
    basis: "eu-reform",
    basisLabel: "Future — depends on EU reform",
    summary:
      "Raya Chain becomes the official register of notes, holdings move across chains, payouts can use a regulated euro stablecoin and settlement uses central bank money. Depends on the reformed EU DLT Pilot Regime (Commission proposal of 4 Dec 2025).",
  },
};

export const STAGE_LIST = [STAGES[0], STAGES[1], STAGES[2], STAGES[3], STAGES[4]];

export function stageForOffer(offerType: "loan" | "rent-share"): Stage {
  return offerType === "loan" ? STAGES[1] : STAGES[2];
}
