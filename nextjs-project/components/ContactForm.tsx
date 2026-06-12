"use client";

import { useActionState, useState, useCallback } from "react";
import { SubmitButton } from "@/components/SubmitButton";
import { ContactFormInputSchema, PURPOSE_OPTIONS } from "@/lib/schemas/contact-form";
import { z } from "zod";

// Pre-built partial schemas for onBlur field-level validation.
// Zod v4's pick() requires literal keys, so we build these statically.
const fieldSchemas: Record<string, z.ZodTypeAny> = {
  name: ContactFormInputSchema.pick({ name: true }),
  email: ContactFormInputSchema.pick({ email: true }),
  message: ContactFormInputSchema.pick({ message: true }),
};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type FormState = {
  status: "idle" | "success" | "error";
  message: string;
  fieldErrors?: Record<string, string[]>;
};

// ---------------------------------------------------------------------------
// Server action
// ---------------------------------------------------------------------------

async function submitAction(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const raw = {
    name: (formData.get("name") as string) ?? "",
    email: (formData.get("email") as string) ?? "",
    purpose: (formData.get("purpose") as string) ?? "",
    message: (formData.get("message") as string) ?? "",
  };

  try {
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(raw),
    });

    const json = (await res.json()) as {
      error?: string;
      message?: string;
      fieldErrors?: Record<string, string[]>;
    };

    if (!res.ok) {
      return {
        status: "error",
        message: json.error ?? "Something went wrong.",
        fieldErrors: json.fieldErrors,
      };
    }

    return { status: "success", message: json.message ?? "Message sent successfully!" };
  } catch {
    return { status: "error", message: "Network error. Please try again." };
  }
}

// ---------------------------------------------------------------------------
// Form component
// ---------------------------------------------------------------------------

