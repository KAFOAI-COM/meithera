# Meithera — handoff for Claude Code

Demonstration MVP of a proposed Irish fractional property investment platform (Stake Ireland / Meithera) for the **Central Bank of Ireland Innovation Hub** meeting (late Oct / early Nov 2026).

**Fees / payouts (per Innovation Hub submission):** 1.5% acquisition fee + 0.5%/yr administration fee; illustrative distributions monthly. Done in `finance.ts` (`FEES.annualAdminPct`, `illustrateLoan`, `loanFacility`, `headlineRate`, `staircase`); seed data monthly; Raya Chain simulator in `src/lib/chain/raya.ts`; Pexels photos in `public/images/`. Competitor study: `docs/competitor-analysis.md`. **Build schedule: `docs/briefs/04-mega-plan.md` (7 daily sessions).** **Current build brief: `docs/briefs/03-claude-code-prompt.md`** (full-vision demo, 5 stages, Raya Chain, supervisor view) — it supersedes the 'Remaining work' list below where they differ. Meeting: Tue 27 Oct 2026.

**Read first:** `docs/briefs/01-master-prompt.md` (full spec, routes, sections), `docs/briefs/02-mvp-brief.md` (second brief: Prisma + PostgreSQL/PostGIS, pitch-deck content), `PROJECT_PLAN.md`, `ARCHITECTURE.md`, `REGULATORY_ASSUMPTIONS.md`.

## Hard rules (never break)

- Demonstration only: no real payments, tokens, KYC, distributions. Every property/figure is fictional and labelled *illustrative*.
- Never claim Central Bank approval/authorisation/regulation. Use "proposed", "subject to regulatory assessment".
- Investors hold an SPV instrument, **not** legal title. Token ≠ legal ownership. Approved wording: "blockchain-based fractional ownership of property companies".
- Every feature carries a stage badge (0 Demo · 1 Lending · 2 Rent share · 3 Tenant to owner · 4 Internet of Value); never present stages 1–4 as live.
- Property-level net operating yield ≠ investor return. Always show gross → net with fees; income is "before investor-level taxes".
- Don't invent real addresses. Geo points are **area centroids** only.
- No sensitive data in browser storage. Demo store = fictional data in `sessionStorage`.
- Do not show the risk warning in modified wording: use `RISK_WARNING` from `src/components/site/notices.tsx`.

## Stack

pnpm · Next.js 15 App Router · TS · Tailwind v4 (tokens in `src/app/globals.css`, mirrored from the Meithera design-system artifact → `docs/design-tokens.json`) · shadcn-style primitives in `src/components/ui` · Lucide · Framer Motion · Recharts · Zustand · Zod. Fonts via `next/font`: Manrope (UI), DM Sans (text), Newsreader (serif headings).

Colours: emerald `#063F36`, forest `#0D6656`, mint `#DDF3E8`, off-white `#F8FAF8`, charcoal `#172521`, slate `#65736D`, gold `#C7A86D` (fill only — `gold-ink #7A5E2A` for text). Tailwind names: `emerald forest mint gold gold-ink surface card ink muted line line-strong demo demo-ink risk risk-ink`.

## Done so far

- Planning docs: `PROJECT_PLAN.md`, `ARCHITECTURE.md`, `REGULATORY_ASSUMPTIONS.md`
- `src/lib/types.ts` · `src/lib/finance.ts` (all maths: `totalCost`, `noi`, `netOperatingYield`, `illustrate()` investor gross→net, `runModel()` + scenarios) · `src/lib/ledger.ts` (EntitlementLedger interface + simulated adapter) · `src/lib/store.ts` (Zustand demo store: properties, investors, investments, distributions, hash-chained audit; `simulateInvestment`, `runDistribution`, `updateProperty`, `reset`) · `src/lib/auth.ts` + `src/app/actions.ts` (HMAC-signed demo session cookie; `demoLogin`, `demoRegister`, `logout`) · `src/middleware.ts` (gates /dashboard /invest /admin /presentation; admin role for /admin + /presentation)
- Seed data: `src/lib/data/properties.ts` (4 properties with valuation, opex breakdown, geo centroid), `src/lib/data/seed.ts` (5 investors, SPVs, 7 investments, audit chain). Demo investor id = `inv-001`.
- Components: `ui/index.tsx` (Button, Card, Badge, Input, Select, Label, Progress, Eyebrow, Table/Th/Td, Stat), `ui/tabs.tsx` (Tabs, Checkbox), `site/*` (Header, Footer, Logo, DemoBanner, RiskNotice, IllustrativeNotice, SectionHeading, PageHeader, PropertyArt SVG, HeroArt, PropertyCard, Marketplace w/ filters+sort, IrelandMap, FaqList, RegisterInterest, StoreHydrator/useHydrated)
- Routes done: `/` (landing, all 8 sections), `/properties` (marketplace)
- `pnpm exec tsc --noEmit` passes.

