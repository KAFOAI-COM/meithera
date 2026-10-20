"use client";

import Link from "next/link";
import { useState } from "react";
import { CheckCircle2, LogOut, RotateCcw } from "lucide-react";
import { useInvestor } from "@/components/dashboard/investor-context";
import { useDemo } from "@/lib/store";
import { logout } from "@/app/actions";
import { Button, Card, buttonVariants } from "@/components/ui";

export default function SettingsPage() {
  const d = useInvestor();
  const reset = useDemo((s) => s.reset);
  const blocks = useDemo((s) => s.chain.blocks.length);
  const audit = useDemo((s) => s.audit.length);
  const [done, setDone] = useState(false);
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="p-6">
        <h2 className="font-sans text-base font-semibold text-ink">Demo session</h2>
        <dl className="mt-4 space-y-3 text-sm">
          {[["Persona", d.displayName], ["Role", d.role], ["Raya Chain holder", d.holder], ["Blocks in this session", String(blocks)], ["Audit events", String(audit)]].map(([k, v]) => (
            <div key={k} className="flex justify-between gap-4 border-b border-line pb-3"><dt className="text-muted">{k}</dt><dd className="text-right font-sans font-semibold text-ink">{v}</dd></div>
          ))}
        </dl>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/login" className={buttonVariants({ variant: "secondary" })}>Switch persona</Link>
          <form action={logout}><button className={buttonVariants({ variant: "ghost" })}><LogOut className="h-4 w-4" /> Log out</button></form>
        </div>
      </Card>
      <Card className="p-6">
        <h2 className="font-sans text-base font-semibold text-ink">Reset demo</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">Returns properties, holdings, payouts, votes, bulletin posts and the Raya Chain to their starting state. Useful before a walkthrough.</p>
        <Button
          variant="danger"
          className="mt-5"
          onClick={() => {
            reset();
            setDone(true);
          }}
        >
          <RotateCcw className="h-4 w-4" /> Reset demo
        </Button>
        {done ? <p className="mt-3 flex items-center gap-2 text-sm font-medium text-forest"><CheckCircle2 className="h-4 w-4" /> Demo reset to its starting state.</p> : null}
      </Card>
      <Card className="p-6 lg:col-span-2">
        <h2 className="font-sans text-base font-semibold text-ink">What this demo stores</h2>
        <ul className="mt-3 space-y-2 text-sm leading-relaxed text-muted">
          <li>• A signed session cookie naming your persona (no personal data, 8-hour expiry).</li>
          <li>• Fictional demo state in this tab’s sessionStorage — cleared when you close the tab or reset.</li>
          <li>• Nothing is sent to a server, a blockchain or any third party.</li>
        </ul>
        <Link href="/legal/privacy" className="mt-3 inline-block font-sans text-sm font-semibold text-forest hover:underline">Privacy notice</Link>
      </Card>
    </div>
  );
}
