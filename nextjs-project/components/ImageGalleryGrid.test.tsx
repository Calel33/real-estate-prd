import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ImageGalleryGrid } from "./ImageGalleryGrid";
import type { StrapiMedia } from "@/lib/schemas/strapi";

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

function createMedia(overrides: Partial<StrapiMedia> = {}): StrapiMedia {
  return {
    id: 1,
    documentId: "media-001",
    url: "/uploads/image.jpg",
    alternativeText: "Gallery image",
    name: "image.jpg",
    width: 1920,
    height: 1080,
    formats: null,
    mime: "image/jpeg",
    size: 204800,
    ...overrides,
  };
}

const TEST_STRAPI_URL = "http://localhost:1337";

describe("ImageGalleryGrid", () => {
  it("renders all images", () => {
    const images = [
      createMedia({ id: 1, documentId: "m1" }),
      createMedia({ id: 2, documentId: "m2" }),
      createMedia({ id: 3, documentId: "m3" }),
    ];

    render(<ImageGalleryGrid images={images} strapiUrl={TEST_STRAPI_URL} />);

    const allImgs = screen.getAllByRole("img");
    // Each image renders an <img> via the mock
    expect(allImgs.length).toBe(3);
  });

  it("renders a section with gallery ARIA label", () => {
    const images = [createMedia()];

    const { container } = render(
      <ImageGalleryGrid images={images} strapiUrl={TEST_STRAPI_URL} />,
    );

    const section = container.querySelector("section");
    expect(section).toHaveAttribute("aria-label", "Property image gallery");
  });

  it("renders empty state when no images", () => {
    const { container } = render(
      <ImageGalleryGrid images={[]} strapiUrl={TEST_STRAPI_URL} />,
    );

    expect(screen.getByText(/no gallery images available/i)).toBeInTheDocument();
    // Should still render a section element
    expect(container.querySelector("section")).toBeInTheDocument();
  });

  it("renders gallery heading", () => {
    const images = [createMedia()];

    render(<ImageGalleryGrid images={images} strapiUrl={TEST_STRAPI_URL} />);

    expect(
      screen.getByRole("heading", { name: /gallery/i }),
    ).toBeInTheDocument();
  });

  it("each image has the correct src prefix", () => {
    const images = [createMedia({ url: "/uploads/gallery1.jpg" })];

    render(<ImageGalleryGrid images={images} strapiUrl={TEST_STRAPI_URL} />);

    const img = screen.getByRole("img");
    // Next.js Image mock renders the raw src
    expect(img.getAttribute("src")).toContain("localhost:1337/uploads/gallery1.jpg");
  });
});
