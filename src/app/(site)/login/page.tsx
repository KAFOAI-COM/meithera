import type { Metadata } from "next";
import Link from "next/link";
import { UserRound, Home, Landmark, Settings2, AlertTriangle } from "lucide-react";
import { demoLogin } from "@/app/actions";
import { PERSONAS } from "@/lib/personas";
import { Card } from "@/components/ui";
import { PageHeader, IllustrativeNotice } from "@/components/site/notices";
import { StageBadge } from "@/components/site/stage-badge";

export const metadata: Metadata = { title: "Log in (demo personas)" };

const icons = { investor: UserRound, tenant: Home, supervisor: Landmark, admin: Settings2 } as const;

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string; need?: string }> }) {
  const sp = await searchParams;
  const next = typeof sp.next === "string" && sp.next.startsWith("/") && !sp.next.startsWith("//") ? sp.next : "";
  return (
    <>
      <PageHeader eyebrow="Demonstration login" title="Choose a persona" intro="No passwords, no accounts, no personal data. Each persona is fictional and opens a different part of the demonstration.">
        <IllustrativeNotice className="mt-6 max-w-xl">A signed demo cookie records the persona for eight hours. Nothing else is stored.</IllustrativeNotice>
      </PageHeader>
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        {sp.error ? (
          <div className="mb-6 flex gap-3 rounded-xl bg-risk p-4 text-sm text-risk-ink" role="alert">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
            <p>
              {sp.error === "role" ? `That area needs the ${sp.need ?? "administrator"} persona. Choose it below to continue${next ? ` to ${next}` : ""}.` : "Please choose one of the personas below."}
            </p>
          </div>
        ) : null}
        <div className="grid gap-5 sm:grid-cols-2">
          {Object.values(PERSONAS).map((p) => {
            const Icon = icons[p.key];
            return (
              <Card key={p.key} className="flex flex-col p-6">
                <div className="flex items-start justify-between gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-mint text-emerald"><Icon className="h-5 w-5" /></span>
                  <StageBadge stage={p.stage} compact />
                </div>
                <h2 className="mt-4 font-sans text-lg font-semibold">{p.name}</h2>
                <p className="mt-1 flex-1 text-sm text-muted">{p.blurb}</p>
                <form action={demoLogin} className="mt-5">
                  <input type="hidden" name="persona" value={p.key} />
                  {next ? <input type="hidden" name="next" value={next} /> : null}
                  <button className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-emerald px-5 font-sans text-sm font-semibold text-white hover:bg-forest" data-testid={`login-${p.key}`}>
                    Continue as {p.key === "admin" ? "Administrator" : p.key === "supervisor" ? "Supervisor" : p.key === "tenant" ? "Tenant" : "Investor"}
                  </button>
                </form>
              </Card>
            );
          })}
        </div>
        <p className="mt-8 text-center text-sm text-muted">
          Prefer to create your own fictional investor? <Link href="/register" className="font-semibold text-forest underline-offset-2 hover:underline">Register (demo)</Link>
        </p>
      </div>
    </>
  );
}
