import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { strapiFetch, StrapiError, StrapiValidationError } from "@/lib/fetch";
import { intake } from "@/lib/intake";
import { resetEnv } from "@/lib/env";
import { z } from "zod";
import { PropertySchema } from "@/lib/schemas/property";

// ---------------------------------------------------------------------------
// Test fixtures
// ---------------------------------------------------------------------------

const TEST_STRAPI_URL = "http://localhost:1337";

const validPropertyData = {
  id: 1,
  documentId: "prop-001",
  title: "Mountain Ranch Estate",
  slug: "mountain-ranch-estate",
  location: "Bozeman, MT",
  acreage: 250.5,
  propertyType: "ranch" as const,
  description: null,
  heroImage: null,
  heroVideo: null,
  gallery: null,
  mapImage: null,
  status: "published" as const,
  publishedAt: "2026-04-01T00:00:00.000Z",
  createdAt: "2026-04-01T00:00:00.000Z",
  updatedAt: "2026-04-01T00:00:00.000Z",
};

const validAboutData = {
  id: 1,
  documentId: "about-001",
  title: "About Us",
  blocks: [],
};

const validGlobalData = {
  id: 1,
  documentId: "global-001",
  siteName: "Real Estate",
  siteDescription: "Premier properties",
  favicon: null,
  defaultSeo: null,
  footerText: "© 2026",
  contactEmail: "info@example.com",
  contactPhone: "+1 (555) 123-4567",
  socialLinks: [],
};

/** Create a Strapi-style paginated response */
function strapiCollectionResponse(data: unknown[]) {
  return {
    data,
    meta: {
      pagination: {
        page: 1,
        pageSize: 25,
        pageCount: 1,
        total: data.length,
      },
    },
  };
}

/** Create a Strapi-style single-type response */
function strapiSingleResponse<T>(data: T) {
  return { data };
}

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

beforeEach(() => {
  vi.stubEnv("STRAPI_URL", TEST_STRAPI_URL);
  vi.stubEnv("STRAPI_API_TOKEN", "test-token");
  vi.stubEnv("RESEND_API_KEY", "re_test123");
  vi.stubEnv("REVALIDATE_SECRET", "test-secret");
  vi.stubEnv("RESEND_FROM_EMAIL", "test@example.com");
  resetEnv();
  vi.restoreAllMocks();
});

afterEach(() => {
  vi.unstubAllEnvs();
  resetEnv();
});

// ---------------------------------------------------------------------------
// strapiFetch
// ---------------------------------------------------------------------------

describe("strapiFetch", () => {
  it("returns parsed data on success", async () => {
    const mockData = { data: { id: 1, name: "Test" } };
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        statusText: "OK",
        json: () => Promise.resolve(mockData),
      }),
    );

    const schema = z.object({
      data: z.object({ id: z.number(), name: z.string() }),
    });
    const result = await strapiFetch("/api/test", schema);

    expect(result).toEqual({
      data: { id: 1, name: "Test" },
    });
    expect(fetch).toHaveBeenCalledWith(
      `${TEST_STRAPI_URL}/api/test`,
      expect.objectContaining({
        next: expect.objectContaining({ revalidate: 0 }),
      }),
    );
  });

  it("throws StrapiError on non-2xx response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
        json: () => Promise.resolve({ error: { message: "Something broke" } }),
      }),
    );

    const schema = z.object({
      data: z.object({ id: z.number(), name: z.string() }),
    });

    await expect(strapiFetch("/api/broken", schema)).rejects.toThrow(
      StrapiError,
    );
    await expect(strapiFetch("/api/broken", schema)).rejects.toThrow(
      "Something broke",
    );
  });

  it("throws StrapiError on 404", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        statusText: "Not Found",
        json: () => Promise.resolve({}),
      }),
    );

    const schema = z.object({ id: z.number() });

    await expect(strapiFetch("/api/missing", schema)).rejects.toThrow(
      StrapiError,
    );
  });

  it("throws StrapiValidationError on invalid response shape", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        statusText: "OK",
        json: () => Promise.resolve({ data: { wrong_field: true } }),
      }),
    );

    const schema = z.object({ id: z.number(), name: z.string() });

    await expect(strapiFetch("/api/malformed", schema)).rejects.toThrow(
      StrapiValidationError,
    );
  });
});

// ---------------------------------------------------------------------------
// intake.properties
// ---------------------------------------------------------------------------

describe("intake.properties", () => {
  it("returns an array of properties on success", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        statusText: "OK",
        json: () =>
          Promise.resolve(strapiCollectionResponse([validPropertyData])),
      }),
    );

    const properties = await intake.properties();
    expect(properties).toHaveLength(1);
    expect(properties[0].title).toBe("Mountain Ranch Estate");
    expect(properties[0].slug).toBe("mountain-ranch-estate");
  });

  it("returns empty array when no properties exist", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        statusText: "OK",
        json: () => Promise.resolve(strapiCollectionResponse([])),
      }),
    );

    const properties = await intake.properties();
    expect(properties).toHaveLength(0);
  });

  it("throws on Strapi error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
        json: () => Promise.resolve({}),
      }),
    );

    await expect(intake.properties()).rejects.toThrow(StrapiError);
  });
});

