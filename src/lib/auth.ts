import "server-only";
import { cookies } from "next/headers";

import { ROLES, type Role } from "./roles";

export { ROLES, ROLE_HOME, type Role } from "./roles";
export const SESSION_COOKIE = "meithera_demo_session";

export interface DemoSession {
  role: Role;
  userId: string;
  name: string;
}

/**
 * Demo session. Signed with a simple HMAC so the role cannot be edited client-side.
 * In production this is replaced by Supabase Auth (see docs/technical-architecture.md).
 */
const SECRET = process.env.DEMO_SESSION_SECRET ?? "meithera-local-demo-secret";

async function sign(value: string) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", enc.encode(SECRET), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(value));
  return Buffer.from(sig).toString("base64url");
}

export async function encodeSession(s: DemoSession) {
  const payload = Buffer.from(JSON.stringify(s)).toString("base64url");
  return `${payload}.${await sign(payload)}`;
}

export async function decodeSession(token: string | undefined): Promise<DemoSession | null> {
  if (!token) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  if ((await sign(payload)) !== sig) return null;
  try {
    const s = JSON.parse(Buffer.from(payload, "base64url").toString()) as DemoSession;
    if (!ROLES.includes(s.role)) return null;
    return s;
  } catch {
    return null;
  }
}

export async function getSession() {
  const jar = await cookies();
  return decodeSession(jar.get(SESSION_COOKIE)?.value);
}
