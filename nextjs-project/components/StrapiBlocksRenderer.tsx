import React from "react";
import type { StrapiBlockNode, StrapiBlocks } from "@/lib/schemas/strapi";

interface StrapiBlocksRendererProps {
  blocks: StrapiBlocks | null;
}

/**
 * Renders Strapi rich text blocks into HTML elements.
 * Supports paragraph, heading, bold, italic, underline, strikethrough,
 * code, and link inline formatting.
 */
export function StrapiBlocksRenderer({ blocks }: StrapiBlocksRendererProps) {
  if (!blocks || blocks.length === 0) return null;

  return (
    <div className="space-y-4">
      {blocks.map((block, index) => (
        <BlockNode key={index} node={block} />
      ))}
    </div>
  );
}

function BlockNode({ node }: { node: StrapiBlockNode }) {
  switch (node.type) {
    case "paragraph":
      return (
        <p className="text-secondary/70 text-lg leading-relaxed font-sans">
          <InlineChildren children={node.children} />
        </p>
      );

    case "heading": {
      const level = node.level ?? 2;
      const sizeClasses: Record<number, string> = {
        1: "font-display text-primary text-3xl md:text-4xl leading-tight mt-8 mb-4",
        2: "font-display text-primary text-2xl md:text-3xl leading-tight mt-8 mb-4",
        3: "font-display text-primary text-xl md:text-2xl leading-tight mt-6 mb-3",
        4: "font-sans text-secondary text-lg font-semibold mt-6 mb-3",
        5: "font-sans text-secondary text-base font-semibold mt-4 mb-2",
        6: "font-sans text-secondary/70 text-sm font-semibold mt-4 mb-2",
      };
      const Tag = `h${Math.min(level, 6)}` as keyof React.JSX.IntrinsicElements;

      return (
        <Tag className={sizeClasses[level] ?? sizeClasses[2]}>
          <InlineChildren children={node.children} />
        </Tag>
      );
    }

    default:
      // Fallback: render as paragraph for unknown block types
      return node.children ? (
        <p className="text-secondary/70 text-lg leading-relaxed font-sans">
          <InlineChildren children={node.children} />
        </p>
      ) : null;
  }
}

function InlineChildren({
  children,
}: {
  children: StrapiBlockNode["children"];
}) {
  if (!children) return null;

  return (
    <>
      {children.map((child, i) => {
        let content: React.ReactNode = child.text ?? "";

        // Apply inline formatting, nesting from innermost to outermost
        if (child.code)
          content = (
            <code key={i} className="bg-surface/50 px-1 rounded">
              {content}
            </code>
          );
        if (child.bold) content = <strong key={i}>{content}</strong>;
        if (child.italic) content = <em key={i}>{content}</em>;
        if (child.underline) content = <u key={i}>{content}</u>;
        if (child.strikethrough) content = <s key={i}>{content}</s>;

        if (child.url) {
          content = (
            <a
              key={i}
              href={child.url}
              className="text-primary underline hover:text-primary/80 transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              {content}
            </a>
          );
        }

        return <span key={i}>{content}</span>;
      })}
    </>
  );
}
