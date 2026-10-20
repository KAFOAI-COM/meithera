import type { Metadata } from "next";
import { AdminProperties } from "@/components/admin/properties";

export const metadata: Metadata = { title: "Admin · Homes & offers" };

export default function Page() {
  return <AdminProperties />;
}
