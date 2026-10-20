import type { Metadata } from "next";
import { AdminSpvs } from "@/components/admin/spvs";

export const metadata: Metadata = { title: "Admin · SPVs & loans" };

export default function Page() {
  return <AdminSpvs />;
}
