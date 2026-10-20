# Claude Code brief — Meithera full-vision MVP

**Meeting:** Central Bank of Ireland Innovation Hub, **Tuesday 27 October 2026**.
**Repo:** `github.com/baz2024/meithera` (local copy: `~/stake/meithera`).

**How to run it:**
```bash
cd ~/stake/meithera && git pull && pnpm install
claude          # Claude Code reads CLAUDE.md automatically
```
Press **Shift+Tab** to switch to plan mode, then paste the prompt below. Approve the plan, then let it build.

---

```text
You are the lead engineer, product designer and regtech architect for MEITHERA — "blockchain-based fractional ownership of property companies", built by Raya Software Limited (incorporated in Ireland, CRO). Finish a polished, fully interactive DEMONSTRATION MVP in this repo for the Central Bank of Ireland Innovation Hub meeting on Tuesday 27 October 2026. The demo presents the FULL VISION first, then walks down a staged roadmap to what can launch first.

READ FIRST: CLAUDE.md, docs/competitor-analysis.md, docs/briefs/01-master-prompt.md (route and section spec), docs/briefs/02-mvp-brief.md, PROJECT_PLAN.md, ARCHITECTURE.md, REGULATORY_ASSUMPTIONS.md. Then inspect src/: a finance engine, demo store, ledger abstraction, auth/middleware, UI primitives, landing page and marketplace already exist. Extend them; don't rewrite them. Use plan mode, track the work with your task list, and commit after each milestone.

MISSION (use this in the copy)
Irish people can't afford to buy, rents are punishing, and thousands of homes sit vacant. Meithera lets ordinary people fund new supply — refurbishing vacant homes — in small amounts, through an EU crowdfunding licence (ECSPR), with every euro, holder and payout recorded on Raya Chain and visible to the supervisor. Over time, tenants can buy into the home they live in.

THE FIVE STAGES — every feature, screen and slide carries a stage badge
- Stage 0 · Demo (today): everything is simulated.
- Stage 1 · Lending (launchable first, under ECSPR via a licensed partner such as Property Bridges, or Meithera's own licence later): investors lend from €100 to refurbish a vacant home. The loan is secured by a first legal charge, pays fixed interest over 12–24 months, and the borrower pays the arrangement fee.
- Stage 2 · Rent share (the Bricks/Stake model under ECSPR): one company (SPV) per home; investors hold notes in it; monthly rental income; an investor vote on selling; an ECSPR bulletin board for early exit; Raya Chain mirrors the register.
- Stage 3 · Tenant to owner (staircasing): the tenant buys shares in their own home's company step by step, rent falls as their share grows, and investors are bought out with a return. This needs additional permissions or a lending partner.
- Stage 4 · Internet of Value: Raya Chain becomes the official register of notes, holdings move across chains (Raya Chain is a Layer Zero), payouts can be made in a regulated euro stablecoin, and settlement uses central bank money. This depends on the reformed EU DLT Pilot Regime (Commission proposal of 4 Dec 2025, which extends it to all MiFID financial instruments).
Badge styles: "Possible under ECSPR" (mint), "Requires further authorisation" (gold), "Future — depends on EU reform" (neutral). Never present Stages 1–4 as live.

NON-NEGOTIABLE RULES
1. Demo only: no real payments, KYC, tokens, wallets, chain calls or AI API calls. All people, homes and numbers are fictional and labelled "illustrative".
2. Never say the Central Bank approved, authorised, regulates or endorses Meithera. The Innovation Hub gives guidance, not approval.
3. Wording: "fractional ownership of property companies" / "notes in the company that owns the home". Never "own part of the house". A token records the holding; it isn't title.
4. Every return figure walks gross → net and is "before investor-level taxes". Fees come from src/lib/finance.ts only: 1.5% acquisition fee (one-off) and 0.5% annual administration fee — change annualMgmtPct (0.01) to annualAdminPct = 0.005. Rental distributions are MONTHLY. The landing-page "per €1,000" example must be computed, not hard-coded.
5. Use RISK_WARNING from src/components/site/notices.tsx verbatim. No real addresses (area centroids only). No personal data collected; fictional state lives in sessionStorage only.
6. Runs with zero env vars, no database and no network (next/font self-hosts at build time). Prisma + PostGIS is optional persistence.

BUILD — in this order. Everything marked P0 must be done and polished before anything else.

P0-1 Foundations: fee and monthly changes; add an offerType field ("loan" | "rent-share") to Property. Cork and Limerick become Stage 1 loan offers (illustrative 7.5% p.a. fixed, 18 months, LTV ≤ 65% of valuation); Dublin 8 and Galway become Stage 2 rent-share offers. Add illustrateLoan(amount, ratePct, months) to finance.ts (monthly interest, total interest, repayment schedule). Add vitest tests: Dublin 8 per €1,000 → net €985.00, NOI share €61.14, admin fee €4.925 (shown €4.93 via Intl), annual income €56.21, yield 6.21%; plus loan maths. Never use toFixed for money.

P0-2 Raya Chain (simulated): src/lib/chain/raya.ts implements the EntitlementLedger interface as RayaChainSimulator:
- blocks with height, timestamp, prevHash, merkleRoot and transactions;
- tx types ISSUE, TRANSFER, DISTRIBUTION, REPAYMENT, FREEZE, CORRECTION, ANCHOR;
- a verified-wallet allowlist (transfers to unverified wallets are rejected and shown with the reason);
- freeze and court-ordered correction with reason codes;
- pseudonymous holder IDs only, no personal data;
- "ANCHOR" proofs mirrored to other chains: show the Merkle root posted to illustrative "Chain B" / "Chain C" so the master record stays single while proofs travel. The compliance rules travel with the asset.
Every simulated investment, payout, loan repayment and admin action writes a tx. Deterministic hashing (existing fnv or a SHA-256 via crypto.subtle).

P0-3 Investment journeys:
- /invest (choose an offer) → /invest/[propertyId], 6 steps: amount → simulated onboarding (personal details prefilled with a fictional person, simulated ID check with no document collected, AML screen, retail/sophisticated classification, ECSPR-style 5-question knowledge test and a "can you bear the loss" simulation) → risk acknowledgement (exact RISK_WARNING, plus an extra warning if the amount is above the higher of €1,000 or 5% of the stated net worth) → review (fees, net invested, instrument, SPV, participation %, monthly income or loan interest schedule, key-information-sheet card, 4-day reflection notice) → confirmation ("Simulation Completed", "No real money has been transferred.", "No securities or tokens have been issued.") and a live link to the new Raya Chain tx.
- The loan flow and the rent-share flow share these steps but show different instrument and income panels.

P0-4 Raya Chain Explorer (/chain): latest blocks, a tx feed, search by tx/holder/property, a holder view (holdings by pseudonym), per-property cap table, anchors to Chain B/C, a "verify chain" button that recomputes hashes, and a "try a transfer to an unverified wallet" demo that gets rejected.

P0-5 Supervisor view (/supervisor, role "supervisor", persona "Supervisor (demonstration)"): a read-only live dashboard of the kind a regulator could be given — totals raised per SPV against the €5m ECSPR cap, investor counts by classification, knowledge-test pass rates, warnings shown, reflection-period withdrawals, AML alerts, frozen holdings, complaints (simulated), the audit and hash-chain status, and the Raya Chain tx feed. Export as CSV/JSON (client-side download). Label it "Illustrative supervisory view — not a Central Bank system".

P0-6 Home Digital Passport (/properties/[slug] plus a passport tab): an SVG gallery (PropertyArt variants), the full financial breakdown (valuation; opex lines for maintenance, management, insurance and other), investment information and risks, a €100–€10,000 calculator using illustrate() or illustrateLoan(), and the passport itself: a timeline of vacancy → acquisition → refurbishment milestones → BER before/after → tenancy → funders count → payouts, each entry linked to its Raya Chain tx.

P0-7 Full-vision presentation (/presentation, admin + supervisor): full-screen, about 12 slides, 7–10 minutes:
1. The problem
2. The mission
3. The full vision (all 5 stages on one journey)
4. Live: an investor funds a vacant home (deep link)
5. Raya Chain record, live (deep link)
6. Supervisor view (deep link)
7. Rent share and monthly payouts
8. Tenant to owner
9. Internet of Value and EU direction (DLT Pilot reform, central bank money settlement)
10. The roadmap: what we have and what we need per stage
11. Investor protections and ECSPR controls
12. Questions for the Innovation Hub + the proposed Stage 1 pilot
Include Previous / Next / Exit, a progress bar, ←/→/Esc keys, speaker notes (N), and the demo banner. No external APIs.

P0-8 Roadmap (/roadmap): a table per stage — goal, product, legal basis, partner, what we have, what we need, key risks, indicative timing. Have: Raya Software Ltd (CRO), Innovation Hub engagement, the MVP, the Raya Chain concept. Need (Stage 1): an ECSP partner or own licence, a payment institution, the first vacant home, a property manager. Stage 2: the SPV structure, notes, legal sign-off on fund-rules risk. Stage 3: lending permissions or a partner, affordability checks with human oversight. Stage 4: a DLT Pilot Regime licence or partner, a custodian, a regulated euro stablecoin, Raya Chain cross-chain controls.

P1-1 Staircasing simulator (/dashboard/tenant, persona "Tenant (fictional)"): start at 5–10%, top up yearly, show the rent falling as the share grows and the investor buy-out, with every step recorded on Raya Chain. Badge: Stage 3.

P1-2 Agentic AI (simulated, deterministic, no LLM calls): an /agents page with four agents, each with inputs, a reasoning trace, an output and a "human approval required" button (EU AI Act human oversight):
- Vacant-home Scout: ranks fictional vacant properties by refurbishment cost, rent and BER uplift.
- Onboarding Guide: explains terms in plain English (and Irish/Arabic toggles optional).
- AML Monitor: flags unusual patterns in the simulated tx feed.
- Supervisory Reporter: drafts a monthly regulatory report from the store.

P1-3 Investor dashboard (/dashboard + portfolio, income, transactions, documents, settings):
- KPI cards;
- Recharts allocation donut, monthly income (projected vs realised), property performance and investment history;
- a 12-month income calendar;
- a ledger linked to Raya Chain;
- watermarked printable documents (summary, risk disclosure, SPV info, assumptions, distribution statement, key-information sheet);
- AutoInvest rules (simulated);
- per-holding exit vote and bulletin board (Stage 2);
- settings → reset demo.

P1-4 /regulatory-demo sections A–G (master prompt) plus H, the financial model (runModel; base/optimistic/downside), and I, "How Meithera compares" (from docs/competitor-analysis.md). Section F asks the four classification questions without answering them.

P1-5 Admin (/admin → /admin/overview): server-side role check; properties CRUD (Zod), budgets, milestones, funding; investors and simulated onboarding; SPVs; monthly distribution run (writes chain txs); audit log with a verify button; freeze/correct a holding; a "Launch Regulatory Presentation" button.

P1-6 Remaining public pages: /how-it-works (SPV diagram — what you own vs what the company owns), /about (Raya Software Ltd, mission), /impact (projected, not achieved), /faq, /compliance ("Regulatory readiness"), /legal/*, /login (personas: Investor, Tenant, Supervisor, Administrator; honour ?next=), /register, not-found, error.

P2-1 Data layer: prisma/schema.prisma for PostgreSQL + PostGIS (County boundary geography(MultiPolygon,4326); Property location geography(Point,4326) as an area centroid; Spv, Investor, Investment, Loan, DistributionRun, Allocation, EntitlementRecord, ChainTx, AuditEvent). Also:
- prisma/seed.ts reusing src/lib/data;
- src/lib/repo.ts (LocalRepository by default, PrismaRepository when DATABASE_URL is set);
- docker-compose.yml (postgis/postgis:16-3.4);
- sql/spatial-examples.sql (ST_DWithin, ST_Contains);
- supabase/migrations/0001_rls.sql;
- .env.example.

P2-2 Docs:
- README.md;
- docs/demo-script.md: a timed 7–10 minute click-path for Tuesday with talking points — full vision first, then down to Stage 1;
- docs/roadmap.md;
- docs/raya-chain-architecture.md: master record, anchors, identity mapping, smart-contract controls, transfer restrictions, reconciliation, security, recovery and disputes, cross-chain compliance;
- docs/investment-structure.md;
- docs/regulatory-questions.md;
- docs/technical-architecture.md;
- docs/deployment.md (Vercel);
- docs/pitch-deck-content.md (12 slides);
- update REGULATORY_ASSUMPTIONS.md with the five stages.

P2-3 QA:
- pnpm exec tsc --noEmit, pnpm lint, pnpm test, pnpm build;
- Playwright: every route at 1280px and 390px, with no console errors and no horizontal overflow;
- an end-to-end journey: log in → invest → the chain tx appears in /chain and /supervisor → the dashboard shows the holding;
- screenshots of the key screens into docs/screenshots/.
Fix everything.

DESIGN: premium, calm, institutional Irish fintech — not crypto. Use the existing tokens (emerald #063F36, forest #0D6656, mint #DDF3E8, off-white #F8FAF8, charcoal #172521, slate #65736D, gold #C7A86D as a fill only and gold-ink #7A5E2A for gold text), Manrope/DM Sans/Newsreader, the existing UI primitives, Lucide icons, restrained Framer Motion (respect prefers-reduced-motion), WCAG AA, 44px targets, and no horizontal scroll at 390px. The chain explorer should look like a bank's audit console, not a block explorer for traders.

DONE MEANS:
- every route works with no dead buttons;
- stage badges are on every feature;
- the demo banner shows on every page, including /presentation;
- `grep -rni "approved by\|authorised by\|regulated by"` finds only negations or third-party facts;
- all checks pass;
- `pnpm build && pnpm start` runs offline on the meeting laptop.
Update CLAUDE.md and PROJECT_PLAN.md status, push the branch `feat/full-vision-mvp`, and open a PR with screenshots and test results. If time runs short, ship all P0 items polished rather than everything half-done.
```
