import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { QuoteBlock } from "./QuoteBlock";

describe("QuoteBlock", () => {
  it("renders the quote body text", () => {
    render(
      <QuoteBlock
        title="John Doe, Founder"
        body="This is an inspiring quote about real estate."
      />,
    );

    expect(
      screen.getByText(/This is an inspiring quote about real estate\./),
    ).toBeInTheDocument();
  });

  it("renders the title attribution", () => {
    render(
      <QuoteBlock title="Jane Smith" body="Quality is never an accident." />,
    );

    expect(screen.getByText(/Jane Smith/)).toBeInTheDocument();
  });

  it("renders title with font-display class", () => {
    render(
      <QuoteBlock title="Author Name" body="A thoughtful quote." />,
    );

    const titleEl = screen.getByText("Author Name");
    const className = titleEl.getAttribute("class") ?? "";
    expect(className).toContain("font-display");
  });

  it("renders title in primary text color", () => {
    render(
      <QuoteBlock title="Author Name" body="A thoughtful quote." />,
    );

    const titleEl = screen.getByText("Author Name");
    const className = titleEl.getAttribute("class") ?? "";
    expect(className).toContain("text-primary");
  });

  it("renders body with secondary/70 muted text styling", () => {
    render(
      <QuoteBlock title="Author" body="Some wise words here." />,
    );

    const bodyEl = screen.getByText(/Some wise words here\./);
    const className = bodyEl.getAttribute("class") ?? "";
    expect(className).toContain("text-secondary/70");
  });

  it("includes visual quote treatment via left border accent", () => {
    const { container } = render(
      <QuoteBlock title="Author" body="Quote text." />,
    );

    // The blockquote should have a left border treatment
    const blockquote = container.querySelector("blockquote");
    expect(blockquote).toBeInTheDocument();
    const className = blockquote?.getAttribute("class") ?? "";
    // Should have border-l-* for left border accent
    expect(className).toMatch(/border-l/);
    // Should have bg-surface for glass treatment
    expect(className).toContain("bg-surface");
  });

  it("renders body within a blockquote element", () => {
    const { container } = render(
      <QuoteBlock title="Author" body="Quote text." />,
    );

    const blockquote = container.querySelector("blockquote");
    expect(blockquote).toBeInTheDocument();
    expect(blockquote?.textContent).toContain("Quote text.");
  });

  it("uses responsive typography for the quote body", () => {
    const { container } = render(
      <QuoteBlock title="Author" body="Responsive quote text." />,
    );

    const blockquote = container.querySelector("blockquote");
    const className = blockquote?.getAttribute("class") ?? "";
    // Should have responsive text classes (e.g., text-lg md:text-xl)
    expect(className).toMatch(/md:text-/);
  });

  it("renders without title gracefully when title is empty string", () => {
    render(<QuoteBlock title="" body="Quote without attribution." />);

    // Body should still render
    expect(
      screen.getByText(/Quote without attribution\./),
    ).toBeInTheDocument();
    // Title element should not be present
    expect(
      screen.queryByRole("heading"),
    ).not.toBeInTheDocument();
  });

  it("applies italic styling to the quote body for visual distinction", () => {
    const { container } = render(
      <QuoteBlock title="Author" body="An italic quote." />,
    );

    // The quote body text should be italic
    const bodyEl = screen.getByText(/An italic quote\./);
    const className = bodyEl.getAttribute("class") ?? "";
    expect(className).toContain("italic");
  });
});
