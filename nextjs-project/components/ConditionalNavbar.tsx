"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/Navbar";

export function ConditionalNavbar() {
  const pathname = usePathname();

  // Homepage is a full-screen overlay with no nav
  if (pathname === "/") {
    return null;
  }

  return <Navbar />;
}
