# Meithera — Claude Code mega plan (meeting Tue 27 Oct 2026)

There are 7 sessions, one a day. Each session is a paste-ready Claude Code prompt and ends with a commit and a push. The full spec is in `docs/briefs/03-claude-code-prompt.md`; Claude Code also reads `CLAUDE.md` automatically.

## Before every session

```bash
cd ~/stake/meithera && git pull && pnpm install
claude
```

- Start each session with `/clear`.
- Press **Shift+Tab** to switch to plan mode, then paste the session prompt.
- Approve the plan.
- When the session finishes, check it in the browser at `pnpm dev` → http://localhost:3000.

## Rules added to every session (already in CLAUDE.md)

- Every number comes from `src/lib/finance.ts`.
- Every feature carries a stage badge.
- The demo banner appears on every page.
- No claims of Central Bank approval.
- The wording is "fractional ownership of property companies".
- Photos come from `public/images/*.webp`.
- **Visual bar:** this must look like a premium private bank or Stripe-level fintech, not a template. Use full-bleed photography, big Newsreader serif headlines, generous whitespace, dark emerald bands, gold hairline accents, restrained motion, and real data density on dashboards.
- **Self-check:** after building UI, run Playwright screenshots at 1280px and 390px, look at them, and fix anything that looks basic, cramped or broken before committing.

---

## Session 1 — Tue 20 (evening): design upgrade + app shell + data wiring

```text
Read CLAUDE.md and docs/briefs/03-claude-code-prompt.md. This session: FOUNDATIONS + VISUAL UPGRADE only.

1. Data and state. src/lib/finance.ts already has the 1.5%/0.5% fees, illustrateLoan, loanFacility, headlineRate and staircase; src/lib/chain/raya.ts has the Raya Chain simulator (commit, verifyChain, capTable).
   - Rewrite src/lib/data/seed.ts and src/lib/store.ts so that every simulated investment, loan, monthly distribution, freeze and correction commits a Raya Chain tx.
   - Seed the chain with a genesis block, ISSUE txs for the seed investments, and Aug–Oct 2026 monthly REPAYMENT txs for the funded Limerick loan.
   - For loans, the investment participation is netLent / loanFacility(p).
   - Add personas investor, tenant, supervisor and admin to auth, actions and middleware. /supervisor is for supervisor+admin, /presentation for admin+supervisor, /admin for admin only.
2. Visual upgrade of the existing pages:
   - Landing: a full-bleed hero using /images/hero-door.webp behind an emerald gradient, a white Newsreader headline, a floating "Live on Raya Chain" card showing the latest 3 txs, and a stat strip whose numbers come from the store.
   - Replace the SVG PropertyArt on PropertyCard with next/image photos (hover zoom, an offer badge "Stage 1 · Secured loan" / "Stage 2 · Rent share", and the headline rate from headlineRate()).
   - Compute the landing "per €1,000" example from finance.ts.
   - Add a "Five stages to the Internet of Value" horizontal journey section to the landing page.
   - Make the header and footer premium; add a StageBadge component (variants: ecspr / authorisation / future).
3. vitest: tests/finance.test.ts. Dublin 8 per €1,000 → net €985.00, NOI share €61.14, admin €4.925, income €56.21, yield 6.21%. Also loan maths and verifyChain.
4. pnpm exec tsc --noEmit, pnpm lint, pnpm test and pnpm build must pass. Take Playwright screenshots of / and /properties at both widths, look at them, and polish. Commit "Session 1" and push.
```

**Check:** the landing page looks premium with real photos, `/properties` shows photo cards with stage badges, and the tests pass.

---

## Session 2 — Wed 21: public site

```text
Read CLAUDE.md. Build every public route, polished, with photography:
- /properties/[slug]:
  - a photo gallery (the 4 images in property.images, with a lightbox), the overview and description, and the refurbishment objectives;
  - a milestone timeline;
  - the financial breakdown (acquisition, refurbishment, legal, contingency, total, valuation, rent, opex lines for maintenance, management, insurance and other, NOI, yield);
  - investment information (SPV, instrument, participation, MONTHLY distributions, holding period, exit limitations);
  - risks (capital, vacancy, valuation, overruns, illiquidity, regulatory, tax);
  - a €100–€10,000 calculator: illustrate() gross→net for rent-share, illustrateLoan() with a schedule for loans;
  - a "Home Digital Passport" tab: vacancy → acquisition → works → BER before/after → tenancy → funders → payouts, each entry linked to its /chain tx.
- /how-it-works: an animated diagram — Investor → notes → Property company (SPV) → Home — plus "what you own vs what the company owns", and loan vs rent-share explained.
- /about (Raya Software Ltd, mission), /impact (projected, NOT achieved: homes returned to use, BER uplift, euros deployed), /faq (FaqList), /compliance ("Regulatory readiness" — safeguards, never claiming authorisation), /legal/risk-disclosure, /legal/privacy, /legal/terms.
- /login: 4 persona cards with photos/icons (Investor Aoife — fictional, Tenant — fictional, Supervisor — demonstration, Administrator); honour ?next=, show ?error=. /register: first name, county and a "this is a demonstration" checkbox only.
- not-found.tsx and error.tsx, branded.
Then run tsc, lint, test and build; take screenshots at 1280 and 390 of every new route; review and polish; commit "Session 2"; push.
```

