import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Lightbox } from "./Lightbox";
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
    alternativeText: "Test image",
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

describe("Lightbox", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders nothing when isOpen is false", () => {
    const { container } = render(
      <Lightbox
        images={mockImages}
        strapiUrl={TEST_STRAPI_URL}
        currentIndex={0}
        isOpen={false}
        onClose={vi.fn()}
        onNavigate={vi.fn()}
      />,
    );

    expect(container.innerHTML).toBe("");
  });

  it("renders the current image when open", () => {
    render(
      <Lightbox
        images={mockImages}
        strapiUrl={TEST_STRAPI_URL}
        currentIndex={0}
        isOpen={true}
        onClose={vi.fn()}
        onNavigate={vi.fn()}
      />,
    );

    const img = screen.getByRole("img");
    expect(img).toBeInTheDocument();
    expect(img.getAttribute("src")).toContain("localhost:1337/uploads/1.jpg");
  });

  it("renders the image counter", () => {
    render(
      <Lightbox
        images={mockImages}
        strapiUrl={TEST_STRAPI_URL}
        currentIndex={1}
        isOpen={true}
        onClose={vi.fn()}
        onNavigate={vi.fn()}
      />,
    );

    expect(screen.getByText(/2 \/ 3/i)).toBeInTheDocument();
  });

  it("renders a close button", () => {
    render(
      <Lightbox
        images={mockImages}
        strapiUrl={TEST_STRAPI_URL}
        currentIndex={0}
        isOpen={true}
        onClose={vi.fn()}
        onNavigate={vi.fn()}
      />,
    );

    const closeBtn = screen.getByLabelText(/close/i);
    expect(closeBtn).toBeInTheDocument();
  });

  it("calls onClose when close button is clicked", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();

    render(
      <Lightbox
        images={mockImages}
        strapiUrl={TEST_STRAPI_URL}
        currentIndex={0}
        isOpen={true}
        onClose={onClose}
        onNavigate={vi.fn()}
      />,
    );

    const closeBtn = screen.getByLabelText(/close/i);
    await user.click(closeBtn);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when Escape key is pressed", () => {
    const onClose = vi.fn();

    render(
      <Lightbox
        images={mockImages}
        strapiUrl={TEST_STRAPI_URL}
        currentIndex={0}
        isOpen={true}
        onClose={onClose}
        onNavigate={vi.fn()}
      />,
    );

    fireEvent.keyDown(window, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onNavigate with prev index when ArrowLeft is pressed", () => {
    const onNavigate = vi.fn();

    render(
      <Lightbox
        images={mockImages}
        strapiUrl={TEST_STRAPI_URL}
        currentIndex={1}
        isOpen={true}
        onClose={vi.fn()}
        onNavigate={onNavigate}
      />,
    );

    fireEvent.keyDown(window, { key: "ArrowLeft" });
    expect(onNavigate).toHaveBeenCalledWith(0);
  });

  it("calls onNavigate with next index when ArrowRight is pressed", () => {
    const onNavigate = vi.fn();

    render(
      <Lightbox
        images={mockImages}
        strapiUrl={TEST_STRAPI_URL}
        currentIndex={0}
        isOpen={true}
        onClose={vi.fn()}
        onNavigate={onNavigate}
      />,
    );

    fireEvent.keyDown(window, { key: "ArrowRight" });
    expect(onNavigate).toHaveBeenCalledWith(1);
  });

  it("wraps to last image when ArrowLeft pressed on first image", () => {
    const onNavigate = vi.fn();

    render(
      <Lightbox
        images={mockImages}
        strapiUrl={TEST_STRAPI_URL}
        currentIndex={0}
        isOpen={true}
        onClose={vi.fn()}
        onNavigate={onNavigate}
      />,
    );

    fireEvent.keyDown(window, { key: "ArrowLeft" });
    expect(onNavigate).toHaveBeenCalledWith(2); // wraps to last
  });

  it("wraps to first image when ArrowRight pressed on last image", () => {
    const onNavigate = vi.fn();

    render(
      <Lightbox
        images={mockImages}
        strapiUrl={TEST_STRAPI_URL}
        currentIndex={2}
        isOpen={true}
        onClose={vi.fn()}
        onNavigate={onNavigate}
      />,
    );

    fireEvent.keyDown(window, { key: "ArrowRight" });
    expect(onNavigate).toHaveBeenCalledWith(0); // wraps to first
  });

  it("does not respond to keyboard when isOpen is false", () => {
    const onClose = vi.fn();
    const onNavigate = vi.fn();

    render(
      <Lightbox
        images={mockImages}
        strapiUrl={TEST_STRAPI_URL}
        currentIndex={0}
        isOpen={false}
        onClose={onClose}
        onNavigate={onNavigate}
      />,
    );

    fireEvent.keyDown(window, { key: "Escape" });
    fireEvent.keyDown(window, { key: "ArrowRight" });
    expect(onClose).not.toHaveBeenCalled();
    expect(onNavigate).not.toHaveBeenCalled();
  });

  it("renders image with alternative text", () => {
    render(
      <Lightbox
        images={mockImages}
        strapiUrl={TEST_STRAPI_URL}
        currentIndex={0}
        isOpen={true}
        onClose={vi.fn()}
        onNavigate={vi.fn()}
      />,
    );

    const img = screen.getByAltText("Image 1");
    expect(img).toBeInTheDocument();
  });
});
