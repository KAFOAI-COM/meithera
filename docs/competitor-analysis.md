# Competitor & framework analysis — fractional property platforms

_Prepared 20 Oct 2026 for the Meithera / PropertyShare Ireland MVP. Figures are self-reported by platforms or third-party reviews and may be out of date — verify before quoting externally._

## 1. Landscape at a glance

| Platform | Market | Regulatory basis | Investor holds | Min. | Income | Exit / liquidity | Fees (headline) |
|---|---|---|---|---|---|---|---|
| **Stake** | UAE, KSA | DFSA — Operator of a Property Investment Crowdfunding Platform; CMA (KSA) FinTech Lab | Shares in a per-property **SPV registered with Dubai Land Department** | AED 500 | Rental dividends; Funds pay quarterly | **Exit windows + investor votes**; ~35-month avg hold to exit | Not published on the review page |
| **PRYPCO Mint** | UAE (residents only) | With **Dubai Land Department**; VARA-licensed | **Tokenised title deed** registered by DLD; ≤20% of a property per investor | AED 2,000 | Monthly rent (if let) | Mint marketplace; majority vote to sell | 2% entry, 1% exit, 0.5%/yr mgmt, up to 15% of appreciation, 2% DLD fee |
| **Arrived** | US | SEC **Reg A+**, one **series LLC per property** | LLC series shares | $100 | Rental dividends (2025 avg SFR ~3.9% annualised) | P2P market since Nov 2025: monthly 1-week windows, after 6 months; 5–7 yr hold | Sourcing up to 3.5%, ~0.6%/yr AM, 8% of rent PM, ~6–7% disposition |
| **Lofty** | US (global users) | No published Reg D/CF/A+ exemption — untested | Wyoming LLC per property, tokens on **Algorand** | ~$50 | **Daily USDC** | Order book + AMM pools | 2.5% buy / 3% sell (limit); round trip 5.5–10.5% |
| **RealT** | US | Token offerings | LLC tokens | — | Weekly stablecoin (historic) | — | — |
| **Bricks.co** | France / EU | **AMF ECSP licence** (FP-2023-08); **Lemonway** payment agent | Bonds / SPV interests set up by project carriers | **€10** | **Monthly** to Bricks wallet | None advertised | "€0 fees" to investors |
| **BRXS** | Netherlands | — | Real-estate **notes** | €100 | Quarterly interest + profit share on sale | — | — |
| **Property Bridges** | Ireland / EU | **Central Bank of Ireland ECSP** authorisation | Loans to Irish homebuilders | — | Interest | — | — |

## 2. What the failures teach

| Case | What happened | Design lesson for Meithera |
|---|---|---|
| **Lex Markets** (US) | Reg A+ building shares on an exchange; only 3 deals; ceased brokerage Feb 2023 — trading became “severely limited” | Liquidity is a platform service, not a property of the instrument. Do **not** promise a secondary market; design a wind-down / continuity plan. |
| **RealT** (US) | Site returning errors in 2026; Detroit blight lawsuit filed July 2025 | Tokenisation does not remove landlord obligations. Property management, local compliance and tenant welfare must be first-class (RTB registration, standards). |
| **Lofty** (US) | No published securities exemption; withdrawal complaints; realised returns below projections | Regulatory-first, not token-first. Show **realised vs projected** separately. |
| **Arrived** (US) | Complaints about projections, fee clarity and illiquidity; valuations lagging property prices | One-screen **fee stack**, gross→net walk, and plain illiquidity warnings. |
| **Shojin, Property Partner, British Pearl, Bricklane** (UK) | Insolvency, wind-down or orderly sale of portfolios | Ring-fenced SPVs, independent custody of client money, documented exit for every SPV. |

## 3. Frameworks that matter for Ireland

- **ECSPR (Reg. (EU) 2020/1503)** — proven EU route (Bricks in France; Property Bridges authorised by the Central Bank in Ireland). Built-in investor-protection mechanics a product can implement now:
  - **Entry knowledge test** and **simulation of the ability to bear loss** for non-sophisticated investors
  - **Risk warning** when a single investment exceeds the higher of **€1,000 or 5% of net worth**
  - **4-calendar-day pre-contractual reflection period** for non-sophisticated investors
  - **Key Investment Information Sheet (KIIS)** per offer
  - **€5m per project owner** in any 12 months
  - **Business-continuity plan** as part of authorisation
