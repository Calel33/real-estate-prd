import { z } from "zod";
import { getEnv } from "@/lib/env";

/** Default revalidation interval in seconds (1 hour). */
const DEFAULT_REVALIDATE = 3600;

/** Error thrown when Strapi returns a non-2xx response. */
export class StrapiError extends Error {
  constructor(
    public readonly status: number,
    public readonly statusText: string,
    message?: string,
  ) {
    super(message ?? `Strapi API error: ${status} ${statusText}`);
    this.name = "StrapiError";
  }
}

/** Error thrown when Zod validation of Strapi response fails. */
export class StrapiValidationError extends Error {
  constructor(
    message: string,
    public readonly zodErrors: z.ZodError,
  ) {
    super(message);
    this.name = "StrapiValidationError";
  }
}

export interface StrapiFetchOptions {
  /** Override the default revalidation interval (seconds). */
  revalidate?: number | false;
  /** HTTP method (default "GET"). */
  method?: "GET" | "POST" | "PUT" | "DELETE";
  /** Request body (for POST/PUT). */
  body?: unknown;
  /** Use Strapi API token for write operations. */
  useToken?: boolean;
  /** Cache tags for on-demand revalidation. */
  tags?: string[];
}

/**
 * Generic Strapi v5 fetch wrapper.
 *
 * - Prepends STRAPI_URL to the path
 * - Applies time-based caching via `next.revalidate`
 * - Strips the `{ data }` Strapi envelope before returning to caller
 * - Throws StrapiError on non-2xx responses
 */
export async function strapiFetch<T>(
  path: string,
  schema: z.ZodSchema<T>,
  options: StrapiFetchOptions = {},
): Promise<T> {
  const env = getEnv();
  const url = `${env.STRAPI_URL}${path}`;

  const fetchOptions: RequestInit & { next?: { revalidate?: number | false; tags?: string[] } } = {
    method: options.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
    },
    next: {
      revalidate: options.revalidate ?? DEFAULT_REVALIDATE,
      ...(options.tags && { tags: options.tags }),
    },
  };

  if (options.useToken) {
    (fetchOptions.headers as Record<string, string>)["Authorization"] =
      `Bearer ${env.STRAPI_API_TOKEN}`;
  }

  if (options.body) {
    fetchOptions.body = JSON.stringify(options.body);
  }

  const response = await fetch(url, fetchOptions);

  if (!response.ok) {
    let errorMessage: string | undefined;
    try {
      const errorBody = await response.json();
      errorMessage =
        errorBody?.error?.message ?? JSON.stringify(errorBody);
    } catch {
      // Ignore parse errors for error body
    }
    throw new StrapiError(response.status, response.statusText, errorMessage);
  }

  const json: unknown = await response.json();

  const result = schema.safeParse(json);

  if (!result.success) {
    throw new StrapiValidationError(
      `Invalid Strapi response for ${path}: ${result.error.message}`,
      result.error,
    );
  }

  return result.data;
}
