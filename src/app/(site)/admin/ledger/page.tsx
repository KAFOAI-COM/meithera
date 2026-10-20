import type { Metadata } from "next";
import { AdminLedger } from "@/components/admin/ledger";

export const metadata: Metadata = { title: "Admin · Ledger controls" };

export default function Page() {
  return <AdminLedger />;
}
