import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Navbar } from "./Navbar";

describe("Navbar", () => {
  it("renders the brand name", () => {
    render(<Navbar />);

    expect(screen.getByText("Zenith")).toBeInTheDocument();
  });

  it("renders all four navigation links", () => {
    render(<Navbar />);

    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Properties")).toBeInTheDocument();
    expect(screen.getByText("About")).toBeInTheDocument();
    expect(screen.getByText("Contact")).toBeInTheDocument();
  });

  it("navigation links have correct hrefs", () => {
    render(<Navbar />);

    const homeLink = screen.getByText("Home").closest("a");
    const propertiesLink = screen.getByText("Properties").closest("a");
    const aboutLink = screen.getByText("About").closest("a");
    const contactLink = screen.getByText("Contact").closest("a");

    expect(homeLink).toHaveAttribute("href", "/");
    expect(propertiesLink).toHaveAttribute("href", "/properties");
    expect(aboutLink).toHaveAttribute("href", "/about");
    expect(contactLink).toHaveAttribute("href", "/contact");
  });

  it("renders with navigation ARIA role", () => {
    render(<Navbar />);

    const nav = screen.getByRole("navigation", { name: "Main navigation" });
    expect(nav).toBeInTheDocument();
  });

  it("has a mobile hamburger button", () => {
    render(<Navbar />);

    const hamburger = screen.getByLabelText("Toggle navigation menu");
    expect(hamburger).toBeInTheDocument();
    expect(hamburger.tagName).toBe("BUTTON");
  });

  it("hamburger starts in collapsed state", () => {
    render(<Navbar />);

    const hamburger = screen.getByLabelText("Toggle navigation menu");
    expect(hamburger).toHaveAttribute("aria-expanded", "false");
  });

  it("renders the glass surface gradient shell", () => {
    render(<Navbar />);

    const nav = screen.getByRole("navigation", { name: "Main navigation" });

    // The outer gradient shell should have the glass-shell radius
    const gradientShell = nav.querySelector(".rounded-\\[24px\\]");
    expect(gradientShell).toBeInTheDocument();

    // The inner surface should have the glass radius
    const innerSurface = nav.querySelector(".rounded-\\[23px\\]");
    expect(innerSurface).toBeInTheDocument();
  });

  it("applies backdrop blur for glass effect", () => {
    render(<Navbar />);

    const nav = screen.getByRole("navigation", { name: "Main navigation" });

    // The inner surface should have backdrop-blur
    const innerSurface = nav.querySelector(".backdrop-blur-\\[4px\\]");
    expect(innerSurface).toBeInTheDocument();
  });
});
