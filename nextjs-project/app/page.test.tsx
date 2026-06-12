import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import type { Global } from "@/lib/schemas/global";

// Mock the child components
vi.mock("@/components/MonolithHero", () => ({
  MonolithHero: ({ tagline }: { tagline?: string }) => (
    <div data-testid="monolith-hero">
      {tagline && <span data-testid="hero-tagline">{tagline}</span>}
    </div>
  ),
}));

vi.mock("@/lib/intake", () => ({
  intake: { global: vi.fn() },
}));

vi.mock("@/lib/env", () => ({
  getEnv: () => ({ STRAPI_URL: "http://localhost:1337" }),
}));

import { intake } from "@/lib/intake";

const HomePage = async () => {
  const { default: Page } = await import("./page");
  return Page;
};

function createGlobal(overrides: Partial<Global> = {}): Global {
  return {
    id: 1,
    documentId: "global-001",
    siteName: "Disrupt the Block",
    siteDescription: "Premium properties",
    favicon: null,
    defaultSeo: null,
    footerText: "© 2026 Disrupt the Block",
    contactEmail: "info@disrupttheblock.com",
    contactPhone: "+1 (555) 123-4567",
    socialLinks: [],
    ...overrides,
  };
}

beforeEach(() => {
  vi.resetModules();
});

afterEach(() => {
  vi.restoreAllMocks();
  cleanup();
});

describe("HomePage (brand splash)", () => {
  it("renders MonolithHero", async () => {
    vi.mocked(intake.global).mockResolvedValue(createGlobal());

    const Page = await HomePage();
    const result = await Page();
    render(result);

    expect(screen.getByTestId("monolith-hero")).toBeInTheDocument();
  });


});
