# Meithera MVP — Project Plan

**Goal:** a polished, fully interactive demonstration of the Meithera full vision — five stages, Raya Chain, supervisor view — for the Central Bank of Ireland Innovation Hub meeting on **Tuesday 27 October 2026**. Presents the full vision first, then walks down to what can launch first (Stage 1).

**Not in scope:** real investments, payments, token issuance, live KYC/AML, real distributions, AI API calls, any claim of authorisation.

## Status (feat/full-vision-mvp)

| # | Item | Status |
|---|---|---|
| P0-1 | Foundations: 0.5% admin fee, monthly, offerType, loans (Cork, Limerick), `illustrateLoan`, vitest | ✅ |
| P0-2 | Raya Chain simulator + store integration (every action writes a tx) | ✅ |
| P0-3 | Investment journeys (loan + rent share, 6 steps, ECSPR controls, chain tx link) | ✅ |
| P0-4 | Raya Chain explorer `/chain` | ✅ |
| P0-5 | Supervisor view `/supervisor` + four personas | ✅ |
| P0-6 | Property detail + Home Digital Passport | ✅ |
| P0-7 | Full-vision presentation (12 slides) | ✅ |
| P0-8 | Roadmap `/roadmap` | ✅ |
| P1-1 | Staircasing simulator `/dashboard/tenant` | ✅ |
| P1-2 | Agents `/agents` (deterministic, human approval) | ✅ |
| P1-3 | Investor dashboard (charts, calendar, ledger, documents, AutoInvest, exit vote, bulletin board) | ✅ |
| P1-4 | `/regulatory-demo` A–I | ✅ |
| P1-5 | Admin console | ✅ |
| P1-6 | Public, auth, error pages | ✅ |
| P2-1 | Data layer (Prisma + PostGIS, repo.ts, docker, SQL, RLS) — optional | ✅ |
| P2-2 | Docs | ✅ |
| P2-3 | QA: tsc, lint, vitest, build, Playwright (1280/390, e2e), screenshots, wording grep | see PR |

## Key decisions

1. **Local demo mode is the default.** Everything runs from seed data with no external services. Session state (simulated investments, chain, audit, admin edits) lives in `sessionStorage` and holds only fictional data.
2. **Raya Chain is simulated, deterministically.** `src/lib/chain/raya.ts` is pure and verifiable in the browser; the store writes a transaction for every material action.
3. **One finance module.** `src/lib/finance.ts` produces every number on screen; unit-tested (Dublin 8 per €1,000; loan maths; thresholds; staircasing).
4. **Stages everywhere.** `src/lib/stages.ts` + `StageBadge`; Stages 1–4 are never presented as live.
5. **Server-side role checks.** HMAC-signed cookie; middleware + server layouts for investor / tenant / supervisor / admin.
6. **Database is optional.** `prisma/schema.prisma` + seed; `src/lib/repo.ts` picks Prisma only when `DATABASE_URL` is set.

## Demo-day checklist

- [ ] `pnpm build && pnpm start` on the presenting laptop (no network needed after install)
- [ ] Log in as **Administrator** → **Launch Regulatory Presentation**; second window with `/chain` and `/supervisor`
- [ ] Rehearse `docs/demo-script.md` (8–9 minutes)
- [ ] Reset demo data from Admin → Overview before the meeting
- [ ] Legal review of `REGULATORY_ASSUMPTIONS.md` before any external distribution
