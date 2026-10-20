# AGENTS.md — Meithera

Demonstration MVP of a proposed Irish fractional property investment platform (Meithera / PropertyShare Ireland) for the Central Bank of Ireland Innovation Hub. Full task brief: `docs/briefs/03-codex-prompt.md`. Status and architecture: `CLAUDE.md`, `PROJECT_PLAN.md`, `ARCHITECTURE.md`. Market context: `docs/competitor-analysis.md`.

## Hard rules

- Demonstration only. No real payments, KYC, tokens, wallets, chain calls or distributions. All data is fictional and labelled *illustrative*.
- Never claim or imply Central Bank approval, authorisation, regulation or endorsement. Use "proposed" and "subject to regulatory assessment".
- Investors hold a proposed SPV instrument, not legal title. A token is a record, not ownership.
- Property-level yield ≠ investor return. Always show gross → net. Income is "before investor-level taxes".
- Fees: 1.5% acquisition (one-off) and 0.5%/yr administration, both defined only in `src/lib/finance.ts`. Distributions are illustrative and monthly.
- Use `RISK_WARNING` from `src/components/site/notices.tsx` verbatim.
- No real addresses; area centroids only. No personal data collected; fictional demo state goes in `sessionStorage` only.
- The app must run with no env vars and no database.

## Conventions

- pnpm; Next.js 15 App Router; TypeScript strict; Tailwind v4 tokens in `src/app/globals.css`; UI primitives in `src/components/ui`; domain logic as pure functions in `src/lib`.
- Server components by default; `"use client"` only where needed. Validate inputs with Zod.
- Tailwind colour names: `emerald forest mint gold gold-ink surface card ink muted line line-strong demo demo-ink risk risk-ink`. Gold is never used for text (use `gold-ink`).

## Checks (must pass before every commit)

```bash
pnpm exec tsc --noEmit
pnpm lint
pnpm test        # vitest
pnpm build
pnpm exec playwright test   # once added
```
