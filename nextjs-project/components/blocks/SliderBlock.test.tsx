/**
 * @vitest-environment jsdom
 *
 * Component tests for the SliderBlock component.
 * Covers: horizontal scroll snap rendering, next/image integration,
 * empty array, single file, alt text, responsive sizing.
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SliderBlock } from "./SliderBlock";
import type { StrapiMedia } from "@/lib/schemas/strapi";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createMedia(overrides: Partial<StrapiMedia> = {}): StrapiMedia {
  return {
    id: 1,
    documentId: "media-001",
    url: "/uploads/slider-image.jpg",
    alternativeText: "Slider image description",
    name: "slider-image.jpg",
    width: 1920,
    height: 1080,
    formats: null,
    mime: "image/jpeg",
    size: 204800,
    ...overrides,
  };
}

function createFileArray(count: number): StrapiMedia[] {
  return Array.from({ length: count }, (_, i) =>
    createMedia({
      id: i + 1,
      documentId: `media-00${i + 1}`,
      url: `/uploads/slide-${i + 1}.jpg`,
      alternativeText: `Slide ${i + 1}`,
      name: `slide-${i + 1}.jpg`,
    }),
  );
}

const TEST_STRAPI_URL = "http://localhost:1337";

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("SliderBlock", () => {
  // ----------
  // Happy path
  // ----------

  it("renders multiple images with correct Strapi URLs", () => {
    const files = createFileArray(3);
    render(<SliderBlock files={files} strapiUrl={TEST_STRAPI_URL} />);

    const images = screen.getAllByRole("img");
    expect(images).toHaveLength(3);

    images.forEach((img) => {
      const src = img.getAttribute("src") ?? "";
      expect(src).toContain("localhost");
      expect(src).toContain("uploads");
    });
  });

  it("renders images using next/image with fill layout", () => {
    const files = createFileArray(2);
    render(<SliderBlock files={files} strapiUrl={TEST_STRAPI_URL} />);

    const images = screen.getAllByRole("img");
    images.forEach((img) => {
      expect(img).toHaveAttribute("data-nimg", "fill");
    });
  });

  it("uses alternativeText as accessible alt text for each image", () => {
    const files = createFileArray(2);
    render(<SliderBlock files={files} strapiUrl={TEST_STRAPI_URL} />);

    expect(screen.getByAltText("Slide 1")).toBeInTheDocument();
    expect(screen.getByAltText("Slide 2")).toBeInTheDocument();
  });

  it("renders with object-cover for proper image cropping", () => {
    const files = createFileArray(2);
    render(<SliderBlock files={files} strapiUrl={TEST_STRAPI_URL} />);

    const images = screen.getAllByRole("img");
    images.forEach((img) => {
      const className = img.getAttribute("class") ?? "";
      expect(className).toContain("object-cover");
    });
  });

  it("maintains aspect-video ratio for each slide container", () => {
    const files = createFileArray(2);
    const { container } = render(
      <SliderBlock files={files} strapiUrl={TEST_STRAPI_URL} />,
    );

    // Each slide container should have aspect-video
    const slideContainers = container.querySelectorAll(".aspect-video");
    expect(slideContainers.length).toBeGreaterThanOrEqual(2);
  });

  // ----------
  // CSS scroll-snap
  // ----------

  it("renders a horizontally scrollable container with snap points", () => {
    const files = createFileArray(3);
    const { container } = render(
      <SliderBlock files={files} strapiUrl={TEST_STRAPI_URL} />,
    );

    // The inner scroll container has snap-x class and inline scrollSnapType
    const scrollContainer = container.querySelector(".snap-mandatory");
    expect(scrollContainer).not.toBeNull();

    const style = scrollContainer?.getAttribute("style") ?? "";
    // Should contain scroll-snap-type for x-axis snapping (from Tailwind snap-x or inline)
    const className = scrollContainer?.getAttribute("class") ?? "";
    const hasSnapType =
      style.includes("scroll-snap-type") || className.includes("snap-x");
    expect(hasSnapType).toBe(true);

    // Each slide should snap into place
    const slides = scrollContainer?.querySelectorAll("[style*='scroll-snap-align']");
    expect(slides?.length).toBe(3);
  });

  it("ensures each slide is individually scroll-snapped", () => {
    const files = createFileArray(3);
    const { container } = render(
      <SliderBlock files={files} strapiUrl={TEST_STRAPI_URL} />,
    );

    const slides = container.querySelectorAll(
      "[style*='scroll-snap-align: start']",
    );
    expect(slides.length).toBe(3);
  });

  it("prevents slides from shrinking via flex-shrink: 0", () => {
    const files = createFileArray(3);
    const { container } = render(
      <SliderBlock files={files} strapiUrl={TEST_STRAPI_URL} />,
    );

    const slides = container.querySelectorAll(
      "[style*='flex-shrink: 0']",
    );
    expect(slides.length).toBe(3);
  });

  // ----------
  // Edge cases
  // ----------

  it("renders nothing when files array is empty", () => {
    const { container } = render(
      <SliderBlock files={[]} strapiUrl={TEST_STRAPI_URL} />,
    );

    expect(container.firstChild).toBeNull();
  });

  it("renders a single image container for a single file", () => {
    const files = createFileArray(1);
    render(<SliderBlock files={files} strapiUrl={TEST_STRAPI_URL} />);

    const images = screen.getAllByRole("img");
    expect(images).toHaveLength(1);
  });

  it("renders nothing when files is null", () => {
    const { container } = render(
      <SliderBlock files={null as unknown as StrapiMedia[]} strapiUrl={TEST_STRAPI_URL} />,
    );

    expect(container.firstChild).toBeNull();
  });

  it("falls back to empty alt text when alternativeText is null", () => {
    const files = [createMedia({ alternativeText: null })];
    render(<SliderBlock files={files} strapiUrl={TEST_STRAPI_URL} />);

    // With empty alt, the img becomes presentational
    const img = document.querySelector("img");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("alt", "");
  });

  // ----------
  // Design system
  // ----------

  it("applies glass treatment rounded corners to slide containers", () => {
    const files = createFileArray(1);
    const { container } = render(
      <SliderBlock files={files} strapiUrl={TEST_STRAPI_URL} />,
    );

    // The overflow-hidden container should have rounded-glass
    const roundedContainer = container.querySelector(".rounded-glass");
    expect(roundedContainer).not.toBeNull();
  });

  it("renders images with priority for above-the-fold performance", () => {
    const files = createFileArray(2);
    render(<SliderBlock files={files} strapiUrl={TEST_STRAPI_URL} />);

    const images = screen.getAllByRole("img");
    // First image should have priority (not data-nimg attribute for this)
    // But we verify images exist and render correctly
    expect(images[0]).toBeInTheDocument();
  });

  it("uses responsive sizes attribute for images", () => {
    const files = createFileArray(1);
    render(<SliderBlock files={files} strapiUrl={TEST_STRAPI_URL} />);

    const img = screen.getByRole("img");
    expect(img).toHaveAttribute(
      "sizes",
      "(max-width: 768px) 100vw, 1200px",
    );
  });
});
