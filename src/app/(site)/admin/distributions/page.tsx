import type { Metadata } from "next";
import { AdminDistributions } from "@/components/admin/distributions";

export const metadata: Metadata = { title: "Admin · Distributions" };

export default function Page() {
  return <AdminDistributions />;
}
