import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, ArrowRight, Eye, Home, Settings2, UserRound } from "lucide-react";
import { demoLogin } from "@/app/actions";
import { AuthShell } from "@/components/site/auth-shell";
import { StageBadge } from "@/components/site/stage-badge";
import { cn } from "@/lib/utils";
import type { Stage } from "@/lib/types";

export const metadata: Metadata = { title: "Log in" };

const PERSONAS: { role: string; name: string; who: string; does: string; icon: typeof UserRound; stage: Stage; tone: string }[] = [
  { role: "investor", name: "Aoife Byrne", who: "Investor — fictional", does: "Fund a vacant home, track monthly income and every holding on Raya Chain.", icon: UserRound, stage: 1, tone: "bg-mint text-emerald" },
  { role: "tenant", name: "Ciara Doyle", who: "Tenant — fictional", does: "Buy into the home she rents, step by step, and watch the rent fall.", icon: Home, stage: 3, tone: "bg-[#f4ecdc] text-gold-ink" },
  { role: "supervisor", name: "Supervisor", who: "Demonstration — not a Central Bank system", does: "A read-only, live view of funds, investors, warnings and the register.", icon: Eye, stage: 0, tone: "bg-emerald text-white" },
  { role: "admin", name: "Administrator", who: "Platform operator — demo", does: "Manage properties, run monthly distributions, freeze or correct holdings.", icon: Settings2, stage: 0, tone: "bg-surface text-ink ring-1 ring-line" },
];

const ERRORS: Record<string, string> = {
  admin: "That page needs the Administrator persona.",
  supervisor: "That page needs the Supervisor or Administrator persona.",
  presentation: "The presentation needs the Administrator or Supervisor persona.",
  invalid: "Please choose one of the personas below.",
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const { next, error } = await searchParams;
  return (
    <AuthShell quote="Pick a persona to see the platform from their side — investor, tenant, supervisor or operator.">
      <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-gold-ink">Demo log in</p>
      <h1 className="mt-3 font-serif text-4xl tracking-tight text-ink sm:text-5xl">Choose who you are today</h1>
      <p className="mt-3 max-w-lg text-muted">No passwords and no personal data. Each persona is fictional; your session lasts eight hours and you can switch at any time.</p>
      {error && ERRORS[error] ? (
        <p role="alert" className="mt-6 flex items-start gap-2 rounded-xl bg-risk p-4 text-sm font-medium text-risk-ink"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> {ERRORS[error]}</p>
      ) : null}
      {next ? <p className="mt-4 text-sm text-muted">After logging in you’ll continue to <code className="rounded bg-surface px-1.5 py-0.5 font-mono text-xs text-ink ring-1 ring-line">{next}</code>.</p> : null}
      <ul className="mt-8 grid gap-4 sm:grid-cols-2">
        {PERSONAS.map((p) => (
          <li key={p.role}>
            <form action={demoLogin} className="h-full">
              <input type="hidden" name="persona" value={p.role} />
              {next ? <input type="hidden" name="next" value={next} /> : null}
              <button type="submit" className="group flex h-full w-full flex-col rounded-2xl border border-line bg-card p-5 text-left shadow-card transition-[box-shadow,border-color,transform] hover:-translate-y-0.5 hover:border-forest/40 hover:shadow-raised focus-visible:outline-2">
                <div className="flex items-start justify-between gap-3">
                  <span className={cn("flex h-12 w-12 items-center justify-center rounded-2xl", p.tone)}><p.icon className="h-5 w-5" /></span>
                  <StageBadge stage={p.stage} />
                </div>
                <p className="mt-5 font-serif text-2xl leading-tight text-ink">{p.name}</p>
                <p className="mt-0.5 font-sans text-xs font-semibold text-muted">{p.who}</p>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">{p.does}</p>
                <span className="mt-5 inline-flex items-center gap-1.5 font-sans text-sm font-semibold text-forest">
                  Continue as {p.name.split(" ")[0]} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </button>
            </form>
          </li>
        ))}
      </ul>
      <p className="mt-8 text-sm text-muted">New here? <Link href="/register" className="font-semibold text-forest hover:underline">Create a demo profile</Link> — first name and county only.</p>
    </AuthShell>
  );
}
