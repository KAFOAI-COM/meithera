import type { Metadata } from "next";
import { AdminAudit } from "@/components/admin/audit";

export const metadata: Metadata = { title: "Admin · Audit log" };

export default function Page() {
  return <AdminAudit />;
}
