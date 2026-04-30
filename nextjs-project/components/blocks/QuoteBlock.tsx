import type { AboutBlock } from "@/lib/schemas/about";

interface QuoteBlockProps {
  /** Block title — the quote heading displayed in display font. */
  title: Extract<AboutBlock, { __component: "shared.quote" }>["title"];
  /** Block body — the quote text content displayed in muted secondary styling. */
  body: Extract<AboutBlock, { __component: "shared.quote" }>["body"];
}

/**
 * Renders a `shared.quote` block from Strapi's about dynamic zone.
 * Displays a styled quote with left-border visual accent,
 * heading in display typography, and body text in muted styling.
 *
 * Renders without a heading when `title` is empty.
 */
export function QuoteBlock({ title, body }: QuoteBlockProps) {
  return (
    <blockquote
      className="my-8 border-l-4 border-primary pl-6 py-4 bg-surface/30 rounded-r-glass text-lg md:text-xl"
    >
      {title && (
        <h2 className="font-display text-primary text-2xl md:text-3xl leading-tight mb-3">
          {title}
        </h2>
      )}
      <p className="text-secondary/70 italic leading-relaxed">
        &ldquo;{body}&rdquo;
      </p>
    </blockquote>
  );
}
