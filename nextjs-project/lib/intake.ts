import "server-only";
import { z } from "zod";
import { strapiFetch, StrapiError } from "./fetch";
import { PropertySchema, type Property } from "@/lib/schemas/property";
import { AboutSchema, type About } from "@/lib/schemas/about";
import { GlobalSchema, type Global } from "@/lib/schemas/global";
import { ContactFormInputSchema, type ContactFormInput } from "@/lib/schemas/contact-form";

// ── Private response schemas ────────────────────────────────────────────────

const SinglePropertyResponseSchema = z.object({
  data: z.array(PropertySchema).max(1),
  meta: z.object({
    pagination: z.object({
      page: z.number().optional(),
      pageSize: z.number().optional(),
      pageCount: z.number().optional(),
      total: z.number().optional(),
    }),
  }),
});

const PropertyListResponseSchema = z.object({
  data: z.array(PropertySchema),
  meta: z.object({
    pagination: z.object({
      page: z.number().optional(),
      pageSize: z.number().optional(),
      pageCount: z.number().optional(),
      total: z.number().optional(),
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

export type CreateSubmissionInput = ContactFormInput;

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

export const EMPTY_ABOUT: About = {
  id: 0,
  documentId: "about-placeholder",
  title: null,
  blocks: [],
};

export const EMPTY_GLOBAL: Global = {
  id: 0,
  documentId: "global-placeholder",
  siteName: "Disrupt the Block",
  siteDescription:
    "Disrupt the Block pairs exceptional properties with blockchain infrastructure.",
  favicon: null,
  defaultSeo: null,
  footerText: null,
  contactEmail: null,
  contactPhone: null,
  socialLinks: [],
};

// ── Intake facade object ────────────────────────────────────────────────────

export const intake = {
  /**
   * Fetch a single property by its slug.
   * Returns the property or null if not found.
   */
  async property(slug: string): Promise<Property | null> {
    const params = new URLSearchParams({
      populate: "*",
      "filters[slug][$eq]": slug,
      "filters[status][$eq]": "published",
    });
    const path = `/api/properties?${params.toString()}`;

    const response = await strapiFetch(path, SinglePropertyResponseSchema, {
      revalidate: 0,
    });

    return response.data.length > 0 ? response.data[0] : null;
  },

  /**
   * Fetch all published properties.
   */
  async properties(): Promise<Property[]> {
    const path = "/api/properties?populate=*&filters[status][$eq]=published&pagination[limit]=-1";

    const response = await strapiFetch(path, PropertyListResponseSchema, {
      revalidate: 0,
      tags: ["properties"],
    });

    return response.data;
  },

  /**
   * Fetch the About page content (single type).
   *
   * Returns an empty fallback when the About single type entry
   * has not been created yet (HTTP 404).
   * This lets the page render during development before content is seeded.
   */
  async about(): Promise<About> {
    const path = "/api/about?populate=*";

    try {
      const response = await strapiFetch(path, AboutResponseSchema, {
        revalidate: 0,
      });

      return response.data;
    } catch (error) {
      // Return empty fallback when About content is missing.
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

    try {
      const response = await strapiFetch(path, GlobalResponseSchema, {
        revalidate: 0,
        tags: ["global"],
      });

      return response.data;
    } catch (error) {
      // Return fallback metadata when global settings are missing.
      if (error instanceof StrapiError && error.status === 404) {
        return EMPTY_GLOBAL;
      }

      throw error;
    }
  },

  /**
   * Create a new contact submission.
   * Uses the Strapi API token for authorization.
   */
  async submission(input: CreateSubmissionInput): Promise<{ id: number; documentId: string }> {
    const validated = ContactFormInputSchema.parse(input);
    const submissionData = {
      name: validated.name,
      email: validated.email,
      message: validated.message,
    };

    const path = "/api/submissions";
    const response = await strapiFetch(path, CreateSubmissionResponseSchema, {
      method: "POST",
      body: {
        data: {
          ...submissionData,
          submittedAt: new Date().toISOString(),
        },
      },
      useToken: true,
      revalidate: false,
    });

    return { id: response.data.id, documentId: response.data.documentId };
  },
};
