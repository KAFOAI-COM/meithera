# Regulatory questions for the Innovation Hub

Meithera is not authorised or regulated by the Central Bank of Ireland. The Innovation Hub provides guidance, not approval. These are the questions we bring; we are not answering them ourselves. The on-screen version is `/regulatory-demo` section F and `src/lib/regulatory.ts`.

## The four classification questions (not pre-judged)

1. **Is the proposed structure potentially within ECSPR (Regulation (EU) 2020/1503)?**
   Stage 1 lending to a project owner looks squarely in scope; Stage 2 notes depend on whether an Irish DAC note is a “transferable security” or an “admitted instrument for crowdfunding purposes”. Demo assumption: none — all ECSPR controls are built *as if* ECSPR applies.
2. **Could the investment instrument qualify as a MiFID II financial instrument?**
   A negotiable profit-participating note is a transferable security; transfer restrictions and a verified-wallet allowlist limit negotiability. Tokenising a financial instrument keeps it a financial instrument (and outside MiCA). Demo assumption: instrument labelled “proposed”, no classification selected.
3. **Could the pooled property structure constitute an AIF under AIFMD?**
   One company per home with an operating purpose resembles an operating company; investors choose each home and nothing pools across homes. Demo assumption: per-home SPV, operating-company framing — to test with counsel.
4. **Could the platform operate through an appropriately authorised partner?**
   Licensed ECSPs and payment institutions exist in Ireland; partner dependency and clear division of responsibilities are the trade-offs. Demo assumption: funds-flow diagram shows an authorised financial services provider placeholder.

## Questions we would like guidance on (slide 12)

1. Is Stage 1 (secured lending from €100) best launched under a licensed ECSP partner, or should Raya seek its own ECSP authorisation from the outset?
2. For Stage 2, is a per-home company issuing profit-participating notes within ECSPR’s scope, or does it risk AIF classification?
3. Could the note be a MiFID financial instrument, and what would that change?
4. How should client money and custody be arranged so that Meithera never holds funds?
5. Does a supervisory view of this kind help, and what would the Central Bank want on it?
6. How does the Central Bank see Irish participation in the reformed DLT Pilot Regime?

## ECSPR controls demonstrated (as if ECSPR applies)

| Control | Where in the demo |
|---|---|
| Entry knowledge test (pass 4/5) and loss-bearing simulation | `/invest/[id]` step 3 |
| Specific risk warning above the higher of €1,000 or 5% of net worth, with express consent | step 4 |
| Key Investment Information Sheet (Annex I style) | step 5, dashboard documents |
| 4-calendar-day reflection period with withdrawal | step 6 → `CORRECTION` tx |
| €5m per-project-owner cap tracked | `/supervisor` |
| Complaints procedure | dashboard settings → supervisor |
| Marketing wording | exact risk warning everywhere; “proposed”, “subject to regulatory assessment” |

## Proposed Stage 1 pilot

One vacant home; one secured refurbishment loan of about €160,000; offered through a licensed ECSP partner with client money at a payment institution; minimum €100; all ECSPR investor-protection steps as demonstrated; Raya Chain mirror of the lender register with the supervisory view available to the Central Bank; report back to the Innovation Hub at completion.

## Related

`REGULATORY_ASSUMPTIONS.md` (working assumptions by stage) · `docs/investment-structure.md` · `docs/raya-chain-architecture.md` · `docs/competitor-analysis.md`.
