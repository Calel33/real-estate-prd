import { z } from "zod";

export const ContactFormInputSchema = z.object({
  name: z.string().min(1, { error: "Name is required" }),
  email: z.email({ error: "Please enter a valid email address" }),
  purpose: z.string().optional(),
  message: z.string().min(1, { error: "Message is required" }),
});

export const PURPOSE_OPTIONS = [
  { value: "", label: "Select an inquiry type" },
  { value: "property-inquiry", label: "Property Inquiry" },
  { value: "schedule-viewing", label: "Schedule a Viewing" },
  { value: "general-question", label: "General Question" },
  { value: "partnership", label: "Partnership" },
] as const;

export type ContactFormInput = z.infer<typeof ContactFormInputSchema>;
