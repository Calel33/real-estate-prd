import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { ContactFormInputSchema } from "@/lib/schemas/contact-form";
import { createSubmission } from "@/lib/fetch-submission";
import { sendContactEmail } from "@/lib/resend";
import { StrapiError } from "@/lib/fetch";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

// Rate limit: 5 submissions per IP per 60 seconds.
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 60_000;

export async function POST(request: NextRequest): Promise<NextResponse> {
  // 0. Rate limit
  const clientIp = getClientIp(request);
  const rateLimit = checkRateLimit(clientIp, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil(rateLimit.resetMs / 1000)),
          "X-RateLimit-Limit": String(RATE_LIMIT_MAX),
          "X-RateLimit-Remaining": "0",
        },
      },
    );
  }

  // 1. Parse body
  let body: unknown;
  try {
    body = await request.json();
  } catch (e) {
    console.warn("Failed to parse contact form JSON body:", e);
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  // 2. Validate with Zod
  const result = ContactFormInputSchema.safeParse(body);
  if (!result.success) {
    const flat = z.flattenError(result.error);
    return NextResponse.json(
      { error: "Validation failed", fieldErrors: flat.fieldErrors },
      { status: 400 },
    );
  }

  const data = result.data;

  try {
    // 3. POST to Strapi
    await createSubmission(data);
  } catch (error) {
    if (error instanceof StrapiError) {
      return NextResponse.json(
        { error: "Failed to save message. Please try again later." },
        { status: 502 },
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }

  // 4. Send email via Resend (non-critical — log but don't fail the submission)
  try {
    await sendContactEmail(data);
  } catch {
    // Strapi save succeeded; Resend failure is non-critical to the user
    console.warn("Resend email notification failed for submission:", data.email);
    return NextResponse.json(
      { message: "Message sent successfully", warning: "Notification email failed to send." },
      { status: 200 },
    );
  }

  // 5. Return success
  return NextResponse.json(
    { message: "Message sent successfully" },
    { status: 200 },
  );
}
