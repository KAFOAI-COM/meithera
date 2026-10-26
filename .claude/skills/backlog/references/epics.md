# Meithera epics and sprints

Use this file to pick the `epic:*` and `sprint:*` labels for a backlog issue. Prefer the
living documents over this summary when they disagree: `docs/sprints/*.md` (one file per
sprint, newest wins), `docs/roadmap.md` and `src/lib/roadmap.ts` (the five stages),
`PROJECT_PLAN.md` and `CLAUDE.md` (what is already built).

## Epics (label `epic:<slug>`)

| Slug | Covers | Where it lives |
|---|---|---|
| `regulatory` | ECSPR / MiFID II / AIFMD classification, disclaimers, client-money and trustee diagrams, decision trees, Central Bank follow-ups, compliance control matrix | `/regulatory-demo`, `/compliance`, `REGULATORY_ASSUMPTIONS.md`, `docs/regulatory-questions.md` |
| `investor-pitch` | Investor deck, market and competition evidence, interview tracker, unit economics, impact dashboard | `docs/investor/*`, `docs/pitch-deck-content.md`, `docs/competitor-analysis.md` |
| `finance-model` | Anything that changes a number: fees, loan maths, gross-to-net, scenarios, worked examples, tax lines, finance tests | `src/lib/finance.ts`, `tests/finance.test.ts`, `components/regulatory/financial-model.tsx` |
| `investor-journey` | `/invest` wizard, onboarding simulation, knowledge test, risk warnings, dashboard, documents, tenant staircasing | `components/invest/*`, `components/dashboard/*`, `src/lib/store.ts` |
| `raya-chain` | Chain simulator, explorer, anchors, verify/freeze/correction, supervisor view, audit log | `src/lib/chain/raya.ts`, `components/chain/*`, `components/supervisor/*`, `/admin/audit-log` |
| `public-site` | Landing, marketplace, property pages, passport, how-it-works, about, impact, FAQ, legal, copy audits | `src/app/(site)/*`, `components/site/*`, `components/property/*` |
| `presentation` | `/presentation` slides, demo script, click-path, fallback screenshots, rehearsal | `components/presentation/*`, `docs/demo-script.md` |
| `admin` | Admin console, property CRUD, distributions, investor review, agents page | `src/app/(site)/admin/*`, `src/lib/agents.ts` |
| `platform` | Data layer (Prisma/PostGIS), deployment, Vercel, env, performance, tooling, Playwright | `prisma/*`, `docs/deployment.md`, `e2e/*`, `playwright.config.ts` |
| `partners-legal` | Legal opinion, ECSP / payment / trustee / servicing partner shortlist, property feasibility, DPIA and resilience assessments | `docs/sprints/*` P2 items, `docs/roadmap.md` "Need" columns |

If none fits, use `epic:general` and say so in the issue body rather than forcing a match.

## Sprints (label `sprint:<slug>`)

Derive the slug from the newest file in `docs/sprints/`: `2026-10-regulatory-investor-readiness.md`
→ `sprint:2026-10-readiness`. Map the sprint document's sections to priority:

| Section in the sprint doc | Priority | Meaning |
|---|---|---|
| P0 — before the meeting | `P0` | Blocks the next milestone (currently the Central Bank meeting, 27 Oct 2026) |
| P1 — investor pitch and commercial validation | `P1` | This sprint, after P0s |
| P2 — post-meeting execution | `P2` | Next sprint; label `sprint:backlog` unless the user names a sprint |
| Not in any sprint doc | `P3` | Nice to have; `sprint:backlog` |

A task that belongs to a sprint that has already ended goes to `sprint:backlog` with a note,
not to the old sprint label.

## Stage badges

Every feature in Meithera carries a stage (0 Demo · 1 Lending · 2 Rent share · 3 Tenant to
owner · 4 Internet of Value). When a task is clearly about one stage, mention it in the body
("Stage: 1 · Lending") so the implementer keeps the badge rule from `CLAUDE.md`.
