import type { StrapiBlocks } from "@/lib/schemas/strapi";
import { StrapiBlocksRenderer } from "@/components/StrapiBlocksRenderer";

interface RichTextBlockProps {
  /** JSON-serialized Strapi rich text blocks, or null/undefined if empty. */
  body: string | null | undefined;
}

/**
 * Renders the `shared.rich-text` dynamic zone block by parsing the
 * JSON-serialized `body` field and delegating to {@link StrapiBlocksRenderer}.
 */
export function RichTextBlock({ body }: RichTextBlockProps) {
  if (!body) return null;

  let blocks: unknown;
  try {
    blocks = JSON.parse(body);
  } catch {
    return null;
  }

  if (!Array.isArray(blocks) || blocks.length === 0) return null;

  return <StrapiBlocksRenderer blocks={blocks as StrapiBlocks} />;
}
