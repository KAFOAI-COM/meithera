/** Shared (client-safe) auth types. Server-only helpers live in auth.ts. */
export type Role = "investor" | "tenant" | "supervisor" | "admin";

export interface SessionInfo {
  role: Role;
  name: string;
  userId: string;
}

/** Where each persona lands after login. */
export const HOME_FOR_ROLE: Record<Role, string> = {
  investor: "/dashboard",
  tenant: "/dashboard/tenant",
  supervisor: "/supervisor",
  admin: "/admin/overview",
};
