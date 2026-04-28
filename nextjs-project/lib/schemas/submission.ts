import { z } from "zod";

export const SubmissionSchema = z.object({
  id: z.number(),
  documentId: z.string(),
  name: z.string(),
  email: z.string().email(),
  message: z.string(),
  submittedAt: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Submission = z.infer<typeof SubmissionSchema>;
