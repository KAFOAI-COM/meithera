# Meithera | 2026 statistics update — evidence register | 27 October 2026

Every real-world figure the demo shows, and every fictional property input recalibrated against 2026 market data. Each entry records the old value, the new value, its source and link, and the period the figure refers to.

**Confidence key**
- **Verified**: read on the publisher's own page, PDF or dataset.
- **Snippet**: from search results only. Confirm on the source before quoting outside the demo.

Where no 2026 figure exists, the latest available figure is used and its period is stated.

## 1. Real-world statistics shown in the demo

Shown on presentation slide 1 (`src/components/presentation/slides.tsx`) and in `docs/pitch-deck-content.md`.

### Vacant dwellings
- **Slide shown from 27 Oct 2026 (later the same day):** GeoDirectory Q2 2026, **81,373 vacant + 19,137 derelict**, replacing the Census 2022 figure at the owner's request so no 2022 figure appears. GeoDirectory is third-party (prepared with EY); there is no official 2026 count.
- **Old:** "~166,000 vacant dwellings counted in Census 2022 (CSO)".
- **New:** **163,433**, from the Census 2022 final results (Profile 2).
- **Period:** census night, April 2022. Published 27 Jul 2023. Census 2022 is still the latest census; the next is in 2027. There is no 2026 census count.
- **Source:** CSO, https://www.cso.ie/en/releasesandpublications/ep/p-cpp2/censusofpopulation2022profile2-housinginireland/keyfindings (Verified).
- **Note:** the old figure (166,752) came from the preliminary results; the final figure supersedes it.
- **Newer measures disagree.** Each defines vacancy differently, so they are given in the speaker notes only and are not mixed into the headline:
  - CSO metered-electricity long-term vacancy: **70,149 (3.2%)** in Q4 2024. Published 24 Mar 2026. Experimental "Frontier Series". https://www.cso.ie/en/releasesandpublications/fp/fp-rvmec/residentialvacancybasedonmeteredelectricityconsumption2024/keyfindings (Verified).
  - GeoDirectory, Q2 2026: **81,373 vacant (3.7%)** and 19,137 derelict. Third-party, prepared with EY. Published 22 Jul 2026. https://www.geodirectory.ie/news/number-of-residential-buildings-under-construction-topped-30,000-in-june (Verified).

