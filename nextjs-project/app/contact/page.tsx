import type { Metadata } from "next";
import { ContactForm } from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Contact | Zenith Real Estate",
  description:
    "Get in touch with Zenith Real Estate. Send us a message about any property or inquiry.",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-8 sm:py-10 md:py-14 lg:py-16">
      {/* Heading */}
      <div className="mb-8 text-center">
        <h1 className="font-display text-[--color-primary] text-3xl sm:text-4xl md:text-5xl leading-tight">
          Contact Us
        </h1>
        <p className="mt-3 text-[--color-secondary]/60 text-base sm:text-lg md:text-xl font-sans max-w-md mx-auto">
          Interested in a property or have a question? Send us a message and
          we&apos;ll get back to you shortly.
        </p>
      </div>

      <ContactForm />
    </div>
  );
}
