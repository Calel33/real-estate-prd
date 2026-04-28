import { z } from "zod";

/**
 * Strapi media format (thumbnail, small, medium, large, etc.)
 */
export const StrapiMediaFormatSchema = z.object({
  url: z.string(),
  width: z.number(),
  height: z.number(),
  name: z.string(),
  size: z.number(),
  mime: z.string(),
});

export type StrapiMediaFormat = z.infer<typeof StrapiMediaFormatSchema>;

/**
 * Strapi media object returned by the CMS.
 * URLs are RELATIVE (e.g., /uploads/file.jpg) — consumers
 * must prefix with STRAPI_URL when used in <Image>.
 */
export const StrapiMediaSchema = z.object({
  id: z.number(),
  documentId: z.string(),
  url: z.string(),
  alternativeText: z.string().nullable(),
  name: z.string(),
  width: z.number(),
  height: z.number(),
  formats: z.record(z.string(), StrapiMediaFormatSchema).nullable(),
  mime: z.string(),
  size: z.number(),
});

export type StrapiMedia = z.infer<typeof StrapiMediaSchema>;

/**
 * Strapi Blocks (rich text / dynamic zones).
 * This is intentionally flexible because the block structure
 * depends on the specific editor content.
 */
export interface StrapiBlockChild {
  type: string;
  text?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  code?: boolean;
  url?: string;
  children?: StrapiBlockChild[];
}

export const StrapiBlockChildSchema: z.ZodType<StrapiBlockChild> = z.object({
  type: z.string(),
  text: z.string().optional(),
  bold: z.boolean().optional(),
  italic: z.boolean().optional(),
  underline: z.boolean().optional(),
  strikethrough: z.boolean().optional(),
  code: z.boolean().optional(),
  url: z.string().optional(),
  children: z.array(z.lazy(() => StrapiBlockChildSchema)).optional(),
});

export const StrapiBlockNodeSchema = z.object({
  type: z.string(),
  children: z.array(StrapiBlockChildSchema),
  level: z.number().optional(),
  format: z.string().optional(),
  image: StrapiMediaSchema.optional(),
});

export type StrapiBlockNode = z.infer<typeof StrapiBlockNodeSchema>;

/** A Strapi Blocks array (rich text / editor content). */
export const StrapiBlocksSchema = z.array(StrapiBlockNodeSchema);

export type StrapiBlocks = z.infer<typeof StrapiBlocksSchema>;

/**
 * Generic Strapi v5 response wrapper.
 * Usage: StrapiResponseSchema(PropertySchema) to validate a full response.
 */
export function strapiResponseSchema<T extends z.ZodTypeAny>(dataSchema: T) {
  return z.object({
    data: dataSchema,
    meta: z.record(z.string(), z.unknown()).optional(),
  });
}

export const StrapiCollectionResponseSchema = z.object({
  data: z.array(z.unknown()),
  meta: z.object({
    pagination: z.object({
      page: z.number(),
      pageSize: z.number(),
      pageCount: z.number(),
      total: z.number(),
    }),
  }).optional(),
});

export type StrapiCollectionResponse = z.infer<
  typeof StrapiCollectionResponseSchema
>;
