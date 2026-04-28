import { z } from "zod";
import { StrapiMediaSchema, StrapiBlocksSchema } from "./strapi";

export const PropertySchema = z.object({
  id: z.number(),
  documentId: z.string(),
  title: z.string(),
  slug: z.string(),
  location: z.string().nullable(),
  acreage: z.number().nullable(),
  propertyType: z
    .enum(["residential", "commercial", "land", "ranch", "estate", "other"])
    .nullable(),
  description: StrapiBlocksSchema.nullable(),
  heroImage: StrapiMediaSchema.nullable(),
  heroVideo: StrapiMediaSchema.nullable(),
  gallery: z.array(StrapiMediaSchema).nullable(),
  mapImage: StrapiMediaSchema.nullable(),
  status: z.enum(["draft", "published"]),
  publishedAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Property = z.infer<typeof PropertySchema>;
