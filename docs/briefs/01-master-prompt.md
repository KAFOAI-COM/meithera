Below is a Claude Code master prompt for designing and building the Stake Ireland / Meithera MVP, specifically for the upcoming Central Bank of Ireland Innovation Hub meeting.

The prompt instructs Claude Code to create a professional fintech investment platform, with an interactive investor dashboard, property marketplace, investment simulator, SPV architecture and regulatory demonstration mode.

You can paste the entire prompt into Claude Code.

CLAUDE CODE MASTER PROMPT

Project: Stake Ireland — Meithera

Irish Fractional Property Investment Platform

MVP for Central Bank of Ireland Innovation Hub

You are acting as a senior fintech product architect, UI/UX designer, full-stack engineer and technical lead.

Your task is to design and implement a premium, investor-ready, responsive web application called Meithera, the proposed consumer-facing brand for Stake Ireland.

The platform will allow retail investors to explore fractional investment opportunities in Irish residential property, with a particular focus on financing the refurbishment of vacant homes and supporting additional housing supply.

The immediate objective is to produce an impressive, fully interactive demonstration for an upcoming meeting with the Central Bank of Ireland Innovation Hub.

This is a demonstration MVP, not a live regulated investment platform.

Do not enable real investments, live financial transactions, issuance of investment tokens or actual rental distributions.

All financial figures and properties must be clearly identified as illustrative.

⸻

1. PRODUCT VISION

Brand

Meithera

Project

Stake Ireland / PropertyShare Ireland

Proposed positioning

Own a Share. Build Ireland’s Future.

Supporting message

Accessible property investment designed to support the regeneration of vacant Irish homes.

Core value proposition

Meithera aims to make property investment more accessible by allowing individuals to participate in property investment opportunities without needing to purchase an entire property.

The proposed platform combines:

* Fractional property investment
* Irish residential real estate
* Property-owning special purpose vehicles (SPVs)
* Digital investor onboarding
* Transparent investment reporting
* Potential rental income distributions
* Blockchain-based investment recordkeeping
* Smart contract integration
* Property refurbishment financing

The MVP must clearly distinguish between ownership of property, ownership of SPV securities or interests, and economic rights represented digitally.

Do not imply that an investor directly owns part of the property’s legal title unless the implemented legal structure explicitly provides this.

⸻

2. DESIGN DIRECTION

Create a premium fintech experience inspired by the usability and visual quality of leading modern investment platforms.

The design should communicate:

1. Trust
2. Regulatory awareness
3. Financial professionalism
4. Accessibility
5. Irish identity
6. Transparency
7. Technology-led innovation

Design personality

Modern, elegant, minimal, sophisticated and credible.

Avoid:

* Cryptocurrency trading aesthetics
* Excessive gradients
* Neon colours
* Gamification
* Speculative investment messaging
* Aggressive return promises
* Overcrowded dashboards

Colour palette

Primary:

Deep Emerald Green — #063F36

Secondary:

Forest Green — #0D6656

Accent:

Soft Mint — #DDF3E8

Background:

Warm Off-White — #F8FAF8

Text:

Charcoal — #172521

Secondary Text:

Slate Grey — #65736D

Highlight:

Muted Gold — #C7A86D

Use green as the dominant brand colour.

Typography

Use:

* Manrope or Inter for interface elements
* DM Sans for supporting text
* Optional elegant serif typography for selected landing-page headings

UI components

Implement:

* Rounded cards
* Subtle shadows
* Professional financial charts
* Property photography
* Interactive investment calculators
* Responsive navigation
* Accessible buttons and forms
* Smooth but restrained animations
* Clear financial disclosures

Use Lucide icons.

⸻

3. TECHNICAL STACK

Build the application using:

Frontend:

* Next.js with App Router
* TypeScript
* React
* Tailwind CSS
* shadcn/ui
* Lucide React
* Framer Motion
* Recharts

Backend:

* Supabase
* PostgreSQL
* Supabase Auth

Deployment:

* Vercel

Use a clean, modular architecture.

Implement realistic demonstration data using seed files.

The application must function locally without requiring payment-provider credentials, blockchain wallets or production KYC integrations.

If Supabase credentials are unavailable, implement a fully functional local demonstration mode.

⸻

4. APPLICATION STRUCTURE

Implement the following routes:

/
├── properties
│   └── [slug]
├── how-it-works
├── about
├── impact
├── faq
├── login
├── register
├── dashboard
│   ├── portfolio
│   ├── income
│   ├── transactions
│   ├── documents
│   └── settings
├── invest
│   └── [propertyId]
├── compliance
├── regulatory-demo
├── admin
│   ├── overview
│   ├── properties
│   ├── investors
│   ├── spvs
│   ├── distributions
│   └── audit-log
└── legal
    ├── risk-disclosure
    ├── privacy
    └── terms

