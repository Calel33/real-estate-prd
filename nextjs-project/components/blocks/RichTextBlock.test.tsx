/**
 * @vitest-environment jsdom
 *
 * Component tests for the RichTextBlock component.
 * Covers: rendering valid rich text JSON, null/empty body, invalid JSON.
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { RichTextBlock } from "./RichTextBlock";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Build a minimal valid StrapiBlocks JSON string (paragraph block). */
function makeBlocksJson(blocks: Array<Record<string, unknown>>): string {
  return JSON.stringify(blocks);
}

/** A single paragraph block with text. */
const paragraphBlock = {
  type: "paragraph",
  children: [{ type: "text", text: "Hello from rich text!" }],
};

/** A heading block. */
const headingBlock = {
  type: "heading",
  level: 2,
  children: [{ type: "text", text: "A Heading" }],
};

/** Multiple blocks (heading + paragraph). */
const multiBlocks = [headingBlock, paragraphBlock];

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("RichTextBlock", () => {
  // ----------
  // Happy path
  // ----------

  it("renders paragraph text from valid JSON body", () => {
    const body = makeBlocksJson([paragraphBlock]);
    render(<RichTextBlock body={body} />);

    expect(screen.getByText("Hello from rich text!")).toBeInTheDocument();
  });

  it("renders heading from valid JSON body", () => {
    const body = makeBlocksJson([headingBlock]);
    render(<RichTextBlock body={body} />);

    expect(screen.getByText("A Heading")).toBeInTheDocument();
  });

  it("renders multiple blocks from valid JSON body", () => {
    const body = makeBlocksJson(multiBlocks);
    render(<RichTextBlock body={body} />);

    expect(screen.getByText("A Heading")).toBeInTheDocument();
    expect(screen.getByText("Hello from rich text!")).toBeInTheDocument();
  });

  // ----------
  // Edge cases
  // ----------

  it("renders nothing when body is null", () => {
    const { container } = render(<RichTextBlock body={null} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders nothing when body is undefined", () => {
    const { container } = render(<RichTextBlock body={undefined} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders nothing when body is an empty string", () => {
    const { container } = render(<RichTextBlock body="" />);
    expect(container.firstChild).toBeNull();
  });

  it("renders nothing for invalid JSON body", () => {
    const { container } = render(<RichTextBlock body="not-valid-json" />);
    expect(container.firstChild).toBeNull();
  });

  it("renders nothing for JSON body that is not an array", () => {
    const { container } = render(
      <RichTextBlock body={JSON.stringify({ not: "an-array" })} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders nothing for empty JSON array body", () => {
    const { container } = render(
      <RichTextBlock body={JSON.stringify([])} />,
    );
    expect(container.firstChild).toBeNull();
  });

  // ----------
  // Formatting
  // ----------

  it("renders bold text from inline formatting", () => {
    const blockWithBold = {
      type: "paragraph",
      children: [
        { type: "text", text: "Normal " },
        { type: "text", text: "Bold Text", bold: true },
      ],
    };
    const body = makeBlocksJson([blockWithBold]);
    render(<RichTextBlock body={body} />);

    // "Normal " has trailing space which gets normalized by text matcher
    expect(screen.getByText(/^Normal/)).toBeInTheDocument();
    // The bold text should be rendered inside a <strong> element
    const strongElement = screen.getByText("Bold Text");
    expect(strongElement.tagName).toBe("STRONG");
  });

  it("renders links from inline formatting", () => {
    const blockWithLink = {
      type: "paragraph",
      children: [
        { type: "text", text: "Click " },
        {
          type: "text",
          text: "here",
          url: "https://example.com",
        },
      ],
    };
    const body = makeBlocksJson([blockWithLink]);
    render(<RichTextBlock body={body} />);

    const link = screen.getByText("here");
    expect(link.tagName).toBe("A");
    expect(link).toHaveAttribute("href", "https://example.com");
  });
});
