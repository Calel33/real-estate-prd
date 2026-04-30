/// <reference types="vitest" />

import { afterEach, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";

// Fully reset DOM between tests to prevent <html>/<body> accumulation
// (Layout components render <html>/<body> which jsdom doesn't clean fully)
// Guard: node-environment tests don't have `document` (e.g., route handler tests)
afterEach(() => {
  cleanup();
  if (typeof document !== "undefined") {
    document.head.innerHTML = "";
    document.body.innerHTML = "";
  }
});

// Mock next/font/google so tests don't need build-time font loading
vi.mock("next/font/google", () => ({
  Playfair_Display: () => ({
    variable: "--font-playfair",
    subsets: ["latin"],
    display: "swap",
  }),
  Inter: () => ({
    variable: "--font-inter",
    subsets: ["latin"],
    display: "swap",
  }),
}));
