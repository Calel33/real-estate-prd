import { z } from "zod";
import { strapiFetch, StrapiError } from "./fetch";
import { PropertySchema, type Property } from "@/lib/schemas/property";
import { AboutSchema, type About } from "@/lib/schemas/about";
import { GlobalSchema, type Global } from "@/lib/schemas/global";

// ── Private response schemas ────────────────────────────────────────────────

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

const AboutResponseSchema = z.object({
  data: AboutSchema,
  meta: z.object({}).optional(),
});

const GlobalResponseSchema = z.object({
  data: GlobalSchema,
  meta: z.object({}).optional(),
});

const CreateSubmissionInputSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  message: z.string().min(1),
});

type CreateSubmissionInput = z.infer<typeof CreateSubmissionInputSchema>;

const CreateSubmissionResponseSchema = z.object({
  data: z.object({
    id: z.number(),
    documentId: z.string(),
    name: z.string(),
    email: z.string(),
    message: z.string(),
    submittedAt: z.string(),
    createdAt: z.string(),
    updatedAt: z.string(),
  }),
  meta: z.object({}).optional(),
});

// ── Private fallback values ─────────────────────────────────────────────────

const EMPTY_ABOUT: About = {
  id: 0,
  documentId: "about-placeholder",
  title: null,
  blocks: [],
};

// ── Intake facade object ────────────────────────────────────────────────────

export const intake = {
  /**
   * Fetch a single property by its slug.
   * Returns the property or null if not found.
   */
  async property(slug: string): Promise<Property | null> {
    const path = `/api/properties?populate=*&filters[slug][$eq]=${encodeURIComponent(slug)}`;

    const response = await strapiFetch(path, SinglePropertyResponseSchema, {
      revalidate: 0,
    });

    return response.data.length > 0 ? response.data[0] : null;
  },

  /**
   * Fetch all published properties.
   */
  async properties(): Promise<Property[]> {
    const path = "/api/properties?populate=*&filters[status][$eq]=published";

    const response = await strapiFetch(path, PropertyListResponseSchema, {
      revalidate: 0,
      tags: ["properties"],
    });

    return response.data;
  },

  /**
   * Fetch the About page content (single type).
   *
   * Returns an empty fallback when the Strapi server is unreachable
   * or the About single type entry has not been created yet (HTTP 404).
   * This lets the page render during development before content is seeded.
   */
  async about(): Promise<About> {
    const path = "/api/about?populate=*";

    try {
      const response = await strapiFetch(path, AboutResponseSchema, {
        revalidate: 0,
        useToken: true,
      });

      return response.data;
    } catch (error) {
      // Single types return 404 when no entry exists (content not seeded yet).
      // Return empty fallback instead of crashing the page.
      if (error instanceof StrapiError && error.status === 404) {
        return EMPTY_ABOUT;
      }

      // Re-throw other errors (network failures, validation errors, 500, etc.)
      // so the Next.js error boundary can display them.
      throw error;
    }
  },

  /**
   * Fetch global site settings (single type).
   */
  async global(): Promise<Global> {
    const path = "/api/global?populate=*";

    const response = await strapiFetch(path, GlobalResponseSchema, {
      revalidate: 0,
      useToken: true,
      tags: ["global"],
    });

    return response.data;
  },

  /**
   * Create a new contact submission.
   * Uses the Strapi API token for authorization.
   */
  async submission(input: CreateSubmissionInput): Promise<{ id: number; documentId: string }> {
    const validated = CreateSubmissionInputSchema.parse(input);

    const path = "/api/submissions";
    const response = await strapiFetch(path, CreateSubmissionResponseSchema, {
      method: "POST",
      body: {
        data: {
          ...validated,
          submittedAt: new Date().toISOString(),
        },
      },
      useToken: true,
      revalidate: false,
    });

    return { id: response.data.id, documentId: response.data.documentId };
  },
};