---

## Session 3 — Thu 22: investment journey + investor dashboard

```text
Read CLAUDE.md and section P0-3 / P1-3 of docs/briefs/03-claude-code-prompt.md.

1. /invest (offer picker with photos) → /invest/[propertyId], a 6-step wizard with a progress rail:
   (2) amount with a live gross→net preview;
   (3) simulated onboarding — fictional prefill, an animated "ID check — no document collected", an AML screen, classification, a 5-question ECSPR-style knowledge test, and a loss-bearing simulation with a net-worth band and 10% capacity;
   (4) RISK_WARNING verbatim plus a checkbox, and an extra warning above max(€1,000, 5% of net worth);
   (5) review with fees, net, instrument, SPV, participation, a monthly income or interest schedule, a key-information-sheet card and a 4-day reflection notice;
   (6) "Simulation Completed" / "No real money has been transferred." / "No securities or tokens have been issued." with an animated "Recorded on Raya Chain" receipt (txId, block, Merkle root) and a link to /chain?tx=…
   Audit events: RISK_ACKNOWLEDGEMENT, INVESTMENT_SIMULATION, LEDGER_EVENT.
2. /dashboard + portfolio, income, transactions, documents, settings:
   - KPI cards; Recharts allocation donut, monthly income (projected vs realised), property performance and investment history;
   - a 12-month income calendar;
   - a transactions ledger linking each row to /chain;
   - printable watermarked documents (summary, risk disclosure, SPV info, assumptions, distribution statement, KIIS);
   - AutoInvest rules (simulated);
   - per holding: an exit-window vote and an ECSPR bulletin board ("post interest to sell" — no order matching);
   - settings → Reset demo.
3. /dashboard/tenant (tenant persona): a staircasing simulator using staircase() — a slider for the start % and yearly top-up, a chart of the tenant share rising and the rent falling, and a "Record step on Raya Chain" button. Badge: Stage 3.
Then tsc, lint, test, build; a Playwright e2e test (login investor → invest €1,000 in Dublin 8 → dashboard shows it); screenshots, polish, commit "Session 3", push.
```

---

## Session 4 — Fri 23: Raya Chain explorer + supervisor view + admin

```text
Read CLAUDE.md, P0-2/P0-4/P0-5/P1-5 of docs/briefs/03-claude-code-prompt.md.

1. /chain — "bank audit console" look (a dark emerald surface, mono hashes, calm, no crypto-trader styling):
   - live blocks (height, time, Merkle root, anchors to Chain B/C);
   - a tx feed with filters, and search by tx / holder pseudonym / property;
   - a tx detail drawer;
   - a per-SPV cap table;
   - a "Verify chain" button (recompute and show a green check, or show the broken block);
   - a "Try transfer to an unverified wallet" demo that yields a REJECTED tx with its reason;
   - a cross-chain anchors panel explaining "one master record, proofs travel".
2. /supervisor — "Illustrative supervisory view — not a Central Bank system". Real-time KPIs from the store:
   - funds raised per SPV against the €5m ECSPR cap;
   - investors by classification;
   - knowledge-test pass rate;
   - warnings shown;
   - reflection withdrawals;
   - AML alerts;
   - frozen holdings;
   - complaints;
   - audit-chain status;
   - a live Raya Chain feed;
   - CSV/JSON export.
3. /admin → /admin/overview (KPIs, "Launch Regulatory Presentation", "Reset demo"); /admin/properties (Zod-validated create/edit, budgets, milestones, funding status); /admin/investors (simulated onboarding review); /admin/spvs; /admin/distributions (run a monthly distribution or loan interest → txs + statements); /admin/audit-log (hash chain + verify; freeze / court-ordered correction actions that write chain txs). Server-side role check in the admin layout.
tsc, lint, test, build, screenshots, polish, commit "Session 4", push.
```

---

## Session 5 — Sat 24: regulatory demo + roadmap + presentation (the meeting centrepiece)

