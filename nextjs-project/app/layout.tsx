import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import { ConditionalNavbar } from "@/components/ConditionalNavbar";
import { Footer } from "@/components/Footer";
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

export const metadata: Metadata = {
  title: "Disrupt the Block — Premium Real Estate for a Digital Future",
  description:
    "Disrupt the Block pairs exceptional properties with blockchain infrastructure. Explore our portfolio of premium real estate, built for the next era of ownership.",
};

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
        <Footer />
      </body>
    </html>
  );
}
