import { z } from "zod";
import { strapiFetch } from "./fetch";
import { GlobalSchema, type Global } from "@/lib/schemas/global";

/** Response shape for fetching the Global single type. */
const GlobalResponseSchema = z.object({
  data: GlobalSchema,
  meta: z.object({}).optional(),
});

/**
 * Fetch global site settings (single type).
 */
export async function fetchGlobal(): Promise<Global> {
  const path = "/api/global?populate=*";

  const response = await strapiFetch(path, GlobalResponseSchema, {
    revalidate: 0, // Always fetch fresh data — global settings change
    useToken: true,
    tags: ["global"],
  });

  return response.data;
}
