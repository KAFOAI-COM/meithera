import type { Metadata, Viewport } from "next";
import { DM_Sans, Manrope, Newsreader } from "next/font/google";
import { StoreHydrator } from "@/components/site/hydrator";
import "./globals.css";

const manrope = Manrope({ variable: "--font-manrope", subsets: ["latin"], display: "swap" });
const dmSans = DM_Sans({ variable: "--font-dm-sans", subsets: ["latin"], display: "swap" });
const newsreader = Newsreader({ variable: "--font-newsreader", subsets: ["latin"], weight: ["400", "500"], display: "swap" });

export const metadata: Metadata = {
  title: { default: "Meithera — Demonstration Platform", template: "%s · Meithera (demo)" },
  description: "Demonstration MVP of a proposed Irish fractional property investment platform. No real investments available.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = { themeColor: "#063f36" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-IE">
      <body className={`${manrope.variable} ${dmSans.variable} ${newsreader.variable} antialiased`}>
        <StoreHydrator />
        {children}
      </body>
    </html>
  );
}
