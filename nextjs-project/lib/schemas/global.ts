import { z } from "zod";
import { StrapiMediaSchema } from "./strapi";

export const SeoSchema = z.object({
  id: z.number(),
  metaTitle: z.string(),
  metaDescription: z.string(),
  shareImage: StrapiMediaSchema.nullable(),
});

export type Seo = z.infer<typeof SeoSchema>;

export const SocialLinkSchema = z.object({
  id: z.number(),
  platform: z.enum([
    "facebook",
    "twitter",
    "instagram",
    "linkedin",
    "youtube",
    "tiktok",
    "pinterest",
    "github",
    "other",
  ]),
  url: z.string().url(),
  label: z.string().nullable(),
});

export type SocialLink = z.infer<typeof SocialLinkSchema>;

export const GlobalSchema = z.object({
  id: z.number(),
  documentId: z.string(),
  siteName: z.string(),
  siteDescription: z.string(),
  favicon: StrapiMediaSchema.nullable(),
  defaultSeo: SeoSchema.nullable(),
  footerText: z.string().nullable(),
  contactEmail: z.string().nullable(),
  contactPhone: z.string().nullable(),
  socialLinks: z.array(SocialLinkSchema),
});

export type Global = z.infer<typeof GlobalSchema>;
