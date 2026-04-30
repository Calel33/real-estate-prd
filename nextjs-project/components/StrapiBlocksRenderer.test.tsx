import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StrapiBlocksRenderer } from "./StrapiBlocksRenderer";
import type { StrapiBlockNode } from "@/lib/schemas/strapi";

function paragraphNode(text: string, children?: StrapiBlockNode["children"]): StrapiBlockNode {
  return {
    type: "paragraph",
    children: children ?? [{ type: "text", text }],
  };
}

function headingNode(text: string, level = 2): StrapiBlockNode {
  return {
    type: "heading",
    level,
    children: [{ type: "text", text }],
  };
}

function boldChild(text: string): StrapiBlockNode["children"][number] {
  return { type: "text", text, bold: true };
}

function italicChild(text: string): StrapiBlockNode["children"][number] {
  return { type: "text", text, italic: true };
}

describe("StrapiBlocksRenderer", () => {
  it("renders null when blocks is null", () => {
    const { container } = render(<StrapiBlocksRenderer blocks={null} />);
    expect(container.innerHTML).toBe("");
  });

  it("renders null when blocks is empty array", () => {
    const { container } = render(<StrapiBlocksRenderer blocks={[]} />);
    expect(container.innerHTML).toBe("");
  });

  it("renders a paragraph with text", () => {
    render(
      <StrapiBlocksRenderer
        blocks={[paragraphNode("This is a description paragraph.")]}
      />,
    );

    expect(
      screen.getByText("This is a description paragraph."),
    ).toBeInTheDocument();
  });

  it("renders multiple paragraphs", () => {
    render(
      <StrapiBlocksRenderer
        blocks={[
          paragraphNode("First paragraph."),
          paragraphNode("Second paragraph."),
        ]}
      />,
    );

    expect(screen.getByText("First paragraph.")).toBeInTheDocument();
    expect(screen.getByText("Second paragraph.")).toBeInTheDocument();
  });

  it("renders a heading", () => {
    render(
      <StrapiBlocksRenderer
        blocks={[headingNode("About This Property", 2)]}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "About This Property" }),
    ).toBeInTheDocument();
  });

  it("renders bold text within a paragraph", () => {
    render(
      <StrapiBlocksRenderer
        blocks={[
          {
            type: "paragraph",
            children: [
              { type: "text", text: "Normal" },
              boldChild("bold text"),
              { type: "text", text: "after." },
            ],
          },
        ]}
      />,
    );

    expect(screen.getByText("Normal")).toBeInTheDocument();
    const boldEl = screen.getByText("bold text");
    expect(boldEl.tagName).toBe("STRONG");
    expect(screen.getByText("after.")).toBeInTheDocument();
  });

  it("renders italic text within a paragraph", () => {
    render(
      <StrapiBlocksRenderer
        blocks={[
          {
            type: "paragraph",
            children: [
              { type: "text", text: "Some " },
              italicChild("italic text"),
              { type: "text", text: " here." },
            ],
          },
        ]}
      />,
    );

    const italicEl = screen.getByText("italic text");
    expect(italicEl.tagName).toBe("EM");
  });
});
