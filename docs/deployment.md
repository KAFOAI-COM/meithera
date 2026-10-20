# Deployment

## Live demo (deployed 20 Oct 2026, build `v0.1-cbi`)

| | |
|---|---|
| Custom domain | **https://meithera.omnirisk.io** |
| Vercel URL | https://meithera.vercel.app |
| Vercel project | `meithera` (team `lasttable`), Next.js preset, Node 24 |
| DNS | `omnirisk.io` is registered in Route 53, but its **nameservers are Cloudflare** — DNS records live in Cloudflare, not the Route 53 hosted zone |
| Record | `CNAME meithera → e65d67235c622866.vercel-dns-016.com`, proxy **DNS only** (Vercel issues the TLS certificate) |

To redeploy the current `main` from a clean export:

```bash
git archive -o /tmp/meithera.tar main && mkdir -p /tmp/meithera && tar -xf /tmp/meithera.tar -C /tmp/meithera
cd /tmp/meithera && vercel link --yes --project meithera && vercel deploy --prod --yes
```

Not yet configured: the Git integration (connect `baz2024/meithera` in Project → Settings → Git for automatic deploys) and `DEMO_SESSION_SECRET` (without it the public demo uses the built-in demo secret; only fictional personas are affected).

## Meeting laptop (recommended for 27 Oct 2026)

```bash
pnpm install
pnpm build
pnpm start          # http://localhost:3000  (if the port is busy: pnpm start -p 3001)
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
