# Meithera — demonstration MVP

**Blockchain-based fractional ownership of property companies**, built by Raya Software Limited (incorporated in Ireland, CRO) for the **Central Bank of Ireland Innovation Hub** meeting on Tuesday 27 October 2026.

> Demonstration only. No real investments, payments, KYC, tokens, wallets or chain calls. Every home, person and figure is fictional and labelled *illustrative*. Meithera is **not** authorised or regulated by the Central Bank of Ireland; the Innovation Hub provides guidance, not approval.

**Live demo:** https://meithera.omnirisk.io (also https://meithera.vercel.app) — log in as Administrator and press **Launch Regulatory Presentation**. Deployment details: `docs/deployment.md`.

## The idea in one paragraph

Irish people can’t afford to buy, rents are punishing, and thousands of homes sit vacant. Meithera lets ordinary people fund new supply — refurbishing vacant homes — in small amounts, through an EU crowdfunding licence (ECSPR), with every euro, holder and payout recorded on **Raya Chain** and visible to the supervisor. Over time, tenants can buy into the home they live in.

## The five stages

| Stage | Name | Legal basis | What the demo shows |
|---|---|---|---|
| 0 | Demo | Everything simulated | This site |
| 1 | Lending | Possible under ECSPR (partner first) | Secured loans from €100, 7.5–8% fixed, 18–24 months, LTV ≤ 62% — Cork, Limerick |
| 2 | Rent share | Possible under ECSPR | Notes in a per-home company, monthly income, exit vote, bulletin board — Dublin 8, Galway |
| 3 | Tenant to owner | Requires further authorisation | Staircasing simulator (`/dashboard/tenant`) |
| 4 | Internet of Value | Future — depends on EU reform | Raya Chain as official register, anchors to other chains, euro stablecoin payouts |

Every feature, screen and slide carries a stage badge.

## Run it

```bash
pnpm install
pnpm dev            # http://localhost:3000
pnpm build && pnpm start   # production, works offline on the meeting laptop
```

Zero environment variables, no database, no network at runtime (fonts are self-hosted at build time).

**Personas** (`/login`): Investor (Aoife, fictional) · Tenant (Ciara Doyle, fictional) · Supervisor (demonstration) · Administrator. Administrator → **Launch Regulatory Presentation**.

## Routes

| Route | What |
|---|---|
| `/` `/properties` `/properties/[slug]` | Landing, marketplace, home detail with **Home Digital Passport** and calculator |
| `/invest` `/invest/[propertyId]` | Six-step simulated journey (loan or rent share) ending in a Raya Chain tx |
| `/chain` | Raya Chain explorer — an audit console: blocks, txs, holders, cap tables, anchors, verify, rejected-transfer demo |
| `/supervisor` | Illustrative supervisory view with CSV/JSON export (role: supervisor/admin) |
| `/dashboard/*` | Investor dashboard: overview, portfolio, income calendar, transactions, documents, settings; `/dashboard/tenant` staircasing |
| `/agents` | Four deterministic agents with reasoning traces and human approval |
| `/regulatory-demo` | Sections A–I incl. the four unanswered classification questions and the financial model |
| `/roadmap` `/how-it-works` `/about` `/impact` `/faq` `/compliance` `/legal/*` | Public pages |
| `/admin/*` | Administrator console (role: admin) |
| `/presentation` | 12-slide full-screen deck with speaker notes (role: admin/supervisor) |

## Checks

```bash
pnpm check          # typecheck + lint + unit tests
pnpm test           # vitest: finance (Dublin 8 per €1,000, loan maths) and Raya Chain integrity
pnpm test:e2e       # Playwright: every route at 1280 and 390 px, plus the end-to-end journey
```

## Optional database

```bash
pnpm add -D prisma @prisma/client tsx
pnpm db:up          # postgis/postgis:16-3.4 via docker compose
cp .env.example .env.local   # set DATABASE_URL
pnpm db:push && pnpm db:seed
```

`src/lib/repo.ts` uses `LocalRepository` unless `DATABASE_URL` is set. See `docs/deployment.md`.

## Documents

`docs/demo-script.md` (timed click-path) · `docs/roadmap.md` · `docs/raya-chain-architecture.md` · `docs/investment-structure.md` · `docs/regulatory-questions.md` · `docs/technical-architecture.md` · `docs/deployment.md` · `docs/pitch-deck-content.md` · `docs/competitor-analysis.md` · `REGULATORY_ASSUMPTIONS.md` · `ARCHITECTURE.md` · `PROJECT_PLAN.md`.

## Hard rules

See `CLAUDE.md`. In short: demo only; never claim Central Bank approval; investors hold notes in a company or a loan participation, never title; every return walks gross → net before investor-level taxes; the risk warning is used verbatim; no real addresses; no personal data.
