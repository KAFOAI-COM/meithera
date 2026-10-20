/** Demo personas. Shared by server auth, middleware and client navigation. */
export const ROLES = ["investor", "tenant", "supervisor", "admin"] as const;
export type Role = (typeof ROLES)[number];

/** Where each persona lands after logging in. */
export const ROLE_HOME: Record<Role, string> = {
  investor: "/dashboard",
  tenant: "/dashboard/tenant",
  supervisor: "/supervisor",
  admin: "/admin/overview",
};

export const ROLE_LABEL: Record<Role, string> = {
  investor: "Dashboard",
  tenant: "My home",
  supervisor: "Supervisor view",
  admin: "Admin",
};

/** Route prefixes and the roles allowed on them. Anything under a listed prefix needs a session. */
export const PROTECTED: { prefix: string; roles: readonly Role[] }[] = [
  { prefix: "/admin", roles: ["admin"] },
  { prefix: "/supervisor", roles: ["supervisor", "admin"] },
  { prefix: "/presentation", roles: ["admin", "supervisor"] },
  { prefix: "/dashboard", roles: ROLES },
  { prefix: "/invest", roles: ROLES },
];
