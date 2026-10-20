import { ChevronDown } from "lucide-react";

export const faqs: { q: string; a: string }[] = [
  { q: "Can I invest real money on Meithera today?", a: "No. Meithera is a demonstration platform. No real investments are available, no money can be transferred, and no securities or tokens are issued. Every property and figure is fictional and illustrative." },
  { q: "Is Meithera regulated by the Central Bank of Ireland?", a: "No. Meithera (a proposed platform by Raya Software Limited) is not authorised or regulated by the Central Bank of Ireland, and the Central Bank has not approved or endorsed the platform. We are using this demonstration to discuss the appropriate regulatory pathway." },
  { q: "Would I own part of the house?", a: "Not directly. Under the proposed structure each property would be held by its own special purpose vehicle (SPV). Investors would hold an investment instrument issued by the SPV — for example a share or a profit-participating note — that carries economic rights. Legal title to the property stays with the SPV. The final rights depend on the instrument and structure, which remain subject to legal and regulatory review." },
  { q: "What does the indicative yield mean?", a: "The indicative property-level net operating yield is estimated annual rent minus estimated operating costs, divided by total project cost. It is not your return: platform fees and investor-level taxes would reduce what an investor receives, and actual rent and costs may differ." },
  { q: "Can I sell my investment whenever I want?", a: "You should assume not. Property investments are illiquid. The proposed model includes a holding period and transfer restrictions; any secondary market would depend on regulatory permissions and is not part of this demonstration." },
  { q: "Where does the blockchain fit in?", a: "The proposal is to use distributed-ledger technology only for recordkeeping — a reconciled mirror of the official investor register, with transfer restrictions built in. The legal record of ownership would remain off-chain. This demo simulates those records; nothing is written to any blockchain." },
  { q: "How would my money be protected?", a: "In a live service, investor funds would be handled only by an appropriately authorised financial services provider using segregated client accounts. Meithera itself would not hold client money. The exact arrangements are an open regulatory question." },
  { q: "Why vacant homes?", a: "Ireland has a significant stock of vacant and derelict homes. The proposed model would finance acquisition and refurbishment so that properties can return to residential use. Any social impact shown in this demo is a projection, not an achieved result." },
];

export function FaqList({ items = faqs }: { items?: typeof faqs }) {
  return (
    <div className="divide-y divide-line rounded-2xl border border-line bg-card">
      {items.map((f) => (
        <details key={f.q} className="group p-5 [&_summary::-webkit-details-marker]:hidden">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-sans text-base font-semibold text-ink">
            {f.q}
            <ChevronDown className="h-5 w-5 shrink-0 text-muted transition-transform group-open:rotate-180" />
          </summary>
          <p className="mt-3 text-sm leading-relaxed text-muted">{f.a}</p>
        </details>
      ))}
    </div>
  );
}
