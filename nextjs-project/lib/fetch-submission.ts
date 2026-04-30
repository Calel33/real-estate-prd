import { z } from "zod";
import { strapiFetch } from "./fetch";

/** Input shape for creating a submission via POST. */
export const CreateSubmissionInputSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  message: z.string().min(1),
});

export type CreateSubmissionInput = z.infer<typeof CreateSubmissionInputSchema>;

/** Response shape for creating a submission. */
const CreateSubmissionResponseSchema = z.object({
  data: z.object({
    id: z.number(),
    documentId: z.string(),
    name: z.string(),
    email: z.string(),
    message: z.string(),
    submittedAt: z.string(),
    createdAt: z.string(),
    updatedAt: z.string(),
  }),
  meta: z.object({}).optional(),
});

/**
 * Create a new contact submission.
 * Uses the Strapi API token for authorization.
 */
export async function createSubmission(
  input: CreateSubmissionInput,
): Promise<{ id: number; documentId: string }> {
  const validated = CreateSubmissionInputSchema.parse(input);

  const path = "/api/submissions";
  const response = await strapiFetch(path, CreateSubmissionResponseSchema, {
    method: "POST",
    body: { data: validated },
    useToken: true,
    revalidate: false,
  });

  return { id: response.data.id, documentId: response.data.documentId };
}
