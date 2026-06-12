"use client";

import { useFormStatus } from "react-dom";

export function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-[--color-primary] text-[--color-background]
                 font-sans font-bold text-lg sm:text-xl
                 py-6 px-8 sm:py-7 sm:px-10
                 transition-all duration-400
                 hover:opacity-90 hover:shadow-lg
                 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[--color-background] focus:ring-[--color-primary]/50
                 disabled:cursor-not-allowed disabled:opacity-50
                 flex items-center justify-center gap-3
                 tracking-tight"
    >
      {pending ? (
        "Transmitting..."
      ) : (
        <>
          Send Message
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        </>
      )}
    </button>
  );
}
