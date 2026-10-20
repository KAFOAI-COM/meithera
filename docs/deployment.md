# Deployment

## Meeting laptop (recommended for 27 Oct 2026)

```bash
pnpm install
pnpm build
pnpm start          # http://localhost:3000
```

No environment variables, no database, no network after `pnpm install`. Fonts are bundled at build time. Log in as **Administrator** and open **Launch Regulatory Presentation**.

## Vercel (preview or shared demo)

1. Import `github.com/baz2024/meithera`, framework Next.js, Node 24, default build (`pnpm build`).
2. Environment variables: `DEMO_SESSION_SECRET` (any long random string). Nothing else is required.
3. Deployment Protection → enable Vercel Authentication or a password so the demo is not publicly indexed (robots are already `noindex`).
4. Optional Postgres: add a Marketplace Postgres with PostGIS (e.g. Supabase or Neon), set `DATABASE_URL`, then `pnpm add -D prisma @prisma/client tsx && pnpm db:push && pnpm db:seed` from a machine that can reach the database. `src/lib/repo.ts` switches to `PrismaRepository` automatically; the browser demo state is unaffected.

`vercel.ts` is not required; defaults suffice. If you prefer explicit config, `@vercel/config` can set `framework: "nextjs"`.

## Local database (optional)

```bash
pnpm db:up                      # postgis/postgis:16-3.4 on :5432, runs sql/00-extensions.sql
cp .env.example .env.local      # uncomment DATABASE_URL
pnpm add -D prisma @prisma/client tsx
pnpm db:push && pnpm db:seed
psql postgresql://meithera:meithera@localhost:5432/meithera -f sql/spatial-examples.sql
```

## Checks before any deployment

```bash
pnpm check        # typecheck, lint, unit tests
pnpm build
pnpm test:e2e     # needs: pnpm exec playwright install chromium
grep -rni "approved by\|authorised by\|regulated by" src docs README.md   # only negations / third-party facts
```
