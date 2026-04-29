import { revalidateTag } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";
import { getEnv } from "@/lib/env";

/**
 * On-demand revalidation endpoint for Strapi webhooks.
 *
 * Strapi calls this when content changes (e.g., property updated,
 * hero image replaced), passing a secret and optional tags.
 *
 * Usage:
 *   POST /api/revalidate
 *   Headers: { Authorization: Bearer <REVALIDATE_SECRET> }
 *   Body (optional): { tags?: string[] }
 *
 * If no tags are specified, both "properties" and "global" are revalidated.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const env = getEnv();

  // Verify the secret
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (token !== env.REVALIDATE_SECRET) {
    return NextResponse.json({ message: "Invalid token" }, { status: 401 });
  }

  // Parse optional tags from body
  let tags: string[] = ["properties", "global"];
  try {
    const body = (await request.json()) as { tags?: string[] };
    if (Array.isArray(body.tags) && body.tags.length > 0) {
      tags = body.tags;
    }
  } catch {
    // No body or invalid JSON — use default tags
  }

  // Revalidate each tag
  const results = tags.map((tag) => {
    try {
      revalidateTag(tag, "seconds");
      return { tag, revalidated: true };
    } catch (error) {
      return {
        tag,
        revalidated: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  });

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
