import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import type { Property } from "@/lib/schemas/property";
import type { StrapiMedia } from "@/lib/schemas/strapi";

// Mock the fetch function used by the Server Component
vi.mock("@/lib/fetch-property", () => ({
  fetchProperty: vi.fn(),
}));

vi.mock("@/lib/env", () => ({
  getEnv: () => ({ STRAPI_URL: "http://localhost:1337" }),
}));

// Mock next/navigation
vi.mock("next/navigation", () => ({
  notFound: vi.fn(),
}));

// Mock Next.js Image to render as regular img for testing
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
import { fetchProperty } from "@/lib/fetch-property";

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

beforeEach(() => {
  vi.resetModules();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("Property Detail Page (Server Component)", () => {
  it("renders the property title", async () => {
    vi.mocked(fetchProperty).mockResolvedValue(createProperty());

    const { default: PropertyPage } = await import("./page");
    const result = await PropertyPage({
      params: Promise.resolve({ slug: "sunset-valley-ranch" }),
    });
    render(result);

    const headings = screen.getAllByRole("heading", {
      name: /sunset valley ranch/i,
    });
    expect(headings.length).toBeGreaterThanOrEqual(1);
  });

  it("renders the property location", async () => {
    vi.mocked(fetchProperty).mockResolvedValue(createProperty());

    const { default: PropertyPage } = await import("./page");
    const result = await PropertyPage({
      params: Promise.resolve({ slug: "sunset-valley-ranch" }),
    });
    render(result);

    const locations = screen.getAllByText(/austin, texas/i);
    expect(locations.length).toBeGreaterThanOrEqual(1);
  });

  it("renders the property acreage", async () => {
    vi.mocked(fetchProperty).mockResolvedValue(createProperty());

    const { default: PropertyPage } = await import("./page");
    const result = await PropertyPage({
      params: Promise.resolve({ slug: "sunset-valley-ranch" }),
    });
    render(result);

    expect(screen.getByText(/500/i)).toBeInTheDocument();
  });

  it("renders the contact CTA link", async () => {
    vi.mocked(fetchProperty).mockResolvedValue(createProperty());

    const { default: PropertyPage } = await import("./page");
    const result = await PropertyPage({
      params: Promise.resolve({ slug: "sunset-valley-ranch" }),
    });
    render(result);

    const link = screen.getByRole("link", { name: /contact/i });
    expect(link).toHaveAttribute("href", "/contact");
  });

  it("renders the property type", async () => {
    vi.mocked(fetchProperty).mockResolvedValue(createProperty());

    const { default: PropertyPage } = await import("./page");
    const result = await PropertyPage({
      params: Promise.resolve({ slug: "sunset-valley-ranch" }),
    });
    render(result);

    const types = screen.getAllByText(/ranch/i);
    expect(types.length).toBeGreaterThanOrEqual(1);
  });

  it("renders the description when provided", async () => {
    vi.mocked(fetchProperty).mockResolvedValue(
      createProperty({
        description: [
          { type: "paragraph", children: [{ type: "text", text: "A beautiful ranch estate with mountain views." }] },
        ],
      }),
    );

    const { default: PropertyPage } = await import("./page");
    const result = await PropertyPage({
      params: Promise.resolve({ slug: "sunset-valley-ranch" }),
    });
    render(result);

    expect(
      screen.getByText("A beautiful ranch estate with mountain views."),
    ).toBeInTheDocument();
  });

  it("renders the gallery grid with images", async () => {
    vi.mocked(fetchProperty).mockResolvedValue(createProperty());

    const { default: PropertyPage } = await import("./page");
    const result = await PropertyPage({
      params: Promise.resolve({ slug: "sunset-valley-ranch" }),
    });
    render(result);

    expect(
      screen.getByRole("heading", { name: /gallery/i }),
    ).toBeInTheDocument();
  });

  it("renders map image when mapImage is provided", async () => {
    vi.mocked(fetchProperty).mockResolvedValue(
      createProperty({
        mapImage: createMedia({
          id: 10,
          documentId: "media-010",
          url: "/uploads/map.jpg",
          alternativeText: "Property map",
          name: "map.jpg",
        }),
      }),
    );

    const { default: PropertyPage } = await import("./page");
    const result = await PropertyPage({
      params: Promise.resolve({ slug: "sunset-valley-ranch" }),
    });
    render(result);

    expect(
      screen.getByRole("heading", { name: /location/i }),
    ).toBeInTheDocument();
  });

  it("does not render map section when mapImage is null", async () => {
    vi.mocked(fetchProperty).mockResolvedValue(
      createProperty({ mapImage: null }),
    );

    const { default: PropertyPage } = await import("./page");
    const result = await PropertyPage({
      params: Promise.resolve({ slug: "sunset-valley-ranch" }),
    });
    render(result);

    expect(
      screen.queryByRole("heading", { name: /location/i }),
    ).not.toBeInTheDocument();
  });
});
