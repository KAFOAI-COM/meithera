import type { Role } from "./auth-types";

export interface Persona {
  key: "investor" | "tenant" | "supervisor" | "admin";
  role: Role;
  userId: string;
  name: string;
  blurb: string;
  stage: 0 | 1 | 2 | 3 | 4;
}

/** The four demonstration personas. All fictional. */
export const PERSONAS: Record<Persona["key"], Persona> = {
  investor: { key: "investor", role: "investor", userId: "inv-001", name: "Aoife Byrne (fictional investor)", blurb: "Retail investor with two simulated holdings. Opens the dashboard and the investment journey.", stage: 1 },
  tenant: { key: "tenant", role: "tenant", userId: "ten-001", name: "Seán Ó Briain (fictional tenant)", blurb: "Lives in the Dublin 8 home. Opens the staircasing simulator (Stage 3).", stage: 3 },
  supervisor: { key: "supervisor", role: "supervisor", userId: "sup-001", name: "Supervisor (demonstration)", blurb: "Read-only view of the kind a regulator could be given. Not a Central Bank system.", stage: 0 },
  admin: { key: "admin", role: "admin", userId: "admin", name: "Platform administrator (demo)", blurb: "Operates the platform: offers, distributions, freezes, audit, presentation.", stage: 0 },
};
