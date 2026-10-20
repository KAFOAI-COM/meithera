import type { Metadata } from "next";
import { seedProperties } from "@/lib/data/properties";
import { PropertyDetail } from "@/components/property/property-detail";

export function generateStaticParams() {
  return seedProperties.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = seedProperties.find((x) => x.slug === slug);
  return { title: p ? p.title : "Property" };
}

/** Reads from the demo store on the client so simulated funding, payouts and admin edits show up. */
export default async function PropertyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <PropertyDetail slug={slug} />;
}
