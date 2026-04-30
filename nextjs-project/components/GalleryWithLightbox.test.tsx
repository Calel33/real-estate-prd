import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { GalleryWithLightbox } from "./GalleryWithLightbox";
import type { StrapiMedia } from "@/lib/schemas/strapi";

// Mock Next.js Image
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

const mockImages: StrapiMedia[] = [
  createMedia({ id: 1, documentId: "m1", url: "/uploads/1.jpg", alternativeText: "Image 1" }),
  createMedia({ id: 2, documentId: "m2", url: "/uploads/2.jpg", alternativeText: "Image 2" }),
  createMedia({ id: 3, documentId: "m3", url: "/uploads/3.jpg", alternativeText: "Image 3" }),
];

describe("GalleryWithLightbox", () => {
  it("renders the gallery grid", () => {
    render(
      <GalleryWithLightbox images={mockImages} strapiUrl={TEST_STRAPI_URL} />,
    );

    expect(
      screen.getByRole("heading", { name: /gallery/i }),
    ).toBeInTheDocument();
  });

  it("opens lightbox when an image is clicked", async () => {
    const user = userEvent.setup();

    render(
      <GalleryWithLightbox images={mockImages} strapiUrl={TEST_STRAPI_URL} />,
    );

    // Click the first gallery image button
    const imageButtons = screen.getAllByLabelText(/view/i);
    expect(imageButtons.length).toBeGreaterThan(0);

    await user.click(imageButtons[0]);

    // Lightbox should now be open — check for close button
    expect(screen.getByLabelText(/close lightbox/i)).toBeInTheDocument();
  });

  it("closes lightbox when close button is clicked", async () => {
    const user = userEvent.setup();

    render(
      <GalleryWithLightbox images={mockImages} strapiUrl={TEST_STRAPI_URL} />,
    );

    // Open lightbox
    const imageButtons = screen.getAllByLabelText(/view/i);
    await user.click(imageButtons[0]);

    // Close lightbox
    const closeBtn = screen.getByLabelText(/close lightbox/i);
    await user.click(closeBtn);

    // Lightbox should be closed
    expect(screen.queryByLabelText(/close lightbox/i)).not.toBeInTheDocument();
  });

  it("navigates to correct image when clicked", async () => {
    const user = userEvent.setup();

    render(
      <GalleryWithLightbox images={mockImages} strapiUrl={TEST_STRAPI_URL} />,
    );

    // Click the second image
    const imageButtons = screen.getAllByLabelText(/view/i);
    await user.click(imageButtons[1]);

    // Check that the lightbox shows the second image
    // Scope to dialog to avoid duplicates from the gallery grid
    const dialog = screen.getByRole("dialog");
    const lightboxImg = dialog.querySelector("img");
    expect(lightboxImg).toBeInTheDocument();
    expect(lightboxImg?.getAttribute("alt")).toBe("Image 2");
  });

  it("supports keyboard navigation in lightbox", async () => {
    const user = userEvent.setup();

    render(
      <GalleryWithLightbox images={mockImages} strapiUrl={TEST_STRAPI_URL} />,
    );

    // Open lightbox
    const imageButtons = screen.getAllByLabelText(/view/i);
    await user.click(imageButtons[0]);

    // Press Escape to close
    fireEvent.keyDown(window, { key: "Escape" });

    // Lightbox should be closed
    expect(screen.queryByLabelText(/close lightbox/i)).not.toBeInTheDocument();
  });
});
