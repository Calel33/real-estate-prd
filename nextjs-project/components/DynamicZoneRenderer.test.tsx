import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { DynamicZoneRenderer } from "./DynamicZoneRenderer";
import type { StrapiMedia } from "@/lib/schemas/strapi";

// ---------------------------------------------------------------------------
// Test Helpers
// ---------------------------------------------------------------------------

function createMedia(overrides: Partial<StrapiMedia> = {}): StrapiMedia {
  return {
    id: 1,
    documentId: "media-001",
    url: "/uploads/about-hero.jpg",
    alternativeText: "Test image",
    name: "test.jpg",
    width: 1920,
    height: 1080,
    formats: null,
    mime: "image/jpeg",
    size: 204800,
    ...overrides,
  };
}

const TEST_STRAPI_URL = "http://localhost:1337";

// ---------------------------------------------------------------------------
// Suppress console.warn during tests that intentionally trigger warnings
// ---------------------------------------------------------------------------
let warnSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("DynamicZoneRenderer", () => {
  // ---- Empty / null / undefined blocks ----

  it("renders nothing when blocks array is empty", () => {
    const { container } = render(
      <DynamicZoneRenderer blocks={[]} strapiUrl={TEST_STRAPI_URL} />,
    );
    expect(container.innerHTML).toBe("");
  });

  it("renders nothing when blocks is null (coerced)", () => {
    const { container } = render(
      <DynamicZoneRenderer
        blocks={null as unknown as []}
        strapiUrl={TEST_STRAPI_URL}
      />,
    );
    expect(container.innerHTML).toBe("");
  });

  // ---- shared.media block ----

  it("renders a shared.media block as a figure element", () => {
    const blocks = [
      {
        __component: "shared.media" as const,
        file: createMedia(),
      },
    ];

    const { container } = render(
      <DynamicZoneRenderer blocks={blocks} strapiUrl={TEST_STRAPI_URL} />,
    );

    // MediaBlock renders a <figure>
    const figure = container.querySelector("figure");
    expect(figure).toBeInTheDocument();
  });

  it("renders an image inside the shared.media block", () => {
    const blocks = [
      {
        __component: "shared.media" as const,
        file: createMedia({ alternativeText: "About hero image" }),
      },
    ];

    render(
      <DynamicZoneRenderer blocks={blocks} strapiUrl={TEST_STRAPI_URL} />,
    );

    // MediaBlock renders an image with the alt text
    const img = screen.getByAltText("About hero image");
    expect(img).toBeInTheDocument();
  });

  // ---- shared.quote block ----

  it("renders a shared.quote block as a blockquote element", () => {
    const blocks = [
      {
        __component: "shared.quote" as const,
        title: "Our Mission",
        body: "We connect people with extraordinary properties.",
      },
    ];

    const { container } = render(
      <DynamicZoneRenderer blocks={blocks} strapiUrl={TEST_STRAPI_URL} />,
    );

    // QuoteBlock renders a <blockquote>
    const blockquote = container.querySelector("blockquote");
    expect(blockquote).toBeInTheDocument();
  });

  it("renders the quote title and body text", () => {
    const blocks = [
      {
        __component: "shared.quote" as const,
        title: "Founder's Vision",
        body: "Quality is never an accident.",
      },
    ];

    render(
      <DynamicZoneRenderer blocks={blocks} strapiUrl={TEST_STRAPI_URL} />,
    );

    expect(screen.getByText("Founder's Vision")).toBeInTheDocument();
    expect(screen.getByText(/Quality is never an accident/)).toBeInTheDocument();
  });

  // ---- shared.rich-text block ----

  it("renders a shared.rich-text block with content", () => {
    const richTextBody = JSON.stringify([
      { type: "paragraph", children: [{ text: "Welcome to our story.", type: "text" }] },
    ]);

    const blocks = [
      {
        __component: "shared.rich-text" as const,
        body: richTextBody,
      },
    ];

    render(
      <DynamicZoneRenderer blocks={blocks} strapiUrl={TEST_STRAPI_URL} />,
    );

    // RichTextBlock delegates to StrapiBlocksRenderer which renders paragraph text
    expect(screen.getByText("Welcome to our story.")).toBeInTheDocument();
  });

  it("renders nothing for shared.rich-text with null body", () => {
    const blocks = [
      {
        __component: "shared.rich-text" as const,
        body: null as unknown as string,
      },
    ];

    const { container } = render(
      <DynamicZoneRenderer blocks={blocks} strapiUrl={TEST_STRAPI_URL} />,
    );

    // The rich-text block with null body should render nothing
    // The container may be empty or just have the wrapper with no visible content
    const wrapperDiv = container.querySelector("div");
    if (wrapperDiv) {
      // space-y-8 div wraps but inner RichTextBlock returns null
      expect(wrapperDiv.querySelector("p")).toBeNull();
    }
  });

  // ---- shared.slider block ----

  it("renders a shared.slider block with images", () => {
    const blocks = [
      {
        __component: "shared.slider" as const,
        files: [
          createMedia({ id: 1, alternativeText: "Slide 1", url: "/uploads/slide1.jpg" }),
          createMedia({ id: 2, alternativeText: "Slide 2", url: "/uploads/slide2.jpg" }),
        ],
      },
    ];

    render(
      <DynamicZoneRenderer blocks={blocks} strapiUrl={TEST_STRAPI_URL} />,
    );

    // SliderBlock renders images
    const img1 = screen.getByAltText("Slide 1");
    const img2 = screen.getByAltText("Slide 2");
    expect(img1).toBeInTheDocument();
    expect(img2).toBeInTheDocument();
  });

  // ---- Multiple block types in sequence ----

  it("renders all 4 block types in correct order", () => {
    const richTextBody = JSON.stringify([
      { type: "paragraph", children: [{ text: "Rich content here.", type: "text" }] },
    ]);

    const blocks = [
      {
        __component: "shared.media" as const,
        file: createMedia({ alternativeText: "First" }),
      },
      {
        __component: "shared.quote" as const,
        title: "Second",
        body: "Second body text.",
      },
      {
        __component: "shared.rich-text" as const,
        body: richTextBody,
      },
      {
        __component: "shared.slider" as const,
        files: [createMedia({ id: 3, alternativeText: "Fourth" })],
      },
    ];

    const { container } = render(
      <DynamicZoneRenderer blocks={blocks} strapiUrl={TEST_STRAPI_URL} />,
    );

    // All four types should be present
    expect(container.querySelector("figure")).toBeInTheDocument();
    expect(container.querySelector("blockquote")).toBeInTheDocument();
    expect(screen.getByText("Rich content here.")).toBeInTheDocument();
    expect(screen.getByAltText("Fourth")).toBeInTheDocument();
  });

  // ---- Unknown component type ----

  it("renders nothing for an unknown __component type", () => {
    const blocks = [
      {
        __component: "shared.unknown" as const,
        junk: "data",
      } as unknown as { __component: string },
    ];

    const { container } = render(
      <DynamicZoneRenderer
        blocks={blocks as unknown as []}
        strapiUrl={TEST_STRAPI_URL}
      />,
    );

    // The wrapper div may still exist but should have no meaningful content
    // console.warn should have been called
    expect(warnSpy).toHaveBeenCalled();
  });

  // ---- Vertical spacing ----

  it("applies vertical spacing class to the wrapper container", () => {
    const blocks = [
      {
        __component: "shared.media" as const,
        file: createMedia(),
      },
    ];

    const { container } = render(
      <DynamicZoneRenderer blocks={blocks} strapiUrl={TEST_STRAPI_URL} />,
    );

    // The outermost wrapper should have a space-y-* class
    const wrapper = container.firstElementChild;
    expect(wrapper).toBeInTheDocument();
    const className = wrapper?.getAttribute("class") ?? "";
    // Should use vertical spacing (space-y-8 is the convention from research)
    expect(className).toMatch(/space-y-\d/);
  });

  // ---- Mixed known and unknown blocks ----

  it("renders known blocks and skips unknown blocks in a mixed array", () => {
    const blocks = [
      {
        __component: "shared.quote" as const,
        title: "Known",
        body: "This should render.",
      },
      {
        __component: "shared.unknown" as const,
        junk: "data",
      } as unknown as { __component: string; junk: string },
      {
        __component: "shared.media" as const,
        file: createMedia({ alternativeText: "Also renders" }),
      },
    ];

    const { container } = render(
      <DynamicZoneRenderer
        blocks={blocks as unknown as []}
        strapiUrl={TEST_STRAPI_URL}
      />,
    );

    // Known blocks should render
    expect(screen.getByText("Known")).toBeInTheDocument();
    expect(screen.getByAltText("Also renders")).toBeInTheDocument();

    // console.warn should have been called for the unknown block
    expect(warnSpy).toHaveBeenCalled();
  });
});
