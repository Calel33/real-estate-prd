import type { Metadata } from "next";
import { getEnv } from "@/lib/env";
import { getGlobalMetadata } from "@/lib/metadata";
import { ContactForm } from "@/components/ContactForm";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const globalData = await getGlobalMetadata();

  return {
    title: `Contact \u2014 ${globalData.siteName}`,
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
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pt-20 sm:pt-28 md:pt-32 pb-16 sm:pb-20">
      {/* Hero */}
      <section aria-label="Contact page header" className="mb-12 md:mb-16">
        <span className="font-sans text-[10px] sm:text-xs tracking-[0.5em] text-primary/50 mb-6 uppercase flex items-center gap-4">
          <div className="w-12 h-px bg-primary/50" /> Communications_Registry
        </span>
        <h1 className="font-display text-[clamp(3rem,12vw,10rem)] leading-[0.85] tracking-[-0.05em] font-black uppercase text-primary">
          Contact<br />Us
        </h1>
        <p className="mt-8 text-secondary/40 text-sm sm:text-base font-sans max-w-lg uppercase tracking-widest">
          Interested in a property or have a question? Send us a message and
          we&apos;ll get back to you shortly.
        </p>
      </section>

      {/* Form */}
      <ContactForm />
    </div>
  );
}

