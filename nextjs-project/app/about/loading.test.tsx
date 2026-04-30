import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import AboutLoading from "./loading";

describe("AboutLoading", () => {
  it("renders a title placeholder matching font-display sizing", () => {
    const { container } = render(<AboutLoading />);

    const titlePlaceholder = container.querySelector(".h-12");
    expect(titlePlaceholder).toBeInTheDocument();
  });

  it("renders varied-height block placeholders", () => {
    const { container } = render(<AboutLoading />);

    // Should have tall placeholder (aspect-video-like) for media/slider blocks
    const tallPlaceholder = container.querySelector(".aspect-video");
    expect(tallPlaceholder).toBeInTheDocument();

    // Should have medium-height placeholder for quote/text blocks
    const mediumPlaceholders = container.querySelectorAll(".h-24");
    expect(mediumPlaceholders.length).toBeGreaterThan(0);
  });

  it("renders with animation pulse", () => {
    const { container } = render(<AboutLoading />);

    const animated = container.querySelector(".animate-pulse");
    expect(animated).toBeInTheDocument();
  });

  it("has appropriate ARIA busy state", () => {
    render(<AboutLoading />);

    const status = screen.getByRole("status");
    expect(status).toBeInTheDocument();
    expect(status).toHaveAttribute("aria-label");
  });

  it("uses design system surface color for placeholders", () => {
    const { container } = render(<AboutLoading />);

    // All skeleton placeholders should use bg-surface/50
    const placeholders = container.querySelectorAll(".bg-surface\\/50");
    expect(placeholders.length).toBeGreaterThanOrEqual(3);
  });

  it("applies responsive container matching about page layout", () => {
    const { container } = render(<AboutLoading />);

    const inner = container.querySelector(".max-w-7xl");
    expect(inner).toBeInTheDocument();
  });
});
