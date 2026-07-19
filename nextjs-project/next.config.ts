import type { NextConfig } from "next";

/**
 * Parse the STRAPI_URL to extract hostname and optional port
 * for Next.js remotePatterns configuration.
 */
function parseStrapiHost(url: string | undefined): {
  protocol: "http" | "https";
  hostname: string;
  port: string;
} {
  if (!url) {
    return { protocol: "http", hostname: "localhost", port: "1337" };
  }

  const stripped = url.replace(/^https?:\/\//, "");
  const [hostPart, portPart] = stripped.split(":");
  const protocol = url.startsWith("https") ? "https" : "http";

  return {
    protocol: protocol as "http" | "https",
    hostname: hostPart ?? "localhost",
    port: portPart ?? (protocol === "https" ? "" : "1337"),
  };
}

const strapiHost = parseStrapiHost(process.env.STRAPI_URL);

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  images: {
    /**
     * Allow optimizing images from local/private IP addresses.
     * Required because Strapi runs on localhost:1337 in development.
     * @see https://nextjs.org/docs/app/guides/upgrading/version-16#local-ip-restriction-breaking-change
     */
    dangerouslyAllowLocalIP: true,
    remotePatterns: [
      {
        protocol: strapiHost.protocol,
        hostname: strapiHost.hostname,
        port: strapiHost.port,
        pathname: "/uploads/**",
      },
    ],
  },
};

export default nextConfig;
