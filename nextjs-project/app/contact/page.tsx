import type { Metadata } from "next";
import { fetchGlobal } from "@/lib/fetch-global";
import { getEnv } from "@/lib/env";
import { ContactForm } from "@/components/ContactForm";

export async function generateMetadata(): Promise<Metadata> {
  const globalData = await fetchGlobal();

  return {
    title:
      globalData.defaultSeo?.metaTitle ??
      `Contact — ${globalData.siteName}`,
    description:
      globalData.defaultSeo?.metaDescription ?? globalData.siteDescription,
    openGraph: globalData.defaultSeo?.shareImage
      ? {
          images: [
            {
              url: `${getEnv().STRAPI_URL}${globalData.defaultSeo.shareImage.url}`,
            },
          ],
        }
      : undefined,
  };
}

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-lg px-4 pt-24 pb-8 sm:pt-24 sm:pb-10 md:pt-28 md:pb-14 lg:pt-32 lg:pb-16">
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
