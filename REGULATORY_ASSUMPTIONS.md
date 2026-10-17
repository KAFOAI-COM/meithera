# Meithera — Regulatory Assumptions Requiring Legal Review

> **Status:** working assumptions for discussion with the Central Bank of Ireland Innovation Hub. Meithera is **not authorised or regulated** by the Central Bank of Ireland. The Central Bank has not approved, authorised or endorsed this platform. Nothing here is legal advice. Every item below needs review by Irish regulatory counsel.

## A. Demonstration boundaries (implemented)

- All properties, investors, investments, distributions and ledger records are fictional and labelled as such.
- No funds can be transferred, no securities or tokens are issued, and no payment, banking, KYC or blockchain service is connected.
- Projected yields are labelled *illustrative* or *indicative* and are never presented as guaranteed.

## B. Open classification questions (not pre-judged by the MVP)

| # | Question | Why it matters | Assumption used in the demo |
|---|---|---|---|
| B1 | Is the offer within **ECSPR** (Regulation (EU) 2020/1503) as crowdfunding of transferable securities or admitted instruments? | Determines whether an ECSP authorisation (or partner) is needed, the €5m offer cap, KIIS and investor-protection rules | None — shown as an open question |
| B2 | Is the investor instrument a **MiFID II financial instrument** (transferable security)? | Investment firm authorisation, prospectus thresholds, conduct rules | Instrument shown as "proposed: profit-participating note or SPV share (TBD)" |
| B3 | Does the pooled property SPV constitute an **AIF** under AIFMD? | Would require an authorised AIFM and depositary; changes the whole structure | One SPV per property, operating-company framing — assumption to test |
| B4 | Can the platform operate through an **appropriately authorised partner** (ECSP / investment firm / AIFM)? | Possible route to market without own authorisation at launch | Funds-flow diagram shows an "Authorised Financial Services Provider" placeholder |

## C. Further assumptions for review

1. **Client money:** investor funds would be held only by an authorised provider in segregated accounts; Meithera never holds client money.
2. **Legal title:** the SPV holds legal title to the property. Investors hold an instrument issued by the SPV, *not* a share of title.
3. **Tokenisation:** any token is a record of an entitlement that exists off-chain; it confers no rights beyond the underlying instrument. MiCA is assumed not to apply if the token is a financial instrument (to confirm).
4. **AML/CFT:** Criminal Justice (Money Laundering and Terrorist Financing) Act 2010 obligations would sit with the authorised entity; the demo only illustrates the steps.
5. **Appropriateness / suitability:** shown as a placeholder; the applicable test depends on B1–B2.
6. **Investor categorisation:** retail vs sophisticated (ECSPR) classification shown for illustration only.
7. **Marketing:** financial promotions would need review under the applicable regime (ECSPR Art. 27 / MiFID / Consumer Protection Code).
8. **Tax:** SPV taxation, withholding on distributions and investor-level tax are not modelled. All income figures are before investor-level taxes.
9. **Residential tenancy law:** RTB registration, rent-pressure-zone rules and tenancy obligations would bind each SPV.
10. **Data protection:** GDPR — no personal data collected in the demo; production requires a DPIA.
11. **Vacant-property schemes:** any interaction with public grants (e.g. Vacant Property Refurbishment Grant) is not assumed and needs separate review.
12. **Complaints & redress:** Financial Services and Pensions Ombudsman access depends on the final authorised entity.

## D. Where these appear in the product

- `/regulatory-demo` sections F (decision points) and G (control matrix)
- `/compliance` (public regulatory readiness page)
- `/legal/risk-disclosure`
- Guided presentation slide 9
