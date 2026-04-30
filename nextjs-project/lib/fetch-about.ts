import { z } from "zod";
import { strapiFetch, StrapiError } from "./fetch";
import { AboutSchema, type About } from "@/lib/schemas/about";

/** Response shape for fetching the About single type. */
const AboutResponseSchema = z.object({
  data: AboutSchema,
  meta: z.object({}).optional(),
});

/** Empty fallback when the About content has not been created in Strapi yet. */
const EMPTY_ABOUT: About = {
  id: 0,
  documentId: "about-placeholder",
  title: null,
  blocks: [],
};

/**
 * Fetch the About page content (single type).
 *
 * Returns an empty fallback when the Strapi server is unreachable
 * or the About single type entry has not been created yet (HTTP 404).
 * This lets the page render during development before content is seeded.
 */
export async function fetchAbout(): Promise<About> {
  const path = "/api/about?populate=*";

  try {
    const response = await strapiFetch(path, AboutResponseSchema, {
      revalidate: 0, // Always fetch fresh data — content changes frequently
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
}
