"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { encodeSession, ROLE_HOME, ROLES, SESSION_COOKIE, type DemoSession, type Role } from "@/lib/auth";

const personas: Record<Role, DemoSession> = {
  investor: { role: "investor", userId: "inv-001", name: "Aoife Byrne (fictional)" },
  tenant: { role: "tenant", userId: "ten-001", name: "Ciara Doyle (fictional tenant)" },
  supervisor: { role: "supervisor", userId: "sup-001", name: "Supervisor (demonstration)" },
  admin: { role: "admin", userId: "admin", name: "Platform administrator (demo)" },
};

const safeNext = (n: unknown, fallback: string) =>
  typeof n === "string" && n.startsWith("/") && !n.startsWith("//") ? n : fallback;

async function setSession(s: DemoSession) {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, await encodeSession(s), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
}

export async function demoLogin(formData: FormData) {
  const persona = z.enum(ROLES).safeParse(formData.get("persona"));
  if (!persona.success) redirect("/login?error=invalid");
  await setSession(personas[persona.data]);
  redirect(safeNext(formData.get("next"), ROLE_HOME[persona.data]));
}

const registerSchema = z.object({
  firstName: z.string().trim().min(1).max(40),
  county: z.string().trim().min(1).max(40),
  confirmFictional: z.literal("on"),
});

export async function demoRegister(formData: FormData) {
  const parsed = registerSchema.safeParse({
    firstName: formData.get("firstName"),
    county: formData.get("county"),
    confirmFictional: formData.get("confirmFictional"),
  });
  if (!parsed.success) redirect("/register?error=invalid");
  // Registration always maps to the fictional demo investor; nothing personal is stored server-side.
  await setSession({ role: "investor", userId: "inv-001", name: `${parsed.data.firstName} (demo)` });
  redirect("/dashboard?welcome=1");
}

export async function logout() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
  redirect("/");
}
