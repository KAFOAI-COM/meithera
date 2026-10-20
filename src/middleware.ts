import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE = "meithera_demo_session";
const SECRET = process.env.DEMO_SESSION_SECRET ?? "meithera-local-demo-secret";

type Role = "investor" | "tenant" | "supervisor" | "admin";

/** Which roles may enter each protected prefix. */
const RULES: { prefix: string; roles: Role[] }[] = [
  { prefix: "/admin", roles: ["admin"] },
  { prefix: "/supervisor", roles: ["supervisor", "admin"] },
  { prefix: "/presentation", roles: ["admin", "supervisor"] },
  { prefix: "/dashboard/tenant", roles: ["tenant", "admin"] },
  { prefix: "/dashboard", roles: ["investor", "tenant", "admin", "supervisor"] },
  { prefix: "/invest", roles: ["investor", "admin"] },
];

function b64urlToString(s: string) {
  const pad = s.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((s.length + 3) % 4);
  return atob(pad);
}

async function verify(token?: string): Promise<{ role: Role } | null> {
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

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const rule = RULES.find((r) => pathname.startsWith(r.prefix));
  if (!rule) return NextResponse.next();
  const session = await verify(req.cookies.get(SESSION_COOKIE)?.value);
  const url = req.nextUrl.clone();
  url.pathname = "/login";
  if (!session) {
    url.search = `?next=${encodeURIComponent(pathname)}`;
    return NextResponse.redirect(url);
  }
  if (!rule.roles.includes(session.role)) {
    url.search = `?next=${encodeURIComponent(pathname)}&error=role&need=${rule.roles[0]}`;
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/invest/:path*", "/admin/:path*", "/presentation/:path*", "/supervisor/:path*"],
};
