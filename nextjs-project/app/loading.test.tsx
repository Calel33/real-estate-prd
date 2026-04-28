import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import HomeLoading from "./loading";

describe("HomeLoading", () => {
  it("renders the loading skeleton", () => {
    const { container } = render(<HomeLoading />);

    // Should have animate-pulse for skeleton animation
    const pulse = container.querySelector('[class*="animate-pulse"]');
    expect(pulse).toBeInTheDocument();
  });

  it("renders a hero placeholder with fullscreen height", () => {
    const { container } = render(<HomeLoading />);

    // Should have a fullscreen hero placeholder
    const heroPlaceholder = container.querySelector('[class*="h-screen"]');
    expect(heroPlaceholder).toBeInTheDocument();
  });

  it("renders gallery grid placeholders", () => {
    const { container } = render(<HomeLoading />);

    // Should have the gallery grid structure
    const grid = container.querySelector('[class*="grid-cols-1"]');
    expect(grid).toBeInTheDocument();

    // Should have multiple placeholder items
    const placeholders = container.querySelectorAll('[class*="aspect-"]');
    expect(placeholders.length).toBeGreaterThan(0);
  });

  it("uses surface color for skeleton placeholders", () => {
    const { container } = render(<HomeLoading />);

    // Placeholders should use bg-surface/50
    const surface = container.querySelector('[class*="bg-surface"]');
    expect(surface).toBeInTheDocument();
  });
});