- **MiFID II** — if the SPV instrument is a transferable security outside ECSPR’s scope, investment-firm authorisation and prospectus rules come into play.
- **AIFMD** — pooled property vehicles risk being AIFs. That is why **one SPV per property, operating-company framing** (Stake, Arrived) matters, and why multi-property “funds” (Stake Funds, Arrived SFR Fund) sit under a different regime.
- **DLT** — the Dubai model works because the **land registry itself** (DLD) issues tokenised title deeds. Ireland has no equivalent (Tailte Éireann), so the **off-chain register must stay authoritative** and any token is a reconciled record of an SPV instrument. If the instrument is a MiFID financial instrument it falls outside MiCA, and the **EU DLT Pilot Regime** becomes relevant only for trading or settlement infrastructure.
- **Payments** — Bricks pairs its ECSP licence with a payment institution (Lemonway). The Meithera funds-flow should show an authorised payment / custody partner holding client money, never the platform.

## 4. Feature benchmark → Meithera MVP decisions

| Capability | Who does it | Meithera MVP (demo) |
|---|---|---|
| Per-property SPV | Stake, Arrived, Lofty, Bricks | ✅ One proposed Irish DAC per property |
| Low minimum | Bricks €10, Lofty $50, Arrived $100, Stake AED 500 | ✅ €100 illustrative |
| Monthly income | PRYPCO Mint, Bricks, (Lofty daily) | ✅ Monthly illustrative distributions (as described in the Innovation Hub submission) |
| Transparent fee stack | PRYPCO publishes all fees | ✅ 1.5% acquisition + 0.5%/yr administration (as submitted to the Innovation Hub), shown gross→net |
| Exit windows / votes | Stake, PRYPCO | ✅ Simulated exit window + investor vote screen; **no live secondary market** |
| Secondary market | Arrived, Lofty, PRYPCO | ⚠️ Shown only as a **future, permission-dependent** concept with transfer-restriction checks |
| Track record dashboard | Stake (properties funded, exits, paid out) | ✅ Platform statistics clearly marked “simulated” |
| AutoInvest | Stake | ✅ Simulated rules (amount per month, location, max per property) |
| Investor tiers / rewards | Stake | ❌ Excluded (gamification) |
| Realised vs projected | Gap across the market | ✅ Differentiator: always separate columns |
| ECSPR investor-protection UX | Required for EU ECSPs | ✅ Knowledge test, loss-bearing simulation, €1,000/5% warning, 4-day reflection countdown, KIIS — all simulated and labelled “if ECSPR applies” |
| Impact reporting | Rare | ✅ Differentiator: vacant homes returned to use, BER uplift (projected, not achieved) |
| Map discovery | Bricks world map | ✅ PostGIS area-centroid map |

## Sources

- [Stake real estate review (getstake.com)](https://getstake.com/content-hub/blog/articles/stake-real-estate-review)
- [Khaleej Times — Dubai tokenised properties guide (PRYPCO Mint)](https://www.khaleejtimes.com/business/property/dubai-tokenised-properties-complete-guide?amp=1)
- [Crowdfund Insider — Dubai launches region’s first tokenized real estate platform](https://www.crowdfundinsider.com/2025/05/240021-dubai-launches-regions-first-tokenized-real-estate-platform/)
- [Angel Investors Network — Arrived review 2026](https://angelinvestorsnetwork.com/real-estate/arrived-homes-review-2026-fractional-rental-investing-platform)
- [Crowdfunded Wealth — Lofty review 2026](https://www.crowdfundedwealth.com/reviews/lofty-review)
- [Bricks.co](https://www.bricks.co/en)
- [LenderKit — Top fractional ownership platforms 2026](https://lenderkit.com/blog/top-10-fractional-ownership-platforms/)
- [Angel Investors Network — Lex Markets collapse](https://angelinvestorsnetwork.com/real-estate/lex-markets-collapse-platform-liquidity-lesson)
- [Crowdfund Insider — Shojin Property Partners goes bust](https://www.crowdfundinsider.com/?p=270740)
- [Alternative Credit Investor — Property Bridges gains EU licence](https://alternativecreditinvestor.com/2023/11/10/property-bridges-gains-eu-licence/)
- [Central Bank of Ireland — CSP authorisation process](https://www.centralbank.ie/regulation/industry-market-sectors/crowdfunding-service-providers/authorisation-process)
