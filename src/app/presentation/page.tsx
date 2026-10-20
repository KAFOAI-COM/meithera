import type { Metadata } from "next";
import { getSession } from "@/lib/auth";
import { HOME_FOR_ROLE } from "@/lib/auth-types";
import { Deck } from "@/components/presentation/deck";

export const metadata: Metadata = { title: "Full-vision presentation" };

export default async function PresentationPage() {
  const session = await getSession();
  return <Deck exitHref={session ? HOME_FOR_ROLE[session.role] : "/"} />;
}
