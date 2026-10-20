# Investment structure (proposed, subject to regulatory assessment)

Approved wording: **“blockchain-based fractional ownership of property companies”** / **“notes in the company that owns the home”**. Never “own part of the house”. A token records a holding; it is not title.

## Stage 1 · Secured lending

```
Lender (from €100) ──► Secured loan note ──► Borrower / project owner (owns the home)
                       first legal charge held by a security trustee
```

- Fixed rate (illustrative 7.5% p.a.), 12–24 months, interest paid monthly, principal at term (bullet).
- Loan-to-value ≤ 65% of the illustrative valuation.
- The **borrower pays the 1.5% arrangement fee**; nothing is deducted from lenders.
- Lenders hold a participation in a loan — not shares, not notes, not property.
- Finance: `illustrateLoan(amount, ratePct, months)`.

## Stage 2 · Rent share

```
Investor ──► Profit-participating note ──► Home’s company (Irish DAC) ──► The home
             transfer-restricted; vote on sale     owns title, tenancy, insurance
```

- **One company per home.** The company owns the home, holds the tenancy and the obligations, and issues the notes.
- Investors hold **notes**: economic rights to a share of net rent and sale proceeds, and a vote on selling. Legal title stays with the company (registered with Tailte Éireann in the company’s name).
- Fees: **1.5% acquisition** (one-off, deducted from the amount entered) and **0.5% a year administration** on net invested capital.
- Distributions **monthly**: collected rent − operating costs, × participation, − administration fee ÷ 12. Always shown gross → net, **before investor-level taxes**.
- Exit: investor vote on sale; an **ECSPR bulletin board** where holders may advertise an interest (not a market; no guaranteed buyer); transfers only to verified wallets.
- Finance: `illustrate(property, amount)`.

### Worked example — Dublin 8, per €1,000 entered

| Line | € |
|---|---|
| Amount entered | 1,000.00 |
| Less acquisition fee 1.5% | −15.00 |
| Net invested | 985.00 |
| Share of gross rent (985 / 290,000 × 24,000) | 81.52 |
| Less share of operating costs | −20.38 |
| Share of net operating income | 61.14 |
| Less administration fee 0.5% of 985 | −4.93 |
| **Illustrative annual income (before tax)** | **56.21** (≈ €4.68 a month) |

Property-level NOI yield 6.21% → investor-level 5.62%. Unit-tested in `tests/finance.test.ts`.

## Stage 3 · Tenant to owner (requires further authorisation)

The tenant buys notes/shares in their home’s company yearly; rent falls in proportion; investors are bought out at the illustrative valuation. Finance: `staircase()`. Needs lending permissions or a partner and affordability checks with human oversight.

## Stage 4 · Internet of Value (depends on EU reform)

Raya Chain becomes the register of the notes; holdings move across chains with their rules; payouts in a regulated euro stablecoin; settlement in central bank money.

## What is deliberately *not* decided here

Whether the note is a MiFID financial instrument; whether a per-home company is an AIF; whether ECSPR applies to Stage 2 as structured; which authorised partner performs KYC/AML and holds client money. See `docs/regulatory-questions.md`.
