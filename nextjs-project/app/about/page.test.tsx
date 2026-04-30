import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import type { About } from "@/lib/schemas/about";
import type { StrapiMedia } from "@/lib/schemas/strapi";

// Mock the fetch function used by the Server Component
vi.mock("@/lib/fetch-about", () => ({
  fetchAbout: vi.fn(),
}));

vi.mock("@/lib/env", () => ({
  getEnv: () => ({ STRAPI_URL: "http://localhost:1337" }),
}));

// Mock Next.js Image to render as a regular img for testing
vi.mock("next/image", () => ({
  default: (props: {
    src: string;
    alt: string;
    fill?: boolean;
    priority?: boolean;
    sizes?: string;
    className?: string;
  }) => (
    <img
      src={props.src}
      alt={props.alt}
      data-nimg={props.fill ? "fill" : undefined}
      className={props.className}
    />
  ),
}));

// Import after mocking
import { fetchAbout } from "@/lib/fetch-about";

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

describe("About Page (Server Component)", () => {
  it("renders the about page title", async () => {
    vi.mocked(fetchAbout).mockResolvedValue(createAbout());

    const { default: AboutPage } = await import("./page");
    const result = await AboutPage();
    render(result);

    expect(
      screen.getByRole("heading", { name: /about us/i }),
    ).toBeInTheDocument();
  });

  it("renders dynamic zone blocks via DynamicZoneRenderer", async () => {
    vi.mocked(fetchAbout).mockResolvedValue(createAbout());

    const { default: AboutPage } = await import("./page");
    const result = await AboutPage();
    render(result);

    // The quote block content should be present
    expect(
      screen.getByText(/We connect people with extraordinary properties/),
    ).toBeInTheDocument();
  });

  it("renders with null title gracefully", async () => {
    vi.mocked(fetchAbout).mockResolvedValue(createAbout({ title: null }));

    const { default: AboutPage } = await import("./page");
    const result = await AboutPage();
    render(result);

    // Should still render blocks even without title
    expect(
      screen.getByText(/We connect people with extraordinary properties/),
    ).toBeInTheDocument();
  });

  it("renders with empty blocks array", async () => {
    vi.mocked(fetchAbout).mockResolvedValue(createAbout({ blocks: [] }));

    const { default: AboutPage } = await import("./page");
    const result = await AboutPage();
    render(result);

    // Title should still render
    expect(
      screen.getByRole("heading", { name: /about us/i }),
    ).toBeInTheDocument();
  });

  it("applies responsive layout classes", async () => {
    vi.mocked(fetchAbout).mockResolvedValue(createAbout());

    const { default: AboutPage } = await import("./page");
    const result = await AboutPage();
    const { container } = render(result);

    // The inner content container should have max-width constraint
    const main = container.querySelector("main");
    expect(main).toBeInTheDocument();
    const innerDiv = main?.querySelector("div");
    expect(innerDiv).toBeInTheDocument();
    const className = innerDiv?.getAttribute("class") ?? "";
    expect(className).toContain("max-w-7xl");
  });

  it("uses correct page container structure", async () => {
    vi.mocked(fetchAbout).mockResolvedValue(createAbout());

    const { default: AboutPage } = await import("./page");
    const result = await AboutPage();
    const { container } = render(result);

    // Should have a main landmark
    const main = container.querySelector("main");
    expect(main).toBeInTheDocument();
  });
});
