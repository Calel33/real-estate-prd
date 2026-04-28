import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CtaSection } from "./CtaSection";

describe("CtaSection", () => {
  it("renders the heading text", () => {
    render(<CtaSection />);

    expect(
      screen.getByRole("heading", { name: /interested/i }),
    ).toBeInTheDocument();
  });

  it("renders supporting description text", () => {
    render(<CtaSection />);

    expect(
      screen.getByText(/get in touch/i),
    ).toBeInTheDocument();
  });

  it("renders a Contact Us link pointing to /contact", () => {
    render(<CtaSection />);

    const link = screen.getByRole("link", { name: /contact us/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/contact");
  });

  it("renders with a section ARIA role", () => {
    const { container } = render(<CtaSection />);

    // Use a generic role since it's a content section
    const section = container.querySelector("section");
    expect(section).toBeInTheDocument();
  });

  it("applies glass gradient background treatment", () => {
    const { container } = render(<CtaSection />);

    // Should have glass shell gradient
    const glassShell = container.querySelector('[class*="gradient"]');
    expect(glassShell).toBeInTheDocument();

    // Should have a backdrop blur element
    const blur = container.querySelector('[class*="backdrop-blur"]');
    expect(blur).toBeInTheDocument();
  });
});
