import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { GalleryPreview } from "./GalleryPreview";
import type { StrapiMedia } from "@/lib/schemas/strapi";

// Next.js Image component uses img under the hood in jsdom
// We don't need to mock it for rendering tests as long as remotePatterns is
// handled at the Next.js config level.

function createMedia(overrides: Partial<StrapiMedia> = {}): StrapiMedia {
  return {
    id: 1,
    documentId: "media-001",
    url: "/uploads/test.jpg",
    alternativeText: "Test image",
    name: "test.jpg",
    width: 800,
    height: 600,
    formats: null,
    mime: "image/jpeg",
    size: 102400,
    ...overrides,
  };
}

const TEST_STRAPI_URL = "http://localhost:1337";

describe("GalleryPreview", () => {
  it("renders section heading and description", () => {
    const images = [createMedia(), createMedia({ id: 2, documentId: "media-002" })];
    render(<GalleryPreview images={images} strapiUrl={TEST_STRAPI_URL} />);

    expect(
      screen.getByRole("heading", { name: /gallery preview/i }),
    ).toBeInTheDocument();

    expect(
      screen.getByText(/a glimpse of our properties/i),
    ).toBeInTheDocument();
  });

  it("renders all gallery images", () => {
    const images = [
      createMedia(),
      createMedia({ id: 2, documentId: "media-002", url: "/uploads/img2.jpg" }),
      createMedia({ id: 3, documentId: "media-003", url: "/uploads/img3.jpg" }),
    ];
    render(<GalleryPreview images={images} strapiUrl={TEST_STRAPI_URL} />);

    const imgElements = screen.getAllByRole("img");
    expect(imgElements).toHaveLength(3);
  });

  it("renders images with Next.js Image optimization attributes", () => {
    const images = [createMedia()];
    render(<GalleryPreview images={images} strapiUrl={TEST_STRAPI_URL} />);

    const img = screen.getByRole("img");
    // Next.js Image adds data-nimg attribute for its optimization layer
    expect(img).toHaveAttribute("data-nimg", "fill");
    // The Next.js Image src is the optimized URL (may be URL-encoded)
    const src = img.getAttribute("src") ?? "";
    expect(src).toContain("/_next/image");
    expect(src).toContain("localhost");
  });

  it("applies responsive grid layout classes", () => {
    const images = [createMedia(), createMedia({ id: 2, documentId: "media-002" })];
    const { container } = render(
      <GalleryPreview images={images} strapiUrl={TEST_STRAPI_URL} />,
    );

    // Find the grid container (the div with grid classes, inside the wrapper)
    const grid = container.querySelector('[class*="grid-cols-1"]');
    expect(grid).toBeInTheDocument();
  });

  it("handles empty images array gracefully", () => {
    const { container } = render(
      <GalleryPreview images={[]} strapiUrl={TEST_STRAPI_URL} />,
    );

    // No images should be rendered
    const imgs = container.querySelectorAll("img");
    expect(imgs).toHaveLength(0);

    // Heading should still show
    expect(
      screen.getByRole("heading", { name: /gallery preview/i }),
    ).toBeInTheDocument();
  });

  it("uses alternativeText for image alt attribute when available", () => {
    const images = [
      createMedia({ alternativeText: "A beautiful mountain view" }),
    ];
    render(<GalleryPreview images={images} strapiUrl={TEST_STRAPI_URL} />);

    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("alt", "A beautiful mountain view");
  });

  it("falls back to image name for alt when alternativeText is null", () => {
    const images = [
      createMedia({ alternativeText: null, name: "sunset.jpg" }),
    ];
    render(<GalleryPreview images={images} strapiUrl={TEST_STRAPI_URL} />);

    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("alt", "sunset.jpg");
  });
});
