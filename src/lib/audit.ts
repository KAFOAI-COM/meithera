import type { AuditEvent } from "./types";
import { fnv } from "./utils";

/** Recompute the audit log's hash chain. Each event's hash covers the previous hash and its own fields. */
export function verifyAudit(events: AuditEvent[]): { ok: boolean; checked: number; brokenAt?: number } {
  let prev = "00000000";
  for (let i = 0; i < events.length; i++) {
    const e = events[i];
    const expected = fnv(prev + e.id + e.type + e.actor + e.detail + e.at);
    if (e.prevHash !== prev || e.hash !== expected) return { ok: false, checked: i, brokenAt: i };
    prev = e.hash;
  }
  return { ok: true, checked: events.length };
}

/** Client-side file download (CSV/JSON exports). Nothing is sent anywhere. */
export function download(name: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

export function toCsv(rows: Record<string, unknown>[]) {
  if (!rows.length) return "";
  const cols = Object.keys(rows[0]);
  const esc = (v: unknown) => {
    const s = v == null ? "" : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [cols.join(","), ...rows.map((r) => cols.map((c) => esc(r[c])).join(","))].join("\n");
}
