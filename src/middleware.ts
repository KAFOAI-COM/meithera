import { NextResponse, type NextRequest } from "next/server";
import { PROTECTED } from "@/lib/roles";

const SESSION_COOKIE = "meithera_demo_session";
const SECRET = process.env.DEMO_SESSION_SECRET ?? "meithera-local-demo-secret";

function b64urlToString(s: string) {
  const pad = s.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((s.length + 3) % 4);
  return atob(pad);
}

async function verify(token?: string): Promise<{ role: string } | null> {
  if (!token) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", enc.encode(SECRET), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const raw = new Uint8Array(await crypto.subtle.sign("HMAC", key, enc.encode(payload)));
  let bin = "";
  raw.forEach((b) => (bin += String.fromCharCode(b)));
  const expected = btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  if (expected !== sig) return null;
  try {
    return JSON.parse(b64urlToString(payload));
  } catch {
    return null;
  }
}

const matches = (pathname: string, prefix: string) => pathname === prefix || pathname.startsWith(`${prefix}/`);

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const rule = PROTECTED.find((r) => matches(pathname, r.prefix));
  if (!rule) return NextResponse.next();
  const session = await verify(req.cookies.get(SESSION_COOKIE)?.value);
  const url = req.nextUrl.clone();
  url.pathname = "/login";
  if (!session) {
    url.search = `?next=${encodeURIComponent(pathname)}`;
    return NextResponse.redirect(url);
  }
  if (!(rule.roles as readonly string[]).includes(session.role)) {
    // e.g. ?error=admin or ?error=supervisor — the login page explains which persona is needed
    url.search = `?next=${encodeURIComponent(pathname)}&error=${rule.prefix.slice(1)}`;
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/invest/:path*", "/admin/:path*", "/presentation/:path*", "/supervisor/:path*"],
};
