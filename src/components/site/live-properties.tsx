"use client";

import { useDemo } from "@/lib/store";
import { PropertyCard } from "./property-card";

/** Featured properties, read from demo state so admin edits and simulated funding show up. */
export function FeaturedProperties({ limit = 3 }: { limit?: number }) {
  const properties = useDemo((s) => s.properties);
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {properties.slice(0, limit).map((p) => (
        <PropertyCard key={p.id} p={p} />
      ))}
    </div>
  );
}
