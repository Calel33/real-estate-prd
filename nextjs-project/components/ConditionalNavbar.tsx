"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export function ConditionalNavbar() {
  const pathname = usePathname();

  // Homepage is a full-screen overlay with no nav
  if (pathname === "/") {
    return null;
  }

  return <Navbar />;
}

/**
 * Footer suppressed on routes that host their own fixed stats bar (e.g. /properties).
 * Prevents a dual-footer conflict where both the stats overlay and the global site
 * footer render simultaneously.
 */
export function ConditionalFooter() {
  const pathname = usePathname();

  if (pathname === "/properties") {
    return null;
  }

  return <Footer />;
}
