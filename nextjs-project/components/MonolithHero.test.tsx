import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MonolithHero } from "./MonolithHero";

// Mock next/image
vi.mock("next/image", () => ({
  default: (props: { src: string; alt: string; fill?: boolean; priority?: boolean; sizes?: string; className?: string }) =>
    <img src={props.src} alt={props.alt} data-fill={props.fill ? "true" : undefined} className={props.className} />,
}));

// Mock next/link
vi.mock("next/link", () => ({
  default: ({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) =>
    <a href={href} className={className}>{children}</a>,
}));

describe("MonolithHero", () => {
  it("renders tagline", () => {
    render(<MonolithHero tagline="Zenith Real Estate" />);

    expect(screen.getByText("Zenith Real Estate")).toBeInTheDocument();
  });

  it("shows brand headline", () => {
    render(<MonolithHero tagline="Zenith" />);

    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toHaveTextContent(/Zenith/);
    expect(heading).toHaveTextContent(/Estates/);
  });

  it('shows "Access Portfolio" CTA', () => {
    render(<MonolithHero tagline="Zenith" />);

    const cta = screen.getByRole("link", { name: /access portfolio/i });
    expect(cta).toBeInTheDocument();
    expect(cta).toHaveAttribute("href", "/properties");
  });

  it("renders side brand mark on large screens", () => {
    render(<MonolithHero tagline="Zenith" />);

    expect(screen.getByText("Z")).toBeInTheDocument();
    expect(screen.getByText("Curated Estates")).toBeInTheDocument();
  });

  it("renders description text", () => {
    render(<MonolithHero tagline="Zenith" />);

    expect(screen.getByText(/Exceptional properties curated/i)).toBeInTheDocument();
  });
});
