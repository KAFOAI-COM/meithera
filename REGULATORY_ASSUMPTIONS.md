# Meithera — Regulatory Assumptions Requiring Legal Review

> **Status:** working assumptions for discussion with the Central Bank of Ireland Innovation Hub. Meithera / Raya Software Limited is **not authorised or regulated** by the Central Bank of Ireland. The Central Bank has not approved, authorised or endorsed this platform; the Innovation Hub provides guidance, not approval. Nothing here is legal advice. Every item needs review by Irish regulatory counsel.

## A. Demonstration boundaries (implemented)

- All homes, investors, investments, distributions, agents and ledger records are fictional and labelled as such.
- No funds can be transferred, no securities or tokens are issued, and no payment, banking, KYC, AI or blockchain service is connected. Raya Chain is simulated in the browser.
- Projected yields are labelled *illustrative* or *indicative*, walk gross → net, are before investor-level taxes and are never presented as guaranteed.

## B. The five stages and their assumed legal basis

| Stage | Product | Assumed basis | Badge | Assumption to test |
|---|---|---|---|---|
| 0 Demo | This site | None — no financial service provided | Demonstration | — |
| 1 Lending | Secured refurbishment loans from €100 to a project owner; 12–24 months; first legal charge; borrower pays the arrangement fee | **ECSPR** lending-based crowdfunding via a licensed ECSP partner (own authorisation later); payment institution for client money | Possible under ECSPR | Borrower is a project owner (company), not a consumer; security trustee arrangements; €5m cap |
| 2 Rent share | One DAC per home issuing profit-participating notes; monthly net rent; vote on sale; bulletin board | **ECSPR** investment-based crowdfunding (transferable securities / admitted instruments) | Possible under ECSPR | Note may be a MiFID transferable security; per-home DAC may be an AIF (see C) |
| 3 Tenant to owner | Tenant staircases into the home’s company; rent falls; investors bought out | **Requires further authorisation**: consumer-credit / mortgage-type permissions if lending is involved; affordability regime; shared-equity analogues | Requires further authorisation | Whether any credit is extended to a consumer; valuation methodology |
| 4 Internet of Value | Raya Chain as the register; cross-chain holdings; regulated euro stablecoin payouts; central-bank-money settlement | **Reformed EU DLT Pilot Regime** (Commission proposal of 4 Dec 2025 extending it to all MiFID instruments); MiCA for any EMT; Eurosystem settlement | Future — depends on EU reform | Timing and scope of the reform; licence or partner; legal recognition of the on-chain register |

## C. Open classification questions (not pre-judged by the MVP)

| # | Question | Why it matters | Assumption used in the demo |
|---|---|---|---|
| C1 | Is the offer within **ECSPR** (Regulation (EU) 2020/1503)? | ECSP authorisation (own or partner), €5m cap, KIIS, knowledge test, €1,000/5% warning, 4-day reflection | None — shown as open; all ECSPR controls implemented *as if* ECSPR applies |
| C2 | Is the Stage 2 note a **MiFID II financial instrument**? | Investment-firm authorisation, prospectus thresholds, conduct rules; MiCA excluded if so | Instrument shown as “proposed: profit-participating note”, no classification selected |
| C3 | Is the per-home SPV an **AIF** under AIFMD? | Authorised AIFM and depositary; changes the structure | One company per home, operating-company framing — to test |
| C4 | Can the platform launch through an **appropriately authorised partner**? | Route to market without own authorisation; who holds client money and performs KYC/AML | Funds-flow shows an authorised financial services provider placeholder |

## D. Further assumptions for review

1. **Client money:** held only by an authorised payment institution or the ECSP in segregated accounts; Meithera never holds client money.
2. **Legal title:** the home’s company (Stage 2) or the borrower (Stage 1) holds title. Investors hold notes or a loan participation — never a share of title. A Raya Chain token is a record, not title.
3. **Tokenisation:** any token represents an entitlement that exists off-chain today; it confers no rights beyond the underlying instrument. MiCA assumed not to apply if the token is a financial instrument (to confirm).
4. **AML/CFT:** CJA 2010 obligations sit with the authorised entity; the demo only illustrates the steps. Verified-wallet allowlist, reason-coded freezes.
5. **ECSPR investor protections:** knowledge test, loss simulation, specific warning, reflection period, KIIS, complaints and business continuity — implemented in simulation; the live standard depends on C1.
6. **Investor categorisation:** sophisticated vs non-sophisticated (ECSPR Annex II) shown for illustration; evidence standard to be defined.
7. **Marketing:** financial promotions reviewed under ECSPR Art. 27 / MiFID / Consumer Protection Code. Risk warning used verbatim.
8. **Tax:** SPV taxation, withholding on distributions, investor-level tax and Stage 3 stamp duty not modelled; all income is before investor-level taxes.
9. **Residential tenancy law:** RTB registration, rent-pressure-zone rules and tenancy obligations bind each company.
10. **Data protection:** no personal data in the demo; pseudonymous holder IDs on chain; the identity mapping lives off-chain; production requires a DPIA.
11. **Vacant-property schemes:** no interaction with public grants assumed; separate review.
12. **Complaints and redress:** FSPO access depends on the final authorised entity.
13. **AI:** agents are deterministic and require human approval (EU AI Act human oversight); risk classification of the AML Monitor to confirm.
14. **Stage 4:** no on-chain register, cross-chain movement, stablecoin or CBDC settlement is assumed to be permissible today.

## E. Where these appear in the product

- `/regulatory-demo` sections F (decision points) and G (control matrix); `/compliance`; `/roadmap`
- `/legal/risk-disclosure`; stage badges on every feature
- Presentation slides 3, 9, 10, 11 and 12
- `docs/regulatory-questions.md`, `docs/investment-structure.md`, `docs/raya-chain-architecture.md`
