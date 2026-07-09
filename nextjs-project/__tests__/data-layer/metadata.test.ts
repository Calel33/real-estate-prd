import { describe, expect, it, vi, beforeEach } from "vitest";
import { StrapiError } from "@/lib/fetch";

const { emptyGlobal } = vi.hoisted(() => ({
  emptyGlobal: {
    id: 0,
    documentId: "global-placeholder",
    siteName: "Disrupt the Block",
    siteDescription:
      "Disrupt the Block pairs exceptional properties with blockchain infrastructure.",
    favicon: null,
    defaultSeo: null,
    footerText: null,
    contactEmail: null,
    contactPhone: null,
    socialLinks: [],
  },
}));

vi.mock("@/lib/intake", () => ({
  EMPTY_GLOBAL: emptyGlobal,
  intake: {
    global: vi.fn(),
  },
}));

import { intake } from "@/lib/intake";
import { getGlobalMetadata } from "@/lib/metadata";

describe("getGlobalMetadata", () => {
  beforeEach(() => {
    vi.mocked(intake.global).mockReset();
  });

  it("returns global data on success", async () => {
    vi.mocked(intake.global).mockResolvedValue({
      ...emptyGlobal,
      id: 1,
      documentId: "global-001",
      siteName: "CMS Site",
    });

    await expect(getGlobalMetadata()).resolves.toMatchObject({
      siteName: "CMS Site",
    });
  });

  it("returns metadata fallback on forbidden global settings", async () => {
    vi.mocked(intake.global).mockRejectedValue(
      new StrapiError(403, "Forbidden", "Forbidden"),
    );

    await expect(getGlobalMetadata()).resolves.toEqual(emptyGlobal);
  });

  it("rethrows non-auth Strapi errors", async () => {
    vi.mocked(intake.global).mockRejectedValue(
      new StrapiError(500, "Error", "Error"),
    );

    await expect(getGlobalMetadata()).rejects.toThrow(StrapiError);
  });
});