export function ContactForm() {
  const [state, formAction] = useActionState(submitAction, {
    status: "idle",
    message: "",
  });

  const fieldErrors = state.fieldErrors ?? {};

  // Client-side inline validation state (populated on blur)
  const [localFieldErrors, setLocalFieldErrors] = useState<Record<string, string[]>>({});

  // Merge server errors (post-submit) with local blur validation errors.
  // Server errors take priority; local errors fill gaps before submission.
  const mergedFieldErrors = { ...localFieldErrors, ...fieldErrors };

  const handleBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      const schema = fieldSchemas[name];
      if (!schema) return;
      const result = schema.safeParse({ [name]: value });
      if (!result.success) {
        const issues = result.error.issues.map((issue) => issue.message);
        setLocalFieldErrors((prev) => ({ ...prev, [name]: issues }));
      } else {
        setLocalFieldErrors((prev) => {
          const next = { ...prev };
          delete next[name];
          return next;
        });
      }
    },
    [],
  );

  return (
    <form
      action={formAction}
      aria-label="Contact form"
      className="w-full"
    >
      {/* SEC_01: Identity Parameters */}
      <section className="border-t border-primary/10 py-16 md:py-24 px-6 lg:px-20 transition-colors duration-500 hover:bg-primary/[0.03]">
        <div className="grid md:grid-cols-12 gap-10">
          <div className="md:col-span-4">
            <span className="font-sans text-[10px] sm:text-xs tracking-[0.35em] text-primary/50 uppercase">
              SEC_01
            </span>
            <h2 className="mt-8 font-sans font-bold text-lg sm:text-xl uppercase tracking-tight text-primary">
              Identity<br />Parameters
            </h2>
          </div>
          <div className="md:col-span-8 space-y-4">
            {/* Name field */}
            <div>
              <label htmlFor="contact-name" className="sr-only">
                Name
              </label>
              <input
                id="contact-name"
                name="name"
                type="text"
                required
                autoComplete="name"
                maxLength={255}
                className={slabInputClass(mergedFieldErrors.name)}
                placeholder="Your name"
                onBlur={handleBlur}
                aria-invalid={mergedFieldErrors.name ? "true" : undefined}
                aria-describedby={mergedFieldErrors.name ? "name-error" : undefined}
              />
              {mergedFieldErrors.name && (
                <p id="name-error" className="mt-2 text-sm text-red-400" role="alert">
                  {mergedFieldErrors.name[0]}
                </p>
              )}
            </div>

            {/* Email field */}
            <div>
              <label htmlFor="contact-email" className="sr-only">
                Email
              </label>
              <input
                id="contact-email"
                name="email"
                type="email"
                required
                autoComplete="email"
                className={slabInputClass(mergedFieldErrors.email)}
                placeholder="Email address"
                onBlur={handleBlur}
                aria-invalid={mergedFieldErrors.email ? "true" : undefined}
                aria-describedby={mergedFieldErrors.email ? "email-error" : undefined}
              />
              {mergedFieldErrors.email && (
                <p id="email-error" className="mt-2 text-sm text-red-400" role="alert">
                  {mergedFieldErrors.email[0]}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* SEC_02: Intelligence Brief */}
      <section className="border-t border-primary/10 py-16 md:py-24 px-6 lg:px-20 transition-colors duration-500 hover:bg-primary/[0.03]">
        <div className="grid md:grid-cols-12 gap-10">
          <div className="md:col-span-4">
            <span className="font-sans text-[10px] sm:text-xs tracking-[0.35em] text-primary/50 uppercase">
              SEC_02
            </span>
            <h2 className="mt-8 font-sans font-bold text-lg sm:text-xl uppercase tracking-tight text-primary">
              Intelligence<br />Brief
            </h2>
          </div>
          <div className="md:col-span-8 space-y-4">
            {/* Purpose field */}
            <div>
              <label htmlFor="contact-purpose" className="sr-only">
                Inquiry Type
              </label>
              <select
                id="contact-purpose"
                name="purpose"
                className={slabSelectClass()}
                defaultValue=""
                onBlur={handleBlur}
              >
                {PURPOSE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-[--color-surface] text-[--color-secondary]">
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Message field */}
            <div>
              <label htmlFor="contact-message" className="sr-only">
                Message
              </label>
              <textarea
                id="contact-message"
                name="message"
                required
                rows={3}
                maxLength={5000}
                className={slabInputClass(mergedFieldErrors.message, "field-sizing-content resize-y min-h-[100px]")}
                placeholder="Tell us about your interest..."
                onBlur={handleBlur}
                aria-invalid={mergedFieldErrors.message ? "true" : undefined}
                aria-describedby={mergedFieldErrors.message ? "message-error" : undefined}
              />
              {mergedFieldErrors.message && (
                <p id="message-error" className="mt-2 text-sm text-red-400" role="alert">
                  {mergedFieldErrors.message[0]}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Status messages */}
      {state.status === "success" && (
        <div
          className="mt-8 rounded-[--radius-glass] bg-green-500/10 border border-green-500/20
                     px-6 py-4 text-green-400 text-sm"
          role="status"
        >
          {state.message}
        </div>
      )}

      {state.status === "error" && state.message && (
        <div
          className="mt-8 rounded-[--radius-glass] bg-red-500/10 border border-red-500/20
                     px-6 py-4 text-red-400 text-sm"
          role="alert"
        >
          {state.message}
        </div>
      )}

      {/* Submit */}
      <div className="mt-12 md:mt-16">
        <SubmitButton />
      </div>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function slabInputClass(error?: string[], extra = ""): string {
  const base =
    "w-full bg-[--color-surface] border-0 border-l-2 py-7 px-7 sm:py-9 sm:px-9 " +
    "text-[--color-secondary] text-xl sm:text-2xl font-black " +
    "placeholder:text-white/[0.06] placeholder:font-normal placeholder:uppercase placeholder:tracking-tighter " +
    "transition-all duration-[400ms] tracking-tight " +
    "focus:outline-none focus:border-l-[--color-primary] focus:bg-[#1a1a1a] focus:pl-9 sm:focus:pl-12";
  if (error) {
    return `${base} border-l-red-500/60 focus:border-l-red-500 ${extra}`.trim();
  }
  return `${base} border-l-transparent ${extra}`.trim();
}

function slabSelectClass(): string {
  return (
    "w-full bg-[--color-surface] border-0 border-l-2 border-l-transparent " +
    "py-7 px-7 sm:py-9 sm:px-9 " +
    "text-[--color-secondary] text-xl sm:text-2xl font-black " +
    "transition-all duration-[400ms] appearance-none cursor-pointer tracking-tight " +
    "focus:outline-none focus:border-l-[--color-primary] focus:bg-[#1a1a1a] focus:pl-9 sm:focus:pl-12"
  );
}
