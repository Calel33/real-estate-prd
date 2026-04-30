import { revalidatePath, revalidateTag } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";
import { getEnv } from "@/lib/env";

/**
 * On-demand cache revalidation endpoint for Strapi webhooks.
 *
 * Supports BOTH path-based (`revalidatePath`) and tag-based (`revalidateTag`)
 * invalidation. Designed for Programmable Webhooks in the Vercel dashboard
 * or Strapi lifecycle middleware.
 *
 * Auth: Bearer token in Authorization header (recommended for webhooks).
 *       Tokens in query params are logged by proxies/CDNs — avoid them.
 *
 * Usage:
 *   POST /api/revalidate?path=/properties/my-property
 *   Headers: { Authorization: Bearer <REVALIDATE_SECRET> }
 *
 *   POST /api/revalidate
 *   Headers: { Authorization: Bearer <REVALIDATE_SECRET> }
 *   Body: { "path": "/properties/my-property", "tags": ["properties", "global"] }
 *
 * Path can be provided via query param OR body. Tags are optional.
 * revalidateTag uses { expire: 0 } for immediate expiration (Next.js 16).
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const env = getEnv();

  // Verify the secret
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (token !== env.REVALIDATE_SECRET) {
    return NextResponse.json({ message: "Invalid token" }, { status: 401 });
  }

  // Extract path from query param or body
  let path: string | null =
    request.nextUrl.searchParams.get("path") ?? null;
  let tags: string[] | null = null;

  // Try to parse body for path/tags (body values override query param)
  try {
    const body = (await request.json()) as {
      path?: string;
      tags?: string[];
    };

    if (body.path) {
      path = body.path;
    }

    if (Array.isArray(body.tags) && body.tags.length > 0) {
      tags = body.tags;
    }
  } catch {
    // No body or invalid JSON — use query param path only
  }

  // Validate: path is required
  if (!path) {
    return NextResponse.json(
      { message: "Missing path parameter" },
      { status: 400 },
    );
  }

  const results: Array<{
    type: "path" | "tag";
    target: string;
    revalidated: boolean;
    error?: string;
  }> = [];

  // Revalidate the specific path
  try {
    revalidatePath(path, "page");
    results.push({ type: "path", target: path, revalidated: true });
  } catch (error) {
    results.push({
      type: "path",
      target: path,
      revalidated: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }

  // Optionally revalidate tags for broader invalidation
  if (tags) {
    for (const tag of tags) {
      try {
        // Next.js 16: use { expire: 0 } for immediate expiration (webhook use case)
        revalidateTag(tag, { expire: 0 });
        results.push({ type: "tag", target: tag, revalidated: true });
      } catch (error) {
        results.push({
          type: "tag",
          target: tag,
          revalidated: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }
  }

  const allSuccess = results.every((r) => r.revalidated);

  return NextResponse.json(
    {
      revalidated: allSuccess,
      now: Date.now(),
      results,
    },
    { status: allSuccess ? 200 : 207 },
  );
}