All routes must be implemented.

⸻

5. LANDING PAGE

Build a visually impressive homepage.

Hero section

Headline:

Property Investment. Made More Accessible.

Supporting text:

Explore a new approach to investing in Irish property, designed to make participation more accessible while supporting the refurbishment of vacant homes.

Primary CTA:

Explore Properties

Secondary CTA:

How It Works

Include a high-quality Irish residential property image.

Display a clearly visible banner:

Demonstration Platform — No Real Investments Available

Supporting sections

Create the following:

1. How Meithera Works
2. Featured Investment Opportunities
3. Why Invest in Irish Property?
4. Supporting Ireland’s Housing Future
5. Investment Transparency
6. Technology and Security
7. Frequently Asked Questions
8. Register Interest

Impact section

Use three cards:

Restore Vacant Homes

Support investment models aimed at returning unused properties to residential use.

Accessible Participation

Explore property investments without purchasing an entire property.

Transparent Reporting

Understand investment costs, risks, projected income and performance.

Do not present projected social or financial impacts as achieved results.

⸻

6. PROPERTY MARKETPLACE

Build a responsive property marketplace.

Each property card should display:

* Property image
* Location
* Property type
* Acquisition cost
* Refurbishment budget
* Total project cost
* Indicative rental yield
* Illustrative investment amount
* Funding progress
* Investment status
* View Details button

Example demonstration properties

Create at least four fictional investment opportunities:

Property 1 — Dublin 8

Type: Two-bedroom residential property

Acquisition: €220,000

Refurbishment: €45,000

Additional costs and contingency: €25,000

Total: €290,000

Estimated annual rent: €24,000

Estimated annual operating costs: €6,000

Indicative property-level net operating yield: 6.21%

Property 2 — Cork City

Type: Vacant terraced house

Total project cost: €245,000

Property 3 — Galway City

Type: Residential apartment

Total project cost: €310,000

Property 4 — Limerick City

Type: Residential refurbishment project

Total project cost: €195,000

All properties must be labelled:

“Illustrative demonstration property — not an investment offer.”

Do not invent actual property addresses or imply these assets have been acquired.

Filters

Implement:

* Location
* Property type
* Project budget
* Indicative yield
* Investment status

Use functional filtering and sorting.

⸻

7. PROPERTY DETAILS PAGE

Each property must have a dedicated details page.

Include:

Property overview

* Image gallery
* Location
* Property description
* Refurbishment objectives
* Project timeline

Financial breakdown

* Acquisition cost
* Refurbishment cost
* Legal costs
* Contingency
* Total project cost
* Estimated annual rent
* Operating expenses
* Indicative net operating income
* Estimated property-level yield

Investment information

* Proposed SPV
* Proposed investment instrument
* Illustrative investor participation
* Potential distribution frequency
* Expected holding period
* Exit limitations

Risks

Clearly explain:

* Capital at risk
* Rental vacancy
* Property valuation changes
* Refurbishment cost overruns
* Illiquidity
* Regulatory uncertainty
* Tax considerations

Interactive investment calculator

Allow users to enter:

€100 to €10,000.

Calculate:

* Illustrative percentage participation
* Illustrative annual income
* Illustrative monthly income
* Indicative property-level return

Clearly distinguish gross and net figures.

Do not imply that property-level net operating yield is equivalent to the investor’s net return.

Show deductions and assumptions where applicable.

⸻

8. INVESTMENT SIMULATOR

Create a complete simulated investment journey.

Step 1 — Select property

User selects a property.

Step 2 — Enter amount

User enters an illustrative investment amount.

Step 3 — Investor onboarding

Show a simulated onboarding process:

* Personal details
* Identity verification
* AML screening
* Investor classification
* Risk assessment
* Appropriateness or suitability assessment placeholder, as applicable

Do not claim the platform is performing legally sufficient KYC or suitability checks.

Step 4 — Risk acknowledgement

Display:

“Property investments involve risk, including possible loss of capital. Returns are not guaranteed and investments may be illiquid.”

Require explicit acknowledgement.

Step 5 — Review

Display:

* Investment amount
* Illustrative fees
* Proposed investment instrument
* SPV information
* Illustrative participation
* Potential income
* Principal risks

Step 6 — Confirmation

Show:

Simulation Completed

No real money has been transferred.

No securities or tokens have been issued.

Save the simulated transaction to the demonstration dashboard.

⸻

9. INVESTOR DASHBOARD

Build a premium investment dashboard.

Overview cards

Display:

* Simulated portfolio value
* Total simulated investment
* Illustrative annual income
* Illustrative monthly income
* Number of properties
* Portfolio allocation

Charts

Use Recharts to implement:

