import { z } from "zod";

export const ContactFormInputSchema = z.object({
  name: z.string().min(1, { error: "Name is required" }),
  email: z.email({ error: "Please enter a valid email address" }),
  message: z.string().min(1, { error: "Message is required" }),
});

export type ContactFormInput = z.infer<typeof ContactFormInputSchema>;
