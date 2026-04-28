import { z } from "zod";
import { StrapiMediaSchema } from "./strapi";

const SharedMediaBlockSchema = z.object({
  __component: z.literal("shared.media"),
  file: StrapiMediaSchema,
});

const SharedQuoteBlockSchema = z.object({
  __component: z.literal("shared.quote"),
  title: z.string(),
  body: z.string(),
});

const SharedRichTextBlockSchema = z.object({
  __component: z.literal("shared.rich-text"),
  body: z.string(),
});

const SharedSliderBlockSchema = z.object({
  __component: z.literal("shared.slider"),
  files: z.array(StrapiMediaSchema),
});

export const AboutBlockSchema = z.discriminatedUnion("__component", [
  SharedMediaBlockSchema,
  SharedQuoteBlockSchema,
  SharedRichTextBlockSchema,
  SharedSliderBlockSchema,
]);

export type AboutBlock = z.infer<typeof AboutBlockSchema>;

export const AboutSchema = z.object({
  id: z.number(),
  documentId: z.string(),
  title: z.string().nullable(),
  blocks: z.array(AboutBlockSchema),
});

export type About = z.infer<typeof AboutSchema>;