1. Portfolio allocation
2. Illustrative income over time
3. Property performance
4. Investment history

Portfolio section

Show each simulated investment with:

* Property
* Investment amount
* Illustrative participation
* Project status
* Potential income
* Risk level

Income section

Create a monthly income calendar.

Show simulated distributions and supporting calculations.

Transactions

Show a ledger of simulated investments and distributions.

Documents

Provide demonstration versions of:

* Investment summary
* Risk disclosure
* SPV information
* Financial assumptions
* Distribution statement

Clearly watermark documents as demonstrations.

⸻

10. REGULATORY DEMONSTRATION MODE

This is a critical feature.

Create a dedicated route:

/regulatory-demo

Design this as a professional presentation environment for the Central Bank of Ireland Innovation Hub.

Main objective

Demonstrate how Meithera proposes to integrate investor protection, transaction transparency and regulatory controls into its architecture.

Sections

A. Investor Lifecycle

Interactive flow:

Registration → Verification → Risk Assessment → Investment Review → Simulated Investment → Reporting

B. Investment Structure

Display an interactive diagram:

Investor → Investment Instrument → Property SPV → Property Asset

Clearly explain that legal rights depend on the final instrument and structure.

C. Funds Flow

Show a proposed architecture involving:

Investor → Authorised Financial Services Provider → Property SPV → Property Acquisition

The involvement and responsibilities of authorised providers are subject to regulatory and commercial assessment.

D. Rental Distribution Flow

Property → Rental Income → Operating Costs → SPV → Investor Entitlements → Distribution

E. Blockchain Recordkeeping

Show:

* Investor entitlement records
* Tokenisation concept
* Transaction references
* Audit events
* Distribution records
* Transfer restrictions

All records must be simulated.

F. Regulatory Decision Points

Present four questions:

1. Is the proposed structure potentially within ECSPR?
2. Could the investment instrument qualify as a MiFID financial instrument?
3. Could the pooled property structure constitute an AIF?
4. Could the platform operate through an appropriately authorised partner?

Do not automatically select a regulatory classification.

G. Compliance Control Matrix

Show a table containing:

* Control
* Purpose
* Proposed implementation
* Responsible party
* Regulatory status
* Open question

Example controls:

* Customer identification
* AML monitoring
* Investor risk disclosures
* Client money handling
* Investment recordkeeping
* Asset custody
* Complaints management
* Data protection

Distinguish proposed controls from implemented controls.

⸻

11. ADMIN DASHBOARD

Create an administrator demonstration environment.

Include:

Property management

* Create and edit fictional properties
* Update budgets
* Update project milestones
* Manage simulated funding status

Investor management

* View fictional investors
* Review simulated onboarding
* View investment records

SPV management

Display:

* SPV name
* Associated property
* Proposed instrument
* Total project funding
* Investor entitlements

Distributions

Simulate:

* Rental income
* Expenses
* Distributable amount
* Investor allocations
* Distribution statements

Audit log

Record demonstration events:

* User registration
* Risk acknowledgement
* Investment simulation
* Document generation
* Administrative changes

Use timestamps and event identifiers.

⸻

12. BLOCKCHAIN ARCHITECTURE

Design the application to support future tokenisation.

However, do not deploy production smart contracts or issue live investment tokens.

Create an abstraction layer for:

* Investment entitlement records
* Token issuance simulation
* Token ownership records
* Transfer restrictions
* Distribution entitlements
* Audit trails

The architecture should allow future integration with a suitable blockchain network.

Do not assume a specific token standard, chain or custody model is legally appropriate.

Produce an architecture document explaining:

1. Off-chain legal ownership records
2. On-chain representations
3. Investor identity mapping
4. Smart contract controls
5. Transfer restrictions
6. Record reconciliation
7. Security considerations
8. Recovery and dispute handling

⸻

13. FINANCIAL MODEL

Implement an interactive property investment model.

Inputs:

* Acquisition price
* Refurbishment budget
* Transaction costs
* Contingency
* Rental income
* Vacancy assumption
* Maintenance
* Insurance
* Property management costs
* Platform fees
* Investment amount

Outputs:

* Total project cost
* Gross rental yield
* Net operating income
* Property-level net operating yield
* Illustrative investor income before investor-level taxes
* Scenario analysis

Scenario analysis

Include:

* Base case
* Optimistic case
* Downside case

Use transparent assumptions.

Never guarantee returns.

⸻

14. SECURITY AND COMPLIANCE DESIGN

Implement:

* Role-based access control
* Secure authentication
* Protected routes
* Input validation
* Server-side authorization
* Safe error handling
* Audit logging
* Environment variable management

For the demo, avoid collecting real identity documents, bank details or sensitive financial information.

Use fictional users.

Do not store sensitive information in browser local storage.

If Supabase is enabled, implement appropriate row-level security policies.

