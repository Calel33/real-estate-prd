/**
 * @vitest-environment node
 *
 * Unit tests for POST /api/revalidate route handler (external deps mocked).
 * Uses node environment because route handlers don't need jsdom.
 */
import { NextRequest } from "next/server";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/revalidate/route";

// ---------------------------------------------------------------------------
// Mocks — use vi.hoisted so mock refs are available when vi.mock factory runs
// ---------------------------------------------------------------------------

const { mockRevalidatePath, mockRevalidateTag } = vi.hoisted(() => ({
  mockRevalidatePath: vi.fn(),
  mockRevalidateTag: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: mockRevalidatePath,
  revalidateTag: mockRevalidateTag,
}));

vi.mock("@/lib/env", () => ({
  getEnv: () => ({
    STRAPI_URL: "http://localhost:1337",
    STRAPI_API_TOKEN: "test-token",
    RESEND_API_KEY: "re_test",
    RESEND_FROM_EMAIL: "test@example.com",
    REVALIDATE_SECRET: "test-secret",
  }),
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createRequest(
  body?: unknown,
  headers?: Record<string, string>,
): NextRequest {
  return new NextRequest(
    "http://localhost:3000/api/revalidate",
    {
      method: "POST",
      headers: { "Content-Type": "application/json", ...headers },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    },
  );
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("POST /api/revalidate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Test 1: Correct secret + valid path → revalidatePath called → returns 200
  it("returns 200 and calls revalidatePath when given valid auth and path in body", async () => {
    const request = createRequest(
      { path: "/properties/test-slug" },
      { Authorization: "Bearer test-secret" },
    );
    const response = await POST(request);

    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.revalidated).toBe(true);
    expect(json.now).toBeTypeOf("number");

    expect(mockRevalidatePath).toHaveBeenCalledWith(
      "/properties/test-slug",
      "page",
    );
  });

  // Test 2: Wrong secret → returns 401
  it("returns 401 when authorization header has wrong secret", async () => {
    const request = createRequest(
      { path: "/properties/test-slug" },
      { Authorization: "Bearer wrong-secret" },
    );
    const response = await POST(request);

    expect(response.status).toBe(401);
    const json = await response.json();
    expect(json.message).toBe("Invalid token");

    expect(mockRevalidatePath).not.toHaveBeenCalled();
    expect(mockRevalidateTag).not.toHaveBeenCalled();
  });

  // Test 3: No secret (missing header) → returns 401
  it("returns 401 when authorization header is missing", async () => {
    const request = createRequest({ path: "/properties/test-slug" });
    const response = await POST(request);

    expect(response.status).toBe(401);
    const json = await response.json();
    expect(json.message).toBe("Invalid token");

    expect(mockRevalidatePath).not.toHaveBeenCalled();
    expect(mockRevalidateTag).not.toHaveBeenCalled();
  });

  // Test 4: Valid auth but missing path → returns 400
  it("returns 400 when path is missing from body and query params", async () => {
    const request = createRequest(
      {},
      { Authorization: "Bearer test-secret" },
    );
    const response = await POST(request);

    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.message).toBe("Missing path parameter");

    expect(mockRevalidatePath).not.toHaveBeenCalled();
    expect(mockRevalidateTag).not.toHaveBeenCalled();
  });

  // Test 5: Correct secret + tags → revalidateTag called with { expire: 0 }
  it("calls revalidateTag with { expire: 0 } when given tags", async () => {
    const request = createRequest(
      { path: "/properties/test-slug", tags: ["properties"] },
      { Authorization: "Bearer test-secret" },
    );
    const response = await POST(request);

    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.revalidated).toBe(true);

    expect(mockRevalidatePath).toHaveBeenCalledWith(
      "/properties/test-slug",
      "page",
    );
    expect(mockRevalidateTag).toHaveBeenCalledWith("properties", {
      expire: 0,
    });
  });

  // Test 6: Path accepted from query param
  it("accepts path from query parameter when body has no path", async () => {
    const request = new NextRequest(
      "http://localhost:3000/api/revalidate?path=%2Fproperties%2Ffrom-query",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer test-secret",
        },
        body: JSON.stringify({}),
      },
    );
    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(mockRevalidatePath).toHaveBeenCalledWith(
      "/properties/from-query",
      "page",
    );
  });

  // Test 7: No body at all → reads path from query params
  it("returns 200 when path is provided via query param without body", async () => {
    const request = new NextRequest(
      "http://localhost:3000/api/revalidate?path=%2Fproperties%2Fquery-only",
      {
        method: "POST",
        headers: {
          Authorization: "Bearer test-secret",
        },
      },
    );
    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(mockRevalidatePath).toHaveBeenCalledWith(
      "/properties/query-only",
      "page",
    );
  });
});
