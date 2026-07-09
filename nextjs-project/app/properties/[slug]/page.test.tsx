import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import type { Property } from "@/lib/schemas/property";
import type { StrapiMedia } from "@/lib/schemas/strapi";

// Mock the fetch function used by the Server Component
vi.mock("@/lib/intake", () => ({
  intake: {
    property: vi.fn(),
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
import { intake } from "@/lib/intake";

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
    map: null,
    mapImage: null,
    ft2: 21780000,
    propertyId: "PROP-001",
    ownership: "Fractional / Tokenized",
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
    vi.mocked(intake.property).mockResolvedValue(createProperty());

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

  it("hides default property details in the hero header", async () => {
    vi.mocked(intake.property).mockResolvedValue(
      createProperty({
        title: "Emri Village",
        slug: "emri-village",
        location: "Cayo District, Belize",
      }),
    );

    const { default: PropertyPage } = await import("./page");
    const result = await PropertyPage({
      params: Promise.resolve({ slug: "emri-village" }),
    });
    render(result);

    const hero = screen.getByRole("region", { name: /featured property/i });
    expect(
      within(hero).queryByRole("heading", { name: /emri village/i }),
    ).not.toBeInTheDocument();
    expect(
      within(hero).queryByText(/cayo district, belize/i),
    ).not.toBeInTheDocument();
    expect(
      within(hero).queryByRole("link", { name: /view details/i }),
    ).not.toBeInTheDocument();
  });

  it("renders default property details in the hero header for non-Emri properties", async () => {
    vi.mocked(intake.property).mockResolvedValue(createProperty());

    const { default: PropertyPage } = await import("./page");
    const result = await PropertyPage({
      params: Promise.resolve({ slug: "sunset-valley-ranch" }),
    });
    render(result);

    const hero = screen.getByRole("region", { name: /featured property/i });
    expect(
      within(hero).getByRole("heading", { name: /sunset valley ranch/i }),
    ).toBeInTheDocument();
    expect(within(hero).getByText(/austin, texas/i)).toBeInTheDocument();
  });

  it("links the Emri waitlist CTA to contact", async () => {
    vi.mocked(intake.property).mockResolvedValue(
      createProperty({
        title: "Emri Village",
        slug: "emri-village",
        location: "Cayo District, Belize",
      }),
    );

    const { default: PropertyPage } = await import("./page");
    const result = await PropertyPage({
      params: Promise.resolve({ slug: "emri-village" }),
    });
    render(result);

    expect(screen.getByRole("link", { name: /join waitlist/i })).toHaveAttribute(
      "href",
      "/contact",
    );
  });

  it("does not render hardcoded Emri highlights", async () => {
    vi.mocked(intake.property).mockResolvedValue(
      createProperty({
        title: "Emri Village",
        slug: "emri-village",
        location: "Cayo District, Belize",
      }),
    );

    const { default: PropertyPage } = await import("./page");
    const result = await PropertyPage({
      params: Promise.resolve({ slug: "emri-village" }),
    });
    render(result);

    expect(screen.queryByText(/utility-ready parcel/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/direct highway access/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/just 20 minutes from belmopan/i)).not.toBeInTheDocument();
  });

  it("renders the property location", async () => {
    vi.mocked(intake.property).mockResolvedValue(createProperty());

    const { default: PropertyPage } = await import("./page");
    const result = await PropertyPage({
      params: Promise.resolve({ slug: "sunset-valley-ranch" }),
    });
    render(result);

    const locations = screen.getAllByText(/austin, texas/i);
    expect(locations.length).toBeGreaterThanOrEqual(1);
  });

  it("renders the property acreage", async () => {
    vi.mocked(intake.property).mockResolvedValue(createProperty());

    const { default: PropertyPage } = await import("./page");
    const result = await PropertyPage({
      params: Promise.resolve({ slug: "sunset-valley-ranch" }),
    });
    render(result);

    expect(screen.getByText(/500/i)).toBeInTheDocument();
  });

  it("renders the contact CTA link", async () => {
    vi.mocked(intake.property).mockResolvedValue(createProperty());

    const { default: PropertyPage } = await import("./page");
    const result = await PropertyPage({
      params: Promise.resolve({ slug: "sunset-valley-ranch" }),
    });
    render(result);

    const link = screen.getByRole("link", { name: /contact/i });
    expect(link).toHaveAttribute("href", "/contact");
  });

  it("renders the property type", async () => {
    vi.mocked(intake.property).mockResolvedValue(createProperty());

    const { default: PropertyPage } = await import("./page");
    const result = await PropertyPage({
      params: Promise.resolve({ slug: "sunset-valley-ranch" }),
    });
    render(result);

    const types = screen.getAllByText(/ranch/i);
    expect(types.length).toBeGreaterThanOrEqual(1);
  });

  it("renders the description when provided", async () => {
    vi.mocked(intake.property).mockResolvedValue(
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
    vi.mocked(intake.property).mockResolvedValue(createProperty());

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
    vi.mocked(intake.property).mockResolvedValue(
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

  it("renders map field coordinates when map is provided", async () => {
    vi.mocked(intake.property).mockResolvedValue(
      createProperty({
        location: null,
        map: {
          place_name: "Cayo District, Belize",
          geometry: { type: "Point", coordinates: [-88.9, 17.2] },
        },
        mapImage: null,
      }),
    );

    const { default: PropertyPage } = await import("./page");
    const result = await PropertyPage({
      params: Promise.resolve({ slug: "sunset-valley-ranch" }),
    });
    render(result);

    expect(
      screen.getByTitle("Map of Sunset Valley Ranch"),
    ).toHaveAttribute("src", expect.stringContaining("17.2%2C-88.9"));
  });

  it("uses Emri Village Belize as the map fallback location", async () => {
    vi.mocked(intake.property).mockResolvedValue(
      createProperty({
        title: "Emri Village",
        slug: "emri-village",
        location: "Cayo District, Belize",
        map: null,
        mapImage: null,
      }),
    );

    const { default: PropertyPage } = await import("./page");
    const result = await PropertyPage({
      params: Promise.resolve({ slug: "emri-village" }),
    });
    render(result);

    expect(screen.getByTitle("Map of Emri Village")).toHaveAttribute(
      "src",
      expect.stringContaining("Emri%20Village%2C%20Belize"),
    );
  });

  it("does not render map section when map data and mapImage are null", async () => {
    vi.mocked(intake.property).mockResolvedValue(
      createProperty({ location: null, map: null, mapImage: null }),
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
