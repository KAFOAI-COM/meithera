/**
 * Prisma seed — reuses the same fictional seed data as the local demo mode, so the database and the
 * no-database build show identical content. Run with: pnpm db:seed (requires DATABASE_URL + PostGIS,
 * and `pnpm add -D prisma @prisma/client tsx` once — they are not installed by default so the demo
 * stays dependency-light and offline-capable).
 *
 * Spatial columns are written with raw SQL because Prisma does not model PostGIS geography types.
 */
import { PrismaClient } from "@prisma/client";
import { seedAudit, seedChain, seedComplaints, seedDistributions, seedInvestments, seedInvestors, seedSpvs } from "../src/lib/data/seed";
import { seedProperties } from "../src/lib/data/properties";
import { loanFacility } from "../src/lib/finance";

const prisma = new PrismaClient();

async function main() {
  for (const county of new Set(seedProperties.map((p) => p.county))) {
    await prisma.county.upsert({ where: { name: county }, update: {}, create: { name: county } });
  }
  const counties = new Map((await prisma.county.findMany()).map((c: { id: string; name: string }) => [c.name, c.id]));

  for (const p of seedProperties) {
    const data = {
      slug: p.slug, title: p.title, location: p.location, countyId: counties.get(p.county), type: p.type, bedrooms: p.bedrooms,
      description: p.description, objectives: p.objectives, offerType: p.offerType === "loan" ? "LOAN" : "RENT_SHARE",
      acquisition: p.acquisition, refurbishment: p.refurbishment, legal: p.legal, contingency: p.contingency, annualRent: p.annualRent,
      opexMaintenance: p.opex.maintenance, opexManagement: p.opex.management, opexInsurance: p.opex.insurance, opexOther: p.opex.other,
      valuation: p.valuation, vacancyPct: p.vacancyPct, status: p.status === "open" ? "OPEN" : p.status === "funded" ? "FUNDED" : "COMING_SOON",
      fundedPct: p.fundedPct, holdingYears: p.holdingYears, riskLevel: p.riskLevel, ber: p.ber, berBefore: p.berBefore, vacantSince: p.vacantSince,
    } as const;
    await prisma.property.upsert({ where: { id: p.id }, update: data, create: { id: p.id, ...data } });
    // Area centroid only — never a building location.
    await prisma.$executeRaw`UPDATE "Property" SET "geo" = ST_SetSRID(ST_MakePoint(${p.geo.lng}, ${p.geo.lat}), 4326)::geography WHERE "id" = ${p.id}`;
    if (p.loan) {
      const loan = { amount: loanFacility(p), ratePct: p.loan.ratePct, termMonths: p.loan.months, ltvPct: p.loan.ltvPct, security: p.loan.security };
      await prisma.loan.upsert({ where: { propertyId: p.id }, update: loan, create: { propertyId: p.id, ...loan } });
    }
  }

  for (const s of seedSpvs) await prisma.spv.upsert({ where: { id: s.id }, update: {}, create: s });

  for (const b of seedChain.blocks) {
    await prisma.chainBlock.upsert({ where: { height: b.height }, update: {}, create: { height: b.height, timestamp: new Date(b.at), prevHash: b.prevHash, hash: b.hash, merkleRoot: b.merkleRoot } });
    for (const a of b.anchors) {
      await prisma.chainAnchor.upsert({ where: { id: `${b.height}:${a.chain}` }, update: {}, create: { id: `${b.height}:${a.chain}`, blockHeight: b.height, merkleRoot: b.merkleRoot, targetChain: a.chain, at: new Date(b.at), receipt: a.ref } });
    }
  }
  const propBySpv = new Map(seedProperties.map((p) => [p.spvId, p.id]));
  for (const t of seedChain.txs) {
    await prisma.chainTx.upsert({
      where: { id: t.txId },
      update: {},
      create: {
        id: t.txId, type: t.type, status: t.type === "REJECTED" ? "REJECTED" : "CONFIRMED", at: new Date(t.at), blockHeight: t.block,
        propertyId: t.spvId ? propBySpv.get(t.spvId) : undefined, spvId: t.spvId, fromRef: t.from, toRef: t.to, units: t.units, amountEur: t.amount,
        memo: t.memo, reasonCode: t.reason, hash: t.txId,
      },
    });
  }

  for (const i of seedInvestors) {
    await prisma.investor.upsert({
      where: { id: i.id },
      update: {},
      create: { id: i.id, name: i.name, email: i.email, county: i.county, classification: i.classification.startsWith("Retail") ? "RETAIL" : "SOPHISTICATED", kyc: i.onboarding.kyc, aml: i.onboarding.aml, risk: i.onboarding.risk, appropriateness: i.onboarding.appropriateness, joined: new Date(i.joined) },
    });
  }
  for (const s of seedInvestments) {
    const p = seedProperties.find((x) => x.id === s.propertyId)!;
    await prisma.investment.upsert({ where: { id: s.id }, update: {}, create: { id: s.id, investorId: s.investorId, propertyId: s.propertyId, offerType: p.offerType === "loan" ? "LOAN" : "RENT_SHARE", amount: s.amount, entryFee: s.entryFee, netInvested: s.netInvested, participation: s.participation, status: s.status, ref: s.ref, txId: s.txId, createdAt: new Date(s.createdAt) } });
  }
  for (const d of seedDistributions) {
    await prisma.distributionRun.upsert({
      where: { id: d.id },
      update: {},
      create: { id: d.id, propertyId: d.propertyId, period: d.period, kind: d.kind, rentalIncome: d.rentalIncome, expenses: d.expenses, adminFee: d.mgmtFee, distributable: d.distributable, createdAt: new Date(d.createdAt), allocations: { create: d.allocations.map((a) => ({ investorId: a.investorId, amount: a.amount, txId: a.txId })) } },
    });
  }
  for (const e of seedAudit) await prisma.auditEvent.upsert({ where: { id: e.id }, update: {}, create: { ...e, at: new Date(e.at) } });
  for (const c of seedComplaints) await prisma.complaint.upsert({ where: { id: c.id }, update: {}, create: c });

  console.log(`Seeded ${seedProperties.length} properties, ${seedInvestors.length} investors, ${seedChain.blocks.length} blocks, ${seedChain.txs.length} txs.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
