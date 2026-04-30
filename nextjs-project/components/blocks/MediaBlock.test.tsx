import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MediaBlock } from "./MediaBlock";
import type { StrapiMedia } from "@/lib/schemas/strapi";

function createMedia(overrides: Partial<StrapiMedia> = {}): StrapiMedia {
  return {
    id: 1,
    documentId: "media-001",
    url: "/uploads/about-hero.jpg",
    alternativeText: "Aerial view of the ranch",
    name: "about-hero.jpg",
    width: 1920,
    height: 1080,
    formats: null,
    mime: "image/jpeg",
    size: 204800,
    ...overrides,
  };
}

const TEST_STRAPI_URL = "http://localhost:1337";

describe("MediaBlock", () => {
  it("renders an image with correct Strapi URL", () => {
    const file = createMedia();
    render(<MediaBlock file={file} strapiUrl={TEST_STRAPI_URL} />);

    const img = screen.getByRole("img");
    expect(img).toBeInTheDocument();
    // Next.js Image url-encodes the src into /_next/image
    const src = img.getAttribute("src") ?? "";
    expect(src).toContain("/_next/image");
    expect(src).toContain("localhost");
    expect(src).toContain("uploads");
  });

  it("renders with fill layout for responsive sizing", () => {
    const file = createMedia();
    render(<MediaBlock file={file} strapiUrl={TEST_STRAPI_URL} />);

    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("data-nimg", "fill");
  });

  it("uses alternativeText as accessible alt text", () => {
    const file = createMedia({ alternativeText: "Scenic mountain view" });
    render(<MediaBlock file={file} strapiUrl={TEST_STRAPI_URL} />);

    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("alt", "Scenic mountain view");
  });

  it("falls back to empty alt text when alternativeText is null", () => {
    const file = createMedia({ alternativeText: null });
    render(<MediaBlock file={file} strapiUrl={TEST_STRAPI_URL} />);

    // Empty alt="" makes the img role "presentation", so use querySelector
    const img = document.querySelector("img");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("alt", "");
  });

  it("renders nothing when file is null", () => {
    const { container } = render(
      <MediaBlock file={null as unknown as StrapiMedia} strapiUrl={TEST_STRAPI_URL} />,
    );

    // Should not render any image
    expect(container.querySelector("img")).toBeNull();
    // Should not render the figure wrapper
    expect(container.querySelector("figure")).toBeNull();
  });

  it("wraps image in a figure element", () => {
    const file = createMedia();
    render(<MediaBlock file={file} strapiUrl={TEST_STRAPI_URL} />);

    const figure = document.querySelector("figure");
    expect(figure).toBeInTheDocument();
  });

  it("applies glass treatment rounded corners to image container", () => {
    const file = createMedia();
    render(<MediaBlock file={file} strapiUrl={TEST_STRAPI_URL} />);

    // The image container div has the rounded-glass class
    const container = document.querySelector("figure > div");
    const className = container?.getAttribute("class") ?? "";
    expect(className).toContain("rounded-glass");
  });

  it("renders with object-cover for proper image cropping", () => {
    const file = createMedia();
    render(<MediaBlock file={file} strapiUrl={TEST_STRAPI_URL} />);

    const img = screen.getByRole("img");
    const className = img.getAttribute("class") ?? "";
    expect(className).toContain("object-cover");
  });

  it("maintains aspect-video ratio container", () => {
    const file = createMedia();
    render(<MediaBlock file={file} strapiUrl={TEST_STRAPI_URL} />);

    const figure = document.querySelector("figure");
    expect(figure).toBeInTheDocument();
    // The image container should have aspect-video
    const imageContainer = figure?.querySelector("div");
    const className = imageContainer?.getAttribute("class") ?? "";
    expect(className).toContain("aspect-video");
  });
});
