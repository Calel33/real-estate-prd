/**
 * @vitest-environment node
 *
 * Unit tests for POST /api/contact route handler (external deps mocked).
 * Uses node environment because route handlers don't need jsdom.
 */
import { NextRequest } from "next/server";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/contact/route";
import { StrapiError } from "@/lib/fetch";

// ---------------------------------------------------------------------------
// Mocks — use vi.hoisted so mock refs are available when vi.mock factory runs
// ---------------------------------------------------------------------------

const { mockCreateSubmission, mockSendContactEmail } = vi.hoisted(() => ({
  mockCreateSubmission: vi.fn(),
  mockSendContactEmail: vi.fn(),
}));

vi.mock("@/lib/rate-limit", () => ({
  checkRateLimit: () => ({ allowed: true, remaining: 99, resetMs: 0 }),
  getClientIp: () => "test-client",
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

vi.mock("@/lib/intake", () => ({
  intake: { submission: mockCreateSubmission },
}));

vi.mock("@/lib/resend", () => ({
  sendContactEmail: mockSendContactEmail,
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createRequest(body: unknown): NextRequest {
  return new NextRequest("http://localhost:3000/api/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function validBody() {
  return {
    name: "John Doe",
    email: "john@example.com",
    message: "I am interested in a property.",
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("POST /api/contact", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateSubmission.mockResolvedValue({
      id: 1,
      documentId: "sub-001",
    });
    mockSendContactEmail.mockResolvedValue({ id: "email-001" });
  });

  // Test 1: Successful submission
  it("returns 200 and success message on valid submission", async () => {
    const request = createRequest(validBody());
    const response = await POST(request);

    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.message).toBe("Message sent successfully");

    expect(mockCreateSubmission).toHaveBeenCalledWith({
      name: "John Doe",
      email: "john@example.com",
      message: "I am interested in a property.",
    });
    expect(mockSendContactEmail).toHaveBeenCalledWith({
      name: "John Doe",
      email: "john@example.com",
      message: "I am interested in a property.",
    });
  });

  // Test 2: Invalid email
  it("returns 400 with field errors when email is invalid", async () => {
    const request = createRequest({
      ...validBody(),
      email: "not-an-email",
    });
    const response = await POST(request);

    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.error).toBe("Validation failed");
    expect(json.fieldErrors).toBeDefined();
    expect(json.fieldErrors.email).toBeDefined();
  });

  // Test 3: Missing required fields
  it("returns 400 with field errors when name is missing", async () => {
    const request = createRequest({
      email: "john@example.com",
      message: "Hello",
    });
    const response = await POST(request);

    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.error).toBe("Validation failed");
    expect(json.fieldErrors.name).toBeDefined();
  });

  it("returns 400 with field errors when message is missing", async () => {
    const request = createRequest({
      name: "John",
      email: "john@example.com",
    });
    const response = await POST(request);

    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.error).toBe("Validation failed");
    expect(json.fieldErrors.message).toBeDefined();
  });

  // Test 4: Strapi unavailable
  it("returns 502 when Strapi is down", async () => {
    mockCreateSubmission.mockRejectedValue(
      new StrapiError(503, "Service Unavailable"),
    );

    const request = createRequest(validBody());
    const response = await POST(request);

    expect(response.status).toBe(502);
    const json = await response.json();
    expect(json.error).toBe(
      "Failed to save message. Please try again later.",
    );
  });

  // Test 5: Non-StrapiError from intake.submission
  it("returns 500 when intake.submission throws a non-Strapi error", async () => {
    mockCreateSubmission.mockRejectedValue(
      new Error("Database connection lost"),
    );

    const request = createRequest(validBody());
    const response = await POST(request);

    expect(response.status).toBe(500);
    const json = await response.json();
    expect(json.error).toBe("Internal server error");
  });

  // Test 6: Resend fails but Strapi succeeds
  it("returns 200 with warning when Resend fails but message was saved", async () => {
    mockSendContactEmail.mockRejectedValue(
      new Error("Resend API error"),
    );

    const request = createRequest(validBody());
    const response = await POST(request);

    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.message).toBe("Message sent successfully");
    expect(json.warning).toBe("Notification email failed to send.");
    expect(mockCreateSubmission).toHaveBeenCalled();
  });

  // Test 7: Empty body
  it("returns 400 with validation error for empty body", async () => {
    const request = createRequest({});
    const response = await POST(request);

    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.error).toBe("Validation failed");
  });
});
