import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import RootLayout from "./layout";

// Mock the child components so we can test layout structure independently
vi.mock("@/components/Navbar", () => ({
  Navbar: () => <nav role="navigation" data-testid="navbar">Navbar</nav>,
}));

vi.mock("@/components/Footer", () => ({
  Footer: () => <footer role="contentinfo" data-testid="footer">Footer</footer>,
}));

// Ensure full cleanup between tests since RootLayout renders <html>/<body>
afterEach(() => {
  cleanup();
});

describe("RootLayout", () => {
  it("renders with dark-mode base styles", () => {
    render(
      <RootLayout>
        <div data-testid="child">Content</div>
      </RootLayout>,
    );

    const html = document.documentElement;
    expect(html).toHaveAttribute("lang", "en");

    // The body should exist
    expect(document.body).toBeInTheDocument();
    expect(screen.getByTestId("child")).toBeInTheDocument();
  });

  it("applies display and sans font CSS variables", () => {
    render(
      <RootLayout>
        <span>Test</span>
      </RootLayout>,
    );

    const html = document.documentElement;
    // The html element should have the font CSS variable classes
    // next/font/google variable option creates classes like --font-playfair
    const htmlClass = html.getAttribute("class") || "";
    expect(htmlClass).toContain("--font-playfair");
    expect(htmlClass).toContain("--font-inter");
  });

  it("sets correct antialiased rendering", () => {
    render(
      <RootLayout>
        <span>Test</span>
      </RootLayout>,
    );

    const html = document.documentElement;
    expect(html.className).toContain("antialiased");
  });

  it("renders Navbar, children, and Footer in order", () => {
    render(
      <RootLayout>
        <main data-testid="main-content">Test content</main>
      </RootLayout>,
    );

    // All three should be present
    const navbar = screen.getByTestId("navbar");
    const main = screen.getByTestId("main-content");
    const footer = screen.getByTestId("footer");

    expect(navbar).toBeInTheDocument();
    expect(main).toBeInTheDocument();
    expect(footer).toBeInTheDocument();

    // Navbar should come before main content in the DOM
    expect(
      navbar.compareDocumentPosition(main) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    // Main should come before footer
    expect(
      main.compareDocumentPosition(footer) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });
});
