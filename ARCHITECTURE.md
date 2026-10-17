# Meithera — Architecture

## Overview

```
Browser ──► Next.js App Router (RSC + client islands)
              ├─ middleware.ts ............ role gate for /dashboard /invest /admin /presentation
              ├─ app/actions.ts ........... server actions: demo login / register / logout (Zod-validated)
              ├─ lib/finance.ts ........... single source for every financial figure
              ├─ lib/store.ts ............. demo state (Zustand → sessionStorage, fictional data only)
              ├─ lib/ledger.ts ............ EntitlementLedger interface + simulated adapter
              └─ lib/data/* ............... seed data (4 properties, 5 investors, SPVs, investments, audit)

Optional persistence:  Prisma ──► PostgreSQL (Supabase or any Postgres)  — prisma/schema.prisma
Optional auth:         Supabase Auth (replaces the demo session cookie)    — supabase/migrations/*_rls.sql
```

## Layers

| Layer | Location | Notes |
|---|---|---|
| Routes | `src/app/(site)/…`, `src/app/presentation` | All routes from the brief; presentation is full-screen outside the site chrome |
| UI primitives | `src/components/ui` | shadcn/ui-style: Button, Card, Badge, Input, Select, Tabs, Progress, Table, Checkbox |
| Domain components | `src/components/{site,invest,dashboard,admin,regulatory,presentation,charts}` | |
| Domain logic | `src/lib` | Pure TS, framework-free, unit-tested (`tests/finance.test.ts`) |
| Data | `src/lib/data`, `prisma/` | Seed data shared by local mode and the Prisma seed script |

## Data model (Prisma)

`Property` 1—1 `Spv` 1—* `Investment` *—1 `Investor`; `DistributionRun` 1—* `DistributionAllocation`; `EntitlementRecord` mirrors an `Investment`; `AuditEvent` is append-only and hash-chained (`prevHash` → `hash`). See `prisma/schema.prisma`.

## Security design

| Control | Demo implementation | Production intent |
|---|---|---|
| Authentication | Persona login, HMAC-signed httpOnly cookie (8h) | Supabase Auth / OIDC with MFA |
| Authorisation | Middleware + server layout role checks (`investor`, `admin`) | Same, plus Postgres RLS on every table |
| Input validation | Zod on server actions; bounded numeric inputs in UI | Zod at every API boundary |
| Sensitive data | None collected. No ID documents, bank details or income data | KYC via an authorised provider; documents never stored in browser |
| Browser storage | `sessionStorage` holds fictional demo state only | Server-side state only |
| Audit | Hash-chained event log (tamper-evident within the demo) | Append-only table, WORM export |
| Secrets | `.env.local` (`DEMO_SESSION_SECRET`, `DATABASE_URL`) — never committed | Vercel environment variables |
| Errors | Route `error.tsx` / `not-found.tsx` with no stack traces | Plus structured logging |

## Ledger abstraction

The **off-chain register is legally authoritative**. An on-chain representation, if adopted, is a reconciled mirror. `EntitlementLedger` exposes `issue`, `checkTransfer` and `reconcile`; investors appear only as salted pseudonyms (`pseudonym()`), never personal data. No chain, token standard or custody model is assumed. Detail: `docs/blockchain-architecture.md`.

## Deployment

Vercel (Node runtime). Local demo needs no environment variables. See `docs/deployment.md`.
