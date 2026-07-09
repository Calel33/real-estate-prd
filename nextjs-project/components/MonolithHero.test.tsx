import { describe, it, expect, vi } from "vitest";
import React from "react";
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
    render(<MonolithHero tagline="Real Assets. Digital Future." />);

    expect(screen.getByText("Real Assets. Digital Future.")).toBeInTheDocument();
  });

  it("shows brand headline", () => {
    render(<MonolithHero tagline="Real Assets. Digital Future." headline="DISRUPT\nTHE BLOCK" />);

    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toHaveTextContent(/DISRUPT/);
    expect(heading).toHaveTextContent(/THE BLOCK/);
  });

  it('shows "Explore the Portfolio" CTA', () => {
    render(<MonolithHero tagline="Real Assets. Digital Future." />);

    const cta = screen.getByRole("link", { name: /explore the portfolio/i });
    expect(cta).toBeInTheDocument();
    expect(cta).toHaveAttribute("href", "/properties");
  });

  it("renders side brand mark on large screens", () => {
    render(<MonolithHero tagline="Real Assets. Digital Future." />);

    expect(screen.getByText("D")).toBeInTheDocument();
    expect(screen.getByText("Digital Estates")).toBeInTheDocument();
  });

  it("renders description text", () => {
    render(<MonolithHero tagline="Real Assets. Digital Future." />);

    expect(
      screen.getByText(
        /Premium real estate\. On-chain liquidity\. Property that trades like any asset should\./i
      )
    ).toBeInTheDocument();
  });
});
