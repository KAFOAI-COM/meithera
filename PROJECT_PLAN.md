# Meithera MVP — Project Plan

> **Status, 20 Oct 2026: meeting build complete — tag `v0.1-cbi`.** All seven sessions of `docs/briefs/04-mega-plan.md` are on `main` (Sessions 2–5 via PRs #2–#4 and #6; Session 6's data layer and docs ported from the parallel build; Session 7 QA). Checks: `pnpm check` (tsc + lint + 23 unit tests), `pnpm build`, 84 Playwright tests (35 routes × 1280/390 + journeys). Remaining steps are manual: deploy, rehearse, record a fallback video — see `CLAUDE.md`.

**Goal:** an interactive, clearly-labelled demonstration of a proposed Irish fractional property investment platform, ready for the Central Bank of Ireland Innovation Hub meeting (late Oct / early Nov 2026).

**Not in scope:** real investments, payments, token issuance, live KYC/AML, real distributions, any claim of authorisation.

## Repository inspection (Phase 1)

- `~/stake` and `github.com/baz2024/meithera` were both empty at the start, so there was no existing code to reuse or preserve.
- Stack chosen to match both briefs and the team's usual tooling: Next.js 15 (App Router), TypeScript, Tailwind CSS v4, shadcn/ui-style components, Lucide, Framer Motion, Recharts, Zustand, Zod, Prisma + PostgreSQL (Supabase-compatible), pnpm.

## Phases

| # | Phase | Output | Status |
|---|---|---|---|
| 1 | Architecture | This plan, `ARCHITECTURE.md`, `REGULATORY_ASSUMPTIONS.md`, project scaffold | ✅ |
| 2 | Design system | Tokens (`globals.css`, mirrored in the Meithera design-system artifact), UI primitives, property illustrations | ✅ |
| 3 | Public website | Landing, marketplace + filters, property details + calculator, How it works, About, Impact, FAQ, Compliance, Legal | ✅ |
| 4 | Investor experience | Demo login / registration, onboarding + 6-step investment simulator, dashboard (portfolio, income, transactions, documents, settings) | ✅ |
| 5 | Regulatory experience | `/regulatory-demo` (lifecycle, structure, funds flow, distributions, ledger, decision points, control matrix, financial model), admin console, audit log, guided presentation | ✅ |
| 6 | Testing | `tsc`, ESLint, production build, finance unit tests, Playwright route + mobile smoke tests | ✅ |

## Key decisions

1. **Local demo mode is the default.** Everything runs from seed data with no external services. State for the session (simulated investments, audit events, admin edits) lives in `sessionStorage` and contains only fictional data.
2. **Database is optional.** `prisma/schema.prisma` + `prisma/seed.ts` describe the production data model; `supabase/migrations` carries matching row-level-security policies.
3. **Server-side role checks.** Demo sessions are HMAC-signed httpOnly cookies; middleware and server layouts enforce investor/admin roles.
4. **Ledger is an abstraction.** `src/lib/ledger.ts` defines the interface a future chain adapter would implement; only a simulated adapter ships.
5. **One finance module.** `src/lib/finance.ts` produces every number on screen, so property-level and investor-level figures are always computed the same way and are unit-tested.

## Demo-day checklist

- [ ] `pnpm build && pnpm start` on the presenting laptop (no network needed after install)
- [ ] Log in as **Administrator** → **Launch Regulatory Presentation**
- [ ] Rehearse `docs/demo-script.md` (7–10 minutes)
- [ ] Reset demo data from Admin → Overview before the meeting
- [ ] Legal review of `REGULATORY_ASSUMPTIONS.md` before any external distribution
