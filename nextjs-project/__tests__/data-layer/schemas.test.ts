import { describe, it, expect } from "vitest";
import { PropertySchema } from "@/lib/schemas/property";
import { SubmissionSchema } from "@/lib/schemas/submission";
import { AboutSchema } from "@/lib/schemas/about";
import { GlobalSchema } from "@/lib/schemas/global";
import {
  StrapiMediaSchema,
  StrapiBlocksSchema,
  StrapiMediaFormatSchema,
} from "@/lib/schemas/strapi";

// ---------------------------------------------------------------------------
// Helpers: valid fixtures
// ---------------------------------------------------------------------------

const validMedia = {
  id: 1,
  documentId: "abc123",
  url: "/uploads/house.jpg",
  alternativeText: "Beautiful house",
  name: "house.jpg",
  width: 1920,
  height: 1080,
  formats: {
    thumbnail: {
      url: "/uploads/thumbnail_house.jpg",
      width: 245,
      height: 138,
      name: "thumbnail_house.jpg",
      size: 8500,
      mime: "image/jpeg",
    },
  },
  mime: "image/jpeg",
  size: 245000,
};

const validMediaFormat = {
  url: "/uploads/small_house.jpg",
  width: 500,
  height: 281,
  name: "small_house.jpg",
  size: 42000,
  mime: "image/jpeg",
};

const validBlocks = [
  {
    type: "paragraph",
    children: [{ type: "text", text: "Beautiful property." }],
  },
];

// ---------------------------------------------------------------------------
// StrapiMedia
// ---------------------------------------------------------------------------

