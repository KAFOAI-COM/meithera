import type { Metadata } from "next";
import { seedProperties } from "@/lib/data/properties";
import { PropertyDetail } from "@/components/property/detail";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = seedProperties.find((x) => x.slug === slug);
  return { title: p ? `${p.title} (illustrative)` : "Home not found" };
}

export default async function PropertyPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ tab?: string }> }) {
  const { slug } = await params;
  const { tab } = await searchParams;
  return <PropertyDetail slug={slug} initialTab={tab} />;
}
