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
    useToken: true,
    tags: ["global"],
  });

  return response.data;
}
