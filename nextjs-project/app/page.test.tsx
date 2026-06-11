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

vi.mock("@/lib/fetch-global", () => ({
  fetchGlobal: vi.fn(),
}));

vi.mock("@/lib/env", () => ({
  getEnv: () => ({ STRAPI_URL: "http://localhost:1337" }),
}));

import { fetchGlobal } from "@/lib/fetch-global";

const HomePage = async () => {
  const { default: Page } = await import("./page");
  return Page;
};

function createGlobal(overrides: Partial<Global> = {}): Global {
  return {
    id: 1,
    documentId: "global-001",
    siteName: "Zenith Real Estate",
    siteDescription: "Premium properties",
    favicon: null,
    defaultSeo: null,
    footerText: "© 2026 Zenith",
    contactEmail: "info@zenith.com",
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
    vi.mocked(fetchGlobal).mockResolvedValue(createGlobal());

    const Page = await HomePage();
    const result = await Page();
    render(result);

    expect(screen.getByTestId("monolith-hero")).toBeInTheDocument();
  });


});
