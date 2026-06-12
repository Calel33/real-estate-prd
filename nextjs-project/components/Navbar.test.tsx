import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Navbar } from "./Navbar";

describe("Navbar", () => {
  it("renders the brand name", () => {
    render(<Navbar />);

    expect(screen.getByText("DTB")).toBeInTheDocument();
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

  it("renders the glass gradient shell with theme tokens", () => {
    render(<Navbar />);

    const nav = screen.getByRole("navigation", { name: "Main navigation" });

    // Shell uses rounded-glass-shell theme token
    const shell = nav.querySelector('[class*="rounded-glass-shell"]');
    expect(shell).toBeInTheDocument();

    // Inner surface uses rounded-glass theme token
    const inner = nav.querySelector('[class*="rounded-glass"]');
    expect(inner).toBeInTheDocument();
  });

  it("applies shadow-glass and backdrop blur for glass effect", () => {
    render(<Navbar />);

    const nav = screen.getByRole("navigation", { name: "Main navigation" });

    // Inner surface should have the shadow-glass theme utility
    const inner = nav.querySelector('[class*="shadow-glass"]');
    expect(inner).toBeInTheDocument();

    // Backdrop blur is applied
    const blurred = nav.querySelector('[class*="backdrop-blur"]');
    expect(blurred).toBeInTheDocument();
  });

  it("toggles mobile menu when hamburger is clicked", () => {
    render(<Navbar />);

    const hamburger = screen.getByLabelText("Toggle navigation menu");

    // Menu should not be visible initially
    expect(screen.queryByRole("list", { hidden: true })).toBeInTheDocument();
    // Desktop <ul> always exists but mobile <ul> should not yet contain links in a dropdown
    const roleLists = screen.getAllByRole("list");
    // Before toggle: only desktop ul exists (it has hidden md:flex, but is in DOM)
    // After toggle: mobile ul is added

    // Click to open
    fireEvent.click(hamburger);
    expect(hamburger).toHaveAttribute("aria-expanded", "true");

    // Now there should be two <ul> elements (desktop + mobile)
    const listsAfterOpen = screen.getAllByRole("list");
    expect(listsAfterOpen.length).toBeGreaterThanOrEqual(2);
  });

  it("closes mobile menu when a link is clicked", () => {
    render(<Navbar />);

    const hamburger = screen.getByLabelText("Toggle navigation menu");

    // Open menu
    fireEvent.click(hamburger);
    expect(hamburger).toHaveAttribute("aria-expanded", "true");

    // Click a link in the mobile menu — the second "Home" (mobile) or the only one visible
    // Find the mobile-specific link: the one in the dropdown div
    const mobileHomeLink = screen.getByText("Home", { selector: ".block" });
    fireEvent.click(mobileHomeLink);

    // Menu should close
    expect(hamburger).toHaveAttribute("aria-expanded", "false");
  });

  it("hamburger icon toggles between menu and close icon", () => {
    render(<Navbar />);

    const hamburger = screen.getByLabelText("Toggle navigation menu");

    // Initially shows hamburger (3 lines)
    const svg = hamburger.querySelector("svg");
    expect(svg?.querySelectorAll("line").length).toBe(3);

    // Click to open
    fireEvent.click(hamburger);

    // Now shows close icon (2 lines in X shape)
    const svgAfterOpen = hamburger.querySelector("svg");
    expect(svgAfterOpen?.querySelectorAll("line").length).toBe(2);
  });
});
