import { NextResponse, type NextRequest } from "next/server";

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

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const session = await verify(req.cookies.get(SESSION_COOKIE)?.value);
  const needsAuth = pathname.startsWith("/dashboard") || pathname.startsWith("/invest") || pathname.startsWith("/admin") || pathname.startsWith("/presentation");
  if (!needsAuth) return NextResponse.next();
  if (!session) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.search = `?next=${encodeURIComponent(pathname)}`;
    return NextResponse.redirect(url);
  }
  if ((pathname.startsWith("/admin") || pathname.startsWith("/presentation")) && session.role !== "admin") {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.search = `?next=${encodeURIComponent(pathname)}&error=admin`;
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/invest/:path*", "/admin/:path*", "/presentation/:path*"],
};