describe("StrapiMediaSchema", () => {
  it("accepts valid Strapi media data", () => {
    expect(() => StrapiMediaSchema.parse(validMedia)).not.toThrow();
  });

  it("rejects media with missing url", () => {
    const { url, ...rest } = validMedia;
    expect(() => StrapiMediaSchema.parse(rest)).toThrow();
  });

  it("rejects media with wrong url type", () => {
    expect(() =>
      StrapiMediaSchema.parse({ ...validMedia, url: 123 }),
    ).toThrow();
  });

  it("accepts null alternativeText", () => {
    const result = StrapiMediaSchema.parse({
      ...validMedia,
      alternativeText: null,
    });
    expect(result.alternativeText).toBeNull();
  });

  it("accepts null formats", () => {
    const result = StrapiMediaSchema.parse({ ...validMedia, formats: null });
    expect(result.formats).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// StrapiMediaFormat
// ---------------------------------------------------------------------------

describe("StrapiMediaFormatSchema", () => {
  it("accepts valid format data", () => {
    expect(() =>
      StrapiMediaFormatSchema.parse(validMediaFormat),
    ).not.toThrow();
  });

  it("rejects format with missing width", () => {
    const { width, ...rest } = validMediaFormat;
    expect(() => StrapiMediaFormatSchema.parse(rest)).toThrow();
  });
});

// ---------------------------------------------------------------------------
// StrapiBlocks
// ---------------------------------------------------------------------------

describe("StrapiBlocksSchema", () => {
  it("accepts valid blocks array", () => {
    expect(() => StrapiBlocksSchema.parse(validBlocks)).not.toThrow();
  });

  it("rejects non-array input", () => {
    expect(() => StrapiBlocksSchema.parse({})).toThrow();
  });

  it("accepts empty blocks array", () => {
    expect(() => StrapiBlocksSchema.parse([])).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// PropertySchema
// ---------------------------------------------------------------------------

describe("PropertySchema", () => {
  const validProperty = {
    id: 1,
    documentId: "prop-001",
    title: "Mountain Ranch Estate",
    slug: "mountain-ranch-estate",
    location: "Bozeman, MT",
    acreage: 250.5,
    ft2: "10911780",
    propertyType: "ranch",
    description: validBlocks,
    heroImage: validMedia,
    heroVideo: null,
    gallery: [validMedia],
    map: {
      place_name: "Cayo District, Belize",
      geometry: { type: "Point", coordinates: [-88.9, 17.2] },
    },
    mapImage: validMedia,
    propertyId: "PROP-001",
    ownership: "Fractional / Tokenized",
    status: "published",
    publishedAt: "2026-04-01T00:00:00.000Z",
    createdAt: "2026-04-01T00:00:00.000Z",
    updatedAt: "2026-04-01T00:00:00.000Z",
  };

  it("accepts valid property data", () => {
    const result = PropertySchema.parse(validProperty);
    expect(result.ft2).toBe(10911780);
  });

  it("rejects property with missing required title", () => {
    const { title, ...rest } = validProperty;
    expect(() => PropertySchema.parse(rest)).toThrow();
  });

  it("rejects property with wrong propertyType", () => {
    expect(() =>
      PropertySchema.parse({ ...validProperty, propertyType: "apartment" }),
    ).toThrow();
  });

  it("rejects property with wrong status", () => {
    expect(() =>
      PropertySchema.parse({ ...validProperty, status: "archived" }),
    ).toThrow();
  });

  it("accepts null for optional fields", () => {
    const result = PropertySchema.parse({
      ...validProperty,
      location: null,
      acreage: null,
      ft2: null,
      propertyType: null,
      description: null,
      heroImage: null,
      gallery: null,
      map: null,
      mapImage: null,
    });
    expect(result.location).toBeNull();
    expect(result.acreage).toBeNull();
    expect(result.ft2).toBeNull();
    expect(result.propertyType).toBeNull();
  });

  it("rejects property with non-string title", () => {
    expect(() =>
      PropertySchema.parse({ ...validProperty, title: 42 }),
    ).toThrow();
  });
});

// ---------------------------------------------------------------------------
// SubmissionSchema
// ---------------------------------------------------------------------------

describe("SubmissionSchema", () => {
  const validSubmission = {
    id: 1,
    documentId: "sub-001",
    name: "John Doe",
    email: "john@example.com",
    message: "I am interested in this property.",
    submittedAt: "2026-04-01T00:00:00.000Z",
    createdAt: "2026-04-01T00:00:00.000Z",
    updatedAt: "2026-04-01T00:00:00.000Z",
  };

  it("accepts valid submission data", () => {
    expect(() => SubmissionSchema.parse(validSubmission)).not.toThrow();
  });

  it("rejects submission with missing name", () => {
    const { name, ...rest } = validSubmission;
    expect(() => SubmissionSchema.parse(rest)).toThrow();
  });

  it("rejects submission with invalid email", () => {
    expect(() =>
      SubmissionSchema.parse({ ...validSubmission, email: "not-an-email" }),
    ).toThrow();
  });

  it("rejects submission with missing message", () => {
    const { message, ...rest } = validSubmission;
    expect(() => SubmissionSchema.parse(rest)).toThrow();
  });
});

// ---------------------------------------------------------------------------
// AboutSchema
// ---------------------------------------------------------------------------

describe("AboutSchema", () => {
  it("accepts about data with quote block", () => {
    const about = {
      id: 1,
      documentId: "about-001",
      title: "About Us",
      blocks: [
        {
          __component: "shared.quote" as const,
          title: "Our Mission",
          body: "We connect people with extraordinary properties.",
        },
      ],
    };
    expect(() => AboutSchema.parse(about)).not.toThrow();
  });

  it("accepts about data with rich-text block", () => {
    const about = {
      id: 1,
      documentId: "about-001",
      title: null,
      blocks: [
        {
          __component: "shared.rich-text" as const,
          body: "Some rich text content.",
        },
      ],
    };
    expect(() => AboutSchema.parse(about)).not.toThrow();
  });

  it("accepts about data with media block", () => {
    const about = {
      id: 1,
      documentId: "about-001",
      title: "About",
      blocks: [
        {
          __component: "shared.media" as const,
          file: validMedia,
        },
      ],
    };
    expect(() => AboutSchema.parse(about)).not.toThrow();
  });

  it("accepts about data with slider block", () => {
    const about = {
      id: 1,
      documentId: "about-001",
      title: "Gallery",
      blocks: [
        {
          __component: "shared.slider" as const,
          files: [validMedia],
        },
      ],
    };
    expect(() => AboutSchema.parse(about)).not.toThrow();
  });

  it("rejects about with unknown block component", () => {
    const about = {
      id: 1,
      documentId: "about-001",
      title: "Test",
      blocks: [
        {
          __component: "shared.unknown" as const,
          body: "test",
        },
      ],
    };
    expect(() => AboutSchema.parse(about)).toThrow();
  });

  it("rejects about with missing blocks", () => {
    expect(() => AboutSchema.parse({ id: 1, documentId: "abt", title: null })).toThrow();
  });
});

// ---------------------------------------------------------------------------
// GlobalSchema
// ---------------------------------------------------------------------------

describe("GlobalSchema", () => {
  const validGlobal = {
    id: 1,
    documentId: "global-001",
    siteName: "Real Estate",
    siteDescription: "Premier properties",
    favicon: validMedia,
    defaultSeo: {
      id: 1,
      metaTitle: "Real Estate - Premier Properties",
      metaDescription: "Find your dream property.",
      shareImage: validMedia,
    },
    footerText: "© 2026 Real Estate. All rights reserved.",
    contactEmail: "info@example.com",
    contactPhone: "+1 (555) 123-4567",
    socialLinks: [
      {
        id: 1,
        platform: "instagram" as const,
        url: "https://instagram.com/realestate",
        label: "Follow us",
      },
    ],
  };

  it("accepts valid global data", () => {
    expect(() => GlobalSchema.parse(validGlobal)).not.toThrow();
  });

  it("rejects global with missing siteName", () => {
    const { siteName, ...rest } = validGlobal;
    expect(() => GlobalSchema.parse(rest)).toThrow();
  });

  it("rejects global with invalid social link platform", () => {
    expect(() =>
      GlobalSchema.parse({
        ...validGlobal,
        socialLinks: [
          { id: 1, platform: "myspace", url: "https://myspace.com/test", label: null },
        ],
      }),
    ).toThrow();
  });

  it("rejects global with invalid social link url", () => {
    expect(() =>
      GlobalSchema.parse({
        ...validGlobal,
        socialLinks: [
          { id: 1, platform: "facebook", url: "not-a-url", label: null },
        ],
      }),
    ).toThrow();
  });

  it("accepts null for optional global fields", () => {
    const result = GlobalSchema.parse({
      ...validGlobal,
      favicon: null,
      defaultSeo: null,
      footerText: null,
      contactEmail: null,
      contactPhone: null,
    });
    expect(result.favicon).toBeNull();
    expect(result.defaultSeo).toBeNull();
    expect(result.footerText).toBeNull();
  });
});