```text
Read CLAUDE.md, P0-7/P0-8/P1-4 of docs/briefs/03-claude-code-prompt.md and docs/competitor-analysis.md.

1. /regulatory-demo, presentation quality, with sticky side navigation:
   - A investor lifecycle (interactive steps);
   - B investment structure diagram (rights depend on the final instrument);
   - C funds flow: investor → authorised payment/custody partner → SPV → home;
   - D rent distribution flow;
   - E Raya Chain recordkeeping (live embed of recent txs);
   - F the four questions — ECSPR, MiFID II, AIFMD, authorised partner — unanswered;
   - G compliance control matrix with Proposed vs Implemented-in-demo columns;
   - H interactive financial model (runModel; base/optimistic/downside; chart);
   - I "How Meithera compares": Stake, PRYPCO Mint, Bricks, Arrived, Lofty, Property Bridges.
2. /roadmap: the 5 stages as a vertical timeline; for each — goal, product, legal basis, partner, HAVE, NEED, risks, indicative timing. Raya Software Ltd (CRO) goes under Have.
3. /presentation (admin + supervisor), full-screen, 12 slides, 7–10 minutes:
   1. the problem
   2. the mission
   3. the full vision (5-stage journey)
   4. live: investor funds a vacant home (deep link)
   5. Raya Chain live (deep link)
   6. supervisor view (deep link)
   7. rent share & monthly payouts
   8. tenant to owner
   9. Internet of Value and the EU direction (DLT Pilot reform proposal, 4 Dec 2025)
   10. the roadmap — have/need
   11. investor protections
   12. questions for the Innovation Hub + proposed Stage 1 pilot
   Requirements: photography on every slide, ←/→/Esc keys, a progress bar, speaker notes (N), and the demo banner.
tsc, lint, test, build, screenshots of every slide, polish, commit "Session 5", push.
```

---

## Session 6 — Sun 25: AI agents, data layer, docs

```text
Read CLAUDE.md, P1-2/P2-1/P2-2 of docs/briefs/03-claude-code-prompt.md.

1. /agents — four simulated, deterministic agents with no LLM calls: Vacant-home Scout, Onboarding Guide, AML Monitor and Supervisory Reporter. Each shows its inputs, a step-by-step reasoning trace (typed-out animation), the output, and a "Human approval required" button that writes an audit event. Badge each as "AI-assisted, human-approved (EU AI Act oversight)".
2. Data layer:
   - prisma/schema.prisma (PostgreSQL + PostGIS via the postgresqlExtensions preview; County boundary geography(MultiPolygon,4326); Property location geography(Point,4326) as an area centroid; Spv, Investor, Investment, Loan, DistributionRun, Allocation, ChainTx, AuditEvent);
   - prisma/seed.ts reusing src/lib/data;
   - src/lib/repo.ts (Local by default, Prisma when DATABASE_URL is set);
   - docker-compose.yml (postgis/postgis:16-3.4);
   - sql/spatial-examples.sql;
   - supabase/migrations/0001_rls.sql;
   - .env.example.
   The app must still run with no DB.
3. Docs: README.md, docs/demo-script.md (timed 8-minute click path with talking points — full vision first, then down to Stage 1), docs/roadmap.md, docs/raya-chain-architecture.md, docs/investment-structure.md, docs/regulatory-questions.md, docs/technical-architecture.md, docs/deployment.md, docs/pitch-deck-content.md. Update REGULATORY_ASSUMPTIONS.md with the 5 stages.
tsc, lint, test, build, commit "Session 6", push.
```

---

## Session 7 — Mon 26: QA, polish, deploy, rehearse

```text
Read CLAUDE.md. Final QA and polish for tomorrow's Central Bank meeting.
1. Playwright: every route at 1280px and 390px — no console errors, no horizontal overflow, no dead buttons. E2E tests: investor journey; chain verify; supervisor sees the new tx; admin distribution run; full presentation run-through.
2. Copy audit: grep for "approved by|authorised by|regulated by|guarantee|own part of the house". Fix anything that isn't a negation or a third-party fact. Check that every page has the demo banner and every feature its stage badge.
3. Visual audit: screenshot every route, list the 10 weakest screens, and fix them (spacing, hierarchy, empty states, chart polish, mobile).
4. Performance: next/image sizes, no layout shift, the presentation advances instantly.
5. `pnpm build && pnpm start` works with the network off.
6. Update CLAUDE.md and PROJECT_PLAN.md status. Commit "Session 7 — meeting build", push, and tag v0.1-cbi.
```

**Then, by hand:**
1. **Deploy:** in Vercel, import the repo and add the domain `meithera.omnirisk.io` (a CNAME record pointing at `cname.vercel-dns.com`).
2. **Rehearse:** go through `docs/demo-script.md` twice, timing it at 8 minutes.
3. **Back up:** record a screen video of the full run as a fallback. On the morning of the 27th, run `pnpm build && pnpm start` on the laptop and use it offline.

---

## If you fall behind

These must be done by Monday night:
- Session 1 (the look)
- Session 3 (the investment journey)
- the `/chain` and `/supervisor` pages from Session 4
- Session 5 (the presentation)

Admin, agents, the database and most docs can be shown as "next" on the roadmap slide.
