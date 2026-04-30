"use client";

import { useFormStatus } from "react-dom";

export function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-[--radius-glass] bg-[--color-primary] px-6 py-3
                 font-medium text-[--color-background]
                 transition-all duration-200
                 hover:opacity-90 hover:shadow-lg
                 focus:outline-none focus:ring-2 focus:ring-[--color-primary]/50
                 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {pending ? "Sending..." : "Send Message"}
    </button>
  );
}
