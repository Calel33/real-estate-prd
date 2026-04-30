import { z } from "zod";
import { strapiFetch } from "./fetch";
import { PropertySchema, type Property } from "@/lib/schemas/property";
import { StrapiMediaSchema } from "@/lib/schemas/strapi";

/** Response shape for fetching a single property by slug. */
const SinglePropertyResponseSchema = z.object({
  data: z.array(PropertySchema).max(1),
  meta: z.object({
    pagination: z.object({
      page: z.number(),
      pageSize: z.number(),
      pageCount: z.number(),
      total: z.number(),
    }),
  }),
});

/** Response shape for fetching all published properties. */
const PropertyListResponseSchema = z.object({
  data: z.array(PropertySchema),
  meta: z.object({
    pagination: z.object({
      page: z.number(),
      pageSize: z.number(),
      pageCount: z.number(),
      total: z.number(),
    }),
  }),
});

/**
 * Fetch a single property by its slug.
 * Returns the property or null if not found.
 */
export async function fetchProperty(slug: string): Promise<Property | null> {
  const path = `/api/properties?populate=*&filters[slug][$eq]=${encodeURIComponent(slug)}`;

  const response = await strapiFetch(path, SinglePropertyResponseSchema, {
    revalidate: 0, // Always fetch fresh data — properties change frequently
  });

  return response.data.length > 0 ? response.data[0] : null;
}

/**
 * Fetch all published properties.
 */
export async function fetchProperties(): Promise<Property[]> {
  const path = `/api/properties?populate=*&filters[status][$eq]=published`;

  const response = await strapiFetch(path, PropertyListResponseSchema, {
    revalidate: 0, // Always fetch fresh data — properties change frequently
    tags: ["properties"],
  });

  return response.data;
}

// ── createSubmission() and CreateSubmissionInputSchema have been extracted ──
// ── to lib/fetch-submission.ts (tech debt: Issue #8).                          ──
// ── Re-export for backwards compatibility with existing consumers.              ──
export {
  CreateSubmissionInputSchema,
  type CreateSubmissionInput,
  createSubmission,
} from "./fetch-submission";