## Remaining work (in order)

1. **Public:** `/properties/[slug]` (gallery via `PropertyArt` variants facade/street/interior/plan, financial breakdown, investment info, risks, calculator €100–€10,000 using `illustrate()`), `/how-it-works`, `/about`, `/impact`, `/faq` (uses `FaqList`), `/compliance` (public "regulatory readiness"), `/legal/risk-disclosure|privacy|terms`, `not-found.tsx`, `error.tsx`.
2. **Auth pages:** `/login` (persona buttons → `demoLogin`, honour `?next=`, show `?error=admin`), `/register` (`demoRegister`, fields firstName + county + "I confirm this is a demo" checkbox; no email).
3. **Investor:** `/invest` (step 1 select property) and `/invest/[propertyId]` steps 2–6 (amount → simulated onboarding: personal details/ID verification/AML/classification/risk assessment/appropriateness placeholder → risk acknowledgement checkbox with exact `RISK_WARNING` → review → "Simulation Completed / No real money has been transferred / No securities or tokens have been issued"). Call `useDemo().simulateInvestment` + `log("RISK_ACKNOWLEDGEMENT")`.
4. **Dashboard** (`/dashboard` + portfolio, income [monthly calendar], transactions [ledger], documents [watermarked: `.watermark` class exists], settings [reset demo]). Recharts: allocation pie, income over time, property performance, investment history. Server layout should verify session via `getSession()`.
5. **Regulatory:** `/regulatory-demo` sections A–G from the master prompt + interactive financial model (`runModel`, base/optimistic/downside).
6. **Admin:** `/admin` → redirect `/admin/overview`; overview (+ "Launch Regulatory Presentation" button → `/presentation`, reset demo), properties (create/edit, budgets, milestones, funding), investors, spvs, distributions (`runDistribution`), audit-log (show hash chain). Server-side check `session.role === "admin"` in admin layout.
7. **Presentation:** `/presentation` full-screen, 10 slides (overview, housing problem, marketplace, simulation, SPV, money flows, blockchain, protections, regulatory questions, proposed pilot), Previous/Next/Exit, progress bar, arrow-key nav, no external APIs.
8. **Database:** `prisma/schema.prisma` (PostgreSQL + `postgis` extension via `previewFeatures = ["postgresqlExtensions"]`; `location Unsupported("geography(Point,4326)")`; County with boundary `geography(MultiPolygon,4326)`), `prisma/seed.ts` reusing `src/lib/data`, raw SQL for `ST_SetSRID(ST_MakePoint(lng,lat),4326)`, `docker-compose.yml` with `postgis/postgis:16-3.4`, `supabase/migrations/*_rls.sql`, `.env.example`. App must still run with no DB.
9. **Docs:** `README.md`, `docs/product-requirements.md`, `docs/technical-architecture.md`, `docs/investment-structure.md`, `docs/regulatory-questions.md`, `docs/blockchain-architecture.md` (8 topics from brief §12), `docs/demo-script.md` (7–10 min Central Bank walkthrough), `docs/deployment.md`, `docs/pitch-deck-content.md`.
10. **QA:** `tsc`, `pnpm lint`, `pnpm build`, unit tests for finance (e.g. Dublin 8 per €1,000: net invested €985, NOI share €61.14, admin fee 0.5% = €4.925, income €56.21; yield 6.21%), Playwright smoke over every route at desktop + 390px mobile.

## Commands

```bash
pnpm install
pnpm dev          # http://localhost:3000 — log in as Investor or Administrator on /login
pnpm exec tsc --noEmit
pnpm lint
pnpm build
```
