import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import type { About } from "@/lib/schemas/about";
import type { StrapiMedia } from "@/lib/schemas/strapi";

// Mock the fetch function used by the Server Component
vi.mock("@/lib/intake", () => ({
  intake: {
    about: vi.fn(),
    global: vi.fn().mockResolvedValue({
      siteName: "Test",
      siteDescription: "Test",
      defaultSeo: null,
      socialLinks: [],
    }),
  },
}));

vi.mock("@/lib/env", () => ({
  getEnv: () => ({ STRAPI_URL: "http://localhost:1337" }),
}));

// Mock Next.js Link to render as a regular anchor for testing
vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
    [key: string]: unknown;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

// Mock DynamicZoneRenderer
vi.mock("@/components/DynamicZoneRenderer", () => ({
  DynamicZoneRenderer: ({
    blocks,
  }: {
    blocks: unknown[];
    strapiUrl: string;
  }) => (
    <div data-testid="dynamic-zone">
      {blocks.length > 0
        ? blocks.map((b: Record<string, unknown>, i: number) => (
            <span key={i} data-testid="block-content">
              {String(b.body ?? "")}
            </span>
          ))
        : null}
    </div>
  ),
}));

// Import after mocking
import { intake } from "@/lib/intake";

// ---------------------------------------------------------------------------
// Test Helpers
// ---------------------------------------------------------------------------

function createMedia(overrides: Partial<StrapiMedia> = {}): StrapiMedia {
  return {
    id: 1,
    documentId: "media-001",
    url: "/uploads/about-hero.jpg",
    alternativeText: "About hero",
    name: "about-hero.jpg",
    width: 1920,
    height: 1080,
    formats: null,
    mime: "image/jpeg",
    size: 204800,
    ...overrides,
  };
}

function createAbout(overrides: Partial<About> = {}): About {
  return {
    id: 1,
    documentId: "about-001",
    title: "About Us",
    blocks: [
      {
        __component: "shared.quote" as const,
        title: "Our Mission",
        body: "We connect people with extraordinary properties.",
      },
      {
        __component: "shared.media" as const,
        file: createMedia(),
      },
    ],
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

beforeEach(() => {
  vi.resetModules();
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

describe("About Page (Server Component) — Monolith Design", () => {
  it("renders the about page title as monolith heading", async () => {
    vi.mocked(intake.about).mockResolvedValue(createAbout());

    const { default: AboutPage } = await import("./page");
    const result = await AboutPage();
    render(result);

    expect(
      screen.getByRole("heading", { name: /about us/i }),
    ).toBeInTheDocument();
  });

  it("renders dynamic zone blocks via DynamicZoneRenderer", async () => {
    vi.mocked(intake.about).mockResolvedValue(createAbout());

    const { default: AboutPage } = await import("./page");
    const result = await AboutPage();
    render(result);

    // The quote block content should be present
    expect(
      screen.getByText(/We connect people with extraordinary properties/),
    ).toBeInTheDocument();
    expect(screen.getByTestId("dynamic-zone")).toBeInTheDocument();
  });

  it("renders with null title — falls back to 'About Disrupt the Block'", async () => {
    vi.mocked(intake.about).mockResolvedValue(createAbout({ title: null }));

    const { default: AboutPage } = await import("./page");
    const result = await AboutPage();
    render(result);

    // Should render fallback heading and still render blocks
    expect(
      screen.getByRole("heading", { name: /about disrupt the block/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/We connect people with extraordinary properties/),
    ).toBeInTheDocument();
  });

  it("renders with empty blocks array — shows manifesto placeholder", async () => {
    vi.mocked(intake.about).mockResolvedValue(createAbout({ blocks: [] }));

    const { default: AboutPage } = await import("./page");
    const result = await AboutPage();
    render(result);

    // Title should still render
    expect(
      screen.getByRole("heading", { name: /about us/i }),
    ).toBeInTheDocument();

    // Should show placeholder manifesto text
    expect(
      screen.getByText(/Disrupt the Block operates as a singular point/i),
    ).toBeInTheDocument();
  });

  it("applies monolith layout structure", async () => {
    vi.mocked(intake.about).mockResolvedValue(createAbout());

    const { default: AboutPage } = await import("./page");
    const result = await AboutPage();
    const { container } = render(result);

    // The section should exist with correct aria label
    const section = container.querySelector("section[aria-label='About us']");
    expect(section).toBeInTheDocument();

    // Should have max-width constraint for content
    const innerDiv = section?.querySelector(".max-w-7xl");
    expect(innerDiv).toBeInTheDocument();
  });

  it("renders corner brand-marker badges", async () => {
    vi.mocked(intake.about).mockResolvedValue(createAbout());

    const { default: AboutPage } = await import("./page");
    const result = await AboutPage();
    render(result);

    // Top corner brand markers should be present
    expect(screen.getByText("Est. 2024")).toBeInTheDocument();
    expect(screen.getByText("Global Portfolio")).toBeInTheDocument();
  });

  it("renders stat grid with portfolio and approach", async () => {
    vi.mocked(intake.about).mockResolvedValue(createAbout());

    const { default: AboutPage } = await import("./page");
    const result = await AboutPage();
    render(result);

    expect(screen.getByText("Curated Estates")).toBeInTheDocument();
    expect(screen.getByText("White-Glove Service")).toBeInTheDocument();
  });

  it("renders CTA link to properties", async () => {
    vi.mocked(intake.about).mockResolvedValue(createAbout());

    const { default: AboutPage } = await import("./page");
    const result = await AboutPage();
    render(result);

    const cta = screen.getByRole("link", { name: /explore portfolio/i });
    expect(cta).toBeInTheDocument();
    expect(cta).toHaveAttribute("href", "/properties");
  });
});
