# Codex brief — design and implement the Meithera MVP

Paste **Part A** into Codex (cloud) against `github.com/baz2024/meithera`, branch `main`. Codex also reads `AGENTS.md` automatically. If Codex should work as a series of smaller PRs, run the tasks in **Part B** one at a time.

---

## Part A — Master prompt

```text
You are the lead engineer and product designer for MEITHERA (working name in filings: PropertyShare Ireland), a proposed Irish platform that lets retail investors take small economic interests in refurbished Irish residential property through one SPV per property. Your job: finish a polished, fully interactive DEMONSTRATION MVP in this repo for a meeting with the Central Bank of Ireland Innovation Hub (late Oct / early Nov 2026), then open a PR.

READ FIRST (in this order): AGENTS.md, docs/competitor-analysis.md, docs/briefs/01-master-prompt.md (full route + section spec), docs/briefs/02-mvp-brief.md, PROJECT_PLAN.md, ARCHITECTURE.md, REGULATORY_ASSUMPTIONS.md. Then inspect src/ — foundations exist (finance engine, demo store, ledger abstraction, auth/middleware, UI primitives, landing page, marketplace). Extend them; do not rewrite them.

POSITIONING (from the competitor study)
- Model: Stake (Dubai) — per-property SPV, low minimum, exit windows + investor votes, track-record dashboard, AutoInvest.
- Regulatory route to show: the EU ECSPR pattern (Bricks.co in France; Property Bridges authorised by the Central Bank of Ireland), with an authorised payment/custody partner holding client money.
- Differentiators: (1) vacant-home regeneration impact reporting, (2) realised vs projected always shown separately, (3) one-screen fee stack, gross → net, (4) ECSPR-style investor-protection UX built in, (5) off-chain legal register with DLT used only as a reconciled record.
- Avoid what failed elsewhere: no promised liquidity (Lex Markets), no unregistered tokens or stablecoin payouts (Lofty/RealT), no gamified tiers or rewards (Stake), no crypto-trading look.

NON-NEGOTIABLE RULES
1. Demonstration only. No real payments, KYC, tokens, wallets, chain calls or distributions. Every property, person and number is fictional and labelled "illustrative".
2. Never say or imply the Central Bank has approved, authorised, regulated or endorsed Meithera. Use "proposed" and "subject to regulatory assessment".
3. Investors hold a proposed SPV instrument (share or profit-participating note — TBD), NOT legal title. A token is a record of that instrument, never ownership of the property.
4. Property-level net operating yield is not the investor return. Every return figure walks gross → net: entry fee, operating costs, administration fee, "before investor-level taxes".
5. Use the fee model submitted to the Innovation Hub: 1.5% acquisition fee (one-off, on the amount invested) and 0.5% annual administration fee (on net invested capital). Put these in FEES in src/lib/finance.ts (change annualMgmtPct from 0.01 to 0.005, rename it annualAdminPct) and derive EVERY on-screen figure from finance.ts — including the landing-page "per €1,000" example, which is currently hard-coded.
6. Illustrative distributions are MONTHLY (as described in the submission). Switch the seed data and all calculators to monthly.
7. Use RISK_WARNING from src/components/site/notices.tsx verbatim wherever the risk warning appears.
8. No real addresses. Locations are area centroids only.
9. No personal or sensitive data in browser storage. The demo store holds fictional data in sessionStorage only. Never ask for email, ID numbers, IBANs or income.
10. The app must run with zero env vars and no database ("local demo mode"). Prisma + PostGIS is optional persistence.

DESIGN
- Premium, calm, institutional Irish fintech. Tokens are already in src/app/globals.css (emerald #063F36, forest #0D6656, mint #DDF3E8, off-white #F8FAF8, charcoal #172521, slate #65736D, gold #C7A86D as a fill only, gold-ink #7A5E2A for gold text). Manrope for UI, DM Sans for text, Newsreader serif for marketing headings only.
- Reuse src/components/ui and src/components/site. Rounded-2xl cards, subtle shadows, Lucide icons at 1.5px stroke, restrained Framer Motion (respect prefers-reduced-motion), Recharts in emerald/forest/gold/#7FB8A4.
- WCAG AA contrast, 44px touch targets, visible focus rings, 16px mobile gutters, no horizontal scroll at 390px.
- Codex cloud has no internet after setup: replace next/font/google with @fontsource packages (@fontsource-variable/manrope, @fontsource/dm-sans, @fontsource/newsreader), installed in the setup script, so `pnpm build` works offline.

BUILD — every route in docs/briefs/01-master-prompt.md §4 must exist, work, and contain no dead buttons:
1. Public: /properties/[slug] (SVG gallery using PropertyArt variants; financial breakdown incl. valuation and opex lines for maintenance, management, insurance and other; investment information; risks; €100–€10,000 calculator using illustrate()); /how-it-works (SPV diagram + "what you own vs what the SPV owns"); /about; /impact (projected — not achieved — vacant homes returned to use, BER uplift); /faq; /compliance (public "Regulatory readiness"); /legal/risk-disclosure, /legal/privacy, /legal/terms; not-found.tsx; error.tsx.
2. Auth: /login (persona cards: Investor "Aoife Byrne (fictional)", Administrator; honour ?next=; show ?error=admin); /register (first name, county, "I confirm this is a demonstration" checkbox — nothing else).
3. Investment simulator: /invest (choose property) → /invest/[propertyId], 6 steps with a progress bar:
   (2) amount €100–€10,000, live gross→net preview;
   (3) simulated onboarding: personal details (fictional prefill), ID verification (animated "simulated check — no document collected"), AML screening, investor classification (retail / sophisticated), and an ECSPR-style ENTRY KNOWLEDGE TEST (5 multiple-choice questions on capital loss, illiquidity, SPV rights, fees, diversification) plus a SIMULATION OF ABILITY TO BEAR LOSS (user enters an illustrative net-worth band; show 10% capacity). Label the whole step "Illustrative — mirrors ECSPR Art. 21 if ECSPR applies";
   (4) risk acknowledgement (exact RISK_WARNING; explicit checkbox). If the amount is above the higher of €1,000 or 5% of the stated net worth, show the ECSPR-style additional warning and a second checkbox;
   (5) review: amount, 1.5% fee, net invested, proposed instrument, SPV, participation %, monthly/annual illustrative income, principal risks, a KIIS-style summary card, and a simulated 4-day reflection-period notice ("in a live service you could withdraw within 4 calendar days");
   (6) confirmation: "Simulation Completed", "No real money has been transferred.", "No securities or tokens have been issued." Write to the store (simulateInvestment) and the audit log (RISK_ACKNOWLEDGEMENT, INVESTMENT_SIMULATION, LEDGER_EVENT).
4. Investor dashboard (/dashboard, portfolio, income, transactions, documents, settings): KPI cards; Recharts allocation donut, monthly income over time (projected vs realised series — realised is a simulated zero until a distribution run), property performance, investment history; a 12-month income calendar; a transactions ledger with simulated tx refs; print-friendly watermarked documents (investment summary, risk disclosure, SPV information, financial assumptions, distribution statement, KIIS); AutoInvest settings (simulated rules: € per month, counties, max % per property — store only, never executes); an exit-window and investor-vote screen per holding (simulated); settings with "Reset demo data".
5. /regulatory-demo — presentation-quality, sections A–G exactly as in the master prompt, plus H: interactive financial model (runModel; base, optimistic and downside cases; transparent inputs) and I: "How Meithera compares", a table from docs/competitor-analysis.md showing regulatory basis, what the investor holds, liquidity and fees. Section F poses the four classification questions (ECSPR / MiFID II / AIFMD / authorised partner) WITHOUT answering them. Section G is the control matrix, with a "Proposed" vs "Implemented in demo" status column.
6. Admin (/admin → /admin/overview; overview, properties, investors, spvs, distributions, audit-log): server-side role check in the admin layout; create and edit fictional properties (Zod-validated), budgets, milestones and funding status; review simulated onboarding; SPV register; monthly distribution simulation (runDistribution: rent → costs → admin fee → allocations → statements); an audit log showing the hash chain with a "verify chain" button; and a prominent "Launch Regulatory Presentation" button.
7. /presentation — full-screen guided demo, 10 slides: platform overview, Irish vacant-housing problem (state figures as "to be sourced — placeholder"), marketplace, investment simulation, proposed SPV structure, proposed money flows (investor → authorised payment/custody partner → SPV → acquisition), DLT recordkeeping, investor protections (ECSPR-style controls), regulatory questions, proposed pilot (e.g. 1–3 vacant homes, capped raise, sophisticated or limited cohort). Previous / Next / Exit, progress bar, ←/→/Esc keys, speaker notes toggle (N), works offline. Target 7–10 minutes.
8. Data layer: prisma/schema.prisma for PostgreSQL + PostGIS (previewFeatures postgresqlExtensions; extensions [postgis]); models County (boundary geography(MultiPolygon,4326)), Property (location geography(Point,4326) — area centroid), Spv, Investor, Investment, DistributionRun, DistributionAllocation, EntitlementRecord, AuditEvent (hash, prevHash). prisma/seed.ts reuses src/lib/data. Write the geography columns with $executeRaw and ST_SetSRID(ST_MakePoint(lng,lat),4326). Add src/lib/repo.ts with a Repository interface, a LocalRepository (seed data), and a PrismaRepository used only when DATABASE_URL is set. Add docker-compose.yml (postgis/postgis:16-3.4), sql/spatial-examples.sql (properties within X km via ST_DWithin; properties per county via ST_Contains), supabase/migrations/0001_rls.sql (RLS: investors read only their own investments and allocations; admins via role claim), and .env.example.
9. Docs: README.md (what it is, the demo-only statement, run locally, demo logins, folder map), docs/product-requirements.md, docs/technical-architecture.md, docs/investment-structure.md, docs/regulatory-questions.md, docs/blockchain-architecture.md (off-chain register, on-chain representation, identity mapping, smart-contract controls, transfer restrictions, reconciliation, security, recovery and disputes), docs/demo-script.md (a timed 7–10 min Central Bank walkthrough with talking points and click path), docs/deployment.md (Vercel), docs/pitch-deck-content.md (12 slides of investor-deck copy: problem, solution, market, product, business model with the 1.5% / 0.5% fees, regulatory pathway, competition from docs/competitor-analysis.md, traction to date, go-to-market, team placeholder, ask placeholder, risks).
10. QA: vitest unit tests for finance.ts. Dublin 8 per €1,000 must give net invested €985.00, NOI share €61.14, 0.5% admin fee €4.925 (shown as €4.93 via Intl.NumberFormat; do not use toFixed for money), illustrative annual income €56.21 and property-level yield 6.21%; also test scenarios, the audit hash chain and the ledger transfer restrictions. Playwright smoke tests visit every route at 1280px and 390px, assert no console errors and no horizontal overflow, and run the full investment journey end to end (log in → invest → dashboard shows the new holding). Run `pnpm exec tsc --noEmit`, `pnpm lint`, `pnpm test` and `pnpm build`, and fix everything.

DEFINITION OF DONE
- Every route renders; every button does something; no "coming soon" stubs except clearly labelled future concepts (secondary market).
- The demo banner "Demonstration Platform — No Real Investments Available" is visible on every page, including /presentation.
- `grep -ri "regulated by\|authorised by\|approved by"` finds only negations or third-party facts (e.g. "Bricks — AMF ECSP licence").
- All checks pass offline. Update CLAUDE.md, AGENTS.md and PROJECT_PLAN.md status. Open one PR titled "Meithera demo MVP — Central Bank Innovation Hub build", with a summary, screenshots of /, /properties/dublin-8-two-bed, /invest, /dashboard, /regulatory-demo and /presentation, and the test results.

WORK STYLE
Plan first (write the plan into the PR description), then implement in the order above, committing after each numbered item. Prefer small, typed, pure functions in src/lib and server components by default; client components only where interaction needs them. Keep accessibility and copy discipline (illustrative, proposed, before investor-level taxes) on every screen.
```

