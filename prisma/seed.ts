/**
 * Prisma seed — reuses the same fictional seed data as the local demo mode, so the database and the
 * no-database build show identical content. Run with: pnpm db:seed (requires DATABASE_URL + PostGIS).
 *
 * Spatial columns are written with raw SQL because Prisma does not model PostGIS geography types.
 */
import { PrismaClient } from "@prisma/client";
import { seedAudit, seedChain, seedComplaints, seedInvestments, seedInvestors, seedProperties, seedSpvs } from "../src/lib/data/seed";
import { pseudonym } from "../src/lib/ledger";

const prisma = new PrismaClient();

async function main() {
  await prisma.$executeRawUnsafe(`CREATE EXTENSION IF NOT EXISTS postgis;`);

  const counties = Array.from(new Set(seedProperties.map((p) => p.county)));
  for (const name of counties) await prisma.county.upsert({ where: { name }, update: {}, create: { name } });

  // Chain blocks first (txs reference them), then txs.
  for (const b of seedChain.blocks) {
    await prisma.chainBlock.upsert({ where: { height: b.height }, update: {}, create: { height: b.height, timestamp: new Date(b.timestamp), prevHash: b.prevHash, hash: b.hash, merkleRoot: b.merkleRoot } });
  }
  for (const w of seedChain.wallets) await prisma.wallet.upsert({ where: { id: w.id }, update: { verified: w.verified, frozen: w.frozen, frozenReason: w.frozenReason }, create: { id: w.id, label: w.label, kind: w.kind, verified: w.verified, frozen: w.frozen, frozenReason: w.frozenReason } });

  for (const p of seedProperties) {
    const county = await prisma.county.findUnique({ where: { name: p.county } });
    await prisma.property.upsert({
      where: { id: p.id },
      update: {},
      create: {
        id: p.id, slug: p.slug, title: p.title, location: p.location, countyId: county?.id, type: p.type, bedrooms: p.bedrooms, description: p.description, objectives: p.objectives,
        offerType: p.offerType === "loan" ? "LOAN" : "RENT_SHARE", acquisition: p.acquisition, refurbishment: p.refurbishment, legal: p.legal, contingency: p.contingency, annualRent: p.annualRent,
        opexMaintenance: p.opex.maintenance, opexManagement: p.opex.management, opexInsurance: p.opex.insurance, opexOther: p.opex.other, valuation: p.valuation, vacancyPct: p.vacancyPct,
        status: p.status === "open" ? "OPEN" : p.status === "funded" ? "FUNDED" : "COMING_SOON", fundedPct: p.fundedPct, holdingYears: p.holdingYears, riskLevel: p.riskLevel, ber: p.ber, berBefore: p.berBefore, vacantSince: p.vacantSince,
      },
    });
    // Area centroid — deliberately not a building location.
    await prisma.$executeRaw`UPDATE "Property" SET "geo" = ST_SetSRID(ST_MakePoint(${p.geo.lng}, ${p.geo.lat}), 4326)::geography WHERE "id" = ${p.id}`;
    if (p.loan) await prisma.loan.upsert({ where: { propertyId: p.id }, update: {}, create: { propertyId: p.id, amount: p.loan.amount, ratePct: p.loan.ratePct, termMonths: p.loan.termMonths, security: p.loan.security, arrangementFeePct: p.loan.arrangementFeePct } });
  }
  for (const s of seedSpvs) await prisma.spv.upsert({ where: { id: s.id }, update: {}, create: { id: s.id, name: s.name, propertyId: s.propertyId, instrument: s.instrument, jurisdiction: s.jurisdiction, status: s.status } });

  for (const t of seedChain.txs) {
    const block = seedChain.blocks.find((b) => b.txIds.includes(t.id));
    await prisma.chainTx.upsert({
      where: { id: t.id }, update: {},
      create: { id: t.id, type: t.type, status: t.status === "confirmed" ? "CONFIRMED" : "REJECTED", at: new Date(t.at), blockHeight: block?.height, propertyId: t.propertyId, spvId: t.spvId, fromRef: t.from, toRef: t.to, units: t.units, amountEur: t.amountEur, memo: t.memo, reasonCode: t.reasonCode, ref: t.ref, rule: t.rule, hash: t.hash },
    });
  }
  for (const a of seedChain.anchors) await prisma.chainAnchor.upsert({ where: { id: a.id }, update: {}, create: { id: a.id, blockHeight: a.blockHeight, merkleRoot: a.merkleRoot, targetChain: a.targetChain, at: new Date(a.at), receipt: a.receipt, ackTxId: a.ackTxId } });

  for (const p of seedProperties) for (const e of p.passport) await prisma.passportEntry.upsert({ where: { id: e.id }, update: {}, create: { id: e.id, propertyId: p.id, kind: e.kind, label: e.label, date: e.date, detail: e.detail, done: e.done, txId: e.txId } });

  for (const i of seedInvestors) {
    await prisma.investor.upsert({
      where: { id: i.id }, update: {},
      create: { id: i.id, name: i.name, email: i.email, county: i.county, classification: i.classification.startsWith("Retail") ? "RETAIL" : "SOPHISTICATED", kyc: i.onboarding.kyc, aml: i.onboarding.aml, risk: i.onboarding.risk, appropriateness: i.onboarding.appropriateness, knowledgeScore: i.knowledgeTest?.score, knowledgeTotal: i.knowledgeTest?.total, knowledgePassed: i.knowledgeTest?.passed, statedNetWorth: i.statedNetWorth, joined: new Date(i.joined) },
    });
  }
  for (const s of seedInvestments) {
    await prisma.investment.upsert({ where: { id: s.id }, update: {}, create: { id: s.id, investorId: s.investorId, propertyId: s.propertyId, offerType: s.offerType === "loan" ? "LOAN" : "RENT_SHARE", amount: s.amount, entryFee: s.entryFee, netInvested: s.netInvested, participation: s.participation, status: s.status, ref: s.ref, txId: s.txId, createdAt: new Date(s.createdAt) } });
    const p = seedProperties.find((x) => x.id === s.propertyId)!;
    const lock = new Date(s.createdAt);
    lock.setFullYear(lock.getFullYear() + (s.offerType === "loan" ? 0 : 3));
    await prisma.entitlementRecord.upsert({ where: { recordId: `ENT-${s.id.toUpperCase()}` }, update: {}, create: { recordId: `ENT-${s.id.toUpperCase()}`, investorId: s.investorId, investorRef: pseudonym(s.investorId), spvId: p.spvId, investmentId: s.id, units: Math.round(s.netInvested), issuedAt: new Date(s.createdAt), txRef: s.txId ?? s.ref, transferRestricted: true, lockUpUntil: lock } });
  }
  for (const c of seedComplaints) await prisma.complaint.upsert({ where: { id: c.id }, update: {}, create: { id: c.id, investorId: c.investorId, subject: c.subject, status: c.status, openedAt: new Date(c.openedAt) } });
  for (const e of seedAudit) await prisma.auditEvent.upsert({ where: { id: e.id }, update: {}, create: { id: e.id, type: e.type, actor: e.actor, detail: e.detail, at: new Date(e.at), hash: e.hash, prevHash: e.prevHash } });

  console.log(`Seeded ${seedProperties.length} homes, ${seedInvestors.length} investors, ${seedInvestments.length} investments, ${seedChain.blocks.length} blocks, ${seedChain.txs.length} chain txs, ${seedAudit.length} audit events.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