// ---------------------------------------------------------------------------
// intake.property
// ---------------------------------------------------------------------------

describe("intake.property", () => {
  it("returns a property when found by slug", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        statusText: "OK",
        json: () =>
          Promise.resolve(strapiCollectionResponse([validPropertyData])),
      }),
    );

    const property = await intake.property("mountain-ranch-estate");
    expect(property).not.toBeNull();
    expect(property?.slug).toBe("mountain-ranch-estate");
  });

  it("returns null when property not found", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        statusText: "OK",
        json: () => Promise.resolve(strapiCollectionResponse([])),
      }),
    );

    const property = await intake.property("nonexistent");
    expect(property).toBeNull();
  });

  it("URL-encodes the slug parameter", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: "OK",
      json: () => Promise.resolve(strapiCollectionResponse([])),
    });
    vi.stubGlobal("fetch", mockFetch);

    await intake.property("ranch with spaces");
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("ranch%20with%20spaces"),
      expect.anything(),
    );
  });

  it("throws on Strapi error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        statusText: "Not Found",
        json: () => Promise.resolve({}),
      }),
    );

    await expect(intake.property("any")).rejects.toThrow(StrapiError);
  });
});

// ---------------------------------------------------------------------------
// intake.about
// ---------------------------------------------------------------------------

describe("intake.about", () => {
  it("returns about data on success", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: "OK",
      json: () => Promise.resolve(strapiSingleResponse(validAboutData)),
    });
    vi.stubGlobal("fetch", mockFetch);

    const about = await intake.about();
    expect(about.siteName).toBeUndefined(); // About doesn't have siteName
    expect(about.title).toBe("About Us");
    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer test-token",
        }),
      }),
    );
  });

  it("throws on Strapi error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: "Error",
        json: () => Promise.resolve({}),
      }),
    );

    await expect(intake.about()).rejects.toThrow(StrapiError);
  });

  it("throws on validation failure (missing data)", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        statusText: "OK",
        json: () => Promise.resolve({ wrong: "shape" }),
      }),
    );

    await expect(intake.about()).rejects.toThrow(StrapiValidationError);
  });

  it("returns EMPTY_ABOUT on 404", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        statusText: "Not Found",
        json: () => Promise.resolve({}),
      }),
    );

    const about = await intake.about();
    expect(about).toEqual({
      id: 0,
      documentId: "about-placeholder",
      title: null,
      blocks: [],
    });
  });
});

// ---------------------------------------------------------------------------
// intake.global
// ---------------------------------------------------------------------------

describe("intake.global", () => {
  it("returns global data on success", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: "OK",
      json: () => Promise.resolve(strapiSingleResponse(validGlobalData)),
    });
    vi.stubGlobal("fetch", mockFetch);

    const global = await intake.global();
    expect(global.siteName).toBe("Real Estate");
    expect(global.siteDescription).toBe("Premier properties");
    expect(global.socialLinks).toEqual([]);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer test-token",
        }),
      }),
    );
  });

  it("throws on Strapi error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: "Error",
        json: () => Promise.resolve({}),
      }),
    );

    await expect(intake.global()).rejects.toThrow(StrapiError);
  });

  it("throws on validation failure", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        statusText: "OK",
        json: () => Promise.resolve({}),
      }),
    );

    await expect(intake.global()).rejects.toThrow(StrapiValidationError);
  });

  it("handles global with missing optional fields", async () => {
    const minimalGlobal = {
      ...validGlobalData,
      favicon: { id: 1, documentId: "m1", url: "/uploads/favicon.ico", alternativeText: null, name: "favicon.ico", width: 32, height: 32, formats: null, mime: "image/x-icon", size: 1024 },
    };

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        statusText: "OK",
        json: () => Promise.resolve(strapiSingleResponse(minimalGlobal)),
      }),
    );

    const global = await intake.global();
    expect(global.siteName).toBe("Real Estate");
  });
});

// ---------------------------------------------------------------------------
// intake.submission
// ---------------------------------------------------------------------------

describe("intake.submission", () => {
  const validSubmissionInput = {
    name: "John Doe",
    email: "john@example.com",
    message: "I am interested.",
  };

  const validSubmissionResponse = {
    data: {
      id: 1,
      documentId: "sub-001",
      name: "John Doe",
      email: "john@example.com",
      message: "I am interested.",
      submittedAt: "2026-04-01T00:00:00.000Z",
      createdAt: "2026-04-01T00:00:00.000Z",
      updatedAt: "2026-04-01T00:00:00.000Z",
    },
    meta: {},
  };

  it("returns id/documentId on success", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: "OK",
      json: () => Promise.resolve(validSubmissionResponse),
    });
    vi.stubGlobal("fetch", mockFetch);

    const result = await intake.submission(validSubmissionInput);
    expect(result).toEqual({ id: 1, documentId: "sub-001" });
    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer test-token",
        }),
      }),
    );
  });

  it("validates input", async () => {
    await expect(
      intake.submission({ name: "", email: "not-an-email", message: "" }),
    ).rejects.toThrow(z.ZodError);
  });
});
