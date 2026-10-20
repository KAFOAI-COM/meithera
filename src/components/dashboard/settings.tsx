"use client";

import { useState } from "react";
import { RotateCcw, MessageSquareWarning, UserRound, Trash2, CheckCircle2 } from "lucide-react";
import { useDemo } from "@/lib/store";
import { useHydrated } from "@/components/site/hydrator";
import { Button, Card, Input, Label } from "@/components/ui";
import { StageBadge } from "@/components/site/stage-badge";
import { logout } from "@/app/actions";
import type { Role } from "@/lib/auth-types";

export function Settings({ userId, userName, role }: { userId: string; userName: string; role: Role }) {
  const hydrated = useHydrated();
  const { reset, openComplaint, complaints, investors } = useDemo();
  const [arm, setArm] = useState(false);
  const [done, setDone] = useState(false);
  const [subject, setSubject] = useState("");
  const investor = investors.find((i) => i.id === userId);
  if (!hydrated) return <div className="h-64 animate-pulse rounded-2xl bg-mint/50" />;
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="p-5">
        <p className="flex items-center gap-2 font-sans text-sm font-semibold"><UserRound className="h-4 w-4 text-forest" /> Persona</p>
        <dl className="mt-3 grid gap-y-1 text-sm sm:grid-cols-[160px_1fr]">
          <dt className="text-muted">Name</dt><dd>{userName}</dd>
          <dt className="text-muted">Role</dt><dd className="capitalize">{role}</dd>
          <dt className="text-muted">Demo id</dt><dd className="font-mono text-xs">{userId}</dd>
          {investor ? (<><dt className="text-muted">Classification</dt><dd>{investor.classification}</dd><dt className="text-muted">Knowledge test</dt><dd>{investor.knowledgeTest ? `${investor.knowledgeTest.score}/${investor.knowledgeTest.total} — ${investor.knowledgeTest.passed ? "passed" : "not passed"}` : "Not taken"}</dd></>) : null}
        </dl>
        <p className="mt-3 text-xs text-muted">No personal data is stored. The persona lives in a signed cookie; everything else is fictional demo state in this tab’s sessionStorage.</p>
        <form action={logout} className="mt-4"><Button variant="secondary" type="submit">Log out</Button></form>
      </Card>

      <Card className="p-5">
        <div className="flex items-center justify-between"><p className="flex items-center gap-2 font-sans text-sm font-semibold"><MessageSquareWarning className="h-4 w-4 text-forest" /> Raise a complaint (simulated)</p><StageBadge stage={1} compact /></div>
        <p className="mt-1 text-xs text-muted">ECSPR requires a complaints procedure. Here a complaint is recorded in the audit log and shown to the supervisor. Nothing is sent anywhere.</p>
        <form className="mt-3 flex flex-col gap-2 sm:flex-row" onSubmit={(e) => { e.preventDefault(); if (subject.trim()) { openComplaint(userId, subject.trim()); setSubject(""); } }}>
          <div className="flex-1 space-y-1"><Label htmlFor="cmp">Subject</Label><Input id="cmp" value={subject} onChange={(e) => setSubject(e.target.value)} maxLength={120} placeholder="e.g. Statement timing" /></div>
          <Button type="submit" variant="secondary" className="sm:self-end">Record</Button>
        </form>
        <ul className="mt-3 space-y-1 text-xs text-muted">{complaints.filter((c) => c.investorId === userId).map((c) => <li key={c.id}>{c.id} · {c.subject} · {c.status}</li>)}</ul>
      </Card>

      <Card className="p-5 lg:col-span-2">
        <p className="flex items-center gap-2 font-sans text-sm font-semibold"><RotateCcw className="h-4 w-4 text-forest" /> Reset the demonstration</p>
        <p className="mt-1 text-xs text-muted">Restores the seed data: homes, investors, holdings, distributions, audit log and the Raya Chain genesis. Only this browser tab is affected.</p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {!arm ? (
            <Button variant="secondary" onClick={() => setArm(true)}><Trash2 className="h-4 w-4" /> Reset demo data…</Button>
          ) : (
            <>
              <Button variant="danger" onClick={() => { reset(); setArm(false); setDone(true); setTimeout(() => setDone(false), 3000); }}>Yes, reset everything</Button>
              <Button variant="ghost" onClick={() => setArm(false)}>Cancel</Button>
            </>
          )}
          {done ? <span className="flex items-center gap-1 text-sm text-emerald"><CheckCircle2 className="h-4 w-4" /> Demo data reset</span> : null}
        </div>
      </Card>
    </div>
  );
}
