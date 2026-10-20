"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { encodeSession, HOME_FOR_ROLE, SESSION_COOKIE, type DemoSession } from "@/lib/auth";
import { PERSONAS } from "@/lib/personas";

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
  const persona = z.enum(["investor", "tenant", "supervisor", "admin"]).safeParse(formData.get("persona"));
  if (!persona.success) redirect("/login?error=invalid");
  const p = PERSONAS[persona.data];
  await setSession({ role: p.role, userId: p.userId, name: p.name });
  redirect(safeNext(formData.get("next"), HOME_FOR_ROLE[p.role]));
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