---

## Part B — Same work as 8 Codex tasks (optional)

Run sequentially; each should end with green `tsc`, `lint`, `test` and `build`.

1. **Foundations fix-ups** — swap to @fontsource; set the 1.5% / 0.5% fees and monthly distributions; make the landing-page example computed; add vitest and the finance tests.
2. **Public pages** — the property detail page and calculator, how-it-works, about, impact, faq, compliance, legal, not-found, error.
3. **Auth + investment simulator** — login, register, /invest, the 6-step flow with the ECSPR-style knowledge test, loss simulation, warnings and reflection notice.
4. **Investor dashboard** — all sub-routes, charts, calendar, ledger, documents, AutoInvest, exit-window and vote screens.
5. **Regulatory demo** — sections A–I and the financial model.
6. **Admin + presentation** — the admin console, distributions, audit-chain verification, the 10-slide presentation.
7. **Data layer** — Prisma + PostGIS schema, seed, repository, docker-compose, spatial SQL, Supabase RLS.
8. **Docs + QA + PR** — all docs, the pitch-deck content, Playwright smoke and journey tests, final PR with screenshots.

---

## Part C — Codex environment

- **Setup script:**
  ```bash
  corepack enable
  pnpm install --frozen-lockfile=false
  pnpm add @fontsource-variable/manrope @fontsource/dm-sans @fontsource/newsreader
  pnpm add -D vitest @playwright/test
  pnpm exec playwright install --with-deps chromium
  ```
- **Agent internet access:** off (the fonts change makes builds offline-safe).
- **Env vars:** none required. Optional: `DEMO_SESSION_SECRET`.
