import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { HeroSection } from "./HeroSection";
import type { Property } from "@/lib/schemas/property";
import type { StrapiMedia } from "@/lib/schemas/strapi";

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
    gallery: null,
    mapImage: null,
    status: "published",
    publishedAt: "2026-04-01T00:00:00.000Z",
    createdAt: "2026-04-01T00:00:00.000Z",
    updatedAt: "2026-04-01T00:00:00.000Z",
    ...overrides,
  };
}

const TEST_STRAPI_URL = "http://localhost:1337";

describe("HeroSection", () => {
  it("renders the property title", () => {
    const property = createProperty();
    render(<HeroSection property={property} strapiUrl={TEST_STRAPI_URL} />);

    expect(
      screen.getByRole("heading", { name: /sunset valley ranch/i }),
    ).toBeInTheDocument();
  });

  it("renders the location when available", () => {
    const property = createProperty();
    render(<HeroSection property={property} strapiUrl={TEST_STRAPI_URL} />);

    expect(screen.getByText(/austin, texas/i)).toBeInTheDocument();
  });

  it("renders a View Details link to the property slug", () => {
    const property = createProperty();
    render(<HeroSection property={property} strapiUrl={TEST_STRAPI_URL} />);

    const link = screen.getByRole("link", { name: /view details/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/properties/sunset-valley-ranch");
  });

  it("renders a hero image when heroImage is provided", () => {
    const property = createProperty();
    render(<HeroSection property={property} strapiUrl={TEST_STRAPI_URL} />);

    const img = screen.getByRole("img");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("data-nimg", "fill");
    // Next.js Image URL-encodes the src
    const src = img.getAttribute("src") ?? "";
    expect(src).toContain("/_next/image");
    expect(src).toContain("localhost");
  });

  it("renders a video element when heroVideo is provided", () => {
    const property = createProperty({
      heroImage: createMedia(),
      heroVideo: createMedia({
        id: 2,
        documentId: "media-002",
        url: "/uploads/hero.mp4",
        name: "hero.mp4",
        mime: "video/mp4",
        width: 1920,
        height: 1080,
      }),
    });
    render(<HeroSection property={property} strapiUrl={TEST_STRAPI_URL} />);

    const video = document.querySelector("video");
    expect(video).toBeInTheDocument();
    // Video should have autoplay, muted, loop, playsInline
    // In jsdom, these are reflected as properties, not attributes
    expect(video?.autoplay).toBe(true);
    expect(video?.muted).toBe(true);
    expect(video?.loop).toBe(true);
    expect(video?.playsInline).toBe(true);
    // Poster should be set to the hero image URL
    expect(video?.getAttribute("poster")).toContain("uploads/hero.jpg");
  });

  it("handles null heroImage gracefully (no image rendered)", () => {
    const property = createProperty({ heroImage: null });
    render(<HeroSection property={property} strapiUrl={TEST_STRAPI_URL} />);

    // No image should be present
    const imgs = document.querySelectorAll("img");
    // Next.js Image may render a placeholder, but no hero image with src
    const heroImgs = Array.from(imgs).filter(
      (img) => img.getAttribute("src")?.includes("uploads") ?? false,
    );
    expect(heroImgs).toHaveLength(0);

    // Title and CTA should still render
    expect(
      screen.getByRole("heading", { name: /sunset valley ranch/i }),
    ).toBeInTheDocument();
  });

  it("handles null location gracefully", () => {
    const property = createProperty({ location: null });
    render(<HeroSection property={property} strapiUrl={TEST_STRAPI_URL} />);

    // Title and CTA should still render
    expect(
      screen.getByRole("heading", { name: /sunset valley ranch/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /view details/i }),
    ).toBeInTheDocument();
  });

  it("applies fullscreen height", () => {
    const property = createProperty();
    const { container } = render(
      <HeroSection property={property} strapiUrl={TEST_STRAPI_URL} />,
    );

    const section = container.querySelector("section");
    expect(section).toBeInTheDocument();
    const className = section?.getAttribute("class") || "";
    expect(className).toContain("h-screen");
  });

  it("renders gradient overlay for content readability", () => {
    const property = createProperty();
    const { container } = render(
      <HeroSection property={property} strapiUrl={TEST_STRAPI_URL} />,
    );

    // Should have a gradient overlay element
    const overlay = container.querySelector('[class*="gradient-to-t"]');
    expect(overlay).toBeInTheDocument();
  });

  it("applies stronger gradient overlay when video is present", () => {
    const property = createProperty({
      heroVideo: createMedia({
        id: 2,
        documentId: "media-002",
        url: "/uploads/hero.mp4",
        name: "hero.mp4",
        mime: "video/mp4",
      }),
    });
    const { container } = render(
      <HeroSection property={property} strapiUrl={TEST_STRAPI_URL} />,
    );

    const overlay = container.querySelector('[class*="gradient-to-t"]');
    const className = overlay?.getAttribute("class") || "";
    // Video should use stronger gradient (from-background/70) for readability
    expect(className).toContain("from-background/70");
    // Should NOT use the image-only gradient
    expect(className).not.toMatch(/from-background(?![/\d])/);
  });

  it("does NOT hide content with sr-only when video is present", () => {
    const property = createProperty({
      heroVideo: createMedia({
        id: 2,
        documentId: "media-002",
        url: "/uploads/hero.mp4",
        name: "hero.mp4",
        mime: "video/mp4",
      }),
    });
    const { container } = render(
      <HeroSection property={property} strapiUrl={TEST_STRAPI_URL} />,
    );

    // Content overlay should NOT have sr-only class
    const contentOverlay = container.querySelector('[class*="flex-col"]');
    const className = contentOverlay?.getAttribute("class") || "";
    expect(className).not.toContain("sr-only");

    // Title should still be visible (not hidden)
    expect(
      screen.getByRole("heading", { name: /sunset valley ranch/i }),
    ).toBeInTheDocument();
  });

  it("applies text-shadow for legibility when video is present", () => {
    const property = createProperty({
      heroVideo: createMedia({
        id: 2,
        documentId: "media-002",
        url: "/uploads/hero.mp4",
        name: "hero.mp4",
        mime: "video/mp4",
      }),
    });
    const { container } = render(
      <HeroSection property={property} strapiUrl={TEST_STRAPI_URL} />,
    );

    const contentOverlay = container.querySelector('[class*="flex-col"]');
    const className = contentOverlay?.getAttribute("class") || "";
    expect(className).toContain("text-shadow");
  });

  it("does NOT apply text-shadow when video is absent", () => {
    const property = createProperty();
    const { container } = render(
      <HeroSection property={property} strapiUrl={TEST_STRAPI_URL} />,
    );

    const contentOverlay = container.querySelector('[class*="flex-col"]');
    const className = contentOverlay?.getAttribute("class") || "";
    expect(className).not.toContain("text-shadow");
  });

  it("renders custom children visibly when video is present", () => {
    const property = createProperty({
      heroVideo: createMedia({
        id: 2,
        documentId: "media-002",
        url: "/uploads/hero.mp4",
        name: "hero.mp4",
        mime: "video/mp4",
      }),
    });
    render(
      <HeroSection property={property} strapiUrl={TEST_STRAPI_URL}>
        <div data-testid="custom-content">Custom Overlay</div>
      </HeroSection>,
    );

    // Custom children should be rendered and visible
    const customContent = screen.getByTestId("custom-content");
    expect(customContent).toBeInTheDocument();
    expect(customContent).toHaveTextContent("Custom Overlay");
  });
});
