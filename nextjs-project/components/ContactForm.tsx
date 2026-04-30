"use client";

import { useActionState, useState, useCallback } from "react";
import { SubmitButton } from "@/components/SubmitButton";
import { ContactFormInputSchema } from "@/lib/schemas/contact-form";
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
    (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
      className="rounded-[--radius-glass-shell] border border-white/10
                 bg-white/5 p-6 sm:p-8 md:p-10 shadow-[--shadow-glass] backdrop-blur-md space-y-5"
      aria-label="Contact form"
    >
      {/* Name field */}
      <div>
        <label
          htmlFor="contact-name"
          className="block text-sm font-medium text-[--color-secondary]/80 mb-1.5"
        >
          Name
        </label>
        <input
          id="contact-name"
          name="name"
          type="text"
          required
          autoComplete="name"
          maxLength={255}
          className={inputClass(mergedFieldErrors.name)}
          placeholder="Your name"
          onBlur={handleBlur}
          aria-invalid={mergedFieldErrors.name ? "true" : undefined}
          aria-describedby={mergedFieldErrors.name ? "name-error" : undefined}
        />
        {mergedFieldErrors.name && (
          <p id="name-error" className="mt-1 text-sm text-red-400" role="alert">
            {mergedFieldErrors.name[0]}
          </p>
        )}
      </div>

      {/* Email field */}
      <div>
        <label
          htmlFor="contact-email"
          className="block text-sm font-medium text-[--color-secondary]/80 mb-1.5"
        >
          Email
        </label>
        <input
          id="contact-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className={inputClass(mergedFieldErrors.email)}
          placeholder="you@example.com"
          onBlur={handleBlur}
          aria-invalid={mergedFieldErrors.email ? "true" : undefined}
          aria-describedby={mergedFieldErrors.email ? "email-error" : undefined}
        />
        {mergedFieldErrors.email && (
          <p id="email-error" className="mt-1 text-sm text-red-400" role="alert">
            {mergedFieldErrors.email[0]}
          </p>
        )}
      </div>

      {/* Message field */}
      <div>
        <label
          htmlFor="contact-message"
          className="block text-sm font-medium text-[--color-secondary]/80 mb-1.5"
        >
          Message
        </label>
        <textarea
          id="contact-message"
          name="message"
          required
          rows={5}
          maxLength={5000}
          className={inputClass(mergedFieldErrors.message, "field-sizing-content resize-y min-h-[120px]")}
          placeholder="Tell us about your interest..."
          onBlur={handleBlur}
          aria-invalid={mergedFieldErrors.message ? "true" : undefined}
          aria-describedby={mergedFieldErrors.message ? "message-error" : undefined}
        />
        {mergedFieldErrors.message && (
          <p id="message-error" className="mt-1 text-sm text-red-400" role="alert">
            {mergedFieldErrors.message[0]}
          </p>
        )}
      </div>

      {/* Status messages */}
      {state.status === "success" && (
        <div
          className="rounded-[--radius-glass] bg-green-500/10 border border-green-500/20
                     px-4 py-3 text-green-400 text-sm"
          role="status"
        >
          {state.message}
        </div>
      )}

      {state.status === "error" && state.message && (
        <div
          className="rounded-[--radius-glass] bg-red-500/10 border border-red-500/20
                     px-4 py-3 text-red-400 text-sm"
          role="alert"
        >
          {state.message}
        </div>
      )}

      <SubmitButton />
    </form>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function inputClass(error?: string[], extra = ""): string {
  const base =
    "w-full rounded-[--radius-glass] border bg-[--color-surface] px-4 py-3 text-[--color-secondary] transition-all duration-200 placeholder:text-white/30 focus:outline-none focus:ring-2";
  if (error) {
    return `${base} border-red-500/50 focus:ring-red-500/40 ${extra}`.trim();
  }
  return `${base} border-white/10 focus:ring-[--color-primary]/40 focus:border-[--color-primary]/50 ${extra}`.trim();
}