### Rents
- **Old:** "Record rents — standardised rents at historic highs (RTB rent index)". No figure or period was given.
- **New:** **+9.1%** a year for new tenancies, now **€1,839 a month**.
- **Period:** Q1 2026, the latest published; Q2 2026 is not yet out. Published 3 Sep 2026.
- **Source:** RTB/ESRI, https://esri.ie/publications/the-rtb-rent-index-q1-2026 (Verified).
- **Why the wording changed:** the report does not call this a record, so the "record" wording was removed.
- **Context:** existing tenancies were €1,513 (+4.2%). From 1 March 2026, rents can reset to market level between some tenancies, and the ESRI links the Q1 jump to that change. CSO CPI private rents were +4.7% year on year in Sep 2026 (https://www.cso.ie/en/releasesandpublications/ep/p-cpi/consumerpriceindexseptember2026/, Verified).

### House prices
- **Old:** "Property wealth is built by those who can already buy" (no figure).
- **New:** **€400,000** national median price, up **5.1%** in 12 months.
- **Period:** 12 months to August 2026. Published 13 Oct 2026.
- **Source:** CSO RPPI, https://www.cso.ie/en/releasesandpublications/ep/p-rppi/residentialpropertypriceindexaugust2026/ (Verified).
- **Note:** this is the latest release. The September release is due mid-November 2026.

### New dwelling completions
These appear only in `PRIMARY_SOURCE_RESEARCH_OCT2026.md`.
- **Old:** 36,284 in 2025, up 20.4% on 2024.
- **New:** **unchanged as first published** (CSO, 29 Jan 2026). The CSO has since revised the totals:
  - 2025: 36,215.
  - 2024: 30,124. The 30,330 often quoted for 2024 is from the Jan 2025 release.
- **Added:** 2026 so far: Q1 7,856 and Q2 8,823, so **16,679 in H1 2026**. Q3 is not yet published.
- **Sources:** https://www.cso.ie/en/releasesandpublications/ep/p-ndc/newdwellingcompletionsq42025/ and https://www.cso.ie/en/releasesandpublications/ep/p-ndc/newdwellingcompletionsq22026/ (Verified).

### Vacant Property Refurbishment Grant
- **Old:** up to €50,000, plus a €20,000 derelict top-up; registered companies cannot apply.
- **New:** **unchanged in amount**. The grant is extended to 2030, and homes must have been built **before 2008** and vacant for 2 or more years.
- **Also new since 31 Mar 2026:** former commercial buildings qualify, plus an expert-advice grant of up to €5,000.
- **Companies:** still excluded, so a Meithera SPV cannot claim it.
- **Source:** Waterford Council VPRG FAQ, Sept 2026, https://waterfordcouncil.ie/app/uploads/2026/09/VPRG_FAQs.pdf (Verified). The gov.ie page was unavailable (HTTP 403).
- **⚠️ Unresolved:** sources disagree on the above-the-shop amounts (€95k/€135k versus €115k/€140k). These are not used in the demo.

## 2. Regulatory facts: checked, no change needed

- **ECSPR €5m cap** per project owner per 12 months, the 4-day reflection period, the €1,000 / 5% warning and the KIIS: no amendment adopted or proposed as of Oct 2026.
  - ESMA Q&A 2437, https://www.esma.europa.eu/publications-data/questions-answers/2437 (Snippet).
  - `ECSPR` in `src/lib/finance.ts` is unchanged.
- **DLT Pilot Regime reform:** the Commission proposed it on 4 Dec 2025 (market integration and supervision package). The proposal widens scope to all financial instruments and raises the threshold to €100bn.
  - **Status, Oct 2026:** still being negotiated. There is no Council general approach, and the Parliament ECON vote is tentatively due in Dec 2026 (Snippet: https://www.regulationtomorrow.com/2026/06/european-parliament-econ-committee-publishes-draft-reports-on-misp-package/).
  - The app already calls it a "proposal" and Stage 4 "depends on EU reform". No change needed.

## 3. Fictional property inputs recalibrated to 2026

**Market data used:**
- Rents: RTB Rent Index Q1 2026, new tenancies, all property sizes (Verified).
- Prices: CSO PxStat HPM08, rolling 12-month median prices to Aug 2026, existing dwellings (Verified): https://ws.cso.ie/public/api.restful/PxStat.Data.Cube_API.ReadDataset/HPM08/JSON-stat/2.0/en

These ranges check that the figures are plausible; they are not valuations. All four homes remain fictional and labelled illustrative.

### Dublin 8 (rent share): recalibrated
**Why:** the old price and valuation were about 24% below the D08 median of €413,000, and the old gross yield of about 8.3% was high for Dublin. The market rent is €2,243–€2,301.

**Inputs:**
- Acquisition: €220,000 → **€300,000**
- Legal and stamp: €9,000 → **€11,000** (1% stamp duty on the higher price)
- Valuation after works: €315,000 → **€410,000**
- Rent: €2,000 a month → **€2,200 a month** (€26,400 a year)
- Operating costs: €6,000 → **€6,350** (management 10% of rent €2,640; insurance €750; other €760; maintenance €2,200 unchanged)

**Results:**
- Total cost: €290,000 → **€372,000**
- NOI yield: 6.21% → **5.39%**

**Per €1,000 entered:**
- NOI share: €61.14 → **€53.09**
- Income: €56.21 → **€48.16 a year** (€4.68 → **€4.01 a month**)
- Investor yield: 5.62% → **4.82%**
- Stage 3 staircasing step (5% of cost): €14,500 → **€18,600 a year** (the pitch-deck doc had said €12,000, which was already stale)

### Limerick City (loan): recalibrated
**Why:** the old rent of €1,400 a month was very conservative against the Limerick City average of €1,921 (+20.9%).

**Inputs:**
- Rent: €1,400 a month → **€1,650 a month** (€19,800 a year)
- Operating costs: €4,600 → **€4,900** (management €1,680 → €1,980)

The loan facility, rate and repayments are unchanged, so the seeded chain is unchanged.

### Cork City (loan): no change
- Rent €1,700 against a Cork City average of €1,903; purchase €165,000 and valuation €262,000 against Cork City €350,000 and northside €310,000.
- These are conservative but within range, so the €160,000 facility headline stays.

### Galway City (rent share): no change
- Rent €2,100 against a Galway City average of €2,004 (central €2,154); valuation €320,000 against a city median of €402,500.
- These are plausible for a 2-bedroom apartment.

## 4. Loan rates: raised on 27 Oct 2026

- **Old:** Cork 7.5%, Limerick 8%.
- **New:** Cork **8.0%**, Limerick **9.0%**.
- **Effect per €1,000 lent (Cork):**
  - Net monthly payment: €5.75 → **€6.16**
  - Total interest over 18 months: €110.81 → **€118.20**
- **Effect on the whole Cork loan (€160k, as quoted in the docs):** €12,000 → **€12,800 a year**.
- **How the rates were set:** each is a margin above market rates, not a quoted market rate. Limerick carries about 1 point more than Cork because it is derelict, has a 24-month term and is rated high risk.
- **Market rates (Verified):**
  - ECB deposit rate: 2.50% since 16 Sep 2026, after two rises in 2026. https://www.ecb.europa.eu/stats/policy_and_exchange_rates/key_ecb_interest_rates/html/index.en.html
  - 3-month Euribor: about 2.67% on 23 Oct 2026.
  - Average Irish new mortgage rate: 3.53% in Aug 2026 (Central Bank retail interest rates).
  - The next ECB decision is on 29 Oct 2026.
- **Platform comparisons (third-party, not 2026 official data):**
  - Estateguru: average return on repaid loans of 8.9% in 2025, as reported by the platform. https://www.crowdfundinsider.com/?p=258300
  - Property Bridges (Ireland): historically 8%–9.5% to investors (2019–2020 press). https://www.longfordleader.ie/news/peer-to-peer-lending-offers-alternative-for-investors-7990901
- **⚠️ No official 2026 source exists** for Irish crowdfunding or bridging-loan rates. The rates are labelled illustrative.

## 5. Other checks
- **Model scenarios** (`SCENARIOS` in `src/lib/finance.ts`: optimistic rent +5%, downside rent −10%) are stress settings, not market statistics, so they are unchanged.
  - Since 1 Mar 2026, rent increases within a tenancy are capped at the lower of 2% or CPI. CPI was 4.1% in Sep 2026, so the 2% cap applies.
  - The model applies no annual rent growth, so this is consistent.
