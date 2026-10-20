# Meithera — handoff for Claude Code

Demonstration MVP of **Meithera** — "blockchain-based fractional ownership of property companies" by Raya Software Limited (Ireland, CRO) — for the **Central Bank of Ireland Innovation Hub** meeting on **Tuesday 27 October 2026**. The demo presents the full vision first (five stages, Raya Chain, supervisor view), then walks down to what can launch first (Stage 1 lending under ECSPR via a partner).

**Build brief:** `docs/briefs/03-claude-code-prompt.md` (supersedes 01/02 where they differ). **Read next:** `README.md`, `PROJECT_PLAN.md`, `ARCHITECTURE.md`, `docs/technical-architecture.md`, `REGULATORY_ASSUMPTIONS.md`, `docs/demo-script.md`, `docs/competitor-analysis.md`.

## Hard rules (never break)

- Demonstration only: no real payments, tokens, KYC, wallets, chain calls or AI API calls. Every home, person and figure is fictional and labelled *illustrative*.
- Never claim Central Bank approval/authorisation/regulation. Use "proposed", "subject to regulatory assessment". The Innovation Hub gives guidance, not approval.
- Wording: "fractional ownership of property companies" / "notes in the company that owns the home". Never "own part of the house". A token records the holding; it is not title.
- Every feature, screen and slide carries a **stage badge** (`StageBadge`, `src/lib/stages.ts`): 0 Demo · 1 Lending (Possible under ECSPR) · 2 Rent share (Possible under ECSPR) · 3 Tenant to owner (Requires further authorisation) · 4 Internet of Value (Future — depends on EU reform). Never present Stages 1–4 as live.
- Every return walks gross → net and is "before investor-level taxes". Property-level NOI yield ≠ investor return. Fees come **only** from `src/lib/finance.ts`: `FEES.entryFeePct` 1.5% acquisition (one-off), `FEES.annualAdminPct` 0.5%/yr administration, loans: borrower pays 1.5% arrangement, LTV ≤ 65%. Distributions are **monthly**. Never `toFixed` for money — use `eur()`.
- Use `RISK_WARNING` from `src/components/site/notices.tsx` verbatim. No real addresses — geo points are **area centroids**. No personal data; demo state = fictional data in `sessionStorage`.
- `grep -rni "approved by\|authorised by\|regulated by" src docs` must find only negations or third-party facts.

## Stack

pnpm · Next.js 15 App Router · TS · Tailwind v4 (tokens in `src/app/globals.css`) · shadcn-style primitives in `src/components/ui` · Lucide · Framer Motion · Recharts · Zustand · Zod · Vitest · Playwright. Fonts via `next/font` (Manrope UI, DM Sans text, Newsreader serif). Colours: emerald `#063F36`, forest `#0D6656`, mint `#DDF3E8`, off-white `#F8FAF8`, charcoal `#172521`, slate `#65736D`, gold `#C7A86D` (fill only; `gold-ink #7A5E2A` for text). Chart palette (validated): `src/lib/chart-colors.ts`.

## Map of the code

- `src/lib/finance.ts` all maths · `src/lib/chain/raya.ts` Raya Chain simulator · `src/lib/store.ts` demo state (every action writes a chain tx + audit event) · `src/lib/data/{properties,seed}.ts` fictional seed + chain genesis · `src/lib/stages.ts`, `roadmap.ts`, `regulatory.ts`, `agents.ts`, `personas.ts`, `auth.ts`/`auth-types.ts`, `repo.ts` (Local/Prisma)
- Routes: `src/app/(site)/*` (public, dashboard, admin, supervisor, chain, agents, regulatory-demo, invest), `src/app/presentation` (own layout)
- Components: `site/*`, `ui/*`, `invest/*`, `chain/*`, `supervisor/*`, `property/*`, `dashboard/*`, `admin/*`, `agents/*`, `regulatory/*`, `presentation/*`
- Personas (`/login`): investor `inv-001` Aoife · tenant `ten-001` Seán · supervisor `sup-001` · admin. Roles gate `/dashboard /invest /admin /supervisor /presentation` in `middleware.ts` plus server layouts.
- Tests: `tests/*.test.ts` (vitest), `e2e/*.spec.ts` (Playwright, 1280 + 390 px, console errors fail).

## Commands

```bash
pnpm install
pnpm dev                 # http://localhost:3000 — /login → persona
pnpm check               # tsc + eslint + vitest
pnpm build && pnpm start # offline-capable production build
pnpm test:e2e            # Playwright (reuses a dev server on :3017 if running)
pnpm db:up && pnpm db:push && pnpm db:seed   # optional PostGIS (needs prisma, @prisma/client, tsx)
```

## Status

All P0, P1 and P2 items from the brief are built on `feat/full-vision-mvp`; see `PROJECT_PLAN.md`. Remaining: rehearse `docs/demo-script.md`; legal review of `REGULATORY_ASSUMPTIONS.md`.
