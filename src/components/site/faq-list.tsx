import { ChevronDown } from "lucide-react";

export type Faq = { q: string; a: string; topic: "Basics" | "Investing" | "Risk" | "Raya Chain" | "Regulation" };

export const faqs: Faq[] = [
  { topic: "Basics", q: "Can I invest real money on Meithera today?", a: "No. Meithera is a demonstration platform. No real investments are available, no money can be transferred, and no securities or tokens are issued. Every property and figure is fictional and illustrative." },
  { topic: "Regulation", q: "Is Meithera regulated by the Central Bank of Ireland?", a: "No. Meithera (a proposed platform by Raya Software Limited) is not authorised or regulated by the Central Bank of Ireland, and the Central Bank has not approved or endorsed the platform. We are engaging with the Innovation Hub, which gives informal guidance only, to discuss the appropriate regulatory pathway." },
  { topic: "Investing", q: "Would I own part of the house?", a: "No. Each home would be held by its own property company (an SPV). You would hold a loan participation (Stage 1) or notes in that company (Stage 2) that carry economic rights. Legal title stays with the company. The final rights depend on the instrument and structure, which remain subject to legal and regulatory review." },
  { topic: "Investing", q: "What is the difference between a secured loan and a rent share?", a: "A Stage 1 secured loan pays fixed interest monthly for 12–24 months and is secured by a first legal charge over the home; you do not share in any rise in value. A Stage 2 rent share gives you notes in the company that owns the home, paying a monthly share of net rent over a longer hold, with a vote on selling at the end." },
  { topic: "Investing", q: "What fees would I pay?", a: "Two, the same on every opportunity: a 1.5% one-off acquisition fee deducted from the amount you enter, and a 0.5% annual administration fee on the amount net invested or lent. Every figure on the site is shown after both fees and before investor-level taxes." },
  { topic: "Investing", q: "What does the property yield mean?", a: "The property-level net operating yield is estimated annual rent minus operating costs, divided by total project cost. It is not your return: fees and investor-level taxes reduce what you would receive, and actual rent and costs may differ. Each calculator shows both side by side." },
  { topic: "Investing", q: "How often would I be paid?", a: "Monthly — interest on a Stage 1 loan, or net rental income on a Stage 2 rent share once the home is let. In this demonstration payouts are simulated and recorded on Raya Chain; no money moves." },
  { topic: "Risk", q: "Can I sell my investment whenever I want?", a: "You should assume not. Loans are repaid at maturity, with no early exit. Rent-share holders vote on a sale at the end of the holding period; before then, interest to sell could be posted on an ECSPR-style bulletin board, but there is no guarantee anyone will buy." },
  { topic: "Risk", q: "What happens if the borrower cannot repay a loan?", a: "Recovery would depend on enforcing the first legal charge over the home, which can take time and may not recover the full amount. You could lose some or all of your money." },
  { topic: "Risk", q: "How would my money be protected?", a: "In a live service, investor funds would be handled only by an appropriately authorised payment or custody partner using segregated client accounts. Meithera itself would not hold client money. The exact arrangements are an open regulatory question. There is no deposit guarantee or investor compensation cover." },
  { topic: "Risk", q: "Can I change my mind?", a: "The proposed journey includes a 4-day reflection period during which a non-sophisticated investor could withdraw without penalty. The demo shows this notice at the review step." },
  { topic: "Raya Chain", q: "Where does the blockchain fit in?", a: "Raya Chain records holdings, payouts and the Home Digital Passport as a tamper-evident mirror of the official register, with transfer restrictions, freeze and court-ordered correction built in. A token records the holding; it is not legal title. Only at Stage 4 — subject to EU reform of the DLT Pilot Regime — could Raya Chain become the official register." },
  { topic: "Raya Chain", q: "Is my personal data on the chain?", a: "No. Holders appear only as salted pseudonyms. Identity data would stay with the regulated onboarding provider, off-chain. This demonstration collects no personal data at all." },
  { topic: "Raya Chain", q: "What is the Home Digital Passport?", a: "A single history of each home — vacancy, works, energy rating before and after, tenancy, funders and payouts — with each entry linked to its Raya Chain transaction." },
  { topic: "Basics", q: "What are the five stages?", a: "Stage 0 is this demonstration. Stage 1 is secured lending under ECSPR via a licensed partner. Stage 2 is rent-share notes. Stage 3 lets tenants buy into their own home step by step and needs further permissions. Stage 4, the Internet of Value, depends on EU reform. Only Stage 0 exists today." },
  { topic: "Basics", q: "Why vacant homes?", a: "Ireland has a significant stock of vacant and derelict homes. Funding their refurbishment adds supply rather than competing for existing homes. Any impact shown in this demo is a projection, not an achieved result." },
];

export function FaqList({ items = faqs }: { items?: Faq[] }) {
  return (
    <div className="divide-y divide-line rounded-2xl border border-line bg-card">
      {items.map((f) => (
        <details key={f.q} className="group p-5 [&_summary::-webkit-details-marker]:hidden">
          <summary className="flex min-h-8 cursor-pointer list-none items-center justify-between gap-4 font-sans text-base font-semibold text-ink">
            {f.q}
            <ChevronDown className="h-5 w-5 shrink-0 text-muted transition-transform group-open:rotate-180" />
          </summary>
          <p className="mt-3 text-sm leading-relaxed text-muted">{f.a}</p>
        </details>
      ))}
    </div>
  );
}
