# Technical architecture

See also `ARCHITECTURE.md` (overview) and `docs/raya-chain-architecture.md`.

## Stack

pnpm · Next.js 15 App Router · TypeScript · Tailwind CSS v4 (tokens in `src/app/globals.css`) · shadcn-style primitives (`src/components/ui`) · Lucide · Framer Motion (respects `prefers-reduced-motion`) · Recharts · Zustand (persist → `sessionStorage`) · Zod · Vitest · Playwright. Fonts via `next/font` (Manrope, DM Sans, Newsreader), self-hosted at build time, so the production build runs offline.

## Layers

```
app/(site)/*            public pages, dashboard, admin, supervisor, chain, agents, regulatory-demo
app/presentation        full-screen deck (own layout, demo banner, role check)
app/actions.ts          server actions: demoLogin / demoRegister / logout (Zod)
middleware.ts           role gate: /dashboard /invest /admin /supervisor /presentation
lib/finance.ts          ALL money maths (fees, illustrate, illustrateLoan, runModel, staircase)
lib/chain/raya.ts       Raya Chain simulator (blocks, 8 tx types, allowlist, freeze/correction, anchors, verify)
lib/store.ts            demo state; every mutation writes a chain tx + audit event
lib/data/*              fictional seed data; seed.ts builds the chain genesis deterministically
lib/stages.ts           the five stages and badge basis
lib/regulatory.ts       decision points, control matrix, lifecycle, competitors (shared with docs)
lib/agents.ts           four deterministic agents (no model calls)
lib/repo.ts             LocalRepository (default) / PrismaRepository (DATABASE_URL)
prisma/, sql/, supabase/ optional PostgreSQL + PostGIS persistence
```

## Roles and sessions

Four personas: `investor`, `tenant`, `supervisor`, `admin`. The session is an HMAC-SHA-256-signed, httpOnly cookie (8 h). `middleware.ts` enforces prefix rules; server layouts (`dashboard`, `admin`, `supervisor`, `presentation`) re-check with `getSession()`. Client components never trust the cookie; they receive `userId` from server pages.

## State model

All fictional state (homes, investors, investments, distributions, audit, chain, complaints, bulletin, votes, AutoInvest, tenant position, agent approvals) lives in one Zustand store persisted to `sessionStorage` under `meithera-demo-v2`. `StoreHydrator` rehydrates after mount; components gate on `useHydrated()` to avoid SSR mismatches. **No personal data is ever stored.**

## Money

`src/lib/finance.ts` is the single source: `FEES` (1.5% acquisition, 0.5%/yr administration, 1.5% borrower-paid arrangement, 65% max LTV), `ECSPR` thresholds, `illustrate`, `illustrateLoan`, `runModel` + scenarios, `staircase`, `exceedsWarningThreshold`. Money is formatted with `Intl.NumberFormat` (`eur()`), never `toFixed`. Tests: `tests/finance.test.ts`.

## Raya Chain simulator

Pure functions over an immutable `ChainState`; the store owns the state. `commit()` groups txs into a block, acknowledges pending anchors with `ANCHOR` txs, and every third block posts roots to “Chain B” and “Chain C”. `verifyChain()` recomputes everything. `RayaChainSimulator` implements the older `EntitlementLedger` interface. Tests: `tests/chain.test.ts`.

## Charts

Recharts with a palette validated by the dataviz six-checks validator (`PROPERTY_COLOR` in `src/lib/portfolio.ts`): one hue per home, fixed; projected vs realised as two steps of one hue; thin marks; legends for ≥ 2 series.

## Security posture (demo → production)

| Area | Demo | Production intent |
|---|---|---|
| Auth | persona cookie | Supabase Auth / OIDC + MFA |
| Authorisation | middleware + server layouts | same + Postgres RLS (`supabase/migrations/0001_rls.sql`) |
| Validation | Zod on actions and admin forms | Zod at every boundary |
| Data | fictional, sessionStorage | server-side only; KYC via authorised partner |
| Audit | hash-chained in browser | append-only table, WORM export |
| Chain | simulated | permissioned Raya Chain, SHA-256, HSM keys |
| Secrets | none required | Vercel env vars |

## Quality gates

`pnpm check` (tsc, eslint, vitest) · `pnpm test:e2e` (Playwright, 1280 and 390 px, console errors fail the run, no horizontal overflow, end-to-end journey) · `pnpm build`.
