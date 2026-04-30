import { z } from "zod";
import { strapiFetch } from "./fetch";
import { AboutSchema, type About } from "@/lib/schemas/about";

/** Response shape for fetching the About single type. */
const AboutResponseSchema = z.object({
  data: AboutSchema,
  meta: z.object({}).optional(),
});

/**
 * Fetch the About page content (single type).
 */
export async function fetchAbout(): Promise<About> {
  const path = "/api/about?populate=*";

  const response = await strapiFetch(path, AboutResponseSchema, {
    revalidate: 0, // Always fetch fresh data — content changes frequently
    useToken: true,
  });

  return response.data;
}
