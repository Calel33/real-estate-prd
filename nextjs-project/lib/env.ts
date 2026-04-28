import { z } from "zod";

/**
 * Environment variable schema.
 * These are validated at import time — if any required variable
 * is missing or malformed, the app aborts with a descriptive error.
 */
const envSchema = z.object({
  STRAPI_URL: z.string().url("STRAPI_URL must be a valid URL"),
  STRAPI_API_TOKEN: z.string().min(1, "STRAPI_API_TOKEN is required"),
  RESEND_API_KEY: z.string().min(1, "RESEND_API_KEY is required"),
  REVALIDATE_SECRET: z.string().min(1, "REVALIDATE_SECRET is required"),
  RESEND_FROM_EMAIL: z.string().email("RESEND_FROM_EMAIL must be a valid email"),
});

export type Env = z.infer<typeof envSchema>;

/**
 * Parse and validate environment variables.
 * Returns the validated env object or throws with a formatted error.
 */
export function parseEnv(overrides?: Partial<Env>): Env {
  const raw = {
    STRAPI_URL: overrides?.STRAPI_URL ?? process.env.STRAPI_URL,
    STRAPI_API_TOKEN:
      overrides?.STRAPI_API_TOKEN ?? process.env.STRAPI_API_TOKEN,
    RESEND_API_KEY: overrides?.RESEND_API_KEY ?? process.env.RESEND_API_KEY,
    REVALIDATE_SECRET:
      overrides?.REVALIDATE_SECRET ?? process.env.REVALIDATE_SECRET,
    RESEND_FROM_EMAIL:
      overrides?.RESEND_FROM_EMAIL ?? process.env.RESEND_FROM_EMAIL,
  };

  const result = envSchema.safeParse(raw);

  if (!result.success) {
    const errors = result.error.issues
      .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    throw new Error(`Environment validation failed:\n${errors}`);
  }

  return result.data;
}

let _env: Env | null = null;

/** Lazily-validated environment variables. Use this instead of process.env directly. */
export function getEnv(): Env {
  if (!_env) {
    _env = parseEnv();
  }
  return _env;
}

/** Reset cached env (useful for testing). */
export function resetEnv(): void {
  _env = null;
}
