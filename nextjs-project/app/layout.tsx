import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import { ConditionalNavbar, ConditionalFooter } from "@/components/ConditionalNavbar";
import { getGlobalMetadata } from "@/lib/metadata";
import { getEnv } from "@/lib/env";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  try {
    const globalData = await getGlobalMetadata();
    const favicon = globalData.favicon;

    return {
      title: globalData.siteName ?? "Disrupt the Block",
      description:
        globalData.siteDescription ??
        "Disrupt the Block pairs exceptional properties with blockchain infrastructure. Explore our portfolio of premium real estate, built for the next era of ownership.",
      icons: favicon
        ? {
            icon: favicon.url.startsWith("http")
              ? favicon.url
              : `${getEnv().STRAPI_URL}${favicon.url}`,
          }
        : undefined,
    };
  } catch {
    return {
      title: "Disrupt the Block — Premium Real Estate for a Digital Future",
      description:
        "Disrupt the Block pairs exceptional properties with blockchain infrastructure. Explore our portfolio of premium real estate, built for the next era of ownership.",
    };
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${inter.variable} antialiased`}
    >
      <body className="bg-background text-secondary font-sans min-h-screen flex flex-col">
        <ConditionalNavbar />
        <main className="flex-1">{children}</main>
        <ConditionalFooter />
      </body>
    </html>
  );
}
