/// <reference types="vitest" />

import "@testing-library/jest-dom/vitest";

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
