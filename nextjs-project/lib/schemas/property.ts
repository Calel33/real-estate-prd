import { z } from "zod";
import { StrapiMediaSchema, StrapiBlocksSchema } from "./strapi";

const nullableNumberFromStrapi = z.preprocess(
  (value) => (value === "" || value == null ? null : value),
  z.coerce.number().nullable(),
);

export const PropertyMapSchema = z.preprocess(
  (value) => {
    if (typeof value === "string") {
      try { return JSON.parse(value); } catch { return null; }
    }
    return value;
  },
  z
    .object({
      place_name: z.string().optional(),
      geometry: z
        .object({
          type: z.string().optional(),
          coordinates: z.tuple([z.number(), z.number()]),
        })
        .optional(),
    })
    .passthrough()
    .nullable()
);

export const PropertySchema = z.object({
  id: z.number(),
  documentId: z.string(),
  title: z.string(),
  slug: z.string(),
  location: z.string().nullable(),
  acreage: z.number().nullable(),
  ft2: nullableNumberFromStrapi,
  propertyType: z
    .enum(["residential", "commercial", "land", "ranch", "estate", "other"])
    .nullable(),
  description: StrapiBlocksSchema.nullable(),
  heroImage: StrapiMediaSchema.nullable(),
  heroVideo: StrapiMediaSchema.nullable(),
  gallery: z.array(StrapiMediaSchema).nullable(),
  map: PropertyMapSchema.nullable(),
  mapImage: StrapiMediaSchema.nullable(),
  propertyId: z.string().nullable(),
  ownership: z.string().nullable(),
  plusCode: z.string().nullable().optional(),
  status: z.enum(["draft", "published"]),
  publishedAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Property = z.infer<typeof PropertySchema>;
