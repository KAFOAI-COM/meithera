import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const eur0 = new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
const eur2 = new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR", minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function eur(n: number, decimals: 0 | 2 = 0) {
  return (decimals === 2 ? eur2 : eur0).format(n);
}

export function pct(n: number, decimals = 2) {
  return `${(n * 100).toFixed(decimals)}%`;
}

export function shortDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IE", { day: "numeric", month: "short", year: "numeric", timeZone: "Europe/Dublin" });
}

export function dateTime(iso: string) {
  return new Date(iso).toLocaleString("en-IE", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Dublin" });
}

/** Deterministic short hash (FNV-1a) used for simulated transaction references. Not cryptographic. */
export function fnv(input: string) {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, "0");
}

export function uid(prefix: string) {
  const rnd = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `${prefix}-${Date.now().toString(36).toUpperCase().slice(-5)}${rnd}`;
}

/** Shortened hash for display, e.g. 0x3f9a…c21e. */
export function shortHash(h: string, head = 6, tail = 4) {
  return h.length <= head + tail + 1 ? h : `${h.slice(0, head)}…${h.slice(-tail)}`;
}
