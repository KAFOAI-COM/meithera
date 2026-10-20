import type { Metadata } from "next";
import { Suspense } from "react";
import { ChainExplorer } from "@/components/chain/explorer";

export const metadata: Metadata = { title: "Raya Chain explorer" };

export default function ChainPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#06231e]" />}>
      <ChainExplorer />
    </Suspense>
  );
}
