# Demo script — Central Bank of Ireland Innovation Hub, Tuesday 27 October 2026

**Length:** 8–9 minutes plus questions. **Order:** full vision first, then down to what can launch first (Stage 1).

## Before the meeting (laptop)

1. `pnpm build && pnpm start` — open `http://localhost:3000`. Works offline.
2. Log in as **Administrator** (`/login`). Admin → Overview → **Reset demo…** → Confirm.
3. Open `/presentation` in the main window. Keys: **→ / ←** slides · **N** speaker notes · **Esc** exit · **Home / End**.
4. In a second window (same browser profile, so the admin cookie carries), keep `/chain` and `/supervisor` ready in tabs.
5. Zoom the browser to 110–125% for a projector. Check the demo banner is visible on every screen.

## Click-path and talking points

| Time | Slide / screen | Say | Do |
|---|---|---|---|
| 0:00 | **1 · The problem** | Vacant homes exist; rents are at record highs; property wealth is built only by those who can already buy. | — |
| 0:45 | **2 · The mission** | Read it once. Stress “notes in the company that owns the home” — never “own part of the house”. State plainly: not authorised; here for guidance on the route. | — |
| 1:30 | **3 · The full vision** | Walk the five stages left to right in under a minute. Then: “now we walk back down to what can launch first.” | — |
| 2:30 | **4 · Live: an investor funds a vacant home** | Stage 1 secured loan: Cork, €162k facility, 7.5% fixed, 18 months, first legal charge, borrower pays the fee. | Click the gold deep link (new tab). Enter **€5,000** so the €1,000 / 5%-of-net-worth warning fires (default band €25k–€100k). Confirm details; let the ID and AML checks run; keep "non-sophisticated"; answer the five questions (1st, 2nd, 2nd, 2nd, 2nd option); keep the band and tick the loss acknowledgement. Show the KIIS card and the 4-day reflection notice. Complete. Point at the **Raya Chain tx id**. Return to the deck. |
| 4:30 | **5 · Live: the Raya Chain record** | A bank’s audit console, not a trading explorer. One master record; rules travel with the asset; proofs anchored to other chains. | Open `/chain`. The new ISSUE tx is first in the feed — click it: pseudonymous holder, units, rule, hash. **Verify & controls** → *Verify chain* (green) → *100 units → unverified external wallet* (red, `RECIPIENT_UNVERIFIED`). Glance at **Anchors**. |
| 5:45 | **6 · Live: what a supervisor could see** | A read-only window an authorised ECSP could give its supervisor. Illustrative — not a Central Bank system. | Open `/supervisor`. Point at the €5m cap bar, the warnings count (just incremented), the frozen Cork holding, the two complaints, the audit-chain tick. Click **Export JSON**. Ask: “is this the kind of transparency that helps supervise a small-ticket, high-volume platform?” |
| 6:45 | **7 · Rent share and monthly payouts** | Stage 2. Fee stack honesty: 5.39% property yield → 4.82% investor yield before tax. Open questions: AIF? MiFID instrument? | — |
| 7:15 | **8 · Tenant to owner** | Stage 3 mechanics only; needs further authorisation or a lending partner. | (If asked: `/login` → Tenant → simulator.) |
| 7:40 | **9 · Internet of Value** | Direction, not a dated plan. Depends on the reformed DLT Pilot Regime (Commission proposal, 4 Dec 2025). | — |
| 8:00 | **10 · Roadmap** | Have: company, Hub engagement, MVP, Raya Chain concept. Need for Stage 1: ECSP partner or own licence, payment institution, first home, property manager. | — |
| 8:20 | **11 · Investor protections** | Every control is live in the simulation they just saw. Ask whether they see gaps against ECSPR Arts 19–22. | — |
| 8:40 | **12 · Questions and the pilot** | Read the six questions. Offer the Stage 1 pilot: one home, one loan of about €160k, via a licensed ECSP, supervisory view available to the Central Bank, report back at completion. | Press **N** to show notes if useful. Leave `/roadmap` and `/regulatory-demo` on screen for discussion. |

## If something goes wrong

- A page errors → the error screen offers *Try again*; the demo state is unaffected.
- Lost the admin session → `/login` → Administrator. Cookie lasts 8 hours.
- Demo state looks odd → Admin → Overview → Reset.
- Projector resolution small → the deck is responsive down to 390 px; use **Exit** and show `/regulatory-demo` instead.

## Lines to use and lines to avoid

- Use: “proposed”, “subject to regulatory assessment”, “possible under ECSPR”, “requires further authorisation”, “notes in the company that owns the home”, “before investor-level taxes”.
- Avoid: “approved”, “authorised”, “regulated by”, “own part of the house”, “guaranteed”, any yield without the gross → net walk.
