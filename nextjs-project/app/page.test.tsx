import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import type { Property } from "@/lib/schemas/property";
import type { Global } from "@/lib/schemas/global";
import type { StrapiMedia } from "@/lib/schemas/strapi";

// Mock the fetch functions used by the Server Component
vi.mock("@/lib/fetch-property", () => ({
  fetchProperties: vi.fn(),
}));

vi.mock("@/lib/fetch-global", () => ({
  fetchGlobal: vi.fn(),
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

// Mock Next.js Link
vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    className,
  }: {
    href: string;
    children: React.ReactNode;
    className?: string;
  }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

// Import after mocking
import { fetchProperties } from "@/lib/fetch-property";
import { fetchGlobal } from "@/lib/fetch-global";

// Dynamic import of the page component
const HomePage = async () => {
  const { default: Page } = await import("./page");
  return Page;
};

function createMedia(overrides: Partial<StrapiMedia> = {}): StrapiMedia {
  return {
    id: 1,
    documentId: "media-001",
    url: "/uploads/hero.jpg",
    alternativeText: "Hero image",
    name: "hero.jpg",
    width: 1920,
    height: 1080,
    formats: null,
    mime: "image/jpeg",
    size: 204800,
    ...overrides,
  };
}

function createProperty(overrides: Partial<Property> = {}): Property {
  return {
    id: 1,
    documentId: "prop-001",
    title: "Sunset Valley Ranch",
    slug: "sunset-valley-ranch",
    location: "Austin, Texas",
    acreage: 500,
    propertyType: "ranch",
    description: null,
    heroImage: createMedia(),
    heroVideo: null,
    gallery: [
      createMedia({ id: 2, documentId: "media-002", url: "/uploads/gallery1.jpg" }),
      createMedia({ id: 3, documentId: "media-003", url: "/uploads/gallery2.jpg" }),
    ],
    mapImage: null,
    status: "published",
    publishedAt: "2026-04-01T00:00:00.000Z",
    createdAt: "2026-04-01T00:00:00.000Z",
    updatedAt: "2026-04-01T00:00:00.000Z",
    ...overrides,
  };
}

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
  vi.unstubAllEnvs();
});

describe("HomePage (Server Component)", () => {
  it("renders hero section with property title", async () => {
    vi.mocked(fetchProperties).mockResolvedValue([createProperty()]);
    vi.mocked(fetchGlobal).mockResolvedValue(createGlobal());

    const Page = await HomePage();
    const result = await Page();
    render(result);

    expect(
      screen.getByRole("heading", { name: /sunset valley ranch/i }),
    ).toBeInTheDocument();
  });

  it("renders View Details link with correct slug", async () => {
    vi.mocked(fetchProperties).mockResolvedValue([createProperty()]);
    vi.mocked(fetchGlobal).mockResolvedValue(createGlobal());

    const Page = await HomePage();
    const result = await Page();
    render(result);

    const link = screen.getByRole("link", { name: /view details/i });
    expect(link).toHaveAttribute("href", "/properties/sunset-valley-ranch");
  });

  it("renders gallery preview when gallery images exist", async () => {
    vi.mocked(fetchProperties).mockResolvedValue([createProperty()]);
    vi.mocked(fetchGlobal).mockResolvedValue(createGlobal());

    const Page = await HomePage();
    const result = await Page();
    render(result);

    expect(
      screen.getByRole("heading", { name: /gallery preview/i }),
    ).toBeInTheDocument();
  });

  it("renders CTA section", async () => {
    vi.mocked(fetchProperties).mockResolvedValue([createProperty()]);
    vi.mocked(fetchGlobal).mockResolvedValue(createGlobal());

    const Page = await HomePage();
    const result = await Page();
    render(result);

    expect(
      screen.getByRole("heading", { name: /interested/i }),
    ).toBeInTheDocument();
  });

  it("handles empty properties gracefully", async () => {
    vi.mocked(fetchProperties).mockResolvedValue([]);
    vi.mocked(fetchGlobal).mockResolvedValue(createGlobal());

    const Page = await HomePage();
    const result = await Page();
    render(result);

    // Should not have hero section content
    expect(
      screen.queryByRole("heading", { name: /sunset valley ranch/i }),
    ).not.toBeInTheDocument();
  });

  it("handles property with null gallery", async () => {
    vi.mocked(fetchProperties).mockResolvedValue([
      createProperty({ gallery: null }),
    ]);
    vi.mocked(fetchGlobal).mockResolvedValue(createGlobal());

    const Page = await HomePage();
    const result = await Page();
    render(result);

    // Gallery heading should still show (with "no images" message)
    expect(
      screen.getByRole("heading", { name: /gallery preview/i }),
    ).toBeInTheDocument();
  });

  it("handles property with null heroImage", async () => {
    vi.mocked(fetchProperties).mockResolvedValue([
      createProperty({ heroImage: null }),
    ]);
    vi.mocked(fetchGlobal).mockResolvedValue(createGlobal());

    const Page = await HomePage();
    const result = await Page();
    render(result);

    // Title and CTA should still render
    expect(
      screen.getByRole("heading", { name: /sunset valley ranch/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /view details/i }),
    ).toBeInTheDocument();
  });
});
