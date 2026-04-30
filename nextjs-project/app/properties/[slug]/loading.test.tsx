import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import PropertyLoading from "./loading";

describe("PropertyDetailLoading", () => {
  it("renders a hero placeholder with fullscreen height", () => {
    const { container } = render(<PropertyLoading />);

    const heroPlaceholder = container.querySelector(".h-screen");
    expect(heroPlaceholder).toBeInTheDocument();
  });

  it("renders gallery placeholder grid", () => {
    const { container } = render(<PropertyLoading />);

    // Should have grid placeholder items
    const gridItems = container.querySelectorAll(".aspect-\\[4\\/3\\]");
    expect(gridItems.length).toBeGreaterThan(0);
  });

  it("renders with animation pulse", () => {
    const { container } = render(<PropertyLoading />);

    const animated = container.querySelector(".animate-pulse");
    expect(animated).toBeInTheDocument();
  });

  it("has appropriate ARIA busy state", () => {
    render(<PropertyLoading />);

    const status = screen.getByRole("status");
    expect(status).toBeInTheDocument();
  });
});
