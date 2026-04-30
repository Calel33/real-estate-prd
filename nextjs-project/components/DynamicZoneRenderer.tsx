import { MediaBlock } from "@/components/blocks/MediaBlock";
import { QuoteBlock } from "@/components/blocks/QuoteBlock";
import { RichTextBlock } from "@/components/blocks/RichTextBlock";
import { SliderBlock } from "@/components/blocks/SliderBlock";
import type { AboutBlock } from "@/lib/schemas/about";

interface DynamicZoneRendererProps {
  /** Array of AboutBlock discriminated union objects from Strapi. */
  blocks: AboutBlock[];
  /** Base URL of the Strapi backend (e.g., http://localhost:1337). */
  strapiUrl: string;
}

/**
 * Dispatches an array of Strapi `AboutBlock` objects to the
 * appropriate block component based on the `__component` discriminator.
 *
 * Supported component types:
 * - `shared.media`    → {@link MediaBlock}
 * - `shared.quote`    → {@link QuoteBlock}
 * - `shared.rich-text`→ {@link RichTextBlock}
 * - `shared.slider`   → {@link SliderBlock}
 *
 * Unknown block types are skipped with a `console.warn`.
 * Empty or null blocks arrays render nothing.
 */
export function DynamicZoneRenderer({
  blocks,
  strapiUrl,
}: DynamicZoneRendererProps) {
  if (!blocks || blocks.length === 0) return null;

  return (
    <div className="space-y-8">
      {blocks.map((block, index) => {
        switch (block.__component) {
          case "shared.media":
            return (
              <MediaBlock key={index} file={block.file} strapiUrl={strapiUrl} />
            );
          case "shared.quote":
            return (
              <QuoteBlock
                key={index}
                title={block.title}
                body={block.body}
              />
            );
          case "shared.rich-text":
            return <RichTextBlock key={index} body={block.body} />;
          case "shared.slider":
            return (
              <SliderBlock
                key={index}
                files={block.files}
                strapiUrl={strapiUrl}
              />
            );
          default: {
            const unknown = block as { __component: string };
            console.warn(
              `DynamicZoneRenderer: Unknown block type "${unknown.__component}" — skipping.`,
            );
            return null;
          }
        }
      })}
    </div>
  );
}