Clearly separate demonstration controls from production-ready compliance capabilities.

⸻

15. CENTRAL BANK MEETING MODE

Add a button in the admin interface:

Launch Regulatory Presentation

This should open a guided, full-screen demonstration.

The guided presentation should contain:

1. Platform overview
2. Irish housing problem
3. Property marketplace
4. Investor investment simulation
5. Proposed SPV structure
6. Proposed money flows
7. Blockchain architecture
8. Investor protection controls
9. Regulatory questions
10. Proposed pilot

Provide navigation buttons:

Previous / Next / Exit Presentation

Include a progress indicator.

The presentation must work smoothly without relying on external APIs.

⸻

16. DELIVERABLES

Produce:

Application

A complete, responsive Next.js demonstration application.

Documentation

Create:

README.md

docs/product-requirements.md

docs/technical-architecture.md

docs/investment-structure.md

docs/regulatory-questions.md

docs/blockchain-architecture.md

docs/demo-script.md

docs/deployment.md

Demonstration data

Create:

* Four fictional properties
* Five fictional investors
* Simulated investments
* Simulated rental distributions
* Simulated audit events
* Example SPV records

Quality assurance

Verify:

* All routes load
* All navigation works
* Filters function
* Calculators produce correct results
* Simulated investment journey completes
* Dashboard reflects simulated investments
* Admin functionality works
* Regulatory demonstration works
* Mobile layout is responsive
* No real financial transactions are possible

⸻

17. IMPLEMENTATION PROCESS

Follow this sequence.

Phase 1 — Architecture

Inspect the repository.

Identify existing technologies and reusable components.

Do not overwrite existing functionality without justification.

Create the project structure and implementation plan.

Phase 2 — Design System

Implement:

* Colours
* Typography
* Layouts
* Buttons
* Cards
* Forms
* Charts
* Navigation

Phase 3 — Public Website

Build:

* Landing page
* Marketplace
* Property details
* How It Works
* About
* Impact

Phase 4 — Investor Experience

Build:

* Authentication or demo login
* Investment simulator
* Portfolio dashboard
* Income reporting
* Transaction history

Phase 5 — Regulatory Experience

Build:

* Regulatory demonstration mode
* SPV architecture
* Compliance matrix
* Audit log
* Guided meeting presentation

Phase 6 — Testing

Run:

* TypeScript checks
* Linting
* Production build
* Functional tests
* Responsive layout checks

Fix all critical issues.

⸻

18. SUCCESS CRITERIA

The completed application must:

1. Look like a credible, premium Irish fintech platform.
2. Clearly explain fractional property investment.
3. Demonstrate a complete simulated investment lifecycle.
4. Explain the proposed legal and SPV structure.
5. Demonstrate investor protection considerations.
6. Provide realistic, transparent financial simulations.
7. Show how tokenisation could support investment recordkeeping.
8. Be suitable for a live demonstration to the Central Bank of Ireland.
9. Work without live banking, payment or blockchain services.
10. Be sufficiently modular for future production development.

⸻

19. IMPORTANT DEVELOPMENT INSTRUCTIONS

Do not create static mockups only.

Build a working interactive application.

Do not leave non-functional buttons or empty pages.

Do not invent regulatory approval.

Do not claim that the Central Bank has approved, authorised or endorsed the platform.

Do not claim that the platform is regulated.

Do not issue real investment tokens.

Do not process real investor payments.

Do not present projected returns as guaranteed.

Do not confuse blockchain token ownership with legal property ownership.

Use professional financial terminology.

Prioritise user experience, investor transparency and regulatory credibility.

If any feature requires regulatory authorisation, implement it only as a clearly labelled simulation.

⸻

FINAL INSTRUCTION

Start by examining the existing repository and producing a concise implementation plan.

Then implement the complete MVP in logical phases.

Prioritise a polished, functional demonstration over unnecessary complexity.

The finished product should be suitable for presenting to:

* Central Bank of Ireland Innovation Hub
* Potential authorised financial services partners
* Enterprise Ireland
* Angel investors
* Property investment partners

The immediate milestone is the Central Bank Innovation Hub meeting in late October or early November 2026.

Build Meithera as a credible Irish property investment fintech — not as a cryptocurrency trading application.

Recommended Claude Code setup

For the best result, use Claude Code in planning mode first. Let it inspect your existing repository, propose the architecture and identify any reusable components before allowing implementation.

I would also suggest one additional design feature: a public-facing “Regulatory Readiness” page that explains the platform’s proposed safeguards without implying authorisation. This could help establish trust with future investors and partners.

The most important feature for the Central Bank meeting is the guided regulatory demonstration. It should allow you to show the entire investment process, proposed money flows, SPV structure and investor protections in approximately 7–10 minutes.