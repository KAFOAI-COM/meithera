import type { Metadata } from "next";
import { AdminInvestors } from "@/components/admin/investors";

export const metadata: Metadata = { title: "Admin · Investors" };

export default function Page() {
  return <AdminInvestors />;
}
